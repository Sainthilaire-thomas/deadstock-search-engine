// src/features/boards/components/canvas/hooks/useZoneResize.ts
// Hook pour le redimensionnement des child boards
// UB-5: Adapté pour architecture unifiée (Board au lieu de Zone)

import { useRef, useState, useCallback } from 'react';
import type { Board } from '../../../domain/types';

const MIN_CHILD_BOARD_WIDTH = 150;
const MIN_CHILD_BOARD_HEIGHT = 100;

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ResizeState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ChildBoardResizeRef {
  childBoardId: string;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  childBoardStartX: number;
  childBoardStartY: number;
  childBoardStartWidth: number;
  childBoardStartHeight: number;
}

interface UseChildBoardResizeProps {
  scale?: number;
  moveChildBoardLocal: (id: string, x: number, y: number) => void;
  saveChildBoardPosition: (id: string, x: number, y: number) => Promise<void>;
  resizeChildBoardLocal: (id: string, width: number, height: number) => void;
  saveChildBoardSize: (id: string, width: number, height: number) => Promise<void>;
  selectChildBoard: (id: string | null) => void;
  setDragging: (isDragging: boolean) => void;
}

interface UseChildBoardResizeReturn {
  resizeState: ResizeState | null;
  handleChildBoardResizeStart: (e: React.MouseEvent, childBoard: Board, handle: ResizeHandle) => void;
}

export function useChildBoardResize({
  scale = 1,
  moveChildBoardLocal,
  saveChildBoardPosition,
  resizeChildBoardLocal,
  saveChildBoardSize,
  selectChildBoard,
  setDragging,
}: UseChildBoardResizeProps): UseChildBoardResizeReturn {
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const resizeStateRef = useRef(resizeState);
  resizeStateRef.current = resizeState;

  const childBoardResizeRef = useRef<ChildBoardResizeRef | null>(null);

  const handleChildBoardResizeMove = useCallback((e: MouseEvent) => {
    if (!childBoardResizeRef.current) return;

    const ref = childBoardResizeRef.current;
    // Diviser par scale pour compenser le zoom
    const dx = (e.clientX - ref.startX) / scale;
    const dy = (e.clientY - ref.startY) / scale;

    let newX = ref.childBoardStartX;
    let newY = ref.childBoardStartY;
    let newWidth = ref.childBoardStartWidth;
    let newHeight = ref.childBoardStartHeight;

    if (ref.handle.includes('e')) {
      newWidth = Math.max(MIN_CHILD_BOARD_WIDTH, ref.childBoardStartWidth + dx);
    }
    if (ref.handle.includes('w')) {
      const widthChange = Math.min(dx, ref.childBoardStartWidth - MIN_CHILD_BOARD_WIDTH);
      newWidth = ref.childBoardStartWidth - widthChange;
      newX = ref.childBoardStartX + widthChange;
    }
    if (ref.handle.includes('s')) {
      newHeight = Math.max(MIN_CHILD_BOARD_HEIGHT, ref.childBoardStartHeight + dy);
    }
    if (ref.handle.includes('n')) {
      const heightChange = Math.min(dy, ref.childBoardStartHeight - MIN_CHILD_BOARD_HEIGHT);
      newHeight = ref.childBoardStartHeight - heightChange;
      newY = ref.childBoardStartY + heightChange;
    }

    setResizeState({
      id: ref.childBoardId,
      x: Math.max(0, newX),
      y: Math.max(0, newY),
      width: newWidth,
      height: newHeight,
    });
  }, [scale]);

  const handleChildBoardResizeEnd = useCallback(() => {
    const resize = resizeStateRef.current;

    if (resize) {
      moveChildBoardLocal(resize.id, resize.x, resize.y);
      resizeChildBoardLocal(resize.id, resize.width, resize.height);
      saveChildBoardPosition(resize.id, resize.x, resize.y);
      saveChildBoardSize(resize.id, resize.width, resize.height);
    }

    setResizeState(null);
    childBoardResizeRef.current = null;
    setDragging(false);
    document.removeEventListener('mousemove', handleChildBoardResizeMove);
    document.removeEventListener('mouseup', handleChildBoardResizeEnd);
  }, [moveChildBoardLocal, resizeChildBoardLocal, saveChildBoardPosition, saveChildBoardSize, setDragging, handleChildBoardResizeMove]);

  const handleChildBoardResizeStart = useCallback((e: React.MouseEvent, childBoard: Board, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    selectChildBoard(childBoard.id);

    // Vérifier que le child board a des coordonnées
    if (childBoard.positionX === null || childBoard.positionY === null) {
      console.warn('Child board sans coordonnées, resize ignoré');
      return;
    }

    childBoardResizeRef.current = {
      childBoardId: childBoard.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      childBoardStartX: childBoard.positionX,
      childBoardStartY: childBoard.positionY,
      childBoardStartWidth: childBoard.width,
      childBoardStartHeight: childBoard.height,
    };
    setDragging(true);

    document.addEventListener('mousemove', handleChildBoardResizeMove);
    document.addEventListener('mouseup', handleChildBoardResizeEnd);
  }, [selectChildBoard, setDragging, handleChildBoardResizeMove, handleChildBoardResizeEnd]);

  return {
    resizeState,
    handleChildBoardResizeStart,
  };
}

// ============================================
// ALIASES DEPRECATED (pour migration progressive)
// ============================================

/** @deprecated Use useChildBoardResize instead */
export const useZoneResize = useChildBoardResize;

/** @deprecated Use UseChildBoardResizeProps instead */
export type UseZoneResizeProps = UseChildBoardResizeProps;

/** @deprecated Use UseChildBoardResizeReturn instead */
export type UseZoneResizeReturn = UseChildBoardResizeReturn;

/** @deprecated Use handleChildBoardResizeStart instead */
export const handleZoneResizeStart = 'Use handleChildBoardResizeStart';
