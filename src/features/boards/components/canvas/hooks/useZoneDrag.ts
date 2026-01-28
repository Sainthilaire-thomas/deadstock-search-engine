// src/features/boards/components/canvas/hooks/useZoneDrag.ts
// Hook pour le drag & drop des child boards (avec Ghost Mode pour performance)
// Sprint P0.4 - Ghost Mode: éléments masqués pendant le drag
// SCALE-2: Optimisé avec requestAnimationFrame pour 60fps max
// UB-5: Adapté pour architecture unifiée (Board au lieu de Zone)

import { useRef, useState, useCallback, useEffect } from 'react';
import { bulkMoveElementsAction } from '../../../actions/elementActions';
import { getElementsVisuallyInChildBoard } from '../../../utils/boardUtils';
import type { Board, BoardElement } from '../../../domain/types';

interface DragPosition {
  type: 'childBoard';
  id: string;
  x: number;
  y: number;
}

interface ChildBoardDragRef {
  childBoardId: string;
  startX: number;
  startY: number;
  childBoardStartX: number;
  childBoardStartY: number;
  containedElements?: Array<{
    id: string;
    startX: number;
    startY: number;
  }>;
}

interface UseChildBoardDragProps {
  scale?: number;
  elements: BoardElement[];
  moveChildBoardLocal: (id: string, x: number, y: number) => void;
  saveChildBoardPosition: (id: string, x: number, y: number) => Promise<void>;
  moveElementLocal: (id: string, x: number, y: number) => void;
  selectChildBoard: (id: string | null) => void;
  setDragging: (isDragging: boolean) => void;
}

interface UseChildBoardDragReturn {
  dragPosition: DragPosition | null;
  childBoardDragElementPositions: Record<string, { x: number; y: number }>;
  draggingChildBoardId: string | null;
  draggingElementIds: string[];
  draggingElementCount: number;
  handleChildBoardMouseDown: (e: React.MouseEvent, childBoard: Board) => void;
}

