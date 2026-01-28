// src/features/boards/components/ZoneFocusOverlay.tsx
// Focus Mode pour apercevoir et éditer le contenu d'un child board
// UB-5: Adapté pour architecture unifiée (Board au lieu de Zone)
'use client';

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, GripHorizontal, Maximize2, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBoard } from '../context/BoardContext';
import { useZoneFocus } from '../context/ZoneFocusContext';
import { moveElementToBoardAction } from '../actions/elementActions';
import type { BoardElement } from '../domain/types';

// Taille de l'overlay
const OVERLAY_WIDTH = 600;
const OVERLAY_HEIGHT = 500;

export function ZoneFocusOverlay() {
  const router = useRouter();
  const { focusedChildBoard, closeFocusMode } = useZoneFocus();
  const { elements, removeElementLocal } = useBoard();

  const overlayRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  // Éléments transférés vers le child board PENDANT cette session (state local pour affichage immédiat)
  const [newlyTransferredElements, setNewlyTransferredElements] = useState<BoardElement[]>([]);

  // Reset des éléments transférés quand on change de child board
  useEffect(() => {
    setNewlyTransferredElements([]);
  }, [focusedChildBoard?.id]);

  // ============================================
  // COMBINER previewElements + éléments transférés
  // ============================================
  const allDisplayedElements = useMemo(() => {
    if (!focusedChildBoard) return [];
    
    // Éléments déjà dans le child board (chargés depuis la DB)
    const existingElements = focusedChildBoard.previewElements || [];
    
    // Combiner avec les éléments nouvellement transférés (éviter les doublons)
    const existingIds = new Set(existingElements.map(e => e.id));
    const newElements = newlyTransferredElements.filter(e => !existingIds.has(e.id));
    
    return [...existingElements, ...newElements];
  }, [focusedChildBoard, newlyTransferredElements]);

  // Nombre total d'éléments (incluant ceux au-delà des 6 preview)
  const totalElementCount = useMemo(() => {
    if (!focusedChildBoard) return 0;
    const existingCount = focusedChildBoard.elementCount ?? 0;
    return existingCount + newlyTransferredElements.length;
  }, [focusedChildBoard, newlyTransferredElements]);

  // ============================================
  // OUVRIR LE CHILD BOARD (Navigation directe)
  // ============================================
  const handleOpenChildBoard = useCallback(() => {
    if (!focusedChildBoard) return;
    closeFocusMode();
    router.push(`/boards/${focusedChildBoard.id}`);
  }, [focusedChildBoard, closeFocusMode, router]);

  // Centrer l'overlay au premier affichage
  useEffect(() => {
    if (focusedChildBoard) {
      const x = (window.innerWidth - OVERLAY_WIDTH) / 2;
      const y = (window.innerHeight - OVERLAY_HEIGHT) / 2;
      setPosition({ x, y });
    }
  }, [focusedChildBoard]);

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
  // DROP D'ÉLÉMENTS DANS LE CHILD BOARD
  // ============================================
  const handleDrop = useCallback(async (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragOver(false);

  const elementId = e.dataTransfer.getData('elementId');
  console.log('🎯 DROP - elementId:', elementId);
  console.log('🎯 DROP - focusedChildBoard:', focusedChildBoard?.id, focusedChildBoard?.name);
  
  if (!elementId || !focusedChildBoard) {
    console.log('🎯 DROP - ABORTED: missing data');
    return;
  }

  const element = elements.find(el => el.id === elementId);
  console.log('🎯 DROP - element found:', element?.id, element?.elementType);
  
  if (!element) {
    console.log('🎯 DROP - ABORTED: element not found in parent');
    return;
  }

  console.log('🎯 DROP - calling moveElementToBoardAction...');
  const result = await moveElementToBoardAction(elementId, focusedChildBoard.id);
  console.log('🎯 DROP - result:', JSON.stringify(result));

  if (result.success) {
    setNewlyTransferredElements(prev => [...prev, element]);
    removeElementLocal(elementId);  // UB-9: retire du state local sans supprimer de la DB
    toast.success(`Élément ajouté à "${focusedChildBoard.name ?? 'Sans nom'}"`);
  } else {
    console.error('🎯 DROP - FAILED:', result.error);
    toast.error(result.error || 'Erreur lors du transfert');
  }
}, [focusedChildBoard, elements, removeElementLocal]);

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

  if (!focusedChildBoard) return null;

  // Déterminer si le child board est cristallisé
  const isCrystallized = focusedChildBoard.crystallizedAt !== null;

  return (
    <>
      {/* Backdrop semi-transparent - pointer-events-none pour permettre le drag depuis le board */}
      <div className="fixed inset-0 bg-black/20 z-100 pointer-events-none" />

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
          style={{
            borderLeftColor: focusedChildBoard.color,
            borderLeftWidth: '4px',
          }}
          onMouseDown={handleOverlayDragStart}
        >
          <GripHorizontal className="w-5 h-5 text-gray-400" />

          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 truncate">
            {focusedChildBoard.name ?? 'Sans nom'}
          </h2>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalElementCount} élément{totalElementCount !== 1 ? 's' : ''}
          </span>

          {isCrystallized && (
            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded">
              Cristallisé
            </span>
          )}

          {/* Bouton ouvrir le child board */}
          <button
            onClick={handleOpenChildBoard}
            className="
              p-2 rounded-lg
              hover:bg-blue-100 dark:hover:bg-blue-900/30
              text-blue-600 hover:text-blue-700
              dark:text-blue-400 dark:hover:text-blue-300
              transition-colors
            "
            title="Ouvrir ce board"
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
          {allDisplayedElements.length === 0 ? (
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
              <p className="text-sm font-medium mb-1">Pièce vide</p>
              <p className="text-xs text-center px-4">
                Glissez des éléments depuis le canvas pour les ajouter à cette pièce
              </p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {allDisplayedElements.map((element) => (
                <FocusElementCard
                  key={element.id}
                  element={element}
                />
              ))}
              
              {/* Indicateur s'il y a plus d'éléments que les preview */}
              {totalElementCount > allDisplayedElements.length && (
                <div 
                  className="
                    flex flex-col items-center justify-center
                    bg-gray-100 dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-lg p-4
                    cursor-pointer
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    transition-colors
                  "
                  onClick={handleOpenChildBoard}
                >
                  <span className="text-2xl font-bold text-gray-500">
                    +{totalElementCount - allDisplayedElements.length}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">Voir tout</span>
                </div>
              )}
            </div>
          )}

          {/* Indicateur de drop quand on drag au-dessus */}
          {isDragOver && allDisplayedElements.length > 0 && (
            <div className="
              mt-4 p-4
              border-2 border-dashed border-blue-400
              rounded-lg
              bg-blue-50/50 dark:bg-blue-900/20
              text-center text-blue-600 dark:text-blue-400
              text-sm
            ">
              Déposez ici pour ajouter à la pièce
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
}

function FocusElementCard({ element }: FocusElementCardProps) {
  const getElementPreview = () => {
    switch (element.elementType) {
      case 'textile': {
        const data = element.elementData as unknown as Record<string, unknown>;
        const snapshot = data.snapshot as Record<string, unknown> | undefined;
        return (
          <div className="flex flex-col h-full">
            {snapshot?.imageUrl ? (
              <img
                src={snapshot.imageUrl as string}
                alt={(snapshot?.name as string) || 'Tissu'}
                className="w-full h-24 object-cover rounded-t"
              />
            ) : (
              <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-t flex items-center justify-center">
                <span className="text-gray-400">Pas d'image</span>
              </div>
            )}
            <div className="p-2 text-xs truncate">
              {(snapshot?.name as string) || 'Tissu'}
            </div>
          </div>
        );
      }

      case 'palette': {
        const data = element.elementData as unknown as Record<string, unknown>;
        const colors = ((data.colors as string[]) || []).slice(0, 6);
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
              {(data.name as string) || 'Palette'}
            </div>
          </div>
        );
      }

      case 'inspiration': {
        const data = element.elementData as unknown as Record<string, unknown>;
        return (
          <div className="flex flex-col h-full">
            {data.imageUrl || data.thumbnailUrl ? (
              <img
                src={(data.thumbnailUrl || data.imageUrl) as string}
                alt={(data.caption as string) || 'Inspiration'}
                className="w-full h-24 object-cover rounded-t"
              />
            ) : (
              <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-t" />
            )}
            <div className="p-2 text-xs truncate">
              {(data.caption as string) || 'Inspiration'}
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
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-lg
      overflow-hidden
      hover:shadow-md
      transition-shadow
    ">
      {getElementPreview()}
    </div>
  );
}
