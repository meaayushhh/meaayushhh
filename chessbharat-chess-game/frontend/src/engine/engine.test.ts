import { describe, it, expect } from 'vitest';
import { parseBestMove } from './StockfishEngine';

describe('parseBestMove (UCI bestmove token)', () => {
  it('parses a normal move', () => {
    expect(parseBestMove('e2e4')).toEqual({ from: 'e2', to: 'e4' });
  });
  it('parses a promotion move', () => {
    expect(parseBestMove('e7e8q')).toEqual({ from: 'e7', to: 'e8', promotion: 'q' });
    expect(parseBestMove('a2a1n')).toEqual({ from: 'a2', to: 'a1', promotion: 'n' });
  });
  it('returns null for "(none)" and "0000"', () => {
    expect(parseBestMove('(none)')).toBeNull();
    expect(parseBestMove('0000')).toBeNull();
  });
  it('rejects malformed tokens', () => {
    expect(parseBestMove('')).toBeNull();
    expect(parseBestMove('e2')).toBeNull();
    expect(parseBestMove('z9e4')).toBeNull();
    expect(parseBestMove('e2e4k')).toBeNull(); // king is not a valid promotion
  });
});
