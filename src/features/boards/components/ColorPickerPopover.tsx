// src/features/boards/components/ColorPickerPopover.tsx
// Sprint B3.5 v2 - Popover avec roue chromatique
// L'utilisateur positionne sa couleur sur un nuancier visuel

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { getColorLabelFr, hexToLab, type ColorName } from '@/lib/color';
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
// Color utilities
// ============================================================================

/**
 * Convertit HEX en HSL
 */
function hexToHslValues(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s, l };
}

// Couleurs de référence HEX - SOURCE UNIQUE DE VÉRITÉ
const COLOR_HEX: Record<string, string> = {
  red: '#E53935',
  orange: '#FB8C00',
  gold: '#FFD600',
  yellow: '#FDD835',
  green: '#43A047',
  teal: '#00897B',
  blue: '#1E88E5',
  navy: '#1A237E',
  purple: '#8E24AA',
  lilac: '#CE93D8',
  pink: '#EC407A',
  burgundy: '#880E4F',
  brown: '#6D4C41',
  beige: '#D7CCC8',
  white: '#FAFAFA',
  gray: '#9E9E9E',
  'dark gray': '#616161',
  black: '#212121',
};

// Pré-calcul des valeurs HSL pour chaque couleur
const COLOR_HSL: Record<string, { h: number; s: number; l: number }> = {};
for (const [name, hex] of Object.entries(COLOR_HEX)) {
  COLOR_HSL[name] = hexToHslValues(hex);
}

/**
 * Vérifie si une couleur est achromatique (saturation très faible)
 */
function isAchromaticColor(colorName: string): boolean {
  const hsl = COLOR_HSL[colorName];
  return !hsl || hsl.s < 0.15;
}

// ============================================================================
// Sub-components
// ============================================================================

interface ColorWheelProps {
  availableColors: AvailableColor[];
  selectedColors: Set<string>;
  paletteColors: string[];
  activePaletteHex: string | null;
  onToggleColor: (color: string) => void;
  size?: number;
}

