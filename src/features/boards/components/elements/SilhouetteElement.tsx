// src/features/boards/components/elements/SilhouetteElement.tsx
// Sprint 6 - Élément Silhouette (croquis de mode)

'use client';
import React from 'react';
import { User, Library, Upload } from 'lucide-react';
import type { SilhouetteElementData } from '../../domain/types';

interface SilhouetteElementProps {
  data: SilhouetteElementData;
  width: number;
  height: number;
}

export const SilhouetteElement = React.memo(function SilhouetteElement({ data, width, height }: SilhouetteElementProps) {
  const isCompact = height < 100;
  const hasImage = !!data.url;
  const isFromLibrary = data.source === 'library';

  return (
    <div 
      className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-800 rounded overflow-hidden relative"
      title={data.name || 'Silhouette'}
    >
      {/* Image ou placeholder */}
      <div className={`
        flex-1 min-h-0 flex items-center justify-center
        ${hasImage ? 'p-1' : 'p-2'}
        bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20
      `}>
        {hasImage ? (
          <img
            src={data.url}
            alt={data.name || 'Silhouette'}
            className="max-w-full max-h-full object-contain"
            draggable={false}
            style={{
              // Style pour les silhouettes : souvent des images avec fond transparent
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <User 
              className="w-10 h-10 text-slate-400 dark:text-slate-500" 
              strokeWidth={1} 
            />
            {!isCompact && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Silhouette
              </span>
            )}
          </div>
        )}
      </div>

      {/* Informations */}
      {!isCompact && (data.name || data.category) && (
        <div className="px-2 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          {data.name && (
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              {data.name}
            </p>
          )}
          <div className="flex items-center gap-1 mt-0.5">
            {data.category && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {data.category}
              </span>
            )}
            {isFromLibrary && (
              <>
                {data.category && <span className="text-gray-300 dark:text-gray-600">•</span>}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                  <Library className="w-2.5 h-2.5" />
                  Bibliothèque
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Badge source */}
      <div className={`
        absolute top-1 right-1 
        w-5 h-5 rounded-full 
        flex items-center justify-center
        ${isFromLibrary 
          ? 'bg-slate-200 dark:bg-slate-700' 
          : 'bg-blue-100 dark:bg-blue-900/50'
        }
      `}>
        {isFromLibrary ? (
          <Library className="w-3 h-3 text-slate-500 dark:text-slate-400" />
        ) : (
          <Upload className="w-3 h-3 text-blue-500 dark:text-blue-400" />
        )}
      </div>
    </div>
  );
});
