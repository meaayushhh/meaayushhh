import { describe, it, expect } from 'vitest';
import { materialFromFen } from './material';
import { STARTING_FEN } from './fen';

describe('materialFromFen', () => {
  it('reports no captures and even material at the start', () => {
    const m = materialFromFen(STARTING_FEN);
    expect(m.capturedByWhite).toEqual([]);
    expect(m.capturedByBlack).toEqual([]);
    expect(m.diff).toBe(0);
  });

  it('counts a white capture of a black knight (+3 for White)', () => {
    // Black is missing one knight; otherwise full.
    const m = materialFromFen('r1bqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(m.capturedByWhite).toEqual(['n']);
    expect(m.capturedByBlack).toEqual([]);
    expect(m.diff).toBe(3);
  });

  it('counts captures on both sides and nets the difference', () => {
    // White missing a pawn; Black missing a rook. Net = +5 (lost pawn) -1 ...
    // White has captured a black rook (+5), Black has captured a white pawn (+1) => diff = +4.
    const m = materialFromFen('1nbqkbnr/pppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR w Kk - 0 1');
    expect(m.capturedByWhite).toEqual(['r']); // black rook gone
    expect(m.capturedByBlack).toEqual(['p']); // white pawn gone
    expect(m.diff).toBe(4);
  });
});
