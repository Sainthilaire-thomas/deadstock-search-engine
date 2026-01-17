// src/features/boards/components/elements/PdfElement.tsx
// Sprint 6 - Élément PDF

'use client';
import React from 'react';
import { FileText } from 'lucide-react';
import type { PdfElementData } from '../../domain/types';

interface PdfElementProps {
  data: PdfElementData;
  width: number;
  height: number;
}

/**
 * Formate la taille du fichier en KB/MB
 */
function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Extrait le nom court du fichier (sans extension si trop long)
 */
function getShortFilename(filename: string, maxLength: number = 20): string {
  if (filename.length <= maxLength) return filename;
  
  const ext = filename.split('.').pop() || '';
  const nameWithoutExt = filename.slice(0, filename.length - ext.length - 1);
  
  if (nameWithoutExt.length <= maxLength - 3 - ext.length) {
    return filename;
  }
  
  return `${nameWithoutExt.slice(0, maxLength - 3 - ext.length - 1)}...${ext ? '.' + ext : ''}`;
}

export const PdfElement = React.memo(function PdfElement({ data, width, height }: PdfElementProps) {
  const isCompact = height < 100;
  const showThumbnail = data.thumbnailUrl && height >= 80;

  return (
    <div 
      className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-800 rounded overflow-hidden"
      title={data.filename}
    >
      {/* Thumbnail ou icône */}
      <div className={`
        flex-1 min-h-0 flex items-center justify-center
        ${showThumbnail ? 'p-1' : 'p-2'}
        bg-linear-to-b from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20
      `}>
        {showThumbnail ? (
          <img
            src={data.thumbnailUrl}
            alt={`Page 1 - ${data.filename}`}
            className="max-w-full max-h-full object-contain rounded shadow-sm"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <FileText 
              className="w-8 h-8 text-red-500 dark:text-red-400" 
              strokeWidth={1.5} 
            />
            {!isCompact && (
              <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                PDF
              </span>
            )}
          </div>
        )}
      </div>

      {/* Informations */}
      {!isCompact && (
        <div className="px-2 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {getShortFilename(data.filename)}
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {data.pageCount ? `${data.pageCount} page${data.pageCount > 1 ? 's' : ''}` : 'PDF'}
            </span>
            {data.fileSize && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {formatFileSize(data.fileSize)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Badge PDF compact */}
      {isCompact && (
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded">
          PDF
        </div>
      )}
    </div>
  );
});
