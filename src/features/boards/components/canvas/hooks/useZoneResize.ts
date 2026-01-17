// src/features/boards/components/canvas/hooks/useZoneResize.ts
// Hook pour le redimensionnement des zones

import { useRef, useState, useCallback } from 'react';
import type { BoardZone } from '../../../domain/types';

const MIN_ZONE_WIDTH = 150;
const MIN_ZONE_HEIGHT = 100;

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ResizeState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ZoneResizeRef {
  zoneId: string;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  zoneStartX: number;
  zoneStartY: number;
  zoneStartWidth: number;
  zoneStartHeight: number;
}

interface UseZoneResizeProps {
  scale?: number;
  moveZoneLocal: (id: string, x: number, y: number) => void;
  saveZonePosition: (id: string, x: number, y: number) => Promise<void>;
  resizeZoneLocal: (id: string, width: number, height: number) => void;
  saveZoneSize: (id: string, width: number, height: number) => Promise<void>;
  selectZone: (id: string | null) => void;
  setDragging: (isDragging: boolean) => void;
}

interface UseZoneResizeReturn {
  resizeState: ResizeState | null;
  handleZoneResizeStart: (e: React.MouseEvent, zone: BoardZone, handle: ResizeHandle) => void;
}

export function useZoneResize({
  scale = 1,
  moveZoneLocal,
  saveZonePosition,
  resizeZoneLocal,
  saveZoneSize,
  selectZone,
  setDragging,
}: UseZoneResizeProps): UseZoneResizeReturn {
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const resizeStateRef = useRef(resizeState);
  resizeStateRef.current = resizeState;

  const zoneResizeRef = useRef<ZoneResizeRef | null>(null);

const handleZoneResizeMove = useCallback((e: MouseEvent) => {
    if (!zoneResizeRef.current) return;

    const ref = zoneResizeRef.current;
    // Diviser par scale pour compenser le zoom
    const dx = (e.clientX - ref.startX) / scale;
    const dy = (e.clientY - ref.startY) / scale;

    let newX = ref.zoneStartX;
    let newY = ref.zoneStartY;
    let newWidth = ref.zoneStartWidth;
    let newHeight = ref.zoneStartHeight;

    if (ref.handle.includes('e')) {
      newWidth = Math.max(MIN_ZONE_WIDTH, ref.zoneStartWidth + dx);
    }
    if (ref.handle.includes('w')) {
      const widthChange = Math.min(dx, ref.zoneStartWidth - MIN_ZONE_WIDTH);
      newWidth = ref.zoneStartWidth - widthChange;
      newX = ref.zoneStartX + widthChange;
    }
    if (ref.handle.includes('s')) {
      newHeight = Math.max(MIN_ZONE_HEIGHT, ref.zoneStartHeight + dy);
    }
    if (ref.handle.includes('n')) {
      const heightChange = Math.min(dy, ref.zoneStartHeight - MIN_ZONE_HEIGHT);
      newHeight = ref.zoneStartHeight - heightChange;
      newY = ref.zoneStartY + heightChange;
    }

    setResizeState({
      id: ref.zoneId,
      x: Math.max(0, newX),
      y: Math.max(0, newY),
      width: newWidth,
      height: newHeight,
    });
   }, [scale]);

  const handleZoneResizeEnd = useCallback(() => {
    const resize = resizeStateRef.current;

    if (resize) {
      moveZoneLocal(resize.id, resize.x, resize.y);
      resizeZoneLocal(resize.id, resize.width, resize.height);
      saveZonePosition(resize.id, resize.x, resize.y);
      saveZoneSize(resize.id, resize.width, resize.height);
    }

    setResizeState(null);
    zoneResizeRef.current = null;
    setDragging(false);
    document.removeEventListener('mousemove', handleZoneResizeMove);
    document.removeEventListener('mouseup', handleZoneResizeEnd);
  }, [moveZoneLocal, resizeZoneLocal, saveZonePosition, saveZoneSize, setDragging, handleZoneResizeMove]);

  const handleZoneResizeStart = useCallback((e: React.MouseEvent, zone: BoardZone, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    selectZone(zone.id);

    zoneResizeRef.current = {
      zoneId: zone.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      zoneStartX: zone.positionX,
      zoneStartY: zone.positionY,
      zoneStartWidth: zone.width,
      zoneStartHeight: zone.height,
    };
    setDragging(true);

    document.addEventListener('mousemove', handleZoneResizeMove);
    document.addEventListener('mouseup', handleZoneResizeEnd);
  }, [selectZone, setDragging, handleZoneResizeMove, handleZoneResizeEnd]);

  return {
    resizeState,
    handleZoneResizeStart,
  };
}
