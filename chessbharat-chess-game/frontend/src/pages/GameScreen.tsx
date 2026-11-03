import { useMemo, useState } from 'react';
import { Board } from '../board/Board';
import { Portrait } from '../components/Portrait';
import { ConfirmModal } from '../components/Modal';
import { DIFFICULTY_META } from '../opponents/types';
import type { GameSetup } from '../app/types';
import type { PieceColor, Square } from '../utils/fen';
import './GameScreen.css';

/**
 * PHASE 1 — static visual prototype of the play environment.
 *
 * This screen demonstrates layout, hierarchy and brand at the intended
 * quality. It is NOT yet a playable game: the position, clocks, captured
 * pieces and move list are representative sample data, and clicking a square
 * only shows the selection highlight. Real rules (chess.js) arrive in Phase 2
 * and the engine in Phase 3. Controls that would be destructive already
 * confirm, and nothing here fakes a completed or in-progress result.
 */

// Sample position: Italian Game, Giuoco Pianissimo — after 5...d6.
const SAMPLE_FEN = 'r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6';
const SAMPLE_LAST = { from: 'd2' as Square, to: 'd3' as Square };

// Representative move list (SAN). Phase 2 generates this from real play.
const SAMPLE_MOVES: [string, string][] = [
  ['e4', 'e5'],
  ['Nf3', 'Nc6'],
  ['Bc4', 'Bc5'],
  ['c3', 'Nf6'],
  ['d3', ''],
];

