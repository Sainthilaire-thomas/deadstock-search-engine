// src/features/boards/components/ColorMatchDisplay.tsx
// Sprint B1 & B2 - Affichage des correspondances couleur avec distance LAB
// Intégration avec recherche contextuelle

'use client';

import { useMemo, useState, useCallback } from 'react';
import { Check, Search, Info } from 'lucide-react';
import {
  findMatchingColors,
  getConfidenceLevel,
  isValidHex,
  normalizeHex,
  type ColorMatch,
} from '@/lib/color';

// Optional context import - graceful degradation if not available
let useColorSearch: (() => (hex: string, options?: { colorNames?: string[]; minConfidence?: number; elementId?: string; requiredMeters?: number }) => void) | null = null;
try {
  const contextModule = require('../context/ContextualSearchContext');
  useColorSearch = contextModule.useColorSearch;
} catch {
  // Context not available, will use callback prop instead
}

// ============================================================================
// Types
// ============================================================================

interface ColorMatchDisplayProps {
  /** Couleur HEX à matcher (e.g., '#8B0000') */
  hex: string;
  /** Callback quand des couleurs sont sélectionnées pour recherche */
  onColorsSelected?: (colors: string[]) => void;
  /** Nombre max de résultats à afficher */
  maxResults?: number;
  /** Distance max pour le matching */
  maxDistance?: number;
  /** Afficher le bouton de recherche */
  showSearchButton?: boolean;
  /** Mode compact (pour intégration dans petits espaces) */
  compact?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
  /** ID de l'élément source (pour traçabilité) */
  elementId?: string;
  /** Métrage requis (depuis un élément calcul lié) */
  requiredMeters?: number;
  /** Utiliser le panneau de recherche contextuelle (si disponible) */
  useContextualPanel?: boolean;
}

// ============================================================================
// Sub-components
// ============================================================================

interface ConfidenceBarProps {
  confidence: number;
  compact?: boolean;
}

