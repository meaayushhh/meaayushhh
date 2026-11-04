import { describe, it, expect } from 'vitest';
import { resultToken } from './pgn';

describe('resultToken', () => {
  it('maps a White checkmate win to 1-0', () => {
    expect(resultToken({ over: true, kind: 'checkmate', winner: 'w', reason: 'Checkmate' }, 'w')).toBe('1-0');
  });
  it('maps a Black checkmate win to 0-1', () => {
    expect(resultToken({ over: true, kind: 'checkmate', winner: 'b', reason: 'Checkmate' }, 'w')).toBe('0-1');
  });
  it('maps a draw to 1/2-1/2', () => {
    expect(resultToken({ over: true, kind: 'draw', winner: null, reason: 'Stalemate' }, 'w')).toBe('1/2-1/2');
  });
  it('maps an ongoing game to *', () => {
    expect(resultToken({ over: false }, 'w')).toBe('*');
  });
});
