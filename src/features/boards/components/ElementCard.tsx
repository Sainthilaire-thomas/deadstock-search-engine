// src/features/boards/components/ElementCard.tsx
// VERSION SPRINT 3 - Avec PaletteElement amélioré

'use client';

import { GripVertical, X } from 'lucide-react';
import { ELEMENT_TYPE_LABELS, isPaletteElement } from '../domain/types';
import { NoteEditor } from './NoteEditor';
import { PaletteElement } from './elements/PaletteElement';
import type { BoardElement, PaletteElementData } from '../domain/types';

interface ElementCardProps {
  element: BoardElement;
  isSelected: boolean;
  isEditing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onSaveNote: (content: string) => void;
  onCancelEdit: () => void;
  onDelete?: () => void;
  onSavePalette?: (data: PaletteElementData) => void; // NEW: pour sauvegarder palette
}

export function ElementCard({
  element,
  isSelected,
  isEditing,
  onMouseDown,
  onDoubleClick,
  onSaveNote,
  onCancelEdit,
  onDelete,
  onSavePalette,
}: ElementCardProps) {
  const width = element.width || 180;
  const height = element.height || 120;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.();
  };

  // Rendu spécial pour palette en mode édition
  const isPalette = element.elementType === 'palette';
  const isNote = element.elementType === 'note';

  return (
    <div
      className={`
        group
        absolute
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded
        overflow-visible
        transition-all duration-150
        select-none
        ${isSelected
          ? 'ring-1 ring-gray-400 dark:ring-gray-500 shadow-md'
          : 'shadow-sm hover:shadow-md'
        }
      `}
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
      {/* Bouton × pour supprimer - visible au hover */}
      {!isEditing && onDelete && (
        <button
          onClick={handleDelete}
          className="
            absolute -top-2 -right-2
            w-5 h-5
            bg-red-500 hover:bg-red-600
            text-white
            rounded-full
            flex items-center justify-center
            opacity-0 group-hover:opacity-100
            transition-opacity duration-150
            shadow-sm
            z-20
          "
          title="Supprimer"
        >
          <X className="w-3 h-3" strokeWidth={2.5} />
        </button>
      )}

      <div className="overflow-hidden rounded h-full">
        {/* Mode édition Note */}
        {isEditing && isNote ? (
          <NoteEditor
            content={(element.elementData as any).content || ''}
            color={(element.elementData as any).color || '#FEF3C7'}
            onSave={onSaveNote}
            onCancel={onCancelEdit}
          />
        ) : (
          <>
            {/* Grip handle - plus discret */}
            <div className="
              absolute top-1 left-1/2 -translate-x-1/2
              opacity-20 group-hover:opacity-50
              transition-opacity
            ">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            <div className="p-3 h-full flex flex-col pt-5">
              {/* Type label - sauf pour palette (a son propre header) */}
              {!isPalette && (
                <span className="
                  text-[10px] uppercase tracking-wider
                  text-gray-400 dark:text-gray-500
                  mb-2
                ">
                  {ELEMENT_TYPE_LABELS[element.elementType]}
                </span>
              )}

              <div className="flex-1 min-h-0 overflow-hidden">
                {element.elementType === 'textile' && (
                  <TextilePreview data={element.elementData as any} />
                )}
                {element.elementType === 'note' && (
                  <NotePreview data={element.elementData as any} />
                )}
                {element.elementType === 'palette' && isPaletteElement(element.elementData) && (
                  <PaletteElement 
                    data={element.elementData} 
                    width={width - 24} // moins le padding
                    height={height - 44} // moins le padding top
                  />
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
    </div>
  );
}

// ============================================
// PREVIEWS - Style épuré
// ============================================

function TextilePreview({ data }: { data: any }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.textileId) {
      window.open(`/textiles/${data.textileId}`, '_blank');
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
          className="w-12 h-12 object-cover rounded-sm"
          draggable={false}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {data.snapshot?.name || 'Tissu'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {data.snapshot?.price}€
        </p>
      </div>
    </div>
  );
}

function NotePreview({ data }: { data: any }) {
  const bgColor = data.color || '#FEF3C7';
  return (
    <div
      className="h-full rounded-sm p-2 -m-1"
      style={{ backgroundColor: bgColor }}
    >
      <p className="text-sm line-clamp-4 text-gray-800">
        {data.content || 'Double-clic pour éditer...'}
      </p>
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
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {data.patternName || data.summary || 'Calcul'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {data.selectedSize && `Taille ${data.selectedSize}`}
          {data.quantity > 1 && ` • ×${data.quantity}`}
        </p>
        <div className="space-y-0.5 mt-2">
          {sortedWidths.map(([width, yardage]) => (
            <div key={width} className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">{width}cm</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {(yardage as number).toFixed(2)}m
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Ancien format - Journey
  return (
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {data.summary || 'Calcul'}
      </p>
      {data.result && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
          className="w-full h-full object-cover rounded-sm"
          draggable={false}
        />
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data.caption || 'Inspiration'}
        </p>
      )}
    </div>
  );
}
