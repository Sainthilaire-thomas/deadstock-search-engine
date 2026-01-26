// src/features/boards/components/ZoneCard.tsx
// VERSION ÉPURÉE - Sprint 1 avec bouton × au hover

'use client';

import React, { useState, useRef } from 'react';
import { GripVertical, Sparkles, ExternalLink, X } from 'lucide-react';
import { isZoneCrystallized, isZoneOrdered } from '../domain/types';
import type { BoardZone } from '../domain/types';

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ZoneCardProps {
  zone: BoardZone;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isSelected: boolean;
  isEditing: boolean;
  isVisible?: boolean;
  isDragging?: boolean;
  ghostElementCount?: number;
  style?: React.CSSProperties;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onResizeStart: (e: React.MouseEvent, handle: ResizeHandle) => void;
  onSaveName: (name: string) => void;
  onCancelEdit: () => void;
  onCrystallize: () => void;
  onDelete?: () => void;
}

export const ZoneCard = React.memo(function ZoneCard({
  zone,
  position,
  size,
  isSelected,
  isEditing,
  isVisible = true,
  isDragging = false,
  ghostElementCount = 0,
  style,
  onMouseDown,
  onDoubleClick,
  onResizeStart,
  onSaveName,
  onCancelEdit,
  onCrystallize,
  onDelete,
}: ZoneCardProps) {
  const [editName, setEditName] = useState(zone.name);
  const inputRef = useRef<HTMLInputElement>(null);
    const isCrystallized = isZoneCrystallized(zone);
  const isOrdered = isZoneOrdered(zone);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSaveName(editName);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditName(zone.name);
      onCancelEdit();
    }
  };

  const handleBlur = () => {
    onSaveName(editName);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.();
  };

  
  // Mode Inspiration : zones invisibles avec animation (sauf si cristallisées)
  const shouldShow = isVisible || isCrystallized;

  // Ghost Mode: style spécial pendant le drag avec éléments masqués
  const isGhostMode = isDragging && ghostElementCount > 0;

  return (
    <div
      className={`
        group
        absolute transition-all duration-300 ease-in-out
        ${shouldShow
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-95 pointer-events-none'
        }
        ${isGhostMode
          ? 'border-2 border-dashed border-blue-400 dark:border-blue-500 bg-blue-50/30 dark:bg-blue-900/20'
          : isCrystallized
            ? 'border border-solid border-gray-400 bg-gray-50/50 dark:bg-gray-800/30'
            : 'border-2 border-dashed border-gray-300 dark:border-gray-600 bg-transparent'
        }
        ${isSelected
          ? 'shadow-md ring-1 ring-gray-400 dark:ring-gray-500'
          : 'hover:border-gray-400 dark:hover:border-gray-500'
        }
        rounded
      `}
       style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
        zIndex: isSelected ? 5 : 1,
        ...style,
      }}
    >
      {/* Bouton × pour supprimer - visible au hover, sauf si cristallisée */}
      {!isCrystallized && onDelete && (
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
          title="Supprimer la zone"
        >
          <X className="w-3 h-3" strokeWidth={2.5} />
        </button>
      )}

      {/* Header - positionné au-dessus de la zone */}
      <div
        className="
          absolute -top-6 left-0 
          flex items-center gap-1.5 
          cursor-move
          px-1
        "
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
        
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="
              text-xs font-medium 
              bg-white dark:bg-gray-800 
              border border-gray-300 dark:border-gray-600 
              rounded px-1.5 py-0.5 
              focus:outline-none focus:ring-1 focus:ring-gray-400
              w-32
            "
            autoFocus
          />
        ) : (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-37.5">
            {zone.name}
          </span>
        )}

        {isCrystallized && (
          <span className="
            inline-flex items-center gap-1
            text-[10px] 
            bg-gray-200 dark:bg-gray-700 
            text-gray-600 dark:text-gray-300
            px-1.5 py-0.5 
            rounded
          ">
            <Sparkles className="w-3 h-3" />
            Projet
          </span>
        )}
      </div>

      {/* Ghost Mode indicator - nombre d'éléments masqués */}
      {isGhostMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-blue-500/80 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
            {ghostElementCount} élément{ghostElementCount > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Zone content area - pour le drag */}
      <div
        className="absolute inset-0 cursor-move"
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
      />

      {/* Actions - en bas à droite */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        {isCrystallized && zone.linkedProjectId ? (
          <a
            href={`/journey/projects/${zone.linkedProjectId}`}
            className="
              text-[10px] 
              text-gray-500 hover:text-gray-700 
              dark:text-gray-400 dark:hover:text-gray-200
              flex items-center gap-1
              px-1.5 py-0.5
              rounded
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors
            "
            onClick={(e) => e.stopPropagation()}
          >
            Voir projet
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : !isCrystallized && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCrystallize();
            }}
            className="
              text-[10px] 
              text-gray-500 hover:text-gray-700 
              dark:text-gray-400 dark:hover:text-gray-200
              flex items-center gap-1
              px-1.5 py-0.5
              rounded
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors
            "
          >
            <Sparkles className="w-3 h-3" />
            Cristalliser
          </button>
        )}
      </div>

      {/* Resize handles - plus discrets (masqués pour zones commandées) */}
      {!isOrdered && (
        <>
          {/* Corners */}
          <div
            className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-gray-400 border border-white rounded-sm cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => onResizeStart(e, 'nw')}
          />
          <div
            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gray-400 border border-white rounded-sm cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => onResizeStart(e, 'ne')}
          />
          <div
            className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-gray-400 border border-white rounded-sm cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => onResizeStart(e, 'sw')}
          />
          <div
            className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-gray-400 border border-white rounded-sm cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => onResizeStart(e, 'se')}
          />

          {/* Edges */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-gray-400 border border-white rounded-sm cursor-n-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => onResizeStart(e, 'n')}
          />
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-gray-400 border border-white rounded-sm cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => onResizeStart(e, 's')}
          />
          <div
            className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-6 bg-gray-400 border border-white rounded-sm cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => onResizeStart(e, 'w')}
          />
          <div
            className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-6 bg-gray-400 border border-white rounded-sm cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => onResizeStart(e, 'e')}
          />
        </>
      )}
        </div>
  );
});
