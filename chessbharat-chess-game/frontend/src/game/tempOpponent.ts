import type { Square } from '../utils/fen';

/**
 * TEMPORARY opponent for Phase 2 — plays a uniformly random legal move.
 *
 * This exists ONLY so a complete game can be played end-to-end to verify the
 * rules (checkmate, stalemate, castling, en passant, promotion, draws). It is
 * replaced in Phase 3 (Stockfish) and Phase 4 (per-personality move selection).
 * Random legal play is explicitly NOT the mistake model for the real opponents.
 */
export function pickRandomMove(
  legal: { from: Square; to: Square; promotion?: string }[],
): { from: Square; to: Square; promotion?: string } | null {
  if (legal.length === 0) return null;
  return legal[Math.floor(Math.random() * legal.length)];
}
