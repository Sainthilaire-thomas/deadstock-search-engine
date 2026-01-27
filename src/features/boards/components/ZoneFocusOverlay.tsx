// src/features/boards/components/ZoneFocusOverlay.tsx
'use client';

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { X, GripHorizontal, Maximize2, Package, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useBoard } from '../context/BoardContext';
import { useZoneFocus } from '../context/ZoneFocusContext';
import { getElementsByZoneId } from '../utils/zoneUtils';
import { ElementCard } from './ElementCard';
import type { BoardElement } from '../domain/types';

// Taille de l'overlay
const OVERLAY_WIDTH = 600;
const OVERLAY_HEIGHT = 500;

export function ZoneFocusOverlay() {
  const { focusedZone, closeFocusMode } = useZoneFocus();
  const { elements, assignElementToZone } = useBoard();

  const overlayRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  // Centrer l'overlay au premier affichage
  useEffect(() => {
    if (focusedZone) {
      const x = (window.innerWidth - OVERLAY_WIDTH) / 2;
      const y = (window.innerHeight - OVERLAY_HEIGHT) / 2;
      setPosition({ x, y });
    }
  }, [focusedZone]);

  // Éléments de cette zone
  const zoneElements = useMemo(() => {
    if (!focusedZone) return [];
    return getElementsByZoneId(elements, focusedZone.id);
  }, [elements, focusedZone]);

  // ============================================
  // DRAG DE L'OVERLAY (pour le déplacer)
  // ============================================
  const handleOverlayDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingOverlay(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  useEffect(() => {
    if (!isDraggingOverlay) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDraggingOverlay(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingOverlay, dragStart]);

  // ============================================
  // DROP D'ÉLÉMENTS DANS LA ZONE
  // ============================================
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const elementId = e.dataTransfer.getData('elementId');
    if (!elementId || !focusedZone) return;

    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    if (element.zoneId === focusedZone.id) {
      toast.info('Cet élément est déjà dans cette zone');
      return;
    }

    await assignElementToZone(elementId, focusedZone.id);
    toast.success(`Élément ajouté à "${focusedZone.name}"`);
  }, [focusedZone, elements, assignElementToZone]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // ============================================
  // FERMETURE (Escape)
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFocusMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeFocusMode]);

  // ============================================
  // RETIRER UN ÉLÉMENT DE LA ZONE
  // ============================================
  const handleRemoveFromZone = useCallback(async (elementId: string) => {
    await assignElementToZone(elementId, null);
    toast.success('Élément retiré de la zone');
  }, [assignElementToZone]);

  if (!focusedZone) return null;

  return (
    <>
      {/* Backdrop semi-transparent - pointer-events-none pour permettre le drag depuis le board */}
      <div
        className="fixed inset-0 bg-black/20 z-100 pointer-events-none"
      />

      {/* Overlay déplaçable */}
      <div
        ref={overlayRef}
        className={`
          fixed z-101
          bg-white dark:bg-gray-900
          rounded-xl shadow-2xl
          flex flex-col
          overflow-hidden
          border border-gray-200 dark:border-gray-700
          ${isDragOver ? 'ring-4 ring-blue-500/50' : ''}
        `}
        style={{
          left: position.x,
          top: position.y,
          width: OVERLAY_WIDTH,
          height: OVERLAY_HEIGHT,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Header - déplaçable */}
        <div
          className="
            flex items-center gap-3 px-4 py-3
            border-b border-gray-200 dark:border-gray-700
            bg-gray-50 dark:bg-gray-800
            cursor-move
            select-none
          "
          onMouseDown={handleOverlayDragStart}
        >
          <GripHorizontal className="w-5 h-5 text-gray-400" />
          
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 truncate">
            {focusedZone.name}
          </h2>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {zoneElements.length} élément{zoneElements.length !== 1 ? 's' : ''}
          </span>

          {/* Bouton ouvrir en plein écran (futur Sprint 6) */}
          <button
            onClick={() => toast.info('Navigation vers sous-board à venir (Sprint 6)')}
            className="
              p-2 rounded-lg
              hover:bg-gray-200 dark:hover:bg-gray-700
              text-gray-500 hover:text-gray-700
              dark:text-gray-400 dark:hover:text-gray-200
              transition-colors
            "
            title="Ouvrir comme board (bientôt)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={closeFocusMode}
            className="
              p-2 rounded-lg
              hover:bg-gray-200 dark:hover:bg-gray-700
              text-gray-500 hover:text-gray-700
              dark:text-gray-400 dark:hover:text-gray-200
              transition-colors
            "
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu - grille d'éléments */}
        <div className="flex-1 overflow-auto p-4">
          {zoneElements.length === 0 ? (
            <div className={`
              h-full flex flex-col items-center justify-center
              text-gray-400 dark:text-gray-500
              border-2 border-dashed rounded-lg
              ${isDragOver 
                ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700'
              }
            `}>
              <Package className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm font-medium mb-1">Zone vide</p>
              <p className="text-xs text-center px-4">
                Glissez des éléments depuis le board pour les ajouter à cette zone
              </p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {zoneElements.map((element) => (
                <FocusElementCard
                  key={element.id}
                  element={element}
                  onRemoveFromZone={() => handleRemoveFromZone(element.id)}
                />
              ))}
            </div>
          )}

          {/* Indicateur de drop quand on drag au-dessus */}
          {isDragOver && zoneElements.length > 0 && (
            <div className="
              mt-4 p-4
              border-2 border-dashed border-blue-400
              rounded-lg
              bg-blue-50/50 dark:bg-blue-900/20
              text-center text-blue-600 dark:text-blue-400
              text-sm
            ">
              Déposez ici pour ajouter à la zone
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================
// Sous-composant : Carte élément dans le Focus Mode
// ============================================
interface FocusElementCardProps {
  element: BoardElement;
  onRemoveFromZone: () => void;
}

function FocusElementCard({ element, onRemoveFromZone }: FocusElementCardProps) {
  // Utiliser une version simplifiée de l'affichage
  const getElementPreview = () => {
    switch (element.elementType) {
      case 'textile': {
        const data = element.elementData as any;
        return (
          <div className="flex flex-col h-full">
            {data.snapshot?.imageUrl ? (
              <img
                src={data.snapshot.imageUrl}
                alt={data.snapshot?.name || 'Tissu'}
                className="w-full h-24 object-cover rounded-t"
              />
            ) : (
              <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-t flex items-center justify-center">
                <span className="text-gray-400">Pas d'image</span>
              </div>
            )}
            <div className="p-2 text-xs truncate">
              {data.snapshot?.name || 'Tissu'}
            </div>
          </div>
        );
      }

      case 'palette': {
        const data = element.elementData as any;
        const colors = data.colors?.slice(0, 6) || [];
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 grid grid-cols-3 gap-0.5 p-2">
              {colors.map((color: string, i: number) => (
                <div
                  key={i}
                  className="rounded aspect-square"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="p-2 text-xs truncate border-t border-gray-100 dark:border-gray-700">
              {data.name || 'Palette'}
            </div>
          </div>
        );
      }

      case 'inspiration': {
        const data = element.elementData as any;
        return (
          <div className="flex flex-col h-full">
            {data.imageUrl || data.thumbnailUrl ? (
              <img
                src={data.thumbnailUrl || data.imageUrl}
                alt={data.caption || 'Inspiration'}
                className="w-full h-24 object-cover rounded-t"
              />
            ) : (
              <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-t" />
            )}
            <div className="p-2 text-xs truncate">
              {data.caption || 'Inspiration'}
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <span className="text-2xl mb-2">
              {element.elementType === 'note' && '📝'}
              {element.elementType === 'calculation' && '📐'}
              {element.elementType === 'video' && '🎬'}
              {element.elementType === 'link' && '🔗'}
              {element.elementType === 'pdf' && '📄'}
              {element.elementType === 'pattern' && '✂️'}
              {element.elementType === 'silhouette' && '👤'}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {element.elementType}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="
      group relative
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-lg
      overflow-hidden
      hover:shadow-md
      transition-shadow
    ">
      {getElementPreview()}

      {/* Bouton retirer de la zone */}
      <button
        onClick={onRemoveFromZone}
        className="
          absolute top-1 right-1
          p-1.5 rounded-full
          bg-amber-500 hover:bg-amber-600
          text-white
          opacity-0 group-hover:opacity-100
          transition-opacity
          shadow
        "
        title="Retirer de la zone"
      >
        <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  );
}
