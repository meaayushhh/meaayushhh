/**
 * Minimal FEN helpers for rendering. Full rules/validation come from chess.js
 * in Phase 2 — this is only for turning a placement string into squares to draw.
 */

export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export interface Piece {
  color: PieceColor;
  type: PieceType;
}

export const STARTING_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

export type Square = `${(typeof FILES)[number]}${(typeof RANKS)[number]}`;

/** Parse the placement field of a FEN into a map of square -> piece. */
export function parseFenPlacement(fen: string): Map<Square, Piece> {
  const placement = fen.trim().split(/\s+/)[0] ?? '';
  const rows = placement.split('/');
  const out = new Map<Square, Piece>();

  for (let r = 0; r < Math.min(8, rows.length); r++) {
    const rank = RANKS[r];
    let file = 0;
    for (const ch of rows[r]) {
      if (/\d/.test(ch)) {
        file += Number(ch);
        continue;
      }
      if (file > 7) break;
      const color: PieceColor = ch === ch.toUpperCase() ? 'w' : 'b';
      const type = ch.toLowerCase() as PieceType;
      const square = `${FILES[file]}${rank}` as Square;
      out.set(square, { color, type });
      file += 1;
    }
  }
  return out;
}

/** Board squares in draw order for a given orientation (top-left first). */
export function squaresInOrder(orientation: PieceColor): Square[] {
  const files = orientation === 'w' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'w' ? RANKS : [...RANKS].reverse();
  const out: Square[] = [];
  for (const rank of ranks) {
    for (const file of files) {
      out.push(`${file}${rank}` as Square);
    }
  }
  return out;
}

export function isLightSquare(square: Square): boolean {
  const file = FILES.indexOf(square[0] as (typeof FILES)[number]);
  const rank = Number(square[1]);
  return (file + rank) % 2 === 1;
}
