import type { PieceColor } from '../utils/fen';
import type { Opponent } from '../opponents/types';
import type { TimeControl } from '../data/timeControls';

export type Screen = 'lobby' | 'game' | 'result';

export interface GameSetup {
  opponent: Opponent;
  timeControl: TimeControl;
  playerColor: PieceColor;
  /** Casual mode enables Undo; competitive (timed) modes disable it. */
  casual: boolean;
}

export type GameResult =
  | { kind: 'win'; reason: string }
  | { kind: 'loss'; reason: string }
  | { kind: 'draw'; reason: string };
