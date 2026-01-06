// src/features/boards/components/BoardCanvas.tsx

'use client';

import { useRef, useState } from 'react';
import { Layout, MousePointer } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { ZoneCard } from './ZoneCard';
import { ElementCard } from './ElementCard';
import { CrystallizationDialog } from './CrystallizationDialog';
import type { BoardElement, BoardZone } from '../domain/types';

// Constantes pour le resize
const MIN_ZONE_WIDTH = 150;
const MIN_ZONE_HEIGHT = 100;

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export function BoardCanvas() {
  const {
    elements,
    zones,
    selectedElementIds,
    selectedZoneId,
    toggleElementSelection,
    clearSelection,
    moveElement,
    updateElement,
    selectZone,
    moveZone,
    resizeZone,
    updateZone,
    setDragging,
  } = useBoard();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [crystallizingZone, setCrystallizingZone] = useState<BoardZone | null>(null);

  // Extraire boardId
  const boardId = zones[0]?.boardId || elements[0]?.boardId || '';

  // Drag state for elements
  const elementDragRef = useRef<{
    elementId: string;
    startX: number;
    startY: number;
    elementStartX: number;
    elementStartY: number;
  } | null>(null);

  // Drag state for zones
  const zoneDragRef = useRef<{
    zoneId: string;
    startX: number;
    startY: number;
    zoneStartX: number;
    zoneStartY: number;
  } | null>(null);

  // Resize state for zones
  const zoneResizeRef = useRef<{
    zoneId: string;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    zoneStartX: number;
    zoneStartY: number;
    zoneStartWidth: number;
    zoneStartHeight: number;
  } | null>(null);

  // ============================================
  // HANDLERS
  // ============================================

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      clearSelection();
      setEditingElementId(null);
      setEditingZoneId(null);
    }
  };

  const handleDoubleClick = (element: BoardElement) => {
    if (element.elementType === 'note') {
      setEditingElementId(element.id);
    }
  };

  const handleZoneDoubleClick = (zone: BoardZone) => {
    setEditingZoneId(zone.id);
  };

  const handleSaveZoneName = async (zoneId: string, name: string) => {
    if (name.trim()) {
      await updateZone(zoneId, { name: name.trim() });
    }
    setEditingZoneId(null);
  };

  const handleSaveNote = async (elementId: string, content: string) => {
    const element = elements.find((e) => e.id === elementId);
    if (element && element.elementType === 'note') {
      await updateElement(elementId, {
        elementData: { ...element.elementData, content },
      });
    }
    setEditingElementId(null);
  };

  // ============================================
  // ELEMENT DRAG
  // ============================================

  const handleElementMouseDown = (e: React.MouseEvent, element: BoardElement) => {
    if (editingElementId === element.id) return;
    e.stopPropagation();

    if (!e.shiftKey && !selectedElementIds.includes(element.id)) {
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

    document.addEventListener('mousemove', handleElementMouseMove);
    document.addEventListener('mouseup', handleElementMouseUp);
  };

  const handleElementMouseMove = (e: MouseEvent) => {
    if (!elementDragRef.current) return;
    const dx = e.clientX - elementDragRef.current.startX;
    const dy = e.clientY - elementDragRef.current.startY;
    const newX = Math.max(0, elementDragRef.current.elementStartX + dx);
    const newY = Math.max(0, elementDragRef.current.elementStartY + dy);
    moveElement(elementDragRef.current.elementId, newX, newY);
  };

  const handleElementMouseUp = () => {
    elementDragRef.current = null;
    setDragging(false);
    document.removeEventListener('mousemove', handleElementMouseMove);
    document.removeEventListener('mouseup', handleElementMouseUp);
  };

  // ============================================
  // ZONE DRAG
  // ============================================

  const handleZoneMouseDown = (e: React.MouseEvent, zone: BoardZone) => {
    if (editingZoneId === zone.id) return;
    e.stopPropagation();
    selectZone(zone.id);

    zoneDragRef.current = {
      zoneId: zone.id,
      startX: e.clientX,
      startY: e.clientY,
      zoneStartX: zone.positionX,
      zoneStartY: zone.positionY,
    };
    setDragging(true);

    document.addEventListener('mousemove', handleZoneMouseMove);
    document.addEventListener('mouseup', handleZoneMouseUp);
  };

  const handleZoneMouseMove = (e: MouseEvent) => {
    if (!zoneDragRef.current) return;
    const dx = e.clientX - zoneDragRef.current.startX;
    const dy = e.clientY - zoneDragRef.current.startY;
    const newX = Math.max(0, zoneDragRef.current.zoneStartX + dx);
    const newY = Math.max(0, zoneDragRef.current.zoneStartY + dy);
    moveZone(zoneDragRef.current.zoneId, newX, newY);
  };

  const handleZoneMouseUp = () => {
    zoneDragRef.current = null;
    setDragging(false);
    document.removeEventListener('mousemove', handleZoneMouseMove);
    document.removeEventListener('mouseup', handleZoneMouseUp);
  };

  // ============================================
  // ZONE RESIZE
  // ============================================

  const handleZoneResizeStart = (e: React.MouseEvent, zone: BoardZone, handle: ResizeHandle) => {
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
  };

  const handleZoneResizeMove = (e: MouseEvent) => {
    if (!zoneResizeRef.current) return;

    const ref = zoneResizeRef.current;
    const dx = e.clientX - ref.startX;
    const dy = e.clientY - ref.startY;

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

    if (newX !== ref.zoneStartX || newY !== ref.zoneStartY) {
      moveZone(ref.zoneId, Math.max(0, newX), Math.max(0, newY));
    }
    resizeZone(ref.zoneId, newWidth, newHeight);
  };

  const handleZoneResizeEnd = () => {
    zoneResizeRef.current = null;
    setDragging(false);
    document.removeEventListener('mousemove', handleZoneResizeMove);
    document.removeEventListener('mouseup', handleZoneResizeEnd);
  };

  // ============================================
  // RENDER
  // ============================================

  if (elements.length === 0 && zones.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <Layout className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-lg font-medium mb-2">Board vide</h2>
        <p className="text-muted-foreground text-center max-w-md px-4">
          Ajoutez des notes, palettes ou zones depuis le panneau de droite pour commencer à
          organiser vos idées.
        </p>
      </div>
    );
  }

  const allPositions = [
    ...elements.map((e) => ({ x: e.positionX + (e.width || 200), y: e.positionY + (e.height || 150) })),
    ...zones.map((z) => ({ x: z.positionX + z.width, y: z.positionY + z.height })),
  ];
  const canvasWidth = Math.max(1200, ...allPositions.map((p) => p.x + 100));
  const canvasHeight = Math.max(800, ...allPositions.map((p) => p.y + 100));

  return (
    <div ref={canvasRef} className="absolute inset-0 overflow-auto" onClick={handleCanvasClick}>
      <div
        className="relative"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          minWidth: '100%',
          minHeight: '100%',
        }}
      >
        {/* Zones */}
        {zones.map((zone) => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            isSelected={selectedZoneId === zone.id}
            isEditing={editingZoneId === zone.id}
            onMouseDown={(e) => handleZoneMouseDown(e, zone)}
            onDoubleClick={() => handleZoneDoubleClick(zone)}
            onResizeStart={(e, handle) => handleZoneResizeStart(e, zone, handle)}
            onSaveName={(name) => handleSaveZoneName(zone.id, name)}
            onCancelEdit={() => setEditingZoneId(null)}
            onCrystallize={() => setCrystallizingZone(zone)}
          />
        ))}

        {/* Éléments */}
        {elements.map((element) => (
          <ElementCard
            key={element.id}
            element={element}
            isSelected={selectedElementIds.includes(element.id)}
            isEditing={editingElementId === element.id}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onDoubleClick={() => handleDoubleClick(element)}
            onSaveNote={(content) => handleSaveNote(element.id, content)}
            onCancelEdit={() => setEditingElementId(null)}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border">
        <MousePointer className="w-3 h-3" />
        Cliquer pour sélectionner • Glisser pour déplacer • Double-clic pour éditer
      </div>

      {/* Crystallization Dialog */}
      {crystallizingZone && (
        <CrystallizationDialog
          zone={crystallizingZone}
          boardId={boardId}
          isOpen={!!crystallizingZone}
          onClose={() => setCrystallizingZone(null)}
          onSuccess={() => setCrystallizingZone(null)}
        />
      )}
    </div>
  );
}
