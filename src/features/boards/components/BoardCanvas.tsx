// src/features/boards/components/BoardCanvas.tsx

'use client';

import { useRef, useState } from 'react';
import { Layout, MousePointer, GripVertical, Move } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { ELEMENT_TYPE_LABELS } from '../domain/types';
import { NoteEditor } from './NoteEditor';
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
    setDragging,
  } = useBoard();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);

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

  // Handle canvas click to clear selection
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      clearSelection();
      setEditingElementId(null);
    }
  };

  // Double click to edit
  const handleDoubleClick = (element: BoardElement) => {
    if (element.elementType === 'note') {
      setEditingElementId(element.id);
    }
  };

  // Save note content
  const handleSaveNote = async (elementId: string, content: string) => {
    const element = elements.find(e => e.id === elementId);
    if (element && element.elementType === 'note') {
      await updateElement(elementId, {
        elementData: {
          ...element.elementData,
          content,
        },
      });
    }
    setEditingElementId(null);
  };

  // Element drag handlers
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

  // Zone drag handlers
  const handleZoneMouseDown = (e: React.MouseEvent, zone: BoardZone) => {
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

  // Zone resize handlers
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

    // Calculer les nouvelles dimensions selon la poignée
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

    // Appliquer les changements
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

  if (elements.length === 0 && zones.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <Layout className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-lg font-medium mb-2">Board vide</h2>
        <p className="text-muted-foreground text-center max-w-md px-4">
          Ajoutez des notes, palettes ou zones depuis le panneau de droite
          pour commencer à organiser vos idées.
        </p>
      </div>
    );
  }

  // Calculate canvas size based on elements and zones
  const allPositions = [
    ...elements.map(e => ({ x: e.positionX + (e.width || 200), y: e.positionY + (e.height || 150) })),
    ...zones.map(z => ({ x: z.positionX + z.width, y: z.positionY + z.height })),
  ];
  const canvasWidth = Math.max(1200, ...allPositions.map(p => p.x + 100));
  const canvasHeight = Math.max(800, ...allPositions.map(p => p.y + 100));

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-auto"
      onClick={handleCanvasClick}
    >
      {/* Canvas avec positionnement absolu */}
      <div
        className="relative"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          minWidth: '100%',
          minHeight: '100%',
        }}
      >
        {/* Zones en arrière-plan (draggables + resizables) */}
        {zones.map((zone) => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            isSelected={selectedZoneId === zone.id}
            onMouseDown={(e) => handleZoneMouseDown(e, zone)}
            onResizeStart={(e, handle) => handleZoneResizeStart(e, zone, handle)}
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
    </div>
  );
}

// ============================================
// ZONE CARD (avec poignées de resize)
// ============================================

interface ZoneCardProps {
  zone: BoardZone;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent, handle: ResizeHandle) => void;
}

function ZoneCard({ zone, isSelected, onMouseDown, onResizeStart }: ZoneCardProps) {
  return (
    <div
      className={`absolute border-2 border-dashed rounded-lg transition-shadow ${
        isSelected ? 'shadow-lg ring-2 ring-primary' : 'hover:shadow-md'
      }`}
      style={{
        left: zone.positionX,
        top: zone.positionY,
        width: zone.width,
        height: zone.height,
        borderColor: zone.color,
        backgroundColor: `${zone.color}15`,
        zIndex: isSelected ? 5 : 1,
      }}
    >
      {/* Zone header - draggable */}
      <div
        className="absolute -top-0 left-0 right-0 px-3 py-1 flex items-center gap-2 cursor-move rounded-t-md"
        style={{ backgroundColor: zone.color }}
        onMouseDown={onMouseDown}
      >
        <Move className="w-3 h-3 text-white/70" />
        <span className="text-xs font-medium text-white truncate">
          {zone.name}
        </span>
      </div>

      {/* Resize handles - uniquement si sélectionné */}
      {isSelected && (
        <>
          {/* Coins */}
          <ResizeHandleComponent position="nw" onMouseDown={(e) => onResizeStart(e, 'nw')} />
          <ResizeHandleComponent position="ne" onMouseDown={(e) => onResizeStart(e, 'ne')} />
          <ResizeHandleComponent position="sw" onMouseDown={(e) => onResizeStart(e, 'sw')} />
          <ResizeHandleComponent position="se" onMouseDown={(e) => onResizeStart(e, 'se')} />
          
          {/* Côtés */}
          <ResizeHandleComponent position="n" onMouseDown={(e) => onResizeStart(e, 'n')} />
          <ResizeHandleComponent position="s" onMouseDown={(e) => onResizeStart(e, 's')} />
          <ResizeHandleComponent position="e" onMouseDown={(e) => onResizeStart(e, 'e')} />
          <ResizeHandleComponent position="w" onMouseDown={(e) => onResizeStart(e, 'w')} />
        </>
      )}
    </div>
  );
}

// ============================================
// RESIZE HANDLE COMPONENT
// ============================================

interface ResizeHandleComponentProps {
  position: ResizeHandle;
  onMouseDown: (e: React.MouseEvent) => void;
}