function ColorWheel({
  availableColors,
  selectedColors,
  paletteColors,
  activePaletteHex,
  onToggleColor,
  size = 240,
}: ColorWheelProps) {
  
  // Séparer les couleurs chromatiques et achromatiques
  const chromaticColors = availableColors
    .filter(c => !isAchromaticColor(c.color))
    .map(c => ({
      ...c,
      hsl: COLOR_HSL[c.color] || { h: 0, s: 0, l: 0 },
    }))
    .sort((a, b) => a.hsl.h - b.hsl.h); // Trier par teinte
  
  const achromaticColors = availableColors
    .filter(c => isAchromaticColor(c.color))
    .map(c => ({
      ...c,
      hsl: COLOR_HSL[c.color] || { h: 0, s: 0, l: 0 },
    }))
    .sort((a, b) => b.hsl.l - a.hsl.l); // Trier par luminosité (clair → foncé)

  // Position de la couleur palette sélectionnée
  const paletteHsl = activePaletteHex ? hexToHslValues(activePaletteHex) : null;

  // Largeur totale disponible
  const width = 260;
  const pastilleSize = 28;
  const gap = 4;

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Ligne des couleurs chromatiques - ordonnées par teinte */}
      <div className="relative" style={{ height: 80 }}>
        <p className="text-[10px] text-gray-400 mb-1 px-1">Couleurs (par teinte)</p>
        <div className="flex flex-wrap gap-1 px-1">
          {chromaticColors.map(({ color, count, hsl }) => {
            const isSelected = selectedColors.has(color);
            const hex = COLOR_HEX[color] || '#808080';

            return (
              <button
                key={color}
                onClick={() => onToggleColor(color)}
                className={`
                  relative rounded-full border-2 transition-all duration-150
                  hover:scale-110 hover:z-20
                  ${isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-500/50 scale-110 z-10' 
                    : 'border-white/50 hover:border-white'
                  }
                `}
                style={{
                  width: pastilleSize,
                  height: pastilleSize,
                  backgroundColor: hex,
                }}
                title={`${getColorLabelFr(color as ColorName)} (${count} tissus) - H:${Math.round(hsl.h)}°`}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" strokeWidth={3} />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full px-1 min-w-[14px] text-center shadow border border-gray-200 dark:border-gray-700">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Marqueur de la couleur palette si chromatique */}
        {paletteHsl && paletteHsl.s >= 0.15 && (
          <div className="mt-2 px-1 flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border-2 border-gray-400"
              style={{ backgroundColor: activePaletteHex || '' }}
            />
            <span className="text-[10px] text-gray-500">
              Votre couleur : H={Math.round(paletteHsl.h)}°
            </span>
          </div>
        )}
      </div>

      {/* Ligne des couleurs achromatiques */}
      <div>
        <p className="text-[10px] text-gray-400 mb-1 px-1">Neutres</p>
        <div className="flex gap-1 px-1">
          {achromaticColors.map(({ color, count, hsl }) => {
            const isSelected = selectedColors.has(color);
            const hex = COLOR_HEX[color] || '#808080';

            return (
              <button
                key={color}
                onClick={() => onToggleColor(color)}
                className={`
                  relative rounded-full border-2 transition-all duration-150
                  hover:scale-110 hover:z-20
                  ${isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-500/50 scale-110 z-10' 
                    : 'border-gray-400/50 hover:border-gray-400'
                  }
                `}
                style={{
                  width: pastilleSize,
                  height: pastilleSize,
                  backgroundColor: hex,
                }}
                title={`${getColorLabelFr(color as ColorName)} (${count} tissus)`}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check 
                      className={`w-3.5 h-3.5 drop-shadow ${color === 'white' ? 'text-gray-800' : 'text-white'}`} 
                      strokeWidth={3} 
                    />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full px-1 min-w-[14px] text-center shadow border border-gray-200 dark:border-gray-700">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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

  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [activePaletteHex, setActivePaletteHex] = useState<string | null>(null);
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

  // Toggle une couleur catalogue
  const handleToggleColor = (color: string) => {
    setSelectedColors(prev => {
      const next = new Set(prev);
      if (next.has(color)) {
        next.delete(color);
      } else {
        next.add(color);
      }
      return next;
    });
  };

  // Sélectionner une couleur de la palette pour la positionner sur la roue
  const handlePaletteColorClick = (hex: string) => {
    setActivePaletteHex(prev => prev === hex ? null : hex);
  };

  // Handler de confirmation
  const handleConfirm = () => {
    if (selectedColors.size === 0) return;

    toggleConstraint({
      type: 'color',
      sourceElementId: elementId,
      sourceElementName: paletteName,
      hex: activePaletteHex || colors[0] || '#000000',
      colorNames: Array.from(selectedColors) as ColorName[],
    });

    onClose();
  };

  // Calcul du nombre total de tissus sélectionnés
  const totalSelectedCount = useMemo(() => {
    return availableColors
      .filter(c => selectedColors.has(c.color))
      .reduce((sum, c) => sum + c.count, 0);
  }, [availableColors, selectedColors]);

  // Position du popover
  const popoverStyle = {
    left: Math.min(anchorPosition.x, window.innerWidth - 320),
    top: Math.min(anchorPosition.y, window.innerHeight - 480),
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" />

      {/* Popover */}
      <div
        ref={popoverRef}
        className="fixed z-50 w-[300px] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
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

        {/* Palette colors - clickable to position on wheel */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Cliquez sur une couleur pour la positionner :
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {colors.map((hex, i) => (
              <button
                key={i}
                onClick={() => handlePaletteColorClick(hex)}
                className={`
                  w-7 h-7 rounded border-2 transition-all
                  ${activePaletteHex === hex 
                    ? 'border-blue-500 ring-2 ring-blue-500/30 scale-110' 
                    : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                  }
                `}
                style={{ backgroundColor: hex }}
                title={`Cliquez pour positionner ${hex}`}
              />
            ))}
          </div>
        </div>

        {/* Color wheel */}
        <div className="flex justify-center py-4 px-2">
          {isLoading ? (
            <div className="flex items-center justify-center" style={{ height: 240 }}>
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <ColorWheel
              availableColors={availableColors}
              selectedColors={selectedColors}
              paletteColors={colors}
              activePaletteHex={activePaletteHex}
              onToggleColor={handleToggleColor}
              size={260}
            />
          )}
        </div>

        {/* Selection summary */}
        {selectedColors.size > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedColors).map(color => (
                <span
                  key={color}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 rounded text-xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-blue-300"
                    style={{ backgroundColor: COLOR_HEX[color] }}
                  />
                  {getColorLabelFr(color as ColorName)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={handleConfirm}
            disabled={selectedColors.size === 0 || isLoading}
            className={`
              w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
              ${selectedColors.size > 0 && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading
              ? 'Chargement...'
              : selectedColors.size > 0
                ? `Rechercher (${totalSelectedCount} tissus)`
                : 'Sélectionnez des couleurs'
            }
          </button>
        </div>
      </div>
    </>
  );
}
