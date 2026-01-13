// src/features/boards/components/ContextualSearchPanel.tsx
// Sprint B2 - Panneau latéral de résultats de recherche contextuelle

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  Search, 
  Loader2, 
  Check, 
  AlertTriangle,
  ExternalLink,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useContextualSearch, 
  type TextileResult,
  type SearchConstraints 
} from '../hooks/useContextualSearch';
import { getColorLabelFr, type ColorName } from '@/lib/color';

// ============================================================================
// Types
// ============================================================================

interface ContextualSearchPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Close the panel */
  onClose: () => void;
  /** Initial search constraints */
  initialConstraints?: SearchConstraints;
  /** Board ID for context */
  boardId?: string;
  /** Element ID that triggered the search */
  elementId?: string;
  /** Callback when a textile is added to the board */
  onAddToBoard?: (textile: TextileResult) => void;
  /** Required meters from calculation element */
  requiredMeters?: number;
}

// ============================================================================
// Sub-components
// ============================================================================

interface TextileCardCompactProps {
  textile: TextileResult;
  onAdd?: () => void;
  requiredMeters?: number;
}

function TextileCardCompact({ textile, onAdd, requiredMeters }: TextileCardCompactProps) {
  const isSufficient = textile.sufficiency?.sufficient ?? true;
  
  return (
    <div className={`
      flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border 
      border-gray-200 dark:border-gray-700 
      hover:border-gray-300 dark:hover:border-gray-600 
      transition-colors
      ${!isSufficient && requiredMeters ? 'opacity-60' : ''}
    `}>
      {/* Image */}
      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
        {textile.image_url ? (
          <Image
            src={textile.image_url}
            alt={textile.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No img
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
          {textile.name}
        </h4>
        
        <div className="flex flex-wrap gap-1 mt-1">
          {textile.color && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
              {getColorLabelFr(textile.color as ColorName)}
            </Badge>
          )}
          {textile.fiber && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
              {textile.fiber}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1.5">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {textile.price_value ? (
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {textile.price_value.toFixed(2)} {textile.price_currency}
              </span>
            ) : (
              'Prix N/A'
            )}
            {textile.quantity_value && (
              <span className="ml-2">
                {textile.quantity_value}m
              </span>
            )}
          </div>
          
          {/* Sufficiency badge */}
          {requiredMeters && textile.sufficiency && (
            <div className={`
              flex items-center gap-0.5 text-[10px] font-medium
              ${isSufficient ? 'text-green-600' : 'text-amber-600'}
            `}>
              {isSufficient ? (
                <Check className="w-3 h-3" />
              ) : (
                <AlertTriangle className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col gap-1 shrink-0">
        {onAdd && (
          <button
            onClick={onAdd}
            className="p-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Ajouter au board"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        <a
          href={textile.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Voir sur le site source"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

interface SearchHeaderProps {
  hex?: string;
  searchedColors: string[];
  total: number;
  aggregations: {
    sufficientCount: number;
    insufficientCount: number;
  } | null;
  requiredMeters?: number;
}

function SearchHeader({ hex, searchedColors, total, aggregations, requiredMeters }: SearchHeaderProps) {
  return (
    <div className="space-y-2">
      {/* Color info */}
      {hex && (
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: hex }}
          />
          <span className="text-sm font-mono text-gray-500">{hex}</span>
          <span className="text-sm text-gray-400">→</span>
          <div className="flex gap-1">
            {searchedColors.map(color => (
              <Badge key={color} variant="secondary" className="capitalize text-xs">
                {getColorLabelFr(color as ColorName)}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Stats */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          <strong className="text-gray-900 dark:text-gray-100">{total}</strong> résultat{total > 1 ? 's' : ''}
        </span>
        
        {requiredMeters && aggregations && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" />
              {aggregations.sufficientCount} suffisant{aggregations.sufficientCount > 1 ? 's' : ''}
            </span>
            <span className="text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {aggregations.insufficientCount}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ContextualSearchPanel({
  isOpen,
  onClose,
  initialConstraints,
  boardId,
  elementId,
  onAddToBoard,
  requiredMeters,
}: ContextualSearchPanelProps) {
  const { state, search, loadMore, reset } = useContextualSearch();
  const [showFilters, setShowFilters] = useState(false);
  const [hideInsufficient, setHideInsufficient] = useState(false);
  
  // Search on open with initial constraints
  useEffect(() => {
    if (isOpen && initialConstraints) {
      const constraints = {
        ...initialConstraints,
        minQuantity: requiredMeters,
      };
      search(constraints, boardId, elementId);
    }
    
    if (!isOpen) {
      reset();
    }
  }, [isOpen, initialConstraints, requiredMeters, boardId, elementId, search, reset]);
  
  // Filter results by sufficiency
  const displayedResults = hideInsufficient && requiredMeters
    ? state.results.filter(r => r.sufficiency?.sufficient)
    : state.results;
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-50 dark:bg-gray-900 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Recherche contextuelle
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Search info */}
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <SearchHeader
            hex={initialConstraints?.hex}
            searchedColors={state.searchedColors}
            total={state.total}
            aggregations={state.aggregations}
            requiredMeters={requiredMeters}
          />
          
          {/* Filters toggle */}
          {requiredMeters && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <Filter className="w-4 h-4" />
                Filtres
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {showFilters && (
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={hideInsufficient}
                      onChange={(e) => setHideInsufficient(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Masquer les stocks insuffisants
                    </span>
                  </label>
                  
                  {requiredMeters && (
                    <p className="text-xs text-gray-500">
                      Métrage requis : <strong>{requiredMeters}m</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Loading state */}
          {state.isLoading && state.results.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          )}
          
          {/* Error state */}
          {state.error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {state.error}
            </div>
          )}
          
          {/* Empty state */}
          {!state.isLoading && !state.error && displayedResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {hideInsufficient 
                  ? 'Aucun tissu avec stock suffisant'
                  : 'Aucun tissu trouvé pour cette couleur'
                }
              </p>
              {hideInsufficient && state.results.length > 0 && (
                <button
                  onClick={() => setHideInsufficient(false)}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                >
                  Afficher tous les résultats ({state.results.length})
                </button>
              )}
            </div>
          )}
          
          {/* Results list */}
          {displayedResults.map(textile => (
            <TextileCardCompact
              key={textile.id}
              textile={textile}
              onAdd={onAddToBoard ? () => onAddToBoard(textile) : undefined}
              requiredMeters={requiredMeters}
            />
          ))}
          
          {/* Load more */}
          {state.hasMore && (
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={loadMore}
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Charger plus
              </Button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p className="text-xs text-gray-500 text-center">
            {displayedResults.length} sur {state.total} affichés
            {hideInsufficient && state.results.length !== displayedResults.length && (
              <span> ({state.results.length - displayedResults.length} masqués)</span>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
