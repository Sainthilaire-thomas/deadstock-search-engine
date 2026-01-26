// src/features/boards/components/canvas/hooks/useZoneDrag.ts
// Hook pour le drag & drop des zones (avec Ghost Mode pour performance)
// Sprint P0.4 - Ghost Mode: éléments masqués pendant le drag
// SCALE-2: Optimisé avec requestAnimationFrame pour 60fps max

import { useRef, useState, useCallback, useEffect } from 'react';
import { bulkMoveElementsAction } from '../../../actions/elementActions';
import { getElementsInZone } from '../../../utils/zoneUtils';
import type { BoardElement, BoardZone } from '../../../domain/types';

interface DragPosition {
  type: 'zone';
  id: string;
  x: number;
  y: number;
}

interface ZoneDragRef {
  zoneId: string;
  startX: number;
  startY: number;
  zoneStartX: number;
  zoneStartY: number;
  containedElements?: Array<{
    id: string;
    startX: number;
    startY: number;
  }>;
}

interface UseZoneDragProps {
  scale?: number;
  elements: BoardElement[];
  moveZoneLocal: (id: string, x: number, y: number) => void;
  saveZonePosition: (id: string, x: number, y: number) => Promise<void>;
  moveElementLocal: (id: string, x: number, y: number) => void;
  selectZone: (id: string | null) => void;
  setDragging: (isDragging: boolean) => void;
}

interface UseZoneDragReturn {
  dragPosition: DragPosition | null;
  zoneDragElementPositions: Record<string, { x: number; y: number }>;
  draggingZoneId: string | null;
  draggingElementIds: string[];
  draggingElementCount: number;
  handleZoneMouseDown: (e: React.MouseEvent, zone: BoardZone) => void;
}

export function useZoneDrag({
  scale = 1,
  elements,
  moveZoneLocal,
  saveZonePosition,
  moveElementLocal,
  selectZone,
  setDragging,
}: UseZoneDragProps): UseZoneDragReturn {
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const [zoneDragElementPositions, setZoneDragElementPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Ghost Mode states
  const [draggingZoneId, setDraggingZoneId] = useState<string | null>(null);
  const [draggingElementIds, setDraggingElementIds] = useState<string[]>([]);
  const [draggingElementCount, setDraggingElementCount] = useState<number>(0);

  const dragPositionRef = useRef(dragPosition);
  dragPositionRef.current = dragPosition;

  const zoneDragRef = useRef<ZoneDragRef | null>(null);

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

  const handleZoneMouseMove = useCallback((e: MouseEvent) => {
    if (!zoneDragRef.current) return;

    // Diviser par scale pour compenser le zoom
    const dx = (e.clientX - zoneDragRef.current.startX) / scale;
    const dy = (e.clientY - zoneDragRef.current.startY) / scale;
    const newX = Math.max(0, zoneDragRef.current.zoneStartX + dx);
    const newY = Math.max(0, zoneDragRef.current.zoneStartY + dy);

    // SCALE-2: Store position in ref, schedule RAF update
    pendingPositionRef.current = { type: 'zone', id: zoneDragRef.current.zoneId, x: newX, y: newY };

    // Only schedule RAF if not already scheduled
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(updatePositionWithRAF);
    }

    // Ghost Mode: on ne met plus à jour zoneDragElementPositions pendant le drag
    // Les éléments sont masqués, pas besoin de calculer leurs positions
  }, [scale, updatePositionWithRAF]);

  const handleZoneMouseUp = useCallback(() => {
    // Cleanup immédiat AVANT toute opération async
    document.removeEventListener('mousemove', handleZoneMouseMove);
    document.removeEventListener('mouseup', handleZoneMouseUp);

    // SCALE-2: Cancel pending RAF
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Apply any pending position immediately
    const pos = pendingPositionRef.current || dragPositionRef.current;
    pendingPositionRef.current = null;
    const dragData = zoneDragRef.current;

    // Reset des states immédiatement
    setDragPosition(null);
    setZoneDragElementPositions({});
    setDraggingZoneId(null);
    setDraggingElementIds([]);
    setDraggingElementCount(0);
    zoneDragRef.current = null;
    setDragging(false);

    if (pos && pos.type === 'zone') {
      moveZoneLocal(pos.id, pos.x, pos.y);
      saveZonePosition(pos.id, pos.x, pos.y);

      // Si zone cristallisée, sauvegarder aussi les positions des éléments
      if (dragData?.containedElements && dragData.containedElements.length > 0) {
        const dx = pos.x - dragData.zoneStartX;
        const dy = pos.y - dragData.zoneStartY;

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
  }, [moveZoneLocal, saveZonePosition, moveElementLocal, setDragging, handleZoneMouseMove]);

  const handleZoneMouseDown = useCallback((e: React.MouseEvent, zone: BoardZone) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    selectZone(zone.id);

    // Si la zone est cristallisée, capturer les éléments contenus pour les déplacer ensemble
    let containedElements: Array<{ id: string; startX: number; startY: number }> | undefined;
    let elementIds: string[] = [];

    if (zone.crystallizedAt && zone.linkedProjectId) {
      const elementsInZone = getElementsInZone(elements, zone);
      containedElements = elementsInZone.map(el => ({
        id: el.id,
        startX: el.positionX,
        startY: el.positionY,
      }));
      elementIds = elementsInZone.map(el => el.id);
    }

    zoneDragRef.current = {
      zoneId: zone.id,
      startX: e.clientX,
      startY: e.clientY,
      zoneStartX: zone.positionX,
      zoneStartY: zone.positionY,
      containedElements,
    };

    // Ghost Mode: activer le masquage des éléments
    setDraggingZoneId(zone.id);
    setDraggingElementIds(elementIds);
    setDraggingElementCount(elementIds.length);

    setDragging(true);
    document.addEventListener('mousemove', handleZoneMouseMove);
    document.addEventListener('mouseup', handleZoneMouseUp);
  }, [elements, selectZone, setDragging, handleZoneMouseMove, handleZoneMouseUp]);

  return {
    dragPosition,
    zoneDragElementPositions,
    draggingZoneId,
    draggingElementIds,
    draggingElementCount,
    handleZoneMouseDown,
  };
}
