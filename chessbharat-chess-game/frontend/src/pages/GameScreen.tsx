import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Board } from '../board/Board';
import { Portrait } from '../components/Portrait';
import { ConfirmModal } from '../components/Modal';
import { PromotionPanel } from '../components/PromotionPanel';
import { ResultOverlay } from '../components/ResultOverlay';
import { DIFFICULTY_META } from '../opponents/types';
import { useChessGame, type GameOutcome } from '../game/useChessGame';
import { useClock, formatClock } from '../game/useClock';
import { pickRandomMove } from '../game/tempOpponent';
import { gamePhase } from '../opponents/selection';
import { useEngine } from '../engine/useEngine';
import { ENGINE_FILENAME } from '../engine/StockfishEngine';
import { materialFromFen } from '../utils/material';
import { playCue } from '../utils/sound';
import { downloadPgn } from '../utils/pgn';
import type { GameSetup } from '../app/types';
import type { PieceColor, PieceType } from '../utils/fen';
import './GameScreen.css';

const CAP_GLYPH: Record<string, string> = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' };

export function GameScreen({
  setup,
  portraitsBase,
  engineBase,
  showCoordinatesDefault,
  onExit,
}: {
  setup: GameSetup;
  portraitsBase: string;
  engineBase: string;
  showCoordinatesDefault: boolean;
  onExit: () => void;
}) {
  const { opponent, timeControl, playerColor, casual } = setup;
  const oppColor: PieceColor = playerColor === 'w' ? 'b' : 'w';

  const game = useChessGame();
  const engine = useEngine(`${engineBase}${ENGINE_FILENAME}`);
  const [orientation, setOrientation] = useState<PieceColor>(playerColor);
  const [soundOn, setSoundOn] = useState(true);
  const [showCoords, setShowCoords] = useState(showCoordinatesDefault);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | 'resign' | 'newgame' | 'draw'>(null);
  const [thinking, setThinking] = useState(false);
  const [manualEnd, setManualEnd] = useState<GameOutcome | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [endedAt, setEndedAt] = useState<number | null>(null);

  const ended: GameOutcome = manualEnd ?? game.outcome;
  const isOver = ended.over;

  const baseMs = timeControl.baseMinutes == null ? null : timeControl.baseMinutes * 60000;
  const incMs = timeControl.incrementSeconds * 1000;

  const handleFlag = useCallback(
    (loser: PieceColor) => {
      setManualEnd({ over: true, kind: 'checkmate', winner: loser === 'w' ? 'b' : 'w', reason: 'Out of time' });
    },
    [],
  );

  const { clock, applyIncrement, reset: resetClock } = useClock({
    baseMs,
    incrementMs: incMs,
    activeColor: game.turn,
    running: !isOver && !game.promotion,
    onFlag: handleFlag,
  });

  // Record the end timestamp once.
  useEffect(() => {
    if (isOver && endedAt == null) setEndedAt(Date.now());
  }, [isOver, endedAt]);

  // Per-move side effects: increment, sound.
  const prevPly = useRef(0);
  useEffect(() => {
    if (game.plyCount > prevPly.current) {
      const mover: PieceColor = game.turn === 'w' ? 'b' : 'w';
      applyIncrement(mover);
      const pairs = game.movePairs;
      const lastPair = pairs[pairs.length - 1];
      const lastSan = lastPair ? (lastPair.black ?? lastPair.white) : null;
      if (game.outcome.over) playCue('end', soundOn);
      else if (game.inCheck || lastSan?.includes('+')) playCue('check', soundOn);
      else if (lastSan?.includes('x')) playCue('capture', soundOn);
      else playCue('move', soundOn);
    }
    prevPly.current = game.plyCount;
  }, [game.plyCount, game.turn, game.movePairs, game.inCheck, game.outcome.over, applyIncrement, soundOn]);

  useEffect(() => {
    if (manualEnd && !game.outcome.over) playCue('end', soundOn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualEnd]);

  // Opponent move: Stockfish searches the position; on any failure we fall
  // back to a random legal move so the game never stalls. The engine's move is
  // validated against the live position (applyMove returns null if illegal /
  // superseded), which also enforces "a new position supersedes the search".
  useEffect(() => {
    if (isOver || game.promotion) return;
    if (game.turn === playerColor) return;
    let cancelled = false;
    setThinking(true);
    const fen = game.fen;
    const movetimeMs = Math.max(200, Math.min(opponent.config.searchTimeMs, 3000));

    (async () => {
      const parsed = await engine.requestPersonalityMove({ fen, config: opponent.config, movetimeMs });
      if (cancelled) return;
      // Validate the engine move against the current position; fall back if needed.
      let applied = parsed ? game.applyMove(parsed) : null;
      if (!applied && !cancelled) {
        const rnd = pickRandomMove(game.legalMoves());
        if (rnd) applied = game.applyMove(rnd);
      }
      if (!cancelled) setThinking(false);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turn, game.fen, isOver, game.promotion, playerColor]);

  const material = useMemo(() => materialFromFen(game.fen), [game.fen]);

  const dialogue = useMemo(() => {
    const pick = (arr?: string[]) => (arr && arr.length ? arr[game.plyCount % arr.length] : undefined);
    if (isOver) {
      if (ended.winner && ended.winner === oppColor) return pick(opponent.dialogue.victory) ?? opponent.signatureLine;
      if (ended.winner === playerColor) return pick(opponent.dialogue.defeat) ?? 'Well played.';
      return pick(opponent.dialogue.draw) ?? opponent.signatureLine;
    }
    if (game.inCheck && game.turn === playerColor) return pick(opponent.dialogue.check) ?? opponent.signatureLine;
    if (game.plyCount === 0) return pick(opponent.dialogue.gameStart) ?? opponent.signatureLine;
    if (game.plyCount >= 16 && gamePhase(game.fen) === 'endgame') {
      return pick(opponent.dialogue.enterEndgame) ?? opponent.signatureLine;
    }
    return opponent.signatureLine;
  }, [isOver, ended, oppColor, playerColor, game.inCheck, game.turn, game.plyCount, game.fen, opponent]);

  const movesEndRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    movesEndRef.current?.scrollTo({ top: movesEndRef.current.scrollHeight });
  }, [game.plyCount]);

  const startFresh = useCallback(() => {
    game.reset();
    resetClock();
    engine.newGame();
    setManualEnd(null);
    setThinking(false);
    setStartedAt(Date.now());
    setEndedAt(null);
    prevPly.current = 0;
  }, [game, resetClock, engine]);

  const moveCount = Math.ceil(game.plyCount / 2);
  const durationMs = (endedAt ?? Date.now()) - startedAt;

  const playerClockMs = playerColor === 'w' ? clock.whiteMs : clock.blackMs;
  const oppClockMs = oppColor === 'w' ? clock.whiteMs : clock.blackMs;
  const playerCaptured = playerColor === 'w' ? material.capturedByWhite : material.capturedByBlack;
  const oppCaptured = oppColor === 'w' ? material.capturedByWhite : material.capturedByBlack;
  const playerAdv = playerColor === 'w' ? material.diff : -material.diff;
  const oppAdv = -playerAdv;

  return (
    <section className="cb-game" aria-label={`Game against ${opponent.name}`}>
      <div className="cb-game__main">
        <header className="cb-opp" aria-label="Opponent">
          <Portrait opponent={opponent} imageBase={portraitsBase} size="header" />
          <div className="cb-opp__meta">
            <div className="cb-opp__row">
              <h2 className="cb-opp__name">{opponent.name}</h2>
              <span className="cb-badge" data-difficulty={opponent.difficulty}>
                {DIFFICULTY_META[opponent.difficulty].label} · {opponent.ratingLabel}
              </span>
            </div>
            {thinking ? (
              <p className="cb-opp__say" aria-live="polite">
                <span className="cb-think" aria-hidden="true"><i /><i /><i /></span>
                <span className="cb-think__label">
                  {engine.status === 'loading' ? 'Loading engine…' : 'Thinking…'}
                </span>
              </p>
            ) : (
              <p className="cb-opp__say" aria-live="polite">“{dialogue}”</p>
            )}
          </div>
        </header>

        {engine.status === 'error' && (
          <p className="cb-engine-error" role="status">
            The chess engine couldn’t load, so the opponent is playing basic fallback moves.
            Check your connection and start a new game to try again.
          </p>
        )}

        <PlayerBar
          side={oppColor === 'w' ? 'White' : 'Black'}
          clock={formatClock(baseMs == null ? null : oppClockMs)}
          active={!isOver && game.turn === oppColor}
          captured={oppCaptured}
          capturedColor={playerColor}
          advantage={oppAdv}
        />

        <div className="cb-game__board">
          <div className="cb-board-stage">
            <Board
              fen={game.fen}
              orientation={orientation}
              lastMove={game.lastMove}
              checkSquare={game.checkSquare}
              selected={game.selected}
              legalTargets={game.legalTargets}
              showCoordinates={showCoords}
              interactive={!isOver}
              draggableColor={playerColor}
              onSquareClick={(sq) => game.tapSquare(sq, playerColor)}
              onDrop={(from, to) => { game.dropPiece(from, to, playerColor); }}
              onDragStartSquare={(sq) => { if (game.selected !== sq) game.tapSquare(sq, playerColor); }}
            />
            {game.promotion && (
              <PromotionPanel
                color={game.promotion.color}
                onChoose={(p) => game.choosePromotion(p)}
                onCancel={() => game.cancelPromotion()}
              />
            )}
          </div>
        </div>

        <PlayerBar
          side={`You · ${playerColor === 'w' ? 'White' : 'Black'}`}
          clock={formatClock(baseMs == null ? null : playerClockMs)}
          active={!isOver && game.turn === playerColor}
          captured={playerCaptured}
          capturedColor={oppColor}
          advantage={playerAdv}
          you
        />
      </div>

      <aside className="cb-side" aria-label="Game panel">
        <div className="cb-movehist">
          <h3 className="cb-panel__title">Moves</h3>
          {game.movePairs.length === 0 ? (
            <p className="cb-prototype-note">No moves yet — you play {playerColor === 'w' ? 'White' : 'Black'}.</p>
          ) : (
            <ol className="cb-moves cb-tnum" aria-label="Move history" ref={movesEndRef}>
              {game.movePairs.map((p) => {
                const isCurrent = p.number === game.movePairs.length;
                return (
                  <li key={p.number} className={isCurrent ? 'is-current' : ''}>
                    <span className="cb-moves__no">{p.number}.</span>
                    <span className="cb-moves__ply">{p.white ?? ''}</span>
                    <span className="cb-moves__ply">{p.black ?? ''}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="cb-controls" role="group" aria-label="Game controls">
          <button className="cb-btn cb-btn--ghost cb-btn--sm" onClick={() => setConfirm('newgame')}>New game</button>
          <button className="cb-btn cb-btn--ghost cb-btn--sm" onClick={() => setOrientation((o) => (o === 'w' ? 'b' : 'w'))}>Flip board</button>
          <button
            className="cb-btn cb-btn--ghost cb-btn--sm"
            disabled={!casual || thinking || isOver || game.plyCount < 2}
            title={casual ? 'Undo your last move' : 'Undo is available in casual (unlimited) games only'}
            onClick={() => game.undoPair(playerColor)}
          >
            Undo
          </button>
          <button className="cb-btn cb-btn--ghost cb-btn--sm" aria-pressed={soundOn} onClick={() => setSoundOn((s) => !s)}>
            Sound: {soundOn ? 'On' : 'Off'}
          </button>
          <button className="cb-btn cb-btn--ghost cb-btn--sm" onClick={() => setSettingsOpen((v) => !v)} aria-expanded={settingsOpen}>Settings</button>
          <button className="cb-btn cb-btn--ghost cb-btn--sm" disabled={isOver} onClick={() => setConfirm('draw')}>Offer draw</button>
          <button className="cb-btn cb-btn--danger cb-btn--sm cb-controls__resign" disabled={isOver} onClick={() => setConfirm('resign')}>Resign</button>
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
        body="You’ll forfeit the game."
        confirmLabel="Resign"
        cancelLabel="Keep playing"
        tone="danger"
        onConfirm={() => { setConfirm(null); setManualEnd({ over: true, kind: 'checkmate', winner: oppColor, reason: 'You resigned' }); }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        open={confirm === 'newgame'}
        title="Start a new game?"
        body="The current game will be discarded."
        confirmLabel="New game"
        cancelLabel="Cancel"
        onConfirm={() => { setConfirm(null); startFresh(); }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        open={confirm === 'draw'}
        title="Offer a draw?"
        body="For this prototype the opponent accepts. Personality-based draw decisions arrive with the real engine (Phase 4)."
        confirmLabel="Offer draw"
        cancelLabel="Cancel"
        onConfirm={() => { setConfirm(null); setManualEnd({ over: true, kind: 'draw', winner: null, reason: 'Draw agreed' }); }}
        onCancel={() => setConfirm(null)}
      />

      {isOver && (
        <ResultOverlay
          outcome={ended}
          humanColor={playerColor}
          opponent={opponent}
          portraitsBase={portraitsBase}
          moveCount={moveCount}
          durationMs={durationMs}
          onPlayAgain={() => startFresh()}
          onChooseAnother={onExit}
          onDownloadPgn={() => downloadPgn(game.getPgn(), `chessbharat-vs-${opponent.id}`)}
        />
      )}
    </section>
  );
}

function PlayerBar({
  side,
  clock,
  active,
  captured,
  capturedColor,
  advantage,
  you = false,
}: {
  side: string;
  clock: string;
  active: boolean;
  captured: PieceType[];
  capturedColor: PieceColor;
  advantage: number;
  you?: boolean;
}) {
  return (
    <div className={`cb-pbar ${you ? 'cb-pbar--you' : ''} ${active ? 'is-active' : ''}`}>
      <div className="cb-pbar__left">
        <span className="cb-pbar__side">{side}</span>
        <span className="cb-captured" aria-label="Captured pieces">
          {captured.map((p, i) => (
            <span key={i} className={`cb-cap cb-cap--${capturedColor}`} aria-hidden="true">{CAP_GLYPH[p]}</span>
          ))}
          {advantage > 0 && <span className="cb-material">+{advantage}</span>}
        </span>
      </div>
      <span className={`cb-clock cb-tnum ${active ? 'is-active' : ''}`} aria-label={`${side} clock`}>{clock}</span>
    </div>
  );
}
