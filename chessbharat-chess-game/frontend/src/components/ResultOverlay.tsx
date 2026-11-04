import { Portrait } from './Portrait';
import type { Opponent } from '../opponents/types';
import type { GameOutcome } from '../game/useChessGame';
import type { PieceColor } from '../utils/fen';

function headline(outcome: GameOutcome, humanColor: PieceColor): { title: string; tone: string } {
  if (!outcome.over) return { title: 'Game in progress', tone: 'draw' };
  // Keyed off the winner so it is correct for checkmate, resignation and time.
  if (outcome.winner == null) return { title: 'Draw', tone: 'draw' };
  return outcome.winner === humanColor
    ? { title: 'You won', tone: 'win' }
    : { title: 'You lost', tone: 'loss' };
}

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function ResultOverlay({
  outcome,
  humanColor,
  opponent,
  portraitsBase,
  moveCount,
  durationMs,
  onPlayAgain,
  onChooseAnother,
  onDownloadPgn,
}: {
  outcome: GameOutcome;
  humanColor: PieceColor;
  opponent: Opponent;
  portraitsBase: string;
  moveCount: number;
  durationMs: number;
  onPlayAgain: () => void;
  onChooseAnother: () => void;
  onDownloadPgn: () => void;
}) {
  const { title, tone } = headline(outcome, humanColor);
  const reason = outcome.over ? outcome.reason : '';

  return (
    <div className="cb-modal-scrim">
      <div className="cb-result" role="dialog" aria-modal="true" aria-labelledby="cb-result-title">
        <div className={`cb-result__ribbon cb-result__ribbon--${tone}`} aria-hidden="true" />
        <Portrait opponent={opponent} imageBase={portraitsBase} size="result" />
        <h2 id="cb-result-title" className="cb-result__title">{title}</h2>
        <p className="cb-result__reason">{reason} · vs {opponent.name} ({opponent.ratingLabel})</p>

        <dl className="cb-result__stats cb-tnum">
          <div><dt>Moves</dt><dd>{moveCount}</dd></div>
          <div><dt>Duration</dt><dd>{formatDuration(durationMs)}</dd></div>
        </dl>

        <div className="cb-result__actions">
          <button type="button" className="cb-btn cb-btn--primary" onClick={onPlayAgain}>Play again</button>
          <button type="button" className="cb-btn cb-btn--ghost" onClick={onChooseAnother}>Choose another opponent</button>
          <button type="button" className="cb-btn cb-btn--ghost" onClick={onDownloadPgn}>Download PGN</button>
        </div>
      </div>
    </div>
  );
}
