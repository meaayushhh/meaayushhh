import { useMemo } from 'react';
import {
  parseFenPlacement,
  squaresInOrder,
  isLightSquare,
  FILES,
  RANKS,
  type PieceColor,
  type Square,
} from '../utils/fen';
import { PieceGlyph } from './pieces';
import './Board.css';

export interface LegalTarget {
  to: Square;
  isCapture: boolean;
}

export interface BoardProps {
  fen: string;
  orientation?: PieceColor;
  lastMove?: { from: Square; to: Square } | null;
  checkSquare?: Square | null;
  selected?: Square | null;
  legalTargets?: LegalTarget[];
  showCoordinates?: boolean;
  /** Visual selection callback (Phase 1). Real move legality arrives in Phase 2. */
  onSquareClick?: (square: Square) => void;
  interactive?: boolean;
}

export function Board({
  fen,
  orientation = 'w',
  lastMove = null,
  checkSquare = null,
  selected = null,
  legalTargets = [],
  showCoordinates = true,
  onSquareClick,
  interactive = false,
}: BoardProps) {
  const pieces = useMemo(() => parseFenPlacement(fen), [fen]);
  const order = useMemo(() => squaresInOrder(orientation), [orientation]);
  const legalMap = useMemo(() => {
    const m = new Map<Square, boolean>();
    for (const t of legalTargets) m.set(t.to, t.isCapture);
    return m;
  }, [legalTargets]);

  const edgeFiles = orientation === 'w' ? FILES : [...FILES].reverse();
  const edgeRanks = orientation === 'w' ? RANKS : [...RANKS].reverse();

  return (
    <div className="cb-board-wrap">
      <div
        className="cb-board"
        role="grid"
        aria-label="Chessboard"
        data-orientation={orientation}
      >
        {order.map((square) => {
          const piece = pieces.get(square);
          const light = isLightSquare(square);
          const isLast =
            lastMove && (lastMove.from === square || lastMove.to === square);
          const isCheck = checkSquare === square;
          const isSelected = selected === square;
          const legal = legalMap.has(square);
          const legalCapture = legalMap.get(square) === true;

          const classes = [
            'cb-sq',
            light ? 'cb-sq--light' : 'cb-sq--dark',
            isLast ? 'is-last' : '',
            isCheck ? 'is-check' : '',
            isSelected ? 'is-selected' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const fileIdx = FILES.indexOf(square[0] as (typeof FILES)[number]);
          const isBottomRow =
            orientation === 'w' ? square[1] === '1' : square[1] === '8';
          const isLeftCol =
            orientation === 'w' ? fileIdx === 0 : fileIdx === 7;

          const content = (
            <>
              {legal && !legalCapture && <span className="cb-move-dot" aria-hidden="true" />}
              {legalCapture && <span className="cb-move-ring" aria-hidden="true" />}
              {piece && <PieceGlyph piece={piece} />}
              {showCoordinates && isBottomRow && (
                <span className="cb-coord cb-coord--file" aria-hidden="true">
                  {square[0]}
                </span>
              )}
              {showCoordinates && isLeftCol && (
                <span className="cb-coord cb-coord--rank" aria-hidden="true">
                  {square[1]}
                </span>
              )}
            </>
          );

          const describe = piece
            ? `${square}, ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}`
            : `${square}, empty`;

          return interactive ? (
            <button
              key={square}
              type="button"
              role="gridcell"
              className={classes}
              data-square={square}
              aria-label={describe}
              aria-pressed={isSelected}
              onClick={() => onSquareClick?.(square)}
            >
              {content}
            </button>
          ) : (
            <div
              key={square}
              role="gridcell"
              className={classes}
              data-square={square}
              aria-label={describe}
            >
              {content}
            </div>
          );
        })}
      </div>

      {/* Visually-hidden coordinate rails are already drawn inside squares;
          the edge arrays above keep file/rank ordering honest for a11y tools. */}
      <span className="cb-sr-only">
        Files {edgeFiles.join(' ')}, ranks {edgeRanks.join(' ')}.
      </span>
    </div>
  );
}
