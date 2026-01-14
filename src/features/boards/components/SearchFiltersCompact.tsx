// src/features/boards/components/SearchFiltersCompact.tsx
// Sprint B3.6 - Filtres compacts pour le panel de recherche contextuelle
// B3.7 - Ajout slider prix

'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { getColorLabelFr, type ColorName } from '@/lib/color';

// ============================================================================
// Types
// ============================================================================

interface FilterCategory {
  slug: string;
  name: string;
  values: string[];
}

interface AvailableFilters {
  categories: FilterCategory[];
  priceRange?: {
    min: number;
    max: number;
  };
}

interface SearchFiltersCompactProps {
  /** Filtres actuellement sélectionnés */
  selectedFilters: Record<string, string[]>;
  /** Callback quand les filtres changent */
  onFiltersChange: (filters: Record<string, string[]>) => void;
  /** Filtre prix min/max (€/m) */
  priceRange?: { min: number; max: number } | null;
  /** Callback quand le prix change */
  onPriceRangeChange?: (range: { min: number; max: number } | null) => void;
  /** Désactiver pendant le chargement */
  disabled?: boolean;
  /** Couleurs depuis les contraintes (pré-sélectionnées, verrouillées) */
  constraintColors?: string[];
  /** Fiber depuis les contraintes */
  constraintFiber?: string;
  /** Weave depuis les contraintes */
  constraintWeave?: string;
}

// Traductions
const categoryLabels: Record<string, string> = {
  fiber: 'Matière',
  color: 'Couleur',
  pattern: 'Motif',
  weave: 'Tissage',
};

// Couleurs pour les swatches
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
// PriceRangeFilter Component
// ============================================================================

interface PriceRangeFilterProps {
  availableRange: { min: number; max: number };
  selectedRange: { min: number; max: number } | null;
  onChange: (range: { min: number; max: number } | null) => void;
}

