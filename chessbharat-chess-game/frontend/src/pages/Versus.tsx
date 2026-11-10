import { useEffect, useState } from 'react';
import { Portrait } from '../components/Portrait';
import { TIME_CONTROLS, isAllowedForClassicalOnly, type TimeControl } from '../data/timeControls';
import type { Opponent } from '../opponents/types';
import type { GameSetup } from '../app/types';
import type { PieceColor } from '../utils/fen';
import './Versus.css';

/**
 * Match screen. The chosen fighter faces the player, and the match is set
 * (clock and colour) before entering the arena.
 */
export function Versus({
  opponent,
  portraitsBase,
  onBack,
  onFight,
}: {
  opponent: Opponent;
  portraitsBase: string;
  onBack: () => void;
  onFight: (setup: GameSetup) => void;
}) {
  const classicalOnly = Boolean(opponent.restriction);
  const firstAllowed =
    TIME_CONTROLS.find((t) => (classicalOnly ? isAllowedForClassicalOnly(t) : true)) ?? TIME_CONTROLS[0];

  const [tcId, setTcId] = useState(firstAllowed.id);
  const [color, setColor] = useState<PieceColor | 'random'>('w');
  const [leaving, setLeaving] = useState(false);

  const tc: TimeControl = TIME_CONTROLS.find((t) => t.id === tcId) ?? firstAllowed;

  function fight() {
    if (leaving) return;
    const resolved: PieceColor = color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : color;
    setLeaving(true);
    // Let the exit animation play before the arena mounts.
    window.setTimeout(() => {
      onFight({ opponent, timeControl: tc, playerColor: resolved, casual: tc.category === 'unlimited' });
    }, 650);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onBack();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  return (
    <section className={`cb-versus ${leaving ? 'is-leaving' : ''}`} aria-labelledby="cb-versus-title">
      <h1 id="cb-versus-title" className="cb-sr-only">Match setup against {opponent.name}</h1>

      <div className="cb-versus__stage">
        <div className="cb-versus__side cb-versus__side--you">
          <div className="cb-versus__you-mark" aria-hidden="true">
            {color === 'b' ? '♚' : '♔'}
          </div>
          <p className="cb-versus__label">You</p>
          <p className="cb-versus__sub">Playing {color === 'b' ? 'Black' : color === 'w' ? 'White' : 'a random colour'}</p>
        </div>

        <div className="cb-versus__vs" aria-hidden="true">
          <span>VS</span>
        </div>

        <div className="cb-versus__side cb-versus__side--foe">
          <div className="cb-versus__portrait">
            <Portrait opponent={opponent} imageBase={portraitsBase} size="bio" />
          </div>
          <p className="cb-versus__label">{opponent.name}</p>
          <p className="cb-versus__sub">
            <span className="cb-badge" data-difficulty={opponent.difficulty}>{opponent.ratingLabel}</span>
          </p>
        </div>
      </div>

      <div className="cb-versus__panel">
        <fieldset className="cb-versus__group">
          <legend>Time control</legend>
          {classicalOnly && (
            <p className="cb-versus__note">{opponent.name} plays classical time controls only.</p>
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

        <fieldset className="cb-versus__group">
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

        <div className="cb-versus__actions">
          <button type="button" className="cb-btn cb-btn--ghost" onClick={onBack}>Back to roster</button>
          <button type="button" className="cb-btn cb-btn--primary cb-versus__fight" onClick={fight} disabled={leaving}>
            Enter the arena
          </button>
        </div>
      </div>
    </section>
  );
}
