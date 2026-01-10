// src/features/boards/components/elements/PaletteElement.tsx

'use client';

import { Palette } from 'lucide-react';
import type { PaletteElementData } from '../../domain/types';

interface PaletteElementProps {
  data: PaletteElementData;
  width: number;
  height: number;
}

export function PaletteElement({ data, width, height }: PaletteElementProps) {
  const { name, colors } = data;
  const hasColors = colors && colors.length > 0;

  // Calculer la taille des swatches en fonction de la largeur
  const swatchCount = hasColors ? colors.length : 5;
  const swatchWidth = Math.floor((width - 16) / swatchCount); // 16 = padding
  const swatchHeight = Math.min(swatchWidth, height - 40); // 40 = espace pour le nom

  return (
    <div 
      className="w-full h-full flex flex-col p-2"
      style={{ width, height }}
    >
      {/* Nom de la palette */}
      <div className="flex items-center gap-1.5 mb-2 min-h-5">
        <Palette className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={1.5} />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">
          {name || 'Palette sans nom'}
        </span>
      </div>

      {/* Swatches */}
      <div className="flex-1 flex items-center justify-center">
        {hasColors ? (
          <div className="flex gap-1">
            {colors.map((color, index) => (
              <div
                key={`${color}-${index}`}
                className="rounded-sm border border-gray-200 dark:border-gray-600 shadow-sm"
                style={{
                  backgroundColor: color,
                  width: Math.max(24, Math.min(swatchWidth, 48)),
                  height: Math.max(24, Math.min(swatchHeight, 48)),
                }}
                title={color}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-1">
            {/* Placeholder swatches */}
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-sm border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
              />
            ))}
          </div>
        )}
      </div>

      {/* Indicateur source si extraite */}
      {data.source === 'extracted' && (
        <div className="text-[10px] text-gray-400 text-center mt-1">
          Extraite d'une image
        </div>
      )}
    </div>
  );
}
