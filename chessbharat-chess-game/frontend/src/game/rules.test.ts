import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import { computeOutcome, toMovePairs, findKing } from './rules';

describe('special moves', () => {
  it('kingside castling produces O-O and relocates king & rook', () => {
    const c = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    const mv = c.move('O-O');
    expect(mv.san).toBe('O-O');
    expect(c.get('g1')).toMatchObject({ type: 'k', color: 'w' });
    expect(c.get('f1')).toMatchObject({ type: 'r', color: 'w' });
  });

  it('en passant is available and flagged', () => {
    const c = new Chess('rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3');
    const ep = c.moves({ square: 'e5', verbose: true }).find((m) => m.flags.includes('e'));
    expect(ep?.to).toBe('f6');
    const mv = c.move({ from: 'e5', to: 'f6' });
    expect(mv.flags).toContain('e');
    expect(c.get('f5')).toBeUndefined(); // captured pawn removed
  });

  it('pawn promotion to queen yields a queen and correct SAN', () => {
    const c = new Chess('7k/P7/8/8/8/8/8/K7 w - - 0 1');
    const opts = c.moves({ square: 'a7', verbose: true });
    expect(opts.every((m) => m.flags.includes('p'))).toBe(true);
    const mv = c.move({ from: 'a7', to: 'a8', promotion: 'q' });
    expect(mv.san).toBe('a8=Q+');
    expect(c.get('a8')).toMatchObject({ type: 'q', color: 'w' });
  });
});

describe('outcome detection', () => {
  it('detects checkmate with the correct winner (Fool\'s mate)', () => {
    const c = new Chess();
    c.move('f3'); c.move('e5'); c.move('g4'); c.move('Qh4#');
    const o = computeOutcome(c);
    expect(o).toEqual({ over: true, kind: 'checkmate', winner: 'b', reason: 'Checkmate' });
  });

  it('detects stalemate as a draw', () => {
    const c = new Chess('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
    const o = computeOutcome(c);
    expect(o.over).toBe(true);
    if (o.over) { expect(o.kind).toBe('stalemate'); expect(o.winner).toBeNull(); }
  });

  it('detects insufficient material (K vs K)', () => {
    const c = new Chess('8/8/8/4k3/8/8/4K3/8 w - - 0 1');
    const o = computeOutcome(c);
    expect(o.over).toBe(true);
    if (o.over) expect(o.reason).toBe('Insufficient material');
  });

  it('detects threefold repetition', () => {
    const c = new Chess();
    for (let i = 0; i < 2; i++) {
      c.move('Nf3'); c.move('Nf6'); c.move('Ng1'); c.move('Ng8');
    }
    expect(c.isThreefoldRepetition()).toBe(true);
    const o = computeOutcome(c);
    expect(o.over).toBe(true);
    if (o.over) expect(o.reason).toBe('Threefold repetition');
  });

  it('reports an ongoing game as not over', () => {
    const c = new Chess();
    c.move('e4');
    expect(computeOutcome(c)).toEqual({ over: false });
  });
});

describe('move list & helpers', () => {
  it('pairs moves with a trailing null for an unfinished pair', () => {
    const c = new Chess();
    c.move('e4'); c.move('e5'); c.move('Nf3');
    const pairs = toMovePairs(c);
    expect(pairs).toHaveLength(2);
    expect(pairs[0]).toEqual({ number: 1, white: 'e4', black: 'e5' });
    expect(pairs[1]).toEqual({ number: 2, white: 'Nf3', black: null });
  });

  it('finds the king square', () => {
    const c = new Chess();
    expect(findKing(c, 'w')).toBe('e1');
    expect(findKing(c, 'b')).toBe('e8');
  });

  it('round-trips FEN and produces PGN', () => {
    const c = new Chess();
    c.move('e4'); c.move('c5');
    expect(c.fen()).toContain('rnbqkbnr/pp1ppppp');
    expect(c.pgn()).toContain('1. e4 c5');
  });
});