function ResizeHandleComponent({ position, onMouseDown }: ResizeHandleComponentProps) {
  const positionStyles: Record<ResizeHandle, string> = {
    nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize',
    ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize',
    sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize',
    se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize',
    n: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize',
    s: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize',
    e: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-e-resize',
    w: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-w-resize',
  };

  const isCorner = ['nw', 'ne', 'sw', 'se'].includes(position);

  return (
    <div
      className={`absolute ${positionStyles[position]} ${
        isCorner ? 'w-3 h-3' : 'w-2 h-2'
      } bg-primary border-2 border-background rounded-full hover:scale-125 transition-transform z-10`}
      onMouseDown={onMouseDown}
    />
  );
}

// ============================================
// ELEMENT CARD
// ============================================

interface ElementCardProps {
  element: BoardElement;
  isSelected: boolean;
  isEditing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onSaveNote: (content: string) => void;
  onCancelEdit: () => void;
}

function ElementCard({
  element,
  isSelected,
  isEditing,
  onMouseDown,
  onDoubleClick,
  onSaveNote,
  onCancelEdit,
}: ElementCardProps) {
  const width = element.width || 180;
  const height = element.height || 120;

  return (
    <div
      className={`absolute bg-background border rounded-lg shadow-sm overflow-hidden transition-shadow select-none ${
        isSelected
          ? 'ring-2 ring-primary shadow-lg'
          : 'hover:shadow-md'
      }`}
      style={{
        left: element.positionX,
        top: element.positionY,
        width,
        height,
        zIndex: isEditing ? 2000 : isSelected ? 1000 : element.zIndex + 10,
        cursor: isEditing ? 'default' : 'move',
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {/* Mode édition pour les notes */}
      {isEditing && element.elementType === 'note' ? (
        <NoteEditor
          content={(element.elementData as any).content || ''}
          color={(element.elementData as any).color || '#FEF3C7'}
          onSave={onSaveNote}
          onCancel={onCancelEdit}
        />
      ) : (
        <>
          {/* Drag handle indicator */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-30 hover:opacity-60 transition-opacity">
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="p-3 h-full flex flex-col pt-5">
            {/* Header avec type */}
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
              {ELEMENT_TYPE_LABELS[element.elementType]}
            </span>

            {/* Contenu selon le type */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {element.elementType === 'textile' && (
                <TextilePreview data={element.elementData as any} />
              )}
              {element.elementType === 'note' && (
                <NotePreview data={element.elementData as any} />
              )}
              {element.elementType === 'palette' && (
                <PalettePreview data={element.elementData as any} />
              )}
              {element.elementType === 'calculation' && (
                <CalculationPreview data={element.elementData as any} />
              )}
              {element.elementType === 'inspiration' && (
                <InspirationPreview data={element.elementData as any} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// PREVIEWS
// ============================================

function TextilePreview({ data }: { data: any }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.textileId) {
      window.open(`/favorites/${data.textileId}`, '_blank');
    }
  };

  return (
    <div
      className="flex gap-2 h-full cursor-pointer hover:opacity-80 transition-opacity"
      onDoubleClick={handleClick}
      title="Double-clic pour voir le détail"
    >
      {data.snapshot?.imageUrl && (
        <img
          src={data.snapshot.imageUrl}
          alt={data.snapshot?.name || 'Tissu'}
          className="w-12 h-12 object-cover rounded"
          draggable={false}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{data.snapshot?.name || 'Tissu'}</p>
        <p className="text-xs text-muted-foreground">{data.snapshot?.price}€</p>
      </div>
    </div>
  );
}

function NotePreview({ data }: { data: any }) {
  const bgColor = data.color || '#FEF3C7';
  return (
    <div
      className="h-full rounded p-2 -m-1"
      style={{ backgroundColor: bgColor }}
    >
      <p className="text-sm line-clamp-4 text-gray-800">
        {data.content || 'Double-clic pour éditer...'}
      </p>
    </div>
  );
}

function PalettePreview({ data }: { data: any }) {
  const colors = data.colors || [];
  return (
    <div>
      {data.name && (
        <p className="text-xs font-medium mb-2 truncate">{data.name}</p>
      )}
      <div className="flex gap-1 flex-wrap">
        {colors.map((color: string, i: number) => (
          <div
            key={i}
            className="w-8 h-8 rounded border border-gray-200"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}

function CalculationPreview({ data }: { data: any }) {
  return (
    <div>
      <p className="text-sm font-medium">{data.summary || 'Calcul'}</p>
      {data.result && (
        <p className="text-xs text-muted-foreground mt-1">
          {data.result.recommended}m recommandés
        </p>
      )}
    </div>
  );
}

function InspirationPreview({ data }: { data: any }) {
  return (
    <div className="h-full">
      {data.imageUrl ? (
        <img
          src={data.imageUrl}
          alt={data.caption || 'Inspiration'}
          className="w-full h-full object-cover rounded"
          draggable={false}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{data.caption || 'Inspiration'}</p>
      )}
    </div>
  );
}
