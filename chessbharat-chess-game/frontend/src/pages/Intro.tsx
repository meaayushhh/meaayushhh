import { useEffect } from 'react';
import { Logo } from '../components/Logo';
import './Intro.css';

/**
 * Title screen. The mark and wordmark assemble on entry, then the screen waits
 * for the player to press a key, click or tap, the way arcade title screens do.
 */
/** How long the title waits before moving on by itself. */
const AUTO_CONTINUE_MS = 8000;

export function Intro({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onContinue();
      }
    }
    window.addEventListener('keydown', onKey);
    // Move on by itself after a while, so the title never blocks the game.
    const timer = window.setTimeout(onContinue, AUTO_CONTINUE_MS);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
    };
  }, [onContinue]);

  const letters = 'CHESS'.split('');
  const letters2 = 'BHARAT'.split('');

  return (
    <button type="button" className="cb-intro" onClick={onContinue} aria-label="Press to begin">
      <div className="cb-intro__stage">
        <div className="cb-intro__mark">
          <Logo size={150} withWordmark={false} />
        </div>

        <h1 className="cb-intro__title" aria-label="Chess Bharat">
          <span className="cb-intro__word" aria-hidden="true">
            {letters.map((l, i) => (
              <span key={`a${i}`} style={{ animationDelay: `${0.55 + i * 0.07}s` }}>{l}</span>
            ))}
          </span>
          <span className="cb-intro__word cb-intro__word--accent" aria-hidden="true">
            {letters2.map((l, i) => (
              <span key={`b${i}`} style={{ animationDelay: `${0.95 + i * 0.07}s` }}>{l}</span>
            ))}
          </span>
        </h1>

        <span className="cb-intro__rule" aria-hidden="true" />
        <p className="cb-intro__tagline">Eleven opponents. One board.</p>
        <p className="cb-intro__press">Press Enter or tap to begin</p>
      </div>
    </button>
  );
}
