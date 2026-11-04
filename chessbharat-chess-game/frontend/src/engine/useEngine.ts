import { useCallback, useEffect, useRef, useState } from 'react';
import { StockfishEngine, parseBestMove, type ParsedMove } from './StockfishEngine';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface RequestMoveArgs {
  fen: string;
  skill: number;
  movetimeMs: number;
}

/**
 * Lifecycle manager for the Stockfish worker. Lazy-initialises on first use,
 * exposes a status for loading/error UI, and tears the worker down on unmount.
 * Never throws to the caller: requestMove resolves to a move or null (so the
 * game loop can fall back and keep playing).
 */
export function useEngine(engineUrl: string) {
  const ref = useRef<StockfishEngine | null>(null);
  const [status, setStatus] = useState<EngineStatus>('idle');

  const ensure = useCallback(async (): Promise<StockfishEngine | null> => {
    if (ref.current?.alive) return ref.current;
    // Clean up a dead worker so a crashed engine is transparently restarted.
    if (ref.current && !ref.current.alive) {
      ref.current.terminate();
      ref.current = null;
    }
    setStatus('loading');
    try {
      const engine = new StockfishEngine(engineUrl);
      await engine.init();
      engine.newGame();
      ref.current = engine;
      setStatus('ready');
      return engine;
    } catch {
      ref.current?.terminate();
      ref.current = null;
      setStatus('error');
      return null;
    }
  }, [engineUrl]);

  const requestMove = useCallback(
    async ({ fen, skill, movetimeMs }: RequestMoveArgs): Promise<ParsedMove | null> => {
      const engine = await ensure();
      if (!engine) return null;
      try {
        engine.setSkillLevel(skill);
        const token = await engine.search({ fen, movetimeMs });
        return parseBestMove(token);
      } catch {
        return null;
      }
    },
    [ensure],
  );

  const newGame = useCallback(() => {
    if (ref.current?.alive) ref.current.newGame();
  }, []);

  const stop = useCallback(() => {
    if (ref.current?.alive) ref.current.stop();
  }, []);

  useEffect(() => {
    return () => {
      ref.current?.terminate();
      ref.current = null;
    };
  }, []);

  return { status, requestMove, newGame, stop };
}
