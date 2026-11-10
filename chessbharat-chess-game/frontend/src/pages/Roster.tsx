import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { OPPONENTS } from '../data/opponents';
import { DIFFICULTY_META, type DifficultyGroup, type Opponent } from '../opponents/types';
import { Portrait } from '../components/Portrait';
import './Roster.css';

type Filter = 'all' | DifficultyGroup;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'expert', label: 'Expert' },
];

/**
 * Fighter select. Moving the cursor (mouse, touch or arrow keys) over a fighter
 * brings up their bio on the side panel. Selecting the highlighted fighter, by
 * a second tap or Enter, moves on to the match setup.
 */
export function Roster({
  portraitsBase,
  onSelect,
}: {
  portraitsBase: string;
  onSelect: (opponent: Opponent) => void;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [focusId, setFocusId] = useState<string>(OPPONENTS[0].id);
  const gridRef = useRef<HTMLUListElement>(null);

  const visible = useMemo(
    () => (filter === 'all' ? OPPONENTS : OPPONENTS.filter((o) => o.difficulty === filter)),
    [filter],
  );

  // If the filter hides the focused fighter, move focus to the first visible one.
  const focused: Opponent =
    visible.find((o) => o.id === focusId) ?? visible[0] ?? OPPONENTS[0];

  function columnCount(): number {
    const tiles = gridRef.current?.querySelectorAll<HTMLElement>('[data-tile]');
    if (!tiles || tiles.length < 2) return 1;
    const top = tiles[0].offsetTop;
    let n = 0;
    for (const t of tiles) {
      if (t.offsetTop === top) n += 1;
      else break;
    }
    return Math.max(1, n);
  }

  function onGridKey(e: KeyboardEvent<HTMLUListElement>) {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const idx = visible.findIndex((o) => o.id === focused.id);
    const cols = columnCount();
    let next = idx;
    if (e.key === 'ArrowLeft') next = idx - 1;
    if (e.key === 'ArrowRight') next = idx + 1;
    if (e.key === 'ArrowUp') next = idx - cols;
    if (e.key === 'ArrowDown') next = idx + cols;
    next = Math.max(0, Math.min(visible.length - 1, next));
    const target = visible[next];
    if (!target) return;
    setFocusId(target.id);
    gridRef.current?.querySelector<HTMLElement>(`[data-tile="${target.id}"]`)?.focus();
  }

  function tileClick(o: Opponent) {
    if (o.id === focused.id) onSelect(o);
    else setFocusId(o.id);
  }

  return (
    <section className="cb-roster" aria-labelledby="cb-roster-title">
      <header className="cb-roster__head">
        <p className="cb-eyebrow">Select your fighter</p>
        <h1 id="cb-roster-title">Choose your opponent</h1>
        <div className="cb-filterbar" role="group" aria-label="Filter by difficulty">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`cb-chip ${filter === f.id ? 'is-active' : ''}`}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="cb-roster__body">
        {/* Bio panel. Keyed on the fighter so the entrance animation replays on change. */}
        <aside className="cb-bio" aria-live="polite">
          <div className="cb-bio__panel" key={focused.id}>
            <div className="cb-bio__portrait">
              <Portrait opponent={focused} imageBase={portraitsBase} size="bio" />
            </div>
            <div className="cb-bio__head">
              <span className="cb-badge" data-difficulty={focused.difficulty}>
                {DIFFICULTY_META[focused.difficulty].label} · {focused.ratingLabel}
              </span>
              <h2 className="cb-bio__name">{focused.name}</h2>
              <p className="cb-bio__sig">“{focused.signatureLine}”</p>
            </div>
            <p className="cb-bio__text">{focused.bio}</p>
            <dl className="cb-bio__facts">
              <div>
                <dt>Teaches</dt>
                <dd>{focused.learningObjective}</dd>
              </div>
              {focused.weakness && (
                <div>
                  <dt>Weak spot</dt>
                  <dd>{focused.weakness}</dd>
                </div>
              )}
              <div>
                <dt>Openings</dt>
                <dd>
                  {[...focused.config.openingRepertoire.asWhite.slice(0, 2), ...focused.config.openingRepertoire.asBlack.slice(0, 2)]
                    .join(', ') || 'Learns as it goes'}
                </dd>
              </div>
            </dl>
            {focused.restriction && <p className="cb-bio__note">{focused.restriction}</p>}
            <button type="button" className="cb-btn cb-btn--primary cb-bio__select" onClick={() => onSelect(focused)}>
              Select fighter
            </button>
          </div>
        </aside>

        <ul
          className="cb-roster__grid"
          ref={gridRef}
          role="listbox"
          aria-label="Opponents"
          onKeyDown={onGridKey}
        >
          {visible.map((o) => {
            const active = o.id === focused.id;
            return (
              <li key={o.id} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-tile={o.id}
                  tabIndex={active ? 0 : -1}
                  className={`cb-tile ${active ? 'is-focus' : ''}`}
                  onMouseEnter={() => setFocusId(o.id)}
                  onFocus={() => setFocusId(o.id)}
                  onClick={() => tileClick(o)}
                >
                  <span className="cb-tile__frame">
                    <Portrait opponent={o} imageBase={portraitsBase} size="card" />
                  </span>
                  <span className="cb-tile__name">{o.name.replace(/^The\s+/, '')}</span>
                  <span className="cb-tile__meta">
                    <span className="cb-tile__diff" data-difficulty={o.difficulty}>
                      {DIFFICULTY_META[o.difficulty].label}
                    </span>
                    <span className="cb-tile__rating cb-tnum">{o.ratingLabel}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
