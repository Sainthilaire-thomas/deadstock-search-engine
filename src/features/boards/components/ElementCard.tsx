// src/features/boards/components/ElementCard.tsx
// VERSION HARMONISÉE - Sprint 5 + Sprint 6
// Sprint 6: Ajout PDF, Pattern, Silhouette

'use client';
import React, { useState } from 'react';

import { GripVertical, X, ExternalLink, Play, Eye } from 'lucide-react';
import { ELEMENT_TYPE_LABELS, isPaletteElement } from '../domain/types';
import { NoteEditor } from './NoteEditor';
import { PaletteElement } from './elements/PaletteElement';
import { ImageElement } from './elements/ImageElement';
import { VideoElement } from './elements/VideoElement';
import { LinkElement } from './elements/LinkElement';

// Sprint 6 imports
import { PdfElement } from './elements/PdfElement';
import { PatternElement } from './elements/PatternElement';
import { SilhouetteElement } from './elements/SilhouetteElement';

import type {
  BoardElement,
  PaletteElementData,
  InspirationElementData,
  VideoElementData,
  LinkElementData,
  PdfElementData,
  PatternElementData,
  SilhouetteElementData,
} from '../domain/types';

interface ElementCardProps {
  element: BoardElement;
  isSelected: boolean;
  isEditing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onSaveNote: (content: string) => void;
  onCancelEdit: () => void;
  onDelete?: () => void;
  onSavePalette?: (data: PaletteElementData) => void;
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

  // Types d'éléments - Sprint 5
  const isPalette = element.elementType === 'palette';
  const isNote = element.elementType === 'note';
  const isInspiration = element.elementType === 'inspiration';
  const isVideo = element.elementType === 'video';
  const isLink = element.elementType === 'link';

  // Types d'éléments - Sprint 6
  const isPdf = element.elementType === 'pdf';
  const isPattern = element.elementType === 'pattern';
  const isSilhouette = element.elementType === 'silhouette';


  // Éléments sans header (gèrent leur propre affichage)
  const noHeader = isPalette || isInspiration || isVideo || isLink || isPdf || isPattern || isSilhouette;

  // Helper pour ouvrir les data URLs (base64) ou URLs normales
  const openDataUrlOrExternal = (url: string, mimeType: string) => {
    if (url.startsWith('data:')) {
      try {
        const base64Data = url.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (error) {
        console.error('Erreur ouverture data URL:', error);
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Handler pour ouvrir le lien ou la vidéo
  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isLink) {
      const linkData = element.elementData as LinkElementData;
      window.open(linkData.url, '_blank', 'noopener,noreferrer');
    } else if (isVideo) {
      const videoData = element.elementData as VideoElementData;
      window.open(videoData.url, '_blank', 'noopener,noreferrer');
    } else if (isPdf) {
      const pdfData = element.elementData as PdfElementData;
      openDataUrlOrExternal(pdfData.url, 'application/pdf');
    } else if (isPattern) {
      const patternData = element.elementData as PatternElementData;
      if (patternData.url) {
        openDataUrlOrExternal(patternData.url, patternData.fileType === 'pdf' ? 'application/pdf' : 'image/png');
      }
    } else if (isSilhouette) {
      const silhouetteData = element.elementData as SilhouetteElementData;
      if (silhouetteData.url) {
        openDataUrlOrExternal(silhouetteData.url, 'image/png');
      }
    }
  };

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
      {/* Boutons au hover - visible uniquement si pas en édition */}
      {!isEditing && (
        <div className="absolute -top-2 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
         {/* Bouton Ouvrir - pour video, link, pdf, pattern, silhouette */}
          {(isVideo || isLink || isPdf || isPattern || isSilhouette) && (
            <button
              onClick={handleOpenExternal}
              className="
                w-5 h-5
                bg-blue-500 hover:bg-blue-600
                text-white
                rounded-full
                flex items-center justify-center
                shadow-sm
              "
             title={isVideo ? "Ouvrir la vidéo" : isLink ? "Ouvrir le lien" : isPdf ? "Ouvrir le PDF" : "Voir l'image"}
            >
              {isVideo ? (
                <Play className="w-2.5 h-2.5 ml-0.5" fill="currentColor" />
              ) : (isPattern || isSilhouette) ? (
                <Eye className="w-2.5 h-2.5" strokeWidth={2.5} />
              ) : (
                <ExternalLink className="w-2.5 h-2.5" strokeWidth={2.5} />
              )}
            </button>
          )}
          
          {/* Bouton Supprimer */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="
                w-5 h-5
                bg-red-500 hover:bg-red-600
                text-white
                rounded-full
                flex items-center justify-center
                shadow-sm
              "
              title="Supprimer"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          )}
        </div>
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
              z-10
            ">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            <div className={`h-full flex flex-col ${noHeader ? 'p-2' : 'p-3 pt-5'}`}>
              {/* Type label - sauf pour les éléments qui gèrent leur propre header */}
              {!noHeader && (
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
                    width={width - 16}
                    height={height - 16}
                  />
                )}

                {element.elementType === 'calculation' && (
                  <CalculationPreview data={element.elementData as any} />
                )}

                {isInspiration && (
                  <ImageElement
                    data={element.elementData as InspirationElementData}
                    width={width - 16}
                    height={height - 16}
                  />
                )}

                {isVideo && (
                  <VideoElement
                    data={element.elementData as VideoElementData}
                    width={width - 16}
                    height={height - 16}
                    isPreview={true}
                  />
                )}

                {isLink && (
                  <LinkElement
                    data={element.elementData as LinkElementData}
                    width={width - 16}
                    height={height - 16}
                  />
                )}

                {/* Sprint 6 Elements */}
                {isPdf && (
                  <PdfElement
                    data={element.elementData as PdfElementData}
                    width={width - 16}
                    height={height - 16}
                  />
                )}

                {isPattern && (
                  <PatternElement
                    data={element.elementData as PatternElementData}
                    width={width - 16}
                    height={height - 16}
                  />
                )}

                {isSilhouette && (
                  <SilhouetteElement
                    data={element.elementData as SilhouetteElementData}
                    width={width - 16}
                    height={height - 16}
                  />
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
  const hasYardageByWidth = data.yardageByWidth && Object.keys(data.yardageByWidth).length > 0;

  if (hasYardageByWidth) {
    const sortedWidths = Object.entries(data.yardageByWidth as Record<number, number>)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .slice(0, 3);

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
