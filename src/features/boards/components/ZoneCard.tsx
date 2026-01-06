// src/features/boards/components/ZoneCard.tsx

'use client';

import { useState, useRef } from 'react';
import { Move, Sparkles, ExternalLink } from 'lucide-react';
import { isZoneCrystallized } from '../domain/types';
import type { BoardZone } from '../domain/types';

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ZoneCardProps {
  zone: BoardZone;
  isSelected: boolean;
  isEditing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onResizeStart: (e: React.MouseEvent, handle: ResizeHandle) => void;
  onSaveName: (name: string) => void;
  onCancelEdit: () => void;
  onCrystallize: () => void;
}

export function ZoneCard({
  zone,
  isSelected,
  isEditing,
  onMouseDown,
  onDoubleClick,
  onResizeStart,
  onSaveName,
  onCancelEdit,
  onCrystallize,
}: ZoneCardProps) {
  const [editName, setEditName] = useState(zone.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCrystallized = isZoneCrystallized(zone);

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

  return (
    <div
      className={`absolute rounded-lg transition-shadow ${
        isCrystallized
          ? 'border-2 border-solid opacity-75'
          : 'border-2 border-dashed'
      } ${isSelected ? 'shadow-lg ring-2 ring-primary' : 'hover:shadow-md'}`}
      style={{
        left: zone.positionX,
        top: zone.positionY,
        width: zone.width,
        height: zone.height,
        borderColor: zone.color,
        backgroundColor: isCrystallized ? `${zone.color}08` : `${zone.color}15`,
        zIndex: isSelected ? 5 : 1,
      }}
    >
      {/* Zone header */}
      <div
        className="absolute top-0 left-0 right-0 px-3 py-1 flex items-center gap-2 rounded-t-md"
        style={{
          backgroundColor: zone.color,
          cursor: isEditing ? 'text' : 'move',
        }}
        onMouseDown={isEditing ? undefined : onMouseDown}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!isCrystallized) onDoubleClick();
        }}
      >
        <Move className="w-3 h-3 text-white/70 shrink-0" />

        {isEditing && !isCrystallized ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="flex-1 bg-white/20 text-white text-xs font-medium px-1 py-0.5 rounded outline-none focus:bg-white/30 placeholder:text-white/50"
            placeholder="Nom de la zone"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-xs font-medium text-white truncate flex-1">
            {zone.name}
          </span>
        )}

        {/* Badge cristallisé */}
        {isCrystallized && (
          <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded">
            Projet
          </span>
        )}
      </div>

      {/* Bouton Cristalliser ou Voir projet */}
      <div className="absolute bottom-2 right-2">
        {isCrystallized ? (
          
          <a  href={`/journey/${zone.linkedProjectId}/idea`}
            className="flex items-center gap-1 text-xs bg-background/90 hover:bg-background text-foreground px-2 py-1 rounded border border-border transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            Voir projet
          </a>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCrystallize();
            }}
            className="flex items-center gap-1 text-xs bg-primary/90 hover:bg-primary text-primary-foreground px-2 py-1 rounded transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Cristalliser
          </button>
        )}
      </div>

      {/* Resize handles - uniquement si sélectionné, pas en édition et pas cristallisé */}
      {isSelected && !isEditing && !isCrystallized && (
        <>
          <ResizeHandle position="nw" onMouseDown={(e) => onResizeStart(e, 'nw')} />
          <ResizeHandle position="ne" onMouseDown={(e) => onResizeStart(e, 'ne')} />
          <ResizeHandle position="sw" onMouseDown={(e) => onResizeStart(e, 'sw')} />
          <ResizeHandle position="se" onMouseDown={(e) => onResizeStart(e, 'se')} />
          <ResizeHandle position="n" onMouseDown={(e) => onResizeStart(e, 'n')} />
          <ResizeHandle position="s" onMouseDown={(e) => onResizeStart(e, 's')} />
          <ResizeHandle position="e" onMouseDown={(e) => onResizeStart(e, 'e')} />
          <ResizeHandle position="w" onMouseDown={(e) => onResizeStart(e, 'w')} />
        </>
      )}
    </div>
  );
}

// ============================================
// RESIZE HANDLE
// ============================================

interface ResizeHandleProps {
  position: ResizeHandle;
  onMouseDown: (e: React.MouseEvent) => void;
}

function ResizeHandle({ position, onMouseDown }: ResizeHandleProps) {
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
