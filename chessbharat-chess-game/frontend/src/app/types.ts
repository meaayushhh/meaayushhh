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

/** The four chess-piece avatars a player can pick without uploading anything. */
export type PresetKey = 'king' | 'queen' | 'knight' | 'rook';

/** A preset, or a photo the player chose on this device (never uploaded). */
export type AvatarChoice = { kind: 'preset'; key: PresetKey } | { kind: 'photo'; src: string };

export interface PlayerProfile {
  name: string;
  avatar: AvatarChoice;
}

export const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Player',
  avatar: { kind: 'preset', key: 'king' },
};

export type GameResult =
  | { kind: 'win'; reason: string }
  | { kind: 'loss'; reason: string }
  | { kind: 'draw'; reason: string };
