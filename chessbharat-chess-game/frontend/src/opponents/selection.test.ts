import { describe, it, expect } from 'vitest';
import { enrichCandidates, gamePhase, selectMove, type EnrichedCandidate } from './selection';
import type { PersonalityConfig } from './types';

function baseConfig(partial: Partial<PersonalityConfig>): PersonalityConfig {
  return {
    targetElo: 1500, engineSkill: 10, searchTimeMs: 800, searchDepth: 10,
    riskTolerance: 0.5, aggression: 0.5, sacrificePreference: 0.3,
    positionalPreference: 0.5, tacticalPreference: 0.5, endgamePreference: 0.5,
    openingRepertoire: { asWhite: [], asBlack: [] },
    mistakeModel: null, moveSelectionPolicy: 'weightedCandidate',
    thinkingTimeProfile: 'measured',
    ...partial,
  };
}

function mk(rank: number, scoreCp: number, extra: Partial<EnrichedCandidate> = {}): EnrichedCandidate {
  return {
    move: { from: 'e2', to: 'e4' }, uci: 'e2e4', scoreCp, mate: null, rank,
    san: 'e4', isCapture: false, capturedValue: 0, givesCheck: false,
    isCastle: false, isPromotion: false, pieceType: 'p', centrality: 0.5, develops: false,
    ...extra,
  };
}

/** Deterministic rng from a queue (loops). */
function seq(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('gamePhase', () => {
  it('calls early moves the opening', () => {
    expect(gamePhase('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')).toBe('opening');
  });
  it('calls a sparse late position an endgame', () => {
    expect(gamePhase('8/5k2/8/8/8/3K4/4P3/8 w - - 0 40')).toBe('endgame');
  });
});

describe('enrichCandidates', () => {
  it('flags a capture and its value', () => {
    // White to move; exd5 is a legal pawn capture of a black pawn.
    const fen = 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2';
    const [c] = enrichCandidates(fen, [
      { move: { from: 'e4', to: 'd5' }, uci: 'e4d5', scoreCp: 30, mate: null, rank: 1 },
    ]);
    expect(c.isCapture).toBe(true);
    expect(c.capturedValue).toBe(1);
    expect(c.san).toBe('exd5');
  });
});

describe('selectMove', () => {
  it('objectiveBest always plays the top line', () => {
    const cfg = baseConfig({ moveSelectionPolicy: 'objectiveBest' });
    const cands = [mk(1, 50), mk(2, 40, { givesCheck: true, isCapture: true })];
    expect(selectMove(cands, cfg, { phase: 'middlegame', rng: seq([0]) }).rank).toBe(1);
  });

  it('an aggressive personality prefers a near-equal check+capture', () => {
    const cfg = baseConfig({ aggression: 0.95, tacticalPreference: 0.9, riskTolerance: 0.6 });
    const cands = [
      mk(1, 50, { san: 'Re1' }),
      mk(2, 38, { san: 'Qxh7+', isCapture: true, givesCheck: true, capturedValue: 1 }),
    ];
    const chosen = selectMove(cands, cfg, { phase: 'middlegame', rng: seq([0.5]) });
    expect(chosen.rank).toBe(2);
  });

  it('never trades a huge eval for appeal (low risk excludes big losses)', () => {
    const cfg = baseConfig({ aggression: 0.95, tacticalPreference: 0.95, riskTolerance: 0.1 });
    const cands = [
      mk(1, 50, { san: 'Re1' }),
      mk(2, -200, { san: 'Qxh7+', isCapture: true, givesCheck: true, capturedValue: 1 }),
    ];
    expect(selectMove(cands, cfg, { phase: 'middlegame', rng: seq([0.5]) }).rank).toBe(1);
  });

  it('the mistake model plays a weaker move when the roll triggers a blunder', () => {
    const cfg = baseConfig({
      moveSelectionPolicy: 'humanlikeMistakes',
      mistakeModel: { missCaptureChance: 0.7, hangPieceChance: 0.6, missThreatChance: 0.2, blunderDepth: 8 },
    });
    const cands = Array.from({ length: 10 }, (_, i) => mk(i + 1, 50 - i * 12));
    // roll=0 (< hangPieceChance) -> blunder branch; second rng=0 -> lowest index of tail.
    const chosen = selectMove(cands, cfg, { phase: 'middlegame', rng: seq([0, 0]) });
    expect(chosen.rank).toBeGreaterThan(1);
  });

  it('the mistake model plays the best move when the roll is high', () => {
    const cfg = baseConfig({
      moveSelectionPolicy: 'humanlikeMistakes',
      mistakeModel: { missCaptureChance: 0.7, hangPieceChance: 0.6, missThreatChance: 0.2, blunderDepth: 8 },
    });
    const cands = Array.from({ length: 10 }, (_, i) => mk(i + 1, 50 - i * 12));
    const chosen = selectMove(cands, cfg, { phase: 'middlegame', rng: seq([0.99]) });
    expect(chosen.rank).toBe(1);
  });
});
