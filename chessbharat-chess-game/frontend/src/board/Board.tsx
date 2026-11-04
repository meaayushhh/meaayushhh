import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
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
  interactive?: boolean;
  /** Which colour the human may pick up (for drag affordances). */
  draggableColor?: PieceColor | 'both';
  onSquareClick?: (square: Square) => void;
  onDrop?: (from: Square, to: Square) => void;
  onDragStartSquare?: (square: Square) => void;
}

export function Board({
  fen,
  orientation = 'w',
  lastMove = null,
  checkSquare = null,
  selected = null,
  legalTargets = [],
  showCoordinates = true,
  interactive = false,
  draggableColor = 'both',
  onSquareClick,
  onDrop,
  onDragStartSquare,
}: BoardProps) {
  const pieces = useMemo(() => parseFenPlacement(fen), [fen]);
  const order = useMemo(() => squaresInOrder(orientation), [orientation]);
  const legalMap = useMemo(() => {
    const m = new Map<Square, boolean>();
    for (const t of legalTargets) m.set(t.to, t.isCapture);
    return m;
  }, [legalTargets]);

  const [dragOver, setDragOver] = useState<Square | null>(null);

  const edgeFiles = orientation === 'w' ? FILES : [...FILES].reverse();
  const edgeRanks = orientation === 'w' ? RANKS : [...RANKS].reverse();

  // Realistic move slide: when a new move lands, animate the piece now on the
  // destination square sliding from its origin square (FLIP via Web Animations).
  const boardRef = useRef<HTMLDivElement>(null);
  const prevMoveRef = useRef<string | null>(null);
  useEffect(() => {
    const key = lastMove ? `${lastMove.from}${lastMove.to}` : null;
    const changed = key !== null && key !== prevMoveRef.current;
    prevMoveRef.current = key;
    if (!changed || !lastMove || !boardRef.current) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const fromIdx = order.indexOf(lastMove.from);
    const toIdx = order.indexOf(lastMove.to);
    if (fromIdx < 0 || toIdx < 0) return;
    const dCol = (fromIdx % 8) - (toIdx % 8);
    const dRow = Math.floor(fromIdx / 8) - Math.floor(toIdx / 8);
    if (dCol === 0 && dRow === 0) return;

    const el = boardRef.current.querySelector<HTMLElement>(
      `.cb-sq[data-square="${lastMove.to}"] .cb-piece-drag`,
    );
    el?.animate?.(
      [
        { transform: `translate(${dCol * 100}%, ${dRow * 100}%)`, offset: 0 },
        { transform: 'translate(0, 0)', offset: 1 },
      ],
      { duration: 240, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)', fill: 'none' },
    );
  }, [lastMove, order, fen]);

  function canDrag(sq: Square): boolean {
    if (!interactive || !onDrop) return false;
    const p = pieces.get(sq);
    if (!p) return false;
    return draggableColor === 'both' || draggableColor === p.color;
  }

  return (
    <div className="cb-board-wrap">
      <div className="cb-board" ref={boardRef} role="grid" aria-label="Chessboard" data-orientation={orientation}>
        {order.map((square) => {
          const piece = pieces.get(square);
          const light = isLightSquare(square);
          const isLast = lastMove && (lastMove.from === square || lastMove.to === square);
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
            dragOver === square ? 'is-dragover' : '',
          ].filter(Boolean).join(' ');

          const fileIdx = FILES.indexOf(square[0] as (typeof FILES)[number]);
          const isBottomRow = orientation === 'w' ? square[1] === '1' : square[1] === '8';
          const isLeftCol = orientation === 'w' ? fileIdx === 0 : fileIdx === 7;

          const dropHandlers = interactive && onDrop
            ? {
                onDragOver: (e: DragEvent) => { e.preventDefault(); setDragOver(square); },
                onDragLeave: () => setDragOver((cur) => (cur === square ? null : cur)),
                onDrop: (e: DragEvent) => {
                  e.preventDefault();
                  const from = e.dataTransfer.getData('text/plain') as Square;
                  setDragOver(null);
                  if (from && from !== square) onDrop(from, square);
                },
              }
            : {};

          const content = (
            <>
              {legal && !legalCapture && <span className="cb-move-dot" aria-hidden="true" />}
              {legalCapture && <span className="cb-move-ring" aria-hidden="true" />}
              {piece && (
                <span
                  className="cb-piece-drag"
                  draggable={canDrag(square)}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', square);
                    e.dataTransfer.effectAllowed = 'move';
                    onDragStartSquare?.(square);
                  }}
                >
                  <PieceGlyph piece={piece} />
                </span>
              )}
              {showCoordinates && isBottomRow && (
                <span className="cb-coord cb-coord--file" aria-hidden="true">{square[0]}</span>
              )}
              {showCoordinates && isLeftCol && (
                <span className="cb-coord cb-coord--rank" aria-hidden="true">{square[1]}</span>
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
              {...dropHandlers}
            >
              {content}
            </button>
          ) : (
            <div key={square} role="gridcell" className={classes} data-square={square} aria-label={describe}>
              {content}
            </div>
          );
        })}
      </div>
      <span className="cb-sr-only">Files {edgeFiles.join(' ')}, ranks {edgeRanks.join(' ')}.</span>
    </div>
  );
}
