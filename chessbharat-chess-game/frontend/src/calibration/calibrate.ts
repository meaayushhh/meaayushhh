import { StockfishEngine, ENGINE_FILENAME } from '../engine/StockfishEngine';
import { enrichCandidates, selectMove, gamePhase } from '../opponents/selection';
import { OPPONENTS } from '../data/opponents';

/**
 * Calibration harness (run in a browser via the calibration page).
 *
 * For a fixed set of positions, it asks Stockfish (full strength) for MultiPV
 * candidates with accurate evaluations, then runs EACH opponent's personality
 * selection over those candidates and measures the eval loss of the chosen
 * move. This isolates and quantifies the *selection layer*: how far each
 * personality's move drifts from the engine's best (ACPL proxy) and how often
 * it makes a real mistake (blunder rate).
 *
 * This is a proxy for relative behaviour, not an exact Elo: real play also
 * applies Stockfish's own Skill-Level weakening, and sample sizes are small.
 */

const FENS: string[] = [
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
  'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6',
  'rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
  'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 0 5',
  'r2q1rk1/ppp2ppp/2np1n2/2b1p3/2B1P1b1/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8',
  '8/5pk1/6p1/8/8/1R6/5PPP/6K1 w - - 0 30',
  '8/8/4k3/8/4P3/4K3/8/8 w - - 0 50',
];

export interface CalibrationRow {
  id: string;
  name: string;
  rating: number;
  acpl: number; // average centipawn loss of the chosen move
  blunderRate: number; // fraction of choices losing > 150cp
  samples: number;
}

export async function runCalibration(
  engineBase: string,
  opts: { movetimeMs?: number; repeats?: number } = {},
): Promise<CalibrationRow[]> {
  const movetimeMs = opts.movetimeMs ?? 500;
  const repeats = opts.repeats ?? 4;
  const engine = new StockfishEngine(`${engineBase}${ENGINE_FILENAME}`);
  await engine.init();
  engine.setSkillLevel(20); // accurate evaluations for scoring

  // Precompute candidate lists once per position.
  const perFen: { fen: string; enriched: ReturnType<typeof enrichCandidates> }[] = [];
  for (const fen of FENS) {
    const cands = await engine.searchMultiPV({ fen, movetimeMs, multipv: 18 });
    perFen.push({ fen, enriched: enrichCandidates(fen, cands) });
  }

  const rows: CalibrationRow[] = [];
  for (const opp of OPPONENTS) {
    let lossSum = 0;
    let n = 0;
    let blunders = 0;
    for (const { fen, enriched } of perFen) {
      if (enriched.length === 0) continue;
      const best = enriched[0].scoreCp;
      for (let r = 0; r < repeats; r++) {
        const choice = selectMove(enriched, opp.config, { phase: gamePhase(fen) });
        const loss = Math.max(0, best - choice.scoreCp);
        lossSum += loss;
        n += 1;
        if (loss > 150) blunders += 1;
      }
    }
    rows.push({
      id: opp.id,
      name: opp.name,
      rating: opp.rating,
      acpl: n ? Math.round(lossSum / n) : 0,
      blunderRate: n ? Number((blunders / n).toFixed(3)) : 0,
      samples: n,
    });
  }

  engine.terminate();
  return rows;
}

declare global {
  interface Window {
    runCalibration?: typeof runCalibration;
  }
}
window.runCalibration = runCalibration;
