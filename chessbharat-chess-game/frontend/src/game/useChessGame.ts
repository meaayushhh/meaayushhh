import { useCallback, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { PieceColor, PieceType, Square } from '../utils/fen';
import { STARTING_FEN } from '../utils/fen';
import type { LegalTarget } from '../board/Board';
import { computeOutcome, findKing, toMovePairs, type GameOutcome, type MovePair } from './rules';

export type { GameOutcome, MovePair } from './rules';

export interface AppliedMove {
  from: Square;
  to: Square;
  san: string;
  color: PieceColor;
  captured?: PieceType;
  flags: string;
}

export interface UseChessGame {
  fen: string;
  turn: PieceColor;
  lastMove: { from: Square; to: Square } | null;
  selected: Square | null;
  legalTargets: LegalTarget[];
  checkSquare: Square | null;
  inCheck: boolean;
  outcome: GameOutcome;
  movePairs: MovePair[];
  plyCount: number;
  canUndo: boolean;
  promotion: { from: Square; to: Square; color: PieceColor } | null;

  /** Click/tap a square. `controllableColor` restricts which side the human may move. */
  tapSquare: (square: Square, controllableColor: PieceColor | 'both') => void;
  /** Drag/drop a piece from one square to another. Returns true if a move was made/started. */
  dropPiece: (from: Square, to: Square, controllableColor: PieceColor | 'both') => boolean;
  choosePromotion: (piece: Exclude<PieceType, 'p' | 'k'>) => AppliedMove | null;
  cancelPromotion: () => void;
  clearSelection: () => void;

  /** Apply a fully-specified move (used by the opponent). Returns the move or null. */
  applyMove: (move: { from: Square; to: Square; promotion?: string }) => AppliedMove | null;
  /** Verbose legal move list for the side to move (used by the opponent). */
  legalMoves: () => { from: Square; to: Square; promotion?: string }[];

  undoPair: (humanColor: PieceColor) => void;
  reset: (fen?: string) => void;
  getPgn: () => string;
  getFen: () => string;
}

export function useChessGame(initialFen: string = STARTING_FEN): UseChessGame {
  const chessRef = useRef<Chess>(new Chess(initialFen));
  const [, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);

  const [selected, setSelected] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [promotion, setPromotion] = useState<{ from: Square; to: Square; color: PieceColor } | null>(null);

  const chess = chessRef.current;
  const turn = chess.turn() as PieceColor;
  const inCheck = chess.isCheck();
  const outcome = useMemo(computeOutcome.bind(null, chess), [chess, selected, lastMove, promotion]);
  const movePairs = useMemo(() => toMovePairs(chess), [chess, lastMove]);
  const plyCount = chess.history().length;

  const legalTargets: LegalTarget[] = useMemo(() => {
    if (!selected) return [];
    try {
      return chess
        .moves({ square: selected, verbose: true })
        .map((m) => ({ to: m.to as Square, isCapture: m.flags.includes('c') || m.flags.includes('e') }));
    } catch {
      return [];
    }
  }, [selected, chess, lastMove]);

  const checkSquare = inCheck ? findKing(chess, turn) : null;

  const finishMove = useCallback(
    (from: Square, to: Square, promo?: string): AppliedMove | null => {
      try {
        const mv = chess.move({ from, to, promotion: promo });
        setLastMove({ from: mv.from as Square, to: mv.to as Square });
        setSelected(null);
        setPromotion(null);
        bump();
        return {
          from: mv.from as Square,
          to: mv.to as Square,
          san: mv.san,
          color: mv.color as PieceColor,
          captured: mv.captured as PieceType | undefined,
          flags: mv.flags,
        };
      } catch {
        return null;
      }
    },
    [chess, bump],
  );

  // Does moving from->to require a promotion choice?
  const needsPromotion = useCallback(
    (from: Square, to: Square): boolean => {
      try {
        return chess
          .moves({ square: from, verbose: true })
          .some((m) => m.to === to && m.flags.includes('p'));
      } catch {
        return false;
      }
    },
    [chess],
  );

  const beginMove = useCallback(
    (from: Square, to: Square): boolean => {
      if (needsPromotion(from, to)) {
        setPromotion({ from, to, color: turn });
        return true;
      }
      return finishMove(from, to) !== null;
    },
    [needsPromotion, finishMove, turn],
  );

  const canControl = useCallback(
    (controllable: PieceColor | 'both') =>
      !outcome.over && !promotion && (controllable === 'both' || controllable === turn),
    [outcome.over, promotion, turn],
  );

  const tapSquare = useCallback(
    (square: Square, controllable: PieceColor | 'both') => {
      if (!canControl(controllable)) return;
      const piece = chess.get(square);

      if (selected) {
        if (square === selected) { setSelected(null); return; }
        const isTarget = legalTargets.some((t) => t.to === square);
        if (isTarget) { beginMove(selected, square); return; }
        // Re-select another of our own pieces, else clear.
        if (piece && piece.color === turn) { setSelected(square); return; }
        setSelected(null);
        return;
      }
      if (piece && piece.color === turn) setSelected(square);
    },
    [canControl, chess, selected, legalTargets, beginMove, turn],
  );

  const dropPiece = useCallback(
    (from: Square, to: Square, controllable: PieceColor | 'both'): boolean => {
      if (!canControl(controllable)) return false;
      const piece = chess.get(from);
      if (!piece || piece.color !== turn) return false;
      if (from === to) return false;
      const legal = chess
        .moves({ square: from, verbose: true })
        .some((m) => m.to === to);
      if (!legal) { setSelected(null); return false; }
      return beginMove(from, to);
    },
    [canControl, chess, turn, beginMove],
  );

  const choosePromotion = useCallback(
    (piece: Exclude<PieceType, 'p' | 'k'>): AppliedMove | null => {
      if (!promotion) return null;
      return finishMove(promotion.from, promotion.to, piece);
    },
    [promotion, finishMove],
  );

  const cancelPromotion = useCallback(() => { setPromotion(null); setSelected(null); }, []);
  const clearSelection = useCallback(() => setSelected(null), []);

  const applyMove = useCallback(
    (move: { from: Square; to: Square; promotion?: string }): AppliedMove | null =>
      finishMove(move.from, move.to, move.promotion),
    [finishMove],
  );

  const legalMoves = useCallback(
    () =>
      chess
        .moves({ verbose: true })
        .map((m) => ({ from: m.from as Square, to: m.to as Square, promotion: m.promotion })),
    [chess],
  );

  const undoPair = useCallback(
    (humanColor: PieceColor) => {
      // Undo back to the human's turn: remove the opponent's reply (if any) and
      // the human's own last move.
      if (chess.history().length === 0) return;
      // If it's currently the human's turn, the last ply was the opponent's.
      if (chess.turn() === humanColor) chess.undo();
      if (chess.history().length > 0) chess.undo();
      const hist = chess.history({ verbose: true });
      const last = hist[hist.length - 1];
      setLastMove(last ? { from: last.from as Square, to: last.to as Square } : null);
      setSelected(null);
      setPromotion(null);
      bump();
    },
    [chess, bump],
  );

  const reset = useCallback(
    (fen: string = STARTING_FEN) => {
      chessRef.current = new Chess(fen);
      setSelected(null);
      setLastMove(null);
      setPromotion(null);
      bump();
    },
    [bump],
  );

  const getPgn = useCallback(() => chess.pgn(), [chess]);
  const getFen = useCallback(() => chess.fen(), [chess]);

  return {
    fen: chess.fen(),
    turn,
    lastMove,
    selected,
    legalTargets,
    checkSquare,
    inCheck,
    outcome,
    movePairs,
    plyCount,
    canUndo: plyCount > 0,
    promotion,
    tapSquare,
    dropPiece,
    choosePromotion,
    cancelPromotion,
    clearSelection,
    applyMove,
    legalMoves,
    undoPair,
    reset,
    getPgn,
    getFen,
  };
}
