import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Portrait } from '../components/Portrait';
import { TIME_CONTROLS, isAllowedForClassicalOnly, type TimeControl } from '../data/timeControls';
import type { Opponent } from '../opponents/types';
import type { AvatarChoice, GameSetup, PlayerProfile, PresetKey } from '../app/types';
import type { PieceColor } from '../utils/fen';
import './Versus.css';

const PRESETS: { key: PresetKey; label: string; glyph: string }[] = [
  { key: 'king', label: 'King', glyph: '♔' },
  { key: 'queen', label: 'Queen', glyph: '♕' },
  { key: 'rook', label: 'Rook', glyph: '♖' },
  { key: 'knight', label: 'Knight', glyph: '♘' },
];

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const MAX_NAME = 16;

function presetGlyph(key: PresetKey): string {
  return PRESETS.find((p) => p.key === key)?.glyph ?? '♔';
}

/**
 * Match screen. The chosen fighter faces the player. The player sets their
 * name and avatar, the clock and the colour, then enters the arena.
 */
export function Versus({
  opponent,
  portraitsBase,
  profile,
  onProfileChange,
  onBack,
  onFight,
}: {
  opponent: Opponent;
  portraitsBase: string;
  profile: PlayerProfile;
  onProfileChange: (next: PlayerProfile) => void;
  onBack: () => void;
  onFight: (setup: GameSetup) => void;
}) {
  const classicalOnly = Boolean(opponent.restriction);
  const firstAllowed =
    TIME_CONTROLS.find((t) => (classicalOnly ? isAllowedForClassicalOnly(t) : true)) ?? TIME_CONTROLS[0];

  const [tcId, setTcId] = useState(firstAllowed.id);
  const [color, setColor] = useState<PieceColor | 'random'>('w');
  const [leaving, setLeaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tc: TimeControl = TIME_CONTROLS.find((t) => t.id === tcId) ?? firstAllowed;

  function setAvatar(avatar: AvatarChoice) {
    onProfileChange({ ...profile, avatar });
    setPhotoError(null);
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again later
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Please choose an image under 3 MB.');
      return;
    }
    // Read locally only. The photo is never uploaded anywhere.
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatar({ kind: 'photo', src: reader.result });
    };
    reader.onerror = () => setPhotoError('That image could not be read.');
    reader.readAsDataURL(file);
  }

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

  const displayName = profile.name.trim() || 'Player';
  const avatar = profile.avatar;

  return (
    <section className={`cb-versus ${leaving ? 'is-leaving' : ''}`} aria-labelledby="cb-versus-title">
      <h1 id="cb-versus-title" className="cb-sr-only">Match setup against {opponent.name}</h1>

      <div className="cb-versus__stage">
        <div className="cb-versus__side cb-versus__side--you">
          <div className="cb-versus__you-mark">
            {avatar.kind === 'photo' ? (
              <img src={avatar.src} alt="" />
            ) : (
              <span aria-hidden="true">{presetGlyph(avatar.key)}</span>
            )}
          </div>
          <p className="cb-versus__label">{displayName}</p>
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
          <legend>Your fighter</legend>
          <div className="cb-versus__profile">
            <label className="cb-versus__name-field">
              <span>Name</span>
              <input
                type="text"
                value={profile.name}
                maxLength={MAX_NAME}
                autoComplete="nickname"
                onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
                onBlur={() => {
                  if (!profile.name.trim()) onProfileChange({ ...profile, name: 'Player' });
                }}
              />
            </label>

            <div className="cb-versus__avatars" role="radiogroup" aria-label="Avatar">
              {PRESETS.map((p) => {
                const active = avatar.kind === 'preset' && avatar.key === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={p.label}
                    className={`cb-versus__avatar ${active ? 'is-active' : ''}`}
                    onClick={() => setAvatar({ kind: 'preset', key: p.key })}
                  >
                    <span aria-hidden="true">{p.glyph}</span>
                  </button>
                );
              })}
              <button
                type="button"
                className={`cb-versus__avatar cb-versus__avatar--photo ${avatar.kind === 'photo' ? 'is-active' : ''}`}
                onClick={() => fileRef.current?.click()}
                aria-label="Upload a photo"
              >
                {avatar.kind === 'photo' ? <img src={avatar.src} alt="" /> : <span aria-hidden="true">+</span>}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onFile}
                hidden
              />
            </div>
          </div>
          <p className="cb-versus__hint">
            {photoError ?? 'A photo stays on this device. Nothing is uploaded.'}
          </p>
        </fieldset>

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
