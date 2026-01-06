// src/features/boards/components/ElementCard.tsx

'use client';

import { GripVertical } from 'lucide-react';
import { ELEMENT_TYPE_LABELS } from '../domain/types';
import { NoteEditor } from './NoteEditor';
import type { BoardElement } from '../domain/types';

interface ElementCardProps {
  element: BoardElement;
  isSelected: boolean;
  isEditing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onSaveNote: (content: string) => void;
  onCancelEdit: () => void;
}

export function ElementCard({
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
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
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
      {isEditing && element.elementType === 'note' ? (
        <NoteEditor
          content={(element.elementData as any).content || ''}
          color={(element.elementData as any).color || '#FEF3C7'}
          onSave={onSaveNote}
          onCancel={onCancelEdit}
        />
      ) : (
        <>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-30 hover:opacity-60 transition-opacity">
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="p-3 h-full flex flex-col pt-5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
              {ELEMENT_TYPE_LABELS[element.elementType]}
            </span>

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
    <div className="h-full rounded p-2 -m-1" style={{ backgroundColor: bgColor }}>
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
      {data.name && <p className="text-xs font-medium mb-2 truncate">{data.name}</p>}
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
  // Support nouveau format (pattern import) et ancien format (journey)
  const hasYardageByWidth = data.yardageByWidth && Object.keys(data.yardageByWidth).length > 0;
  
  if (hasYardageByWidth) {
    // Nouveau format - Pattern Import
    const sortedWidths = Object.entries(data.yardageByWidth as Record<number, number>)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .slice(0, 3); // Max 3 pour la preview
    
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium truncate">
          {data.patternName || data.summary || 'Calcul'}
        </p>
        <p className="text-xs text-muted-foreground">
          {data.selectedSize && `Taille ${data.selectedSize}`}
          {data.quantity > 1 && ` • ×${data.quantity}`}
        </p>
        <div className="space-y-0.5 mt-2">
          {sortedWidths.map(([width, yardage]) => (
            <div key={width} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{width}cm</span>
              <span className="font-mono">{(yardage as number).toFixed(2)}m</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Ancien format - Journey
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