function PriceRangeFilter({ availableRange, selectedRange, onChange }: PriceRangeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(selectedRange !== null);
  
  // Valeurs locales pour le slider (évite les rerenders pendant le drag)
  const [localValues, setLocalValues] = useState<[number, number]>([
    selectedRange?.min ?? availableRange.min,
    selectedRange?.max ?? availableRange.max,
  ]);

  // Sync quand selectedRange change de l'extérieur
  useEffect(() => {
    if (selectedRange) {
      setLocalValues([selectedRange.min, selectedRange.max]);
    } else {
      setLocalValues([availableRange.min, availableRange.max]);
    }
  }, [selectedRange, availableRange]);

  const hasSelection = selectedRange !== null && 
    (selectedRange.min > availableRange.min || selectedRange.max < availableRange.max);

  const handleSliderChange = (values: number[]) => {
    setLocalValues([values[0], values[1]]);
  };

  const handleSliderCommit = (values: number[]) => {
    const [min, max] = values;
    // Si on est revenu aux bornes, c'est comme "pas de filtre"
    if (min === availableRange.min && max === availableRange.max) {
      onChange(null);
    } else {
      onChange({ min, max });
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          Prix au mètre
          {hasSelection && (
            <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded">
              {localValues[0]}€ - {localValues[1]}€
            </span>
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>{localValues[0].toFixed(0)}€/m</span>
            <span>{localValues[1].toFixed(0)}€/m</span>
          </div>
          
          <Slider
            value={localValues}
            min={availableRange.min}
            max={availableRange.max}
            step={1}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            className="w-full"
          />
          
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>Min: {availableRange.min}€</span>
            <span>Max: {availableRange.max}€</span>
          </div>

          {hasSelection && (
            <button
              onClick={() => {
                setLocalValues([availableRange.min, availableRange.max]);
                onChange(null);
              }}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Réinitialiser le prix
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FilterSection Component
// ============================================================================

interface FilterSectionProps {
  title: string;
  slug: string;
  values: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  isColor?: boolean;
  /** Valeurs verrouillées (depuis les contraintes) */
  lockedValues?: string[];
}

function FilterSection({
  title,
  slug,
  values,
  selectedValues,
  onToggle,
  isColor = false,
  lockedValues = [],
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(selectedValues.length > 0 || lockedValues.length > 0);
  const hasSelection = selectedValues.length > 0 || lockedValues.length > 0;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          {title}
          {hasSelection && (
            <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded">
              {selectedValues.length + lockedValues.length}
            </span>
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-1.5">
          {values.map((value) => {
            const isLocked = lockedValues.includes(value);
            const isSelected = selectedValues.includes(value) || isLocked;
            return (
              <button
                key={value}
                onClick={() => !isLocked && onToggle(value)}
                disabled={isLocked}
                className={`
                  flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors
                  ${isLocked
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700 cursor-default'
                    : isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }
                `}
                title={isLocked ? 'Depuis la contrainte active' : undefined}
              >
                {isColor && (
                  <div
                    className="w-3.5 h-3.5 rounded-sm border border-gray-300 dark:border-gray-600 shrink-0"
                    style={{ backgroundColor: COLOR_SWATCHES[value] || '#808080' }}
                  />
                )}
                <span className="truncate capitalize flex-1">
                  {isColor ? getColorLabelFr(value as ColorName) : value}
                </span>
                {isLocked && (
                  <span className="text-[10px] text-blue-500 dark:text-blue-400">●</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SearchFiltersCompact({
  selectedFilters,
  onFiltersChange,
  priceRange,
  onPriceRangeChange,
  disabled = false,
  constraintColors = [],
  constraintFiber,
  constraintWeave,
}: SearchFiltersCompactProps) {
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Charger les filtres disponibles
  useEffect(() => {
    async function loadFilters() {
      try {
        // Utilise l'API search existante avec un body vide pour récupérer les filtres
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (response.ok) {
          const data = await response.json();
          setAvailableFilters({
            categories: data.filters?.categories || [],
            priceRange: data.filters?.priceRange || { min: 0, max: 100 },
          });
        }
      } catch (error) {
        console.error('Failed to load filters:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadFilters();
  }, []);

  // Toggle une valeur dans une catégorie
  const handleToggle = (slug: string, value: string) => {
    const currentValues = selectedFilters[slug] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    const newFilters = { ...selectedFilters };
    if (newValues.length > 0) {
      newFilters[slug] = newValues;
    } else {
      delete newFilters[slug];
    }

    onFiltersChange(newFilters);
  };

  // Compter le nombre total de filtres actifs
  const totalActiveFilters = useMemo(() => {
    let count = Object.values(selectedFilters).reduce(
      (sum, values) => sum + values.length,
      0
    );
    if (priceRange) count += 1;
    return count;
  }, [selectedFilters, priceRange]);

  // Reset tous les filtres
  const handleReset = () => {
    onFiltersChange({});
    onPriceRangeChange?.(null);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Chargement des filtres...</span>
        </div>
      </div>
    );
  }

  if (!availableFilters || availableFilters.categories.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Header accordéon */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50"
      >
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
          Filtres avancés
          {totalActiveFilters > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
              {totalActiveFilters}
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {totalActiveFilters > 0 && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
              Réinitialiser
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Contenu */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Slider Prix */}
          {availableFilters.priceRange && onPriceRangeChange && (
            <PriceRangeFilter
              availableRange={availableFilters.priceRange}
              selectedRange={priceRange ?? null}
              onChange={onPriceRangeChange}
            />
          )}

          {/* Catégories de filtres */}
          {availableFilters.categories.map((category) => {
            // Déterminer les valeurs verrouillées selon la catégorie
            let lockedValues: string[] = [];
            if (category.slug === 'color') {
              lockedValues = constraintColors;
            } else if (category.slug === 'fiber' && constraintFiber) {
              lockedValues = [constraintFiber];
            } else if (category.slug === 'weave' && constraintWeave) {
              lockedValues = [constraintWeave];
            }

            return (
              <FilterSection
                key={category.slug}
                title={categoryLabels[category.slug] || category.name}
                slug={category.slug}
                values={category.values}
                selectedValues={selectedFilters[category.slug] || []}
                onToggle={(value) => handleToggle(category.slug, value)}
                isColor={category.slug === 'color'}
                lockedValues={lockedValues}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
