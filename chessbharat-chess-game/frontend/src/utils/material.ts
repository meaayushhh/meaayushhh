import { parseFenPlacement, type PieceColor, type PieceType } from './fen';

const FULL_SET: Record<Exclude<PieceType, 'k'>, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
const VALUE: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const ORDER: Exclude<PieceType, 'k'>[] = ['q', 'r', 'b', 'n', 'p'];

export interface MaterialInfo {
  /** Black pieces that White has captured, as a display list (q,r,b,n,p order). */
  capturedByWhite: PieceType[];
  capturedByBlack: PieceType[];
  /** Positive = White is ahead by this many points. */
  diff: number;
}

export function materialFromFen(fen: string): MaterialInfo {
  const pieces = parseFenPlacement(fen);
  const present: Record<PieceColor, Record<string, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  };
  for (const piece of pieces.values()) present[piece.color][piece.type] += 1;

  const capturedByWhite: PieceType[] = [];
  const capturedByBlack: PieceType[] = [];
  for (const type of ORDER) {
    const whiteTook = Math.max(0, FULL_SET[type] - present.b[type]);
    const blackTook = Math.max(0, FULL_SET[type] - present.w[type]);
    for (let i = 0; i < whiteTook; i++) capturedByWhite.push(type);
    for (let i = 0; i < blackTook; i++) capturedByBlack.push(type);
  }

  let diff = 0;
  for (const type of ORDER) {
    diff += (present.w[type] - present.b[type]) * VALUE[type];
  }
  return { capturedByWhite, capturedByBlack, diff };
}
