import type { GameOutcome } from '../game/useChessGame';
import type { PieceColor } from './fen';

/** Map an outcome to a PGN result token. */
export function resultToken(outcome: GameOutcome, humanColor: PieceColor): string {
  if (!outcome.over) return '*';
  if (outcome.kind === 'checkmate') {
    return outcome.winner === 'w' ? '1-0' : '0-1';
  }
  return '1/2-1/2';
  // Note: `humanColor` is accepted for symmetry with callers that build
  // human/engine White/Black headers.
  void humanColor;
}

/** Trigger a browser download of a PGN string. */
export function downloadPgn(pgn: string, filename: string): void {
  try {
    const blob = new Blob([pgn], { type: 'application/x-chess-pgn' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.pgn') ? filename : `${filename}.pgn`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    /* ignore */
  }
}
