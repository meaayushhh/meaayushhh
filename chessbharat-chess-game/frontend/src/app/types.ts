import type { PieceColor } from '../utils/fen';
import type { Opponent } from '../opponents/types';
import type { TimeControl } from '../data/timeControls';

/**
 * Screen flow, modelled on a classic fighting-game front end:
 * title -> roster (pick a fighter, bio shown) -> versus (set the match) -> arena.
 */
export type Screen = 'intro' | 'roster' | 'versus' | 'game';

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
