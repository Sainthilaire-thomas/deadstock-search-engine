// src/features/boards/components/ColorPickerPopover.tsx
// Sprint B3.5 - Popover simplifié pour sélectionner une couleur
// L'utilisateur choisit directement parmi les couleurs disponibles en DB

'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { getColorLabelFr, type ColorName } from '@/lib/color';
import { useContextualSearchPanel } from '../context/ContextualSearchContext';

// ============================================================================
// Types
// ============================================================================

interface ColorPickerPopoverProps {
  /** Couleurs HEX de la palette (pour affichage) */
  colors: string[];
  /** ID de l'élément palette source */
  elementId: string;
  /** Nom de la palette (pour le label de la contrainte) */
  paletteName: string;
  /** Position d'ancrage du popover */
  anchorPosition: { x: number; y: number };
  /** Callback à la fermeture */
  onClose: () => void;
}

interface AvailableColor {
  color: string;
  count: number;
}

// ============================================================================
// Color swatches for display
// ============================================================================

const COLOR_SWATCHES: Record<string, string> = {
  red: '#E53935',
  blue: '#1E88E5',
  green: '#43A047',
  yellow: '#FDD835',
  orange: '#FB8C00',
  pink: '#EC407A',
  purple: '#8E24AA',
  brown: '#6D4C41',
  beige: '#D7CCC8',
  gray: '#9E9E9E',
  black: '#212121',
  white: '#FAFAFA',
  burgundy: '#880E4F',
  navy: '#1A237E',
  teal: '#00897B',
  gold: '#FFD600',
  lilac: '#CE93D8',
  'dark gray': '#616161',
};

// ============================================================================
// Main Component
// ============================================================================

export function ColorPickerPopover({
  colors,
  elementId,
  paletteName,
  anchorPosition,
  onClose,
}: ColorPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { toggleConstraint } = useContextualSearchPanel();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [availableColors, setAvailableColors] = useState<AvailableColor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les couleurs disponibles depuis l'API
  useEffect(() => {
    async function loadAvailableColors() {
      try {
        const response = await fetch('/api/colors/available');
        if (response.ok) {
          const data = await response.json();
          setAvailableColors(data.colorCounts || []);
        }
      } catch (error) {
        console.error('Failed to load available colors:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAvailableColors();
  }, []);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handler de confirmation
  const handleConfirm = () => {
    if (!selectedColor) return;

    toggleConstraint({
      type: 'color',
      sourceElementId: elementId,
      sourceElementName: paletteName,
      hex: colors[0] || '#000000',
      colorNames: [selectedColor as ColorName],
    });

    onClose();
  };

  // Position du popover
  const popoverStyle = {
    left: Math.min(anchorPosition.x, window.innerWidth - 300),
    top: Math.min(anchorPosition.y, window.innerHeight - 450),
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" />

      {/* Popover */}
      <div
        ref={popoverRef}
        className="fixed z-50 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={popoverStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Rechercher par couleur
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Selected palette colors preview */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Couleurs de votre palette :
          </p>
          <div className="flex gap-1 flex-wrap">
            {colors.map((hex, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 shadow-sm"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>

        {/* Color selection */}
        <div className="px-4 py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sélectionnez une couleur catalogue :
          </p>
        </div>

        <div className="px-2 pb-2 max-h-52 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-0.5">
              {availableColors.map(({ color, count }) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${selectedColor === color
                      ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  {/* Color swatch */}
                  <div
                    className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 shrink-0"
                    style={{ backgroundColor: COLOR_SWATCHES[color] || '#808080' }}
                  />

                  {/* Label */}
                  <span className="flex-1 text-sm text-gray-900 dark:text-gray-100 text-left capitalize">
                    {getColorLabelFr(color as ColorName)}
                  </span>

                  {/* Count */}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {count} tissu{count > 1 ? 's' : ''}
                  </span>

                  {/* Selection indicator */}
                  <div className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                    ${selectedColor === color
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 dark:border-gray-600'
                    }
                  `}>
                    {selectedColor === color && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={handleConfirm}
            disabled={!selectedColor || isLoading}
            className={`
              w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
              ${selectedColor && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading 
              ? 'Chargement...'
              : selectedColor
                ? `Rechercher en ${getColorLabelFr(selectedColor as ColorName)}`
                : 'Sélectionnez une couleur'
            }
          </button>
        </div>
      </div>
    </>
  );
}
