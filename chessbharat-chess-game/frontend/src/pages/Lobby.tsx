import { useMemo, useState } from 'react';
import { OPPONENTS } from '../data/opponents';
import { DIFFICULTY_META, type DifficultyGroup, type Opponent } from '../opponents/types';
import { TIME_CONTROLS, isAllowedForClassicalOnly } from '../data/timeControls';
import { Portrait } from '../components/Portrait';
import type { GameSetup } from '../app/types';
import type { PieceColor } from '../utils/fen';
import './Lobby.css';

type Filter = 'all' | DifficultyGroup;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'expert', label: 'Expert' },
];

export function Lobby({
  portraitsBase,
  onStart,
}: {
  portraitsBase: string;
  onStart: (setup: GameSetup) => void;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Opponent | null>(null);

  const visible = useMemo(
    () => (filter === 'all' ? OPPONENTS : OPPONENTS.filter((o) => o.difficulty === filter)),
    [filter],
  );

  return (
    <section className="cb-lobby" aria-labelledby="cb-lobby-title">
      <header className="cb-lobby__head">
        <p className="cb-eyebrow">Play Chess Online</p>
        <h1 id="cb-lobby-title">Choose your opponent</h1>
        <p className="cb-lobby__intro">
          Eleven original computer players, each with a distinct personality, opening
          repertoire and playing style. Pick an opponent, set the clock, and play a
          full game — from your first opening move to the final result.
        </p>
      </header>

      <div className="cb-filterbar" role="tablist" aria-label="Filter opponents by difficulty">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`cb-chip ${filter === f.id ? 'is-active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="cb-grid" aria-label="Opponents">
        {visible.map((o) => (
          <li key={o.id}>
            <OpponentCard
              opponent={o}
              portraitsBase={portraitsBase}
              selected={selected?.id === o.id}
              onSelect={() => setSelected(o)}
            />
          </li>
        ))}
      </ul>

      {selected && (
        <SetupDialog
          opponent={selected}
          portraitsBase={portraitsBase}
          onClose={() => setSelected(null)}
          onStart={onStart}
        />
      )}
    </section>
  );
}

function OpponentCard({
  opponent,
  portraitsBase,
  selected,
  onSelect,
}: {
  opponent: Opponent;
  portraitsBase: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={`cb-card ${selected ? 'is-selected' : ''}`}
      style={{ ['--cb-card-accent' as string]: opponent.accentVar }}
    >
      <Portrait opponent={opponent} imageBase={portraitsBase} size="card" />
      <div className="cb-card__body">
        <div className="cb-card__topline">
          <span className="cb-badge" data-difficulty={opponent.difficulty}>
            {DIFFICULTY_META[opponent.difficulty].label}
          </span>
          <span className="cb-rating cb-tnum" title="Target rating">
            {opponent.ratingLabel}
          </span>
        </div>
        <h2 className="cb-card__name">{opponent.name}</h2>
        <p className="cb-card__tag">{opponent.tagline}</p>
        {opponent.restriction && (
          <p className="cb-card__restriction">
            <span aria-hidden="true">●</span> {opponent.restriction}
          </p>
        )}
      </div>
      <button type="button" className="cb-btn cb-btn--primary cb-card__cta" onClick={onSelect}>
        Challenge
      </button>
    </article>
  );
}

function SetupDialog({
  opponent,
  portraitsBase,
  onClose,
  onStart,
}: {
  opponent: Opponent;
  portraitsBase: string;
  onClose: () => void;
  onStart: (setup: GameSetup) => void;
}) {
  const classicalOnly = Boolean(opponent.restriction);
  const firstAllowed =
    TIME_CONTROLS.find((t) => (classicalOnly ? isAllowedForClassicalOnly(t) : true)) ??
    TIME_CONTROLS[0];
  const [tcId, setTcId] = useState(firstAllowed.id);
  const [color, setColor] = useState<PieceColor | 'random'>('w');

  const tc = TIME_CONTROLS.find((t) => t.id === tcId) ?? firstAllowed;
  const casual = tc.category === 'unlimited';

  function start() {
    const resolvedColor: PieceColor =
      color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : color;
    onStart({ opponent, timeControl: tc, playerColor: resolvedColor, casual });
  }

  return (
    <div className="cb-modal-scrim" onMouseDown={onClose}>
      <div
        className="cb-setup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cb-setup-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="cb-setup__close" aria-label="Close" onClick={onClose}>
          ✕
        </button>

        <div className="cb-setup__hero">
          <Portrait opponent={opponent} imageBase={portraitsBase} size="header" />
          <div>
            <span className="cb-badge" data-difficulty={opponent.difficulty}>
              {DIFFICULTY_META[opponent.difficulty].label} · {opponent.ratingLabel}
            </span>
            <h2 id="cb-setup-title">{opponent.name}</h2>
            <p className="cb-setup__sig">“{opponent.signatureLine}”</p>
          </div>
        </div>

        <p className="cb-setup__bio">{opponent.bio}</p>
        <dl className="cb-setup__facts">
          <div>
            <dt>You’ll practise</dt>
            <dd>{opponent.learningObjective}</dd>
          </div>
          {opponent.weakness && (
            <div>
              <dt>Exploitable weakness</dt>
              <dd>{opponent.weakness}</dd>
            </div>
          )}
        </dl>

        <fieldset className="cb-setup__group">
          <legend>Time control</legend>
          {classicalOnly && (
            <p className="cb-setup__note">
              {opponent.name} plays classical time controls only — faster clocks are disabled.
            </p>
          )}
          <div className="cb-tc-grid">
            {TIME_CONTROLS.map((t) => {
              const disabled = classicalOnly && !isAllowedForClassicalOnly(t);
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`cb-tc ${tcId === t.id ? 'is-active' : ''}`}
                  disabled={disabled}
                  aria-pressed={tcId === t.id}
                  onClick={() => setTcId(t.id)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="cb-setup__group">
          <legend>Play as</legend>
          <div className="cb-color-row">
            {([
              { id: 'w', label: 'White' },
              { id: 'b', label: 'Black' },
              { id: 'random', label: 'Random' },
            ] as const).map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cb-tc ${color === c.id ? 'is-active' : ''}`}
                aria-pressed={color === c.id}
                onClick={() => setColor(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>

        <button type="button" className="cb-btn cb-btn--primary cb-setup__start" onClick={start}>
          Start game
        </button>
      </div>
    </div>
  );
}
