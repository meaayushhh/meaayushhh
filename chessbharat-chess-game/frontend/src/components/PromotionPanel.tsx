import type { PieceColor, PieceType } from '../utils/fen';

const CHOICES: Exclude<PieceType, 'p' | 'k'>[] = ['q', 'r', 'b', 'n'];
const GLYPH: Record<string, string> = { q: '♛', r: '♜', b: '♝', n: '♞' };
const NAME: Record<string, string> = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight' };

/** Accessible promotion chooser, overlaid on the board. */
export function PromotionPanel({
  color,
  onChoose,
  onCancel,
}: {
  color: PieceColor;
  onChoose: (piece: Exclude<PieceType, 'p' | 'k'>) => void;
  onCancel: () => void;
}) {
  return (
    <div className="cb-promo" role="dialog" aria-modal="true" aria-label="Choose promotion piece">
      <div className="cb-promo__panel">
        <p className="cb-promo__title">Promote to</p>
        <div className="cb-promo__row">
          {CHOICES.map((p) => (
            <button
              key={p}
              type="button"
              className="cb-promo__btn"
              aria-label={NAME[p]}
              autoFocus={p === 'q'}
              onClick={() => onChoose(p)}
            >
              <span className={`cb-piece cb-piece--${color}`} aria-hidden="true">{GLYPH[p]}</span>
            </button>
          ))}
        </div>
        <button type="button" className="cb-btn cb-btn--ghost cb-btn--sm cb-promo__cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
