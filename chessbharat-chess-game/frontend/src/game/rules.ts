import { Chess } from 'chess.js';
import type { PieceColor, Square } from '../utils/fen';

export interface MovePair {
  number: number;
  white: string | null;
  black: string | null;
}

export type GameOutcome =
  | { over: false }
  | {
      over: true;
      kind: 'checkmate' | 'stalemate' | 'draw';
      winner: PieceColor | null;
      reason: string;
    };

/** Locate a side's king square (for the check highlight). */
export function findKing(chess: Chess, color: PieceColor): Square | null {
  for (const row of chess.board()) {
    for (const sq of row) {
      if (sq && sq.type === 'k' && sq.color === color) return sq.square as Square;
    }
  }
  return null;
}

/** Classify the game state into a structured outcome. Pure (reads, never mutates). */
export function computeOutcome(chess: Chess): GameOutcome {
  if (!chess.isGameOver()) return { over: false };
  if (chess.isCheckmate()) {
    const winner: PieceColor = chess.turn() === 'w' ? 'b' : 'w';
    return { over: true, kind: 'checkmate', winner, reason: 'Checkmate' };
  }
  if (chess.isStalemate()) {
    return { over: true, kind: 'stalemate', winner: null, reason: 'Stalemate' };
  }
  if (chess.isInsufficientMaterial()) {
    return { over: true, kind: 'draw', winner: null, reason: 'Insufficient material' };
  }
  if (chess.isThreefoldRepetition()) {
    return { over: true, kind: 'draw', winner: null, reason: 'Threefold repetition' };
  }
  return { over: true, kind: 'draw', winner: null, reason: 'Fifty-move rule' };
}

/** Turn move history into White/Black pairs for the move list. */
export function toMovePairs(chess: Chess): MovePair[] {
  const history = chess.history({ verbose: true });
  const pairs: MovePair[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      number: i / 2 + 1,
      white: history[i]?.san ?? null,
      black: history[i + 1]?.san ?? null,
    });
  }
  return pairs;
}
