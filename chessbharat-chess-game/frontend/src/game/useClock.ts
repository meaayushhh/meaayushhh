import { useEffect, useRef, useState } from 'react';
import type { PieceColor } from '../utils/fen';

export interface ClockState {
  whiteMs: number;
  blackMs: number;
}

/**
 * Two-sided chess clock with increment.
 *
 * Elapsed time is measured from wall-clock timestamps (not by counting ticks),
 * so throttled background tabs don't distort the running side's remaining time
 * while the tab is focused. Browser background-tab/device-sleep behaviour still
 * limits perfect accuracy for casual play — this is documented for players and
 * hardened further in Phase 5.
 */
export function useClock(opts: {
  baseMs: number | null; // null = unlimited (clock disabled)
  incrementMs: number;
  activeColor: PieceColor;
  running: boolean;
  onFlag: (loser: PieceColor) => void;
}): { clock: ClockState; applyIncrement: (mover: PieceColor) => void; reset: () => void } {
  const { baseMs, incrementMs, activeColor, running, onFlag } = opts;
  const enabled = baseMs != null;

  const [clock, setClock] = useState<ClockState>({
    whiteMs: baseMs ?? 0,
    blackMs: baseMs ?? 0,
  });
  const lastTsRef = useRef<number>(0);
  const flaggedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Keep latest values available to the animation loop without re-subscribing.
  const activeRef = useRef(activeColor);
  activeRef.current = activeColor;
  const runningRef = useRef(running);
  runningRef.current = running && enabled;
  const onFlagRef = useRef(onFlag);
  onFlagRef.current = onFlag;

  useEffect(() => {
    if (!enabled) return;
    lastTsRef.current = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = now - lastTsRef.current;
      lastTsRef.current = now;

      if (runningRef.current && !flaggedRef.current && dt > 0) {
        setClock((c) => {
          const key = activeRef.current === 'w' ? 'whiteMs' : 'blackMs';
          const next = Math.max(0, c[key] - dt);
          if (next <= 0 && !flaggedRef.current) {
            flaggedRef.current = true;
            onFlagRef.current(activeRef.current);
          }
          return { ...c, [key]: next };
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  function applyIncrement(mover: PieceColor) {
    if (!enabled || incrementMs <= 0) return;
    setClock((c) => {
      const key = mover === 'w' ? 'whiteMs' : 'blackMs';
      return { ...c, [key]: c[key] + incrementMs };
    });
  }

  function reset() {
    flaggedRef.current = false;
    lastTsRef.current = performance.now();
    setClock({ whiteMs: baseMs ?? 0, blackMs: baseMs ?? 0 });
  }

  return { clock, applyIncrement, reset };
}

export function formatClock(ms: number | null): string {
  if (ms == null) return '—:—';
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${(m % 60).toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
