// src/features/boards/components/canvas/hooks/useElementDrag.ts
// Hook pour le drag & drop des éléments

import { useRef, useState, useCallback } from 'react';
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

  const handleElementMouseMove = useCallback((e: MouseEvent) => {
    if (!elementDragRef.current) return;
    
    const dx = e.clientX - elementDragRef.current.startX;
    const dy = e.clientY - elementDragRef.current.startY;
    const newX = Math.max(0, elementDragRef.current.elementStartX + dx);
    const newY = Math.max(0, elementDragRef.current.elementStartY + dy);

    setDragPosition({ 
      type: 'element', 
      id: elementDragRef.current.elementId, 
      x: newX, 
      y: newY 
    });
  }, []);

  const handleElementMouseUp = useCallback(() => {
    const pos = dragPositionRef.current;

    if (pos && pos.type === 'element') {
      moveElementLocal(pos.id, pos.x, pos.y);
      saveElementPosition(pos.id, pos.x, pos.y);
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