function ConfidenceBar({ confidence, compact = false }: ConfidenceBarProps) {
  const level = getConfidenceLevel(confidence);
  
  const colorClass = {
    excellent: 'bg-green-500',
    good: 'bg-emerald-400',
    acceptable: 'bg-amber-400',
    poor: 'bg-red-400',
  }[level];

  const height = compact ? 'h-1.5' : 'h-2';
  
  return (
    <div className={`flex-1 ${height} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
      <div
        className={`h-full ${colorClass} transition-all duration-300`}
        style={{ width: `${confidence}%` }}
      />
    </div>
  );
}

interface ColorMatchRowProps {
  match: ColorMatch;
  isSelected: boolean;
  onToggle: () => void;
  compact?: boolean;
}

function ColorMatchRow({ match, isSelected, onToggle, compact = false }: ColorMatchRowProps) {
  const level = getConfidenceLevel(match.confidence);
  
  const textColorClass = {
    excellent: 'text-green-600 dark:text-green-400',
    good: 'text-emerald-600 dark:text-emerald-400',
    acceptable: 'text-amber-600 dark:text-amber-400',
    poor: 'text-red-600 dark:text-red-400',
  }[level];

  if (compact) {
    return (
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-2 w-full p-1.5 rounded-md transition-colors
          ${isSelected 
            ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }
        `}
      >
        {/* Checkbox */}
        <div className={`
          w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
          ${isSelected 
            ? 'bg-blue-500 border-blue-500' 
            : 'border-gray-300 dark:border-gray-600'
          }
        `}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
        
        {/* Color swatch */}
        <div
          className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 shrink-0"
          style={{ backgroundColor: match.referenceHex }}
        />
        
        {/* Name + confidence */}
        <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1 text-left">
          {match.labelFr}
        </span>
        
        <span className={`text-xs font-medium ${textColorClass} tabular-nums`}>
          {match.confidence}%
        </span>
      </button>
    );
  }

  return (
    <div
      className={`
        flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }
      `}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div className={`
        w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
        ${isSelected 
          ? 'bg-blue-500 border-blue-500' 
          : 'border-gray-300 dark:border-gray-600'
        }
      `}>
        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      
      {/* Color swatch */}
      <div
        className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm shrink-0"
        style={{ backgroundColor: match.referenceHex }}
      />
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {match.labelFr}
          </span>
          <span className={`text-sm font-semibold ${textColorClass} tabular-nums`}>
            {match.confidence}%
          </span>
        </div>
        <ConfidenceBar confidence={match.confidence} />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ColorMatchDisplay({
  hex,
  onColorsSelected,
  maxResults = 3,
  maxDistance = 50,
  showSearchButton = true,
  compact = false,
  className = '',
  elementId,
  requiredMeters,
  useContextualPanel = true,
}: ColorMatchDisplayProps) {
  // Try to use contextual search if available and enabled
  let openColorSearch: ((hex: string, options?: { colorNames?: string[]; minConfidence?: number; elementId?: string; requiredMeters?: number }) => void) | null = null;
  
  try {
    if (useContextualPanel && useColorSearch) {
      openColorSearch = useColorSearch();
    }
  } catch {
    // Context not available in this render tree
  }
  
  // Normalize and validate hex
  const normalizedHex = useMemo(() => {
    if (!isValidHex(hex)) return null;
    try {
      return normalizeHex(hex);
    } catch {
      return null;
    }
  }, [hex]);

  // Calculate matches
  const matches = useMemo(() => {
    if (!normalizedHex) return [];
    return findMatchingColors(normalizedHex, { maxResults, maxDistance });
  }, [normalizedHex, maxResults, maxDistance]);

  // Selection state - pre-select high confidence matches
  const [selectedColors, setSelectedColors] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    matches.forEach(m => {
      if (m.confidence >= 50) {
        initial.add(m.color);
      }
    });
    return initial;
  });

  // Update selection when matches change
  useMemo(() => {
    setSelectedColors(prev => {
      const newSet = new Set<string>();
      matches.forEach(m => {
        if (prev.has(m.color) || m.confidence >= 50) {
          newSet.add(m.color);
        }
      });
      return newSet;
    });
  }, [matches]);

  const toggleColor = useCallback((colorName: string) => {
    setSelectedColors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(colorName)) {
        newSet.delete(colorName);
      } else {
        newSet.add(colorName);
      }
      return newSet;
    });
  }, []);

  const handleSearch = useCallback(() => {
    if (selectedColors.size === 0) return;
    
    const colors = Array.from(selectedColors);
    
    // Prefer contextual panel if available
    if (openColorSearch && normalizedHex) {
      openColorSearch(normalizedHex, {
        colorNames: colors,
        elementId,
        requiredMeters,
      });
      return;
    }
    
    // Fallback to callback prop
    if (onColorsSelected) {
      onColorsSelected(colors);
    }
  }, [onColorsSelected, selectedColors, openColorSearch, normalizedHex, elementId, requiredMeters]);

  // Invalid hex
  if (!normalizedHex) {
    return (
      <div className={`text-sm text-red-500 ${className}`}>
        Couleur invalide: {hex}
      </div>
    );
  }

  // No matches found
  if (matches.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Aucune correspondance trouvée pour {normalizedHex}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`space-y-1 ${className}`}>
        {/* Input color preview */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: normalizedHex }}
          />
          <span className="text-xs font-mono text-gray-500">
            {normalizedHex}
          </span>
        </div>

        {/* Matches */}
        <div className="space-y-0.5">
          {matches.map(match => (
            <ColorMatchRow
              key={match.color}
              match={match}
              isSelected={selectedColors.has(match.color)}
              onToggle={() => toggleColor(match.color)}
              compact
            />
          ))}
        </div>

        {/* Search button */}
        {showSearchButton && onColorsSelected && (
          <button
            onClick={handleSearch}
            disabled={selectedColors.size === 0}
            className={`
              w-full mt-2 flex items-center justify-center gap-1.5 px-2 py-1.5
              text-xs font-medium rounded-md transition-colors
              ${selectedColors.size > 0
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
              }
            `}
          >
            <Search className="w-3 h-3" />
            Rechercher ({selectedColors.size})
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Input color */}
        <div
          className="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm shrink-0"
          style={{ backgroundColor: normalizedHex }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
              {normalizedHex}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Couleurs correspondantes dans le catalogue
          </p>
        </div>
      </div>

      {/* Matches list */}
      <div className="space-y-2">
        {matches.map(match => (
          <ColorMatchRow
            key={match.color}
            match={match}
            isSelected={selectedColors.has(match.color)}
            onToggle={() => toggleColor(match.color)}
          />
        ))}
      </div>

      {/* Info tip */}
      <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sélectionnez les couleurs à inclure dans votre recherche. 
          Les tissus correspondant à ces couleurs seront affichés.
        </p>
      </div>

      {/* Search button */}
      {showSearchButton && onColorsSelected && (
        <button
          onClick={handleSearch}
          disabled={selectedColors.size === 0}
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-2.5
            text-sm font-medium rounded-lg transition-colors
            ${selectedColors.size > 0
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
            }
          `}
        >
          <Search className="w-4 h-4" />
          Rechercher des tissus ({selectedColors.size} couleur{selectedColors.size > 1 ? 's' : ''})
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export type { ColorMatchDisplayProps };