export function useChildBoardDrag({
  scale = 1,
  elements,
  moveChildBoardLocal,
  saveChildBoardPosition,
  moveElementLocal,
  selectChildBoard,
  setDragging,
}: UseChildBoardDragProps): UseChildBoardDragReturn {
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const [childBoardDragElementPositions, setChildBoardDragElementPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Ghost Mode states
  const [draggingChildBoardId, setDraggingChildBoardId] = useState<string | null>(null);
  const [draggingElementIds, setDraggingElementIds] = useState<string[]>([]);
  const [draggingElementCount, setDraggingElementCount] = useState<number>(0);

  const dragPositionRef = useRef(dragPosition);
  dragPositionRef.current = dragPosition;

  const childBoardDragRef = useRef<ChildBoardDragRef | null>(null);

  // SCALE-2: RAF throttling refs
  const rafIdRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<DragPosition | null>(null);

  // SCALE-2: Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // SCALE-2: RAF update function
  const updatePositionWithRAF = useCallback(() => {
    if (pendingPositionRef.current) {
      setDragPosition(pendingPositionRef.current);
      pendingPositionRef.current = null;
    }
    rafIdRef.current = null;
  }, []);

  const handleChildBoardMouseMove = useCallback((e: MouseEvent) => {
    if (!childBoardDragRef.current) return;

    // Diviser par scale pour compenser le zoom
    const dx = (e.clientX - childBoardDragRef.current.startX) / scale;
    const dy = (e.clientY - childBoardDragRef.current.startY) / scale;
    const newX = Math.max(0, childBoardDragRef.current.childBoardStartX + dx);
    const newY = Math.max(0, childBoardDragRef.current.childBoardStartY + dy);

    // SCALE-2: Store position in ref, schedule RAF update
    pendingPositionRef.current = { type: 'childBoard', id: childBoardDragRef.current.childBoardId, x: newX, y: newY };

    // Only schedule RAF if not already scheduled
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(updatePositionWithRAF);
    }

    // Ghost Mode: on ne met plus à jour childBoardDragElementPositions pendant le drag
    // Les éléments sont masqués, pas besoin de calculer leurs positions
  }, [scale, updatePositionWithRAF]);

  const handleChildBoardMouseUp = useCallback(() => {
    // Cleanup immédiat AVANT toute opération async
    document.removeEventListener('mousemove', handleChildBoardMouseMove);
    document.removeEventListener('mouseup', handleChildBoardMouseUp);

    // SCALE-2: Cancel pending RAF
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Apply any pending position immediately
    const pos = pendingPositionRef.current || dragPositionRef.current;
    pendingPositionRef.current = null;
    const dragData = childBoardDragRef.current;

    // Reset des states immédiatement
    setDragPosition(null);
    setChildBoardDragElementPositions({});
    setDraggingChildBoardId(null);
    setDraggingElementIds([]);
    setDraggingElementCount(0);
    childBoardDragRef.current = null;
    setDragging(false);

    if (pos && pos.type === 'childBoard') {
      moveChildBoardLocal(pos.id, pos.x, pos.y);
      saveChildBoardPosition(pos.id, pos.x, pos.y);

      // Si child board cristallisé, sauvegarder aussi les positions des éléments
      if (dragData?.containedElements && dragData.containedElements.length > 0) {
        const dx = pos.x - dragData.childBoardStartX;
        const dy = pos.y - dragData.childBoardStartY;

        const elementMoves = dragData.containedElements.map(el => ({
          elementId: el.id,
          positionX: el.startX + dx,
          positionY: el.startY + dy,
        }));

        // Mettre à jour le state local immédiatement
        elementMoves.forEach(move => {
          moveElementLocal(move.elementId, move.positionX, move.positionY);
        });

        // Sauvegarder les nouvelles positions en bulk (async, fire-and-forget)
        bulkMoveElementsAction(elementMoves).catch(error => {
          console.error('Erreur sauvegarde positions éléments:', error);
        });
      }
    }
  }, [moveChildBoardLocal, saveChildBoardPosition, moveElementLocal, setDragging, handleChildBoardMouseMove]);

  const handleChildBoardMouseDown = useCallback((e: React.MouseEvent, childBoard: Board) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    selectChildBoard(childBoard.id);

    // Vérifier que le child board a des coordonnées (obligatoire pour un child)
    if (childBoard.positionX === null || childBoard.positionY === null) {
      console.warn('Child board sans coordonnées, drag ignoré');
      return;
    }

    // Si le child board est cristallisé, capturer les éléments contenus pour les déplacer ensemble
    let containedElements: Array<{ id: string; startX: number; startY: number }> | undefined;
    let elementIds: string[] = [];

    if (childBoard.crystallizedAt && childBoard.linkedProjectId) {
      const elementsInChildBoard = getElementsVisuallyInChildBoard(elements, childBoard);
      containedElements = elementsInChildBoard.map(el => ({
        id: el.id,
        startX: el.positionX,
        startY: el.positionY,
      }));
      elementIds = elementsInChildBoard.map(el => el.id);
    }

    childBoardDragRef.current = {
      childBoardId: childBoard.id,
      startX: e.clientX,
      startY: e.clientY,
      childBoardStartX: childBoard.positionX,
      childBoardStartY: childBoard.positionY,
      containedElements,
    };

    // Ghost Mode: activer le masquage des éléments
    setDraggingChildBoardId(childBoard.id);
    setDraggingElementIds(elementIds);
    setDraggingElementCount(elementIds.length);

    setDragging(true);
    document.addEventListener('mousemove', handleChildBoardMouseMove);
    document.addEventListener('mouseup', handleChildBoardMouseUp);
  }, [elements, selectChildBoard, setDragging, handleChildBoardMouseMove, handleChildBoardMouseUp]);

  return {
    dragPosition,
    childBoardDragElementPositions,
    draggingChildBoardId,
    draggingElementIds,
    draggingElementCount,
    handleChildBoardMouseDown,
  };
}

// ============================================
// ALIASES DEPRECATED (pour migration progressive)
// ============================================

/** @deprecated Use useChildBoardDrag instead */
export const useZoneDrag = useChildBoardDrag;

/** @deprecated Use handleChildBoardMouseDown instead */
export type UseZoneDragProps = UseChildBoardDragProps;

/** @deprecated Use UseChildBoardDragReturn instead */
export type UseZoneDragReturn = UseChildBoardDragReturn;
