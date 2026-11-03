import type { Piece } from '../utils/fen';

/**
 * One cohesive piece set. We render the SOLID glyph for BOTH colours so the
 * silhouettes match exactly, then colour and edge them via CSS (see
 * Board.css): white pieces get a light fill + dark edge, black pieces a dark
 * fill + light edge. No externally hosted piece images are used.
 *
 * A bespoke vector piece set is tracked as a later visual-polish upgrade; the
 * markup below is drop-in compatible with that change.
 */
const SOLID_GLYPH: Record<Piece['type'], string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

const PIECE_NAME: Record<Piece['type'], string> = {
  k: 'king',
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
  p: 'pawn',
};

export function PieceGlyph({ piece }: { piece: Piece }) {
  const colorWord = piece.color === 'w' ? 'White' : 'Black';
  const label = `${colorWord} ${PIECE_NAME[piece.type]}`;
  return (
    <span
      className={`cb-piece cb-piece--${piece.color}`}
      role="img"
      aria-label={label}
      data-piece={`${piece.color}${piece.type}`}
    >
      {SOLID_GLYPH[piece.type]}
    </span>
  );
}
