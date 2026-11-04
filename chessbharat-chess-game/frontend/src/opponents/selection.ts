import { Chess } from 'chess.js';
import type { Candidate } from '../engine/StockfishEngine';
import type { PersonalityConfig } from './types';

/**
 * Personality move-selection layer.
 *
 * Stockfish (MultiPV) proposes ranked candidate moves with evaluations; this
 * module chooses among them according to an opponent's personality, while
 * keeping a strong preference for legal, reasonable moves. For the 200–900
 * opponents a controlled mistake model deliberately - but plausibly - picks a
 * weaker candidate, instead of playing random moves.
 */

export type GamePhase = 'opening' | 'middlegame' | 'endgame';

export interface EnrichedCandidate extends Candidate {
  san: string;
  isCapture: boolean;
  capturedValue: number;
  givesCheck: boolean;
  isCastle: boolean;
  isPromotion: boolean;
  pieceType: string;
  centrality: number; // 0..1, higher = more central target
  develops: boolean; // minor piece leaving the back rank in the opening
}

const PIECE_VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function centralityOf(square: string): number {
  const file = square.charCodeAt(0) - 97; // a..h -> 0..7
  const rank = Number(square[1]) - 1; // 1..8 -> 0..7
  const df = 3.5 - Math.abs(file - 3.5);
  const dr = 3.5 - Math.abs(rank - 3.5);
  return (df + dr) / 7; // 0..1
}

/** Classify the phase from material and development. */
export function gamePhase(fen: string): GamePhase {
  const placement = fen.split(' ')[0];
  const majorsMinors = (placement.match(/[nbrqNBRQ]/g) ?? []).length;
  const fullmove = Number(fen.split(' ')[5] ?? '1');
  if (fullmove <= 8) return 'opening';
  if (majorsMinors <= 6) return 'endgame';
  return 'middlegame';
}

/** Add move features (needs the position) to each engine candidate. */
export function enrichCandidates(fen: string, candidates: Candidate[]): EnrichedCandidate[] {
  const out: EnrichedCandidate[] = [];
  for (const c of candidates) {
    const chess = new Chess(fen);
    let verbose;
    try {
      verbose = chess.move({ from: c.move.from, to: c.move.to, promotion: c.move.promotion });
    } catch {
      continue; // illegal in this position (stale) - skip
    }
    const givesCheck = chess.isCheck();
    out.push({
      ...c,
      san: verbose.san,
      isCapture: verbose.flags.includes('c') || verbose.flags.includes('e'),
      capturedValue: verbose.captured ? PIECE_VALUE[verbose.captured] ?? 0 : 0,
      givesCheck,
      isCastle: verbose.flags.includes('k') || verbose.flags.includes('q'),
      isPromotion: verbose.flags.includes('p'),
      pieceType: verbose.piece,
      centrality: centralityOf(c.move.to),
      develops:
        (verbose.piece === 'n' || verbose.piece === 'b') &&
        (verbose.from[1] === '1' || verbose.from[1] === '8'),
    });
  }
  return out;
}

/** Personality "appeal" of a move, in centipawns, from the config weights. */
function appealCp(c: EnrichedCandidate, cfg: PersonalityConfig, phase: GamePhase): number {
  let appeal = 0;
  appeal += cfg.aggression * (c.givesCheck ? 55 : 0);
  appeal += cfg.aggression * (c.isCapture ? 25 : 0);
  appeal += cfg.tacticalPreference * ((c.isCapture ? 30 : 0) + (c.givesCheck ? 30 : 0));
  appeal += cfg.sacrificePreference * (c.isCapture ? 30 * c.capturedValue * 0.1 : 0);
  appeal += cfg.positionalPreference * (c.centrality * 40 + (c.develops && phase === 'opening' ? 35 : 0));
  appeal += cfg.positionalPreference * (c.isCastle ? 30 : 0);
  if (phase === 'endgame') appeal += cfg.endgamePreference * (c.isCapture ? 25 : 0);
  return appeal;
}

export interface SelectContext {
  phase: GamePhase;
  rng?: () => number;
}

/**
 * Choose a move. Returns the chosen candidate (never null if any are given).
 */
export function selectMove(
  candidates: EnrichedCandidate[],
  cfg: PersonalityConfig,
  ctx: SelectContext,
): EnrichedCandidate {
  const rng = ctx.rng ?? Math.random;
  if (candidates.length === 1) return candidates[0];
  const best = candidates[0];

  // Objective players: play the engine's top line.
  if (cfg.moveSelectionPolicy === 'objectiveBest') return best;

  // Beginner mistake model: controlled, plausible errors from the ranked list.
  if (cfg.moveSelectionPolicy === 'humanlikeMistakes' && cfg.mistakeModel) {
    const mm = cfg.mistakeModel;
    const n = candidates.length;
    const maxReach = Math.min(mm.blunderDepth, n - 1);
    const roll = rng();
    if (maxReach >= 1 && roll < mm.hangPieceChance) {
      // A real mistake: pick from the weaker tail of the candidate list.
      const lo = Math.max(1, Math.floor(maxReach / 2));
      const idx = lo + Math.floor(rng() * (maxReach - lo + 1));
      return candidates[Math.min(idx, n - 1)];
    }
    if (roll < mm.hangPieceChance + mm.missThreatChance) {
      // A small inaccuracy: near the top but not best.
      const idx = 1 + Math.floor(rng() * Math.min(2, n - 1));
      return candidates[Math.min(idx, n - 1)];
    }
    return best;
  }

  // Weighted-candidate policy for the stronger personalities.
  // Accept only candidates within a personality-scaled eval window of the best,
  // then pick the one with the highest objective + personality-appeal score.
  const maxLoss = 50 + cfg.riskTolerance * 320; // centipawns
  let chosen = best;
  let chosenScore = -Infinity;
  for (const c of candidates) {
    const evalLoss = best.scoreCp - c.scoreCp;
    if (evalLoss > maxLoss) continue;
    const appeal = appealCp(c, cfg, ctx.phase);
    // Small noise keeps repeated games from being identical.
    const noise = (rng() - 0.5) * 20;
    const score = c.scoreCp + appeal + noise;
    if (score > chosenScore) {
      chosenScore = score;
      chosen = c;
    }
  }
  return chosen;
}
