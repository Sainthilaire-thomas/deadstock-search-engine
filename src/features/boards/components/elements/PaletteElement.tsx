// src/features/boards/components/elements/PaletteElement.tsx
// VERSION COMPACTE - Optimisée pour l'espace

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
  const colorCount = hasColors ? colors.length : 0;

  return (
    <div className="w-full h-full flex flex-col gap-1 p-1">
      {/* Header compact */}
      <div className="flex items-center gap-1.5 px-1 h-5 shrink-0">
        <Palette className="w-3 h-3 text-gray-400 shrink-0" strokeWidth={1.5} />
        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 truncate flex-1">
          {name || 'Palette sans nom'}
        </span>
        {hasColors && (
          <span className="text-[10px] text-gray-400 tabular-nums">
            {colorCount}
          </span>
        )}
      </div>

      {/* Swatches - hauteur fixe compacte */}
      <div className="flex-1 min-h-6 max-h-10">
        {hasColors ? (
          <div className="flex h-full rounded overflow-hidden border border-gray-200 dark:border-gray-600">
            {colors.map((color, index) => (
              <div
                key={`${color}-${index}`}
                className="flex-1 transition-all hover:flex-[1.3] relative group cursor-pointer"
                style={{ backgroundColor: color }}
                title={color}
              >
                {/* Code hex au survol - seulement si assez large */}
                {width > 150 && (
                  <div className="
                    absolute inset-0 flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity
                  ">
                    <span 
                      className="text-[8px] font-mono font-bold px-0.5 rounded"
                      style={{
                        color: isLightColor(color) ? '#000' : '#fff',
                        textShadow: isLightColor(color) 
                          ? '0 0 2px rgba(255,255,255,0.8)' 
                          : '0 0 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      {color.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 rounded">
            <span className="text-[10px] text-gray-400">
              Double-clic pour éditer
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper pour déterminer si une couleur est claire
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}
