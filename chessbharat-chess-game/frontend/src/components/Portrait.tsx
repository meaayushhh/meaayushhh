import { useState } from 'react';
import type { Opponent } from '../opponents/types';
import { getConfig } from '../app/config';

/**
 * Opponent portrait.
 *
 * Final artwork (11 original character portraits) is produced in Phase 5. Until
 * then this renders a CLEARLY-LABELLED placeholder - never passed off as final
 * art. When a real image exists at assets/portraits/<file>, it is used and the
 * placeholder becomes the graceful fallback if the image fails to load.
 */
export function Portrait({
  opponent,
  imageBase,
  size = 'card',
}: {
  opponent: Opponent;
  /** Base URL of assets/portraits/ (injected by WP). Empty in dev = placeholder. */
  imageBase?: string;
  size?: 'card' | 'header' | 'result';
}) {
  const [failed, setFailed] = useState(false);
  const initials = opponent.name
    .replace(/^The\s+/, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  // A standalone build can inline portraits as data URIs via config.portraits,
  // keyed by filename. Otherwise fall back to imageBase + filename (WordPress).
  const inlineSrc = getConfig().portraits?.[opponent.portrait];
  const src = inlineSrc ?? (imageBase ? `${imageBase}${opponent.portrait}` : '');
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={`cb-portrait cb-portrait--${size}`}
      data-difficulty={opponent.difficulty}
      style={{ ['--cb-portrait-accent' as string]: opponent.accentVar }}
    >
      {showImage ? (
        <img
          src={src}
          alt={`${opponent.name}, opponent portrait`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="cb-portrait__ph" aria-label={`${opponent.name} portrait placeholder`}>
          <span className="cb-portrait__initials" aria-hidden="true">{initials}</span>
          <span className="cb-portrait__badge">Placeholder art</span>
        </div>
      )}
    </div>
  );
}
