/**
 * Opponent model for the ChessBharat Chess Game.
 *
 * An opponent is MORE than an engine skill slider: it carries a personality
 * configuration that a dedicated selection layer (Phase 4) uses to shape move
 * choice on top of Stockfish's candidates, plus display and dialogue metadata.
 */

export type DifficultyGroup = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Dialogue is contextual, triggered by game events - never random spam. */
export type DialogueTrigger =
  | 'gameStart'
  | 'ownMistake'
  | 'foundTactic'
  | 'playerAttacks'
  | 'enterEndgame'
  | 'check'
  | 'checkmateGiven'
  | 'victory'
  | 'defeat'
  | 'draw';

export type DialogueLines = Partial<Record<DialogueTrigger, string[]>>;

/**
 * Opening repertoire by side. Entries are opening/system names; Phase 4 maps
 * these to concrete move sequences / ECO families and biases early play.
 */
export interface OpeningRepertoire {
  asWhite: string[];
  asBlack: string[];
}

/**
 * Beginner mistake model (used for the 200–900 opponents). Controlled,
 * plausible human errors - NOT random legal moves. Phase 4 implements the
 * behaviour; these are the tunable parameters.
 */
export interface MistakeModel {
  /** Probability [0..1] of overlooking an available winning capture. */
  missCaptureChance: number;
  /** Probability [0..1] of leaving a piece hanging / ignoring a threat. */
  hangPieceChance: number;
  /** Probability [0..1] of missing a simple one-move tactic against them. */
  missThreatChance: number;
  /** How far down the ranked candidate list a "mistake" may reach. */
  blunderDepth: number;
}

export type MoveSelectionPolicy =
  | 'objectiveBest'      // play near the engine's top line
  | 'weightedCandidate'  // sample from MultiPV weighted by personality
  | 'humanlikeMistakes'; // apply the mistake model first, then weight

export interface PersonalityConfig {
  targetElo: number;
  /** Stockfish "Skill Level" 0–20 starting point before personality shaping. */
  engineSkill: number;
  searchTimeMs: number;
  searchDepth: number;
  /** 0..1 scalars that bias candidate scoring in the personality layer. */
  riskTolerance: number;
  aggression: number;
  sacrificePreference: number;
  positionalPreference: number;
  tacticalPreference: number;
  endgamePreference: number;
  openingRepertoire: OpeningRepertoire;
  mistakeModel: MistakeModel | null;
  moveSelectionPolicy: MoveSelectionPolicy;
  /** 'instant' | 'quick' | 'measured' | 'deliberate' - paces the UI "thinking". */
  thinkingTimeProfile: 'instant' | 'quick' | 'measured' | 'deliberate';
}

export interface Opponent {
  id: string;
  index: number;              // 1..11, display order
  name: string;
  /** Target rating LABEL - calibrated and reported honestly, not guaranteed. */
  rating: number;
  ratingLabel: string;        // e.g. "~200", "2300+"
  difficulty: DifficultyGroup;
  /** One-line personality hook for the card. */
  tagline: string;
  /** The signature line shown in the opponent header. */
  signatureLine: string;
  /** 2–3 sentence detail for the expandable panel. */
  bio: string;
  /** What a player tends to learn against this opponent. */
  learningObjective: string;
  /** Known weakness the player can exploit (empty for the Ultimate Bot). */
  weakness: string;
  /** e.g. "Classical time controls only". */
  restriction?: string;
  /** Portrait asset basename (served from assets/portraits). */
  portrait: string;
  /** Accent used sparingly on the card; derived from difficulty group. */
  accentVar: string;
  config: PersonalityConfig;
  dialogue: DialogueLines;
}

export const DIFFICULTY_META: Record<
  DifficultyGroup,
  { label: string; accentVar: string; order: number }
> = {
  beginner:     { label: 'Beginner',     accentVar: 'var(--cb-diff-beginner)',     order: 0 },
  intermediate: { label: 'Intermediate', accentVar: 'var(--cb-diff-intermediate)', order: 1 },
  advanced:     { label: 'Advanced',     accentVar: 'var(--cb-diff-advanced)',     order: 2 },
  expert:       { label: 'Expert',       accentVar: 'var(--cb-diff-expert)',       order: 3 },
};
