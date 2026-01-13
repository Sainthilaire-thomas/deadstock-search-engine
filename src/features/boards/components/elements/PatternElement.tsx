// src/features/boards/components/elements/PatternElement.tsx
// Sprint 6 - Élément Patron de couture

'use client';

import { Scissors, FileText, Image as ImageIcon } from 'lucide-react';
import type { PatternElementData } from '../../domain/types';

interface PatternElementProps {
  data: PatternElementData;
  width: number;
  height: number;
}

export function PatternElement({ data, width, height }: PatternElementProps) {
  const isCompact = height < 100;
  const showThumbnail = data.thumbnailUrl && height >= 80;
  const isPdf = data.fileType === 'pdf';

  return (
    <div 
      className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-800 rounded overflow-hidden relative"
      title={data.name || 'Patron'}
    >
      {/* Thumbnail ou icône */}
      <div className={`
        flex-1 min-h-0 flex items-center justify-center
        ${showThumbnail ? 'p-1' : 'p-2'}
        bg-linear-to-b from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20
      `}>
        {showThumbnail ? (
          <img
            src={data.thumbnailUrl}
            alt={data.name || 'Patron'}
            className="max-w-full max-h-full object-contain rounded shadow-sm"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <Scissors 
                className="w-8 h-8 text-violet-500 dark:text-violet-400" 
                strokeWidth={1.5} 
              />
              {/* Petit indicateur de type de fichier */}
              <div className="absolute -bottom-1 -right-1">
                {isPdf ? (
                  <FileText className="w-3 h-3 text-violet-600 dark:text-violet-300" />
                ) : (
                  <ImageIcon className="w-3 h-3 text-violet-600 dark:text-violet-300" />
                )}
              </div>
            </div>
            {!isCompact && (
              <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">
                PATRON
              </span>
            )}
          </div>
        )}
      </div>

      {/* Informations */}
      {!isCompact && (
        <div className="px-2 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {data.name || 'Patron sans nom'}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {data.brand && (
              <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">
                {data.brand}
              </span>
            )}
            {data.brand && data.garmentType && (
              <span className="text-gray-300 dark:text-gray-600">•</span>
            )}
            {data.garmentType && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {data.garmentType}
              </span>
            )}
            {!data.brand && !data.garmentType && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {isPdf ? `PDF${data.pageCount ? ` • ${data.pageCount}p` : ''}` : 'Image'}
              </span>
            )}
          </div>
          {data.sizes && data.sizes.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {data.sizes.slice(0, 4).map((size) => (
                <span 
                  key={size}
                  className="px-1 py-0.5 text-[9px] bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded"
                >
                  {size}
                </span>
              ))}
              {data.sizes.length > 4 && (
                <span className="text-[9px] text-gray-400">
                  +{data.sizes.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Badge Patron compact */}
      {isCompact && (
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-violet-500 text-white text-[9px] font-bold rounded flex items-center gap-0.5">
          <Scissors className="w-2.5 h-2.5" />
        </div>
      )}
    </div>
  );
}
