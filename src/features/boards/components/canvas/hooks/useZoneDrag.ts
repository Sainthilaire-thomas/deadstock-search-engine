// src/features/boards/components/canvas/hooks/useZoneDrag.ts
// Hook pour le drag & drop des zones (avec déplacement solidaire des éléments)

import { useRef, useState, useCallback } from 'react';
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
  handleZoneMouseDown: (e: React.MouseEvent, zone: BoardZone) => void;
}

export function useZoneDrag({
  elements,
  moveZoneLocal,
  saveZonePosition,
  moveElementLocal,
  selectZone,
  setDragging,
}: UseZoneDragProps): UseZoneDragReturn {
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const [zoneDragElementPositions, setZoneDragElementPositions] = useState<Record<string, { x: number; y: number }>>({});

  const dragPositionRef = useRef(dragPosition);
  dragPositionRef.current = dragPosition;

  const zoneDragRef = useRef<ZoneDragRef | null>(null);

  const handleZoneMouseMove = useCallback((e: MouseEvent) => {
    if (!zoneDragRef.current) return;
    
    const dx = e.clientX - zoneDragRef.current.startX;
    const dy = e.clientY - zoneDragRef.current.startY;
    const newX = Math.max(0, zoneDragRef.current.zoneStartX + dx);
    const newY = Math.max(0, zoneDragRef.current.zoneStartY + dy);

    setDragPosition({ type: 'zone', id: zoneDragRef.current.zoneId, x: newX, y: newY });

    // Si zone cristallisée, calculer les nouvelles positions des éléments (visuel uniquement)
    if (zoneDragRef.current.containedElements && zoneDragRef.current.containedElements.length > 0) {
      const newPositions: Record<string, { x: number; y: number }> = {};
      zoneDragRef.current.containedElements.forEach(el => {
        newPositions[el.id] = {
          x: Math.max(0, el.startX + dx),
          y: Math.max(0, el.startY + dy),
        };
      });
      setZoneDragElementPositions(newPositions);
    }
  }, []);

  const handleZoneMouseUp = useCallback(() => {
    // Cleanup immédiat AVANT toute opération async
    document.removeEventListener('mousemove', handleZoneMouseMove);
    document.removeEventListener('mouseup', handleZoneMouseUp);

    const pos = dragPositionRef.current;
    const dragData = zoneDragRef.current;

    // Reset des states immédiatement
    setDragPosition(null);
    setZoneDragElementPositions({});
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

    if (zone.crystallizedAt && zone.linkedProjectId) {
      const elementsInZone = getElementsInZone(elements, zone);
      containedElements = elementsInZone.map(el => ({
        id: el.id,
        startX: el.positionX,
        startY: el.positionY,
      }));
    }

    zoneDragRef.current = {
      zoneId: zone.id,
      startX: e.clientX,
      startY: e.clientY,
      zoneStartX: zone.positionX,
      zoneStartY: zone.positionY,
      containedElements,
    };

    setDragging(true);
    document.addEventListener('mousemove', handleZoneMouseMove);
    document.addEventListener('mouseup', handleZoneMouseUp);
  }, [elements, selectZone, setDragging, handleZoneMouseMove, handleZoneMouseUp]);

  return {
    dragPosition,
    zoneDragElementPositions,
    handleZoneMouseDown,
  };
}