export function GameScreen({
  setup,
  portraitsBase,
  showCoordinatesDefault,
  onExit,
}: {
  setup: GameSetup;
  portraitsBase: string;
  showCoordinatesDefault: boolean;
  onExit: () => void;
}) {
  const { opponent, timeControl, playerColor, casual } = setup;
  const [orientation, setOrientation] = useState<PieceColor>(playerColor);
  const [selected, setSelected] = useState<Square | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [showCoords, setShowCoords] = useState(showCoordinatesDefault);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | 'resign' | 'newgame'>(null);

  const initialClock = useMemo(
    () => (timeControl.baseMinutes == null ? '—:—' : `${timeControl.baseMinutes}:00`),
    [timeControl],
  );

  // Sample legal targets for the selected square (visual demo only).
  const legalTargets = selected
    ? [
        { to: 'e6' as Square, isCapture: false },
        { to: 'd5' as Square, isCapture: false },
      ]
    : [];

  const opponentLabel = playerColor === 'w' ? 'Black' : 'White';
  const playerLabel = playerColor === 'w' ? 'White' : 'Black';

  return (
    <section className="cb-game" aria-label={`Game against ${opponent.name}`}>
      <div className="cb-game__main">
        {/* Opponent header */}
        <header className="cb-opp" aria-label="Opponent">
          <Portrait opponent={opponent} imageBase={portraitsBase} size="header" />
          <div className="cb-opp__meta">
            <div className="cb-opp__row">
              <h2 className="cb-opp__name">{opponent.name}</h2>
              <span className="cb-badge" data-difficulty={opponent.difficulty}>
                {DIFFICULTY_META[opponent.difficulty].label} · {opponent.ratingLabel}
              </span>
            </div>
            <p className="cb-opp__say" aria-live="polite">“{opponent.signatureLine}”</p>
          </div>
          <span className="cb-think" hidden aria-hidden="true">
            <i /><i /><i />
          </span>
        </header>

        {/* Opponent info bar */}
        <PlayerBar
          side={opponentLabel}
          clock={initialClock}
          captured={['p', 'p']}
          capturedColor={playerColor}
          material={0}
        />

        {/* Board */}
        <div className="cb-game__board">
          <Board
            fen={SAMPLE_FEN}
            orientation={orientation}
            lastMove={SAMPLE_LAST}
            selected={selected}
            legalTargets={legalTargets}
            showCoordinates={showCoords}
            interactive
            onSquareClick={(sq) => setSelected((cur) => (cur === sq ? null : sq))}
          />
        </div>

        {/* Player info bar */}
        <PlayerBar
          side={`You · ${playerLabel}`}
          clock={initialClock}
          captured={['n']}
          capturedColor={playerColor === 'w' ? 'b' : 'w'}
          material={0}
          you
        />
      </div>

      {/* Side panel: move history + controls */}
      <aside className="cb-side" aria-label="Game panel">
        <div className="cb-movehist">
          <h3 className="cb-panel__title">Moves</h3>
          <ol className="cb-moves cb-tnum" aria-label="Move history">
            {SAMPLE_MOVES.map(([w, b], i) => {
              const isCurrent = i === SAMPLE_MOVES.length - 1;
              return (
                <li key={i} className={isCurrent ? 'is-current' : ''}>
                  <span className="cb-moves__no">{i + 1}.</span>
                  <span className="cb-moves__ply">{w}</span>
                  <span className="cb-moves__ply">{b}</span>
                </li>
              );
            })}
          </ol>
          <p className="cb-prototype-note">Sample game · live play begins in Phase 2</p>
        </div>

        <div className="cb-controls" role="group" aria-label="Game controls">
          <button className="cb-btn cb-btn--ghost cb-btn--sm" onClick={() => setConfirm('newgame')}>
            New game
          </button>
          <button className="cb-btn cb-btn--ghost cb-btn--sm" onClick={() => setOrientation((o) => (o === 'w' ? 'b' : 'w'))}>
            Flip board
          </button>
          <button className="cb-btn cb-btn--ghost cb-btn--sm" disabled={!casual} title={casual ? 'Undo your last move' : 'Undo is available in casual (unlimited) games only'}>
            Undo
          </button>
          <button className="cb-btn cb-btn--ghost cb-btn--sm" aria-pressed={soundOn} onClick={() => setSoundOn((s) => !s)}>
            Sound: {soundOn ? 'On' : 'Off'}
          </button>
          <button className="cb-btn cb-btn--ghost cb-btn--sm" onClick={() => setSettingsOpen((v) => !v)} aria-expanded={settingsOpen}>
            Settings
          </button>
          <button className="cb-btn cb-btn--ghost cb-btn--sm" disabled title="Offer a draw (enabled in Phase 2)">
            Offer draw
          </button>
          <button className="cb-btn cb-btn--danger cb-btn--sm cb-controls__resign" onClick={() => setConfirm('resign')}>
            Resign
          </button>
        </div>

        {settingsOpen && (
          <div className="cb-settings" role="group" aria-label="Settings">
            <label className="cb-toggle">
              <input type="checkbox" checked={showCoords} onChange={(e) => setShowCoords(e.target.checked)} />
              <span>Show board coordinates</span>
            </label>
          </div>
        )}
      </aside>

      <ConfirmModal
        open={confirm === 'resign'}
        title="Resign this game?"
        body="You’ll forfeit the game and return to the result screen."
        confirmLabel="Resign"
        cancelLabel="Keep playing"
        tone="danger"
        onConfirm={() => { setConfirm(null); onExit(); }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        open={confirm === 'newgame'}
        title="Start a new game?"
        body="The current game will be discarded."
        confirmLabel="New game"
        cancelLabel="Cancel"
        onConfirm={() => { setConfirm(null); onExit(); }}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}

function PlayerBar({
  side,
  clock,
  captured,
  capturedColor,
  material,
  you = false,
}: {
  side: string;
  clock: string;
  captured: string[];
  capturedColor: PieceColor;
  material: number;
  you?: boolean;
}) {
  const glyphs: Record<string, string> = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };
  return (
    <div className={`cb-pbar ${you ? 'cb-pbar--you' : ''}`}>
      <div className="cb-pbar__left">
        <span className="cb-pbar__side">{side}</span>
        <span className="cb-captured" aria-label="Captured pieces">
          {captured.map((p, i) => (
            <span key={i} className={`cb-cap cb-cap--${capturedColor}`} aria-hidden="true">{glyphs[p]}</span>
          ))}
          {material > 0 && <span className="cb-material">+{material}</span>}
        </span>
      </div>
      <span className="cb-clock cb-tnum" aria-label={`${side} clock`}>{clock}</span>
    </div>
  );
}
