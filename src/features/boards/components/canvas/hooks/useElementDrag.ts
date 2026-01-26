// src/features/boards/components/canvas/hooks/useElementDrag.ts
// Hook pour le drag & drop des éléments
// SCALE-2: Optimisé avec requestAnimationFrame pour 60fps max

import { useRef, useState, useCallback, useEffect } from 'react';
import type { BoardElement } from '../../../domain/types';

interface DragPosition {
  type: 'element';
  id: string;
  x: number;
  y: number;
}

interface ElementDragRef {
  elementId: string;
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
}

interface UseElementDragProps {
  scale?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  moveElementLocal: (id: string, x: number, y: number) => void;
  saveElementPosition: (id: string, x: number, y: number) => Promise<void>;
  toggleElementSelection: (id: string) => void;
  clearSelection: () => void;
  setDragging: (isDragging: boolean) => void;
}

interface UseElementDragReturn {
  dragPosition: DragPosition | null;
  handleElementMouseDown: (e: React.MouseEvent, element: BoardElement) => void;
}

export function useElementDrag({
  scale = 1,
  onDragStart,
  onDragEnd,
  moveElementLocal,
  saveElementPosition,
  toggleElementSelection,
  clearSelection,
  setDragging,
}: UseElementDragProps): UseElementDragReturn {
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const dragPositionRef = useRef(dragPosition);
  dragPositionRef.current = dragPosition;

  const elementDragRef = useRef<ElementDragRef | null>(null);
  
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

  const handleElementMouseMove = useCallback((e: MouseEvent) => {
    if (!elementDragRef.current) return;

    // Diviser par scale pour compenser le zoom
    const dx = (e.clientX - elementDragRef.current.startX) / scale;
    const dy = (e.clientY - elementDragRef.current.startY) / scale;
    const newX = Math.max(0, elementDragRef.current.elementStartX + dx);
    const newY = Math.max(0, elementDragRef.current.elementStartY + dy);

    // SCALE-2: Store position in ref, schedule RAF update
    pendingPositionRef.current = {
      type: 'element',
      id: elementDragRef.current.elementId,
      x: newX,
      y: newY
    };

    // Only schedule RAF if not already scheduled
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(updatePositionWithRAF);
    }
  }, [scale, updatePositionWithRAF]);

  const handleElementMouseUp = useCallback(() => {
    // SCALE-2: Cancel pending RAF
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Apply any pending position immediately
    const finalPos = pendingPositionRef.current || dragPositionRef.current;
    pendingPositionRef.current = null;

    if (finalPos && finalPos.type === 'element') {
      moveElementLocal(finalPos.id, finalPos.x, finalPos.y);
      saveElementPosition(finalPos.id, finalPos.x, finalPos.y);
    }

    setDragPosition(null);
    elementDragRef.current = null;
    setDragging(false);
    onDragEnd?.();

    document.removeEventListener('mousemove', handleElementMouseMove);
    document.removeEventListener('mouseup', handleElementMouseUp);
  }, [moveElementLocal, saveElementPosition, setDragging, onDragEnd, handleElementMouseMove]);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, element: BoardElement) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    if (!e.shiftKey) {
      clearSelection();
    }
    toggleElementSelection(element.id);

    elementDragRef.current = {
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      elementStartX: element.positionX,
      elementStartY: element.positionY,
    };

    setDragging(true);
    onDragStart?.();

    document.addEventListener('mousemove', handleElementMouseMove);
    document.addEventListener('mouseup', handleElementMouseUp);
  }, [clearSelection, toggleElementSelection, setDragging, onDragStart, handleElementMouseMove, handleElementMouseUp]);

  return {
    dragPosition,
    handleElementMouseDown,
  };
}
