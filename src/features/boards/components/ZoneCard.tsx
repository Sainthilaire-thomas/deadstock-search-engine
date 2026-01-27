// src/features/boards/components/ZoneCard.tsx
// VERSION Sprint 2 - Card compacte avec miniatures

'use client';

import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { GripVertical, Sparkles, ExternalLink, X, FolderOpen } from 'lucide-react';
import { isZoneCrystallized, isZoneOrdered } from '../domain/types';
import { getElementsByZoneId } from '../utils/zoneUtils';
import { ZoneElementThumbnail } from './ZoneElementThumbnail';
import type { BoardZone, BoardElement } from '../domain/types';

// Taille fixe de la card
const CARD_WIDTH = 280;
const CARD_HEIGHT = 140;
const MAX_THUMBNAILS = 6;

export interface ZoneCardHandle {
  setTransform: (x: number, y: number) => void;
  resetTransform: () => void;
}

interface ZoneCardProps {
  zone: BoardZone;
  elements: BoardElement[]; // Tous les éléments du board
  position: { x: number; y: number };
  isSelected: boolean;
  isVisible?: boolean;
  isDragging?: boolean;
  ghostElementCount?: number;
  style?: React.CSSProperties;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onCrystallize: () => void;
  onDelete?: () => void;
}

export const ZoneCard = React.memo(forwardRef<ZoneCardHandle, ZoneCardProps>(function ZoneCard({
  zone,
  elements,
  position,
  isSelected,
  isVisible = true,
  isDragging = false,
  ghostElementCount = 0,
  style,
  onMouseDown,
  onDoubleClick,
  onCrystallize,
  onDelete,
}, ref) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Expose methods for direct DOM manipulation during drag
  useImperativeHandle(ref, () => ({
    setTransform: (x: number, y: number) => {
      if (cardRef.current) {
        cardRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    },
    resetTransform: () => {
      if (cardRef.current) {
        cardRef.current.style.transform = '';
      }
    },
  }), []);

  const isCrystallized = isZoneCrystallized(zone);
  const isOrdered = isZoneOrdered(zone);

  // Récupérer les éléments de cette zone via zoneId
  const zoneElements = getElementsByZoneId(elements, zone.id);
  const elementCount = zoneElements.length;
  const displayedElements = zoneElements.slice(0, MAX_THUMBNAILS);
  const remainingCount = elementCount - MAX_THUMBNAILS;

  // Mode Inspiration : zones invisibles (sauf si cristallisées)
  const shouldShow = isVisible || isCrystallized;

  // Ghost Mode: style spécial pendant le drag avec éléments masqués
  const isGhostMode = isDragging && ghostElementCount > 0;

  return (
    <div
      ref={cardRef}
      className={`
        group absolute
        transition-opacity duration-300 ease-in-out
        ${shouldShow ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        ${isGhostMode
          ? 'border-2 border-dashed border-blue-400 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-900/40'
          : isCrystallized
            ? 'border border-solid border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            : 'border border-solid border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }
        ${isSelected
          ? 'ring-2 ring-blue-500 shadow-lg'
          : 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500'
        }
        rounded-lg shadow-sm
        cursor-move
      `}
      style={{
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        zIndex: isSelected ? 10 : 2,
        ...style,
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {/* Bouton × pour supprimer - visible au hover, sauf si cristallisée */}
      {!isCrystallized && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
          }}
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

      {/* Header */}
      <div className="px-3 pt-2 pb-1 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
            {zone.name}
          </span>
        </div>
        
        {isCrystallized && (
          <span className="
            inline-flex items-center gap-1
            text-[10px]
            bg-emerald-100 dark:bg-emerald-900/50
            text-emerald-700 dark:text-emerald-300
            px-1.5 py-0.5
            rounded
            shrink-0
          ">
            <Sparkles className="w-3 h-3" />
            Projet
          </span>
        )}
      </div>

      {/* Content - Grille de miniatures ou Ghost Mode */}
      <div className="px-3 py-2 flex-1">
        {isGhostMode ? (
          <div className="h-full flex items-center justify-center">
            <div className="bg-blue-500/80 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow">
              {ghostElementCount} élément{ghostElementCount > 1 ? 's' : ''}
            </div>
          </div>
        ) : elementCount === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <FolderOpen className="w-6 h-6 mb-1" />
            <span className="text-xs">Zone vide</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {displayedElements.map((element) => (
              <ZoneElementThumbnail key={element.id} element={element} />
            ))}
            {remainingCount > 0 && (
              <div
                className="rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300"
                style={{ width: 40, height: 40 }}
              >
                +{remainingCount}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Actions */}
      <div className="px-3 pb-2 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {elementCount} élément{elementCount !== 1 ? 's' : ''}
        </span>
        
        {isCrystallized && zone.linkedProjectId ? (
          
          <a  href={`/journey/projects/${zone.linkedProjectId}`}
            className="
              text-[11px]
              text-blue-600 hover:text-blue-700
              dark:text-blue-400 dark:hover:text-blue-300
              flex items-center gap-1
              px-2 py-1
              rounded
              hover:bg-blue-50 dark:hover:bg-blue-900/30
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
              text-[11px]
              text-gray-500 hover:text-gray-700
              dark:text-gray-400 dark:hover:text-gray-200
              flex items-center gap-1
              px-2 py-1
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
    </div>
  );
}));
