// src/features/boards/components/elements/ImageElement.tsx
// Affichage d'une image d'inspiration sur le board
// Utilise InspirationElementData du domain

'use client';

import { useState } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';
import type { InspirationElementData } from '../../domain/types';

interface ImageElementProps {
  data: InspirationElementData;
  width: number;
  height: number;
}

export function ImageElement({ data, width, height }: ImageElementProps) {
  const [imageError, setImageError] = useState(false);
  

  const { imageUrl, caption, sourceUrl } = data;

  // Placeholder si pas d'URL ou erreur
  if (!imageUrl || imageError) {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md"
        style={{ minHeight: height - 40 }}
      >
        <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-xs text-gray-500">Image non disponible</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Container image */}
      <div 
        className="relative flex-1 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800"
        style={{ minHeight: height - (caption ? 48 : 24) }}
      >
      
        
       {/* Image */}
        <img
          src={imageUrl}
          alt={caption || 'Image d\'inspiration'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          draggable={false}
          referrerPolicy="no-referrer"
        />

        {/* Source indicator */}
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 
                     rounded-md transition-colors"
            onClick={(e) => e.stopPropagation()}
            title="Voir la source"
          >
            <ExternalLink className="w-3 h-3 text-white" />
          </a>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <div className="mt-1 px-1">
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}
