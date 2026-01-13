// src/features/boards/components/ContextualSearchPanel.tsx
// Sprint B3 - Panneau latéral avec contraintes multiples et sources

'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  X, 
  Search, 
  Loader2, 
  Check, 
  AlertTriangle,
  ExternalLink,
  Plus,
  Palette,
  Ruler,
  Layers,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useContextualSearch, 
  type TextileResult,
} from '../hooks/useContextualSearch';
import { 
  useContextualSearchPanel,
  type Constraint,
  type ColorConstraint,
  type QuantityConstraint,
  type MaterialConstraint,
} from '../context/ContextualSearchContext';
import { PriceDisplay } from '@/components/search/PriceDisplay';
import { getColorLabelFr, type ColorName } from '@/lib/color';

// ============================================================================
// Types
// ============================================================================

interface ContextualSearchPanelProps {
  /** Board ID for context */
  boardId?: string;
  /** Callback when a textile is added to the board */
  onAddToBoard?: (textile: TextileResult) => void;
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

        {/* Prix - utilise PriceDisplay comme le module search */}
        <div className="mt-1.5 text-xs">
          <PriceDisplay
            saleType={textile.sale_type as 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece' | null}
            price={textile.price_value}
            pricePerMeter={textile.price_per_meter}
            quantity={textile.quantity_value}
            currency={textile.price_currency || '€'}
          />
        </div>

        {/* Sufficiency badge */}
        {requiredMeters && textile.sufficiency && (
          <div className={`
            flex items-center gap-0.5 text-[10px] font-medium mt-1
            ${isSufficient ? 'text-green-600' : 'text-amber-600'}
          `}>
            {isSufficient ? (
              <>
                <Check className="w-3 h-3" />
                <span>{textile.sufficiency.reason}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>{textile.sufficiency.reason}</span>
              </>
            )}
          </div>
        )}
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
        
         <a href={textile.source_url}
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

// ============================================================================
// Constraint Chips
// ============================================================================

interface ConstraintChipProps {
  constraint: Constraint;
  onRemove: () => void;
}

function ConstraintChip({ constraint, onRemove }: ConstraintChipProps) {
  const getIcon = () => {
    switch (constraint.type) {
      case 'color':
        return <Palette className="w-3 h-3" />;
      case 'quantity':
        return <Ruler className="w-3 h-3" />;
      case 'material':
        return <Layers className="w-3 h-3" />;
    }
  };

  const getLabel = () => {
    switch (constraint.type) {
      case 'color':
        const colorConstraint = constraint as ColorConstraint;
        return colorConstraint.colorNames.map(c => getColorLabelFr(c as ColorName)).join(', ');
      case 'quantity':
        const quantityConstraint = constraint as QuantityConstraint;
        return `≥ ${quantityConstraint.meters}m`;
      case 'material':
        const materialConstraint = constraint as MaterialConstraint;
        return [materialConstraint.fiber, materialConstraint.weave].filter(Boolean).join(', ');
    }
  };

  const getTypeLabel = () => {
    switch (constraint.type) {
      case 'color':
        return 'Couleur';
      case 'quantity':
        return 'Métrage';
      case 'material':
        return 'Matière';
    }
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
        {getIcon()}
        <span className="text-xs font-medium">{getTypeLabel()}</span>
      </div>
      <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
        {getLabel()}
      </span>
      <span className="text-[10px] text-gray-400 truncate max-w-24">
        ({constraint.sourceElementName})
      </span>
      <button
        onClick={onRemove}
        className="p-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        title="Retirer cette contrainte"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ContextualSearchPanel({
  boardId,
  onAddToBoard,
}: ContextualSearchPanelProps) {
  const { 
    state: panelState, 
    closePanel, 
    closeAndReset,
    removeConstraint, 
    clearConstraints,
    aggregatedConstraints,
    requiredMeters,
  } = useContextualSearchPanel();
  
  const { state: searchState, search, loadMore, reset } = useContextualSearch();
  const [hideInsufficient, setHideInsufficient] = useState(false);
  
  // Build search constraints from aggregated constraints
  const searchConstraints = useMemo(() => ({
    hex: aggregatedConstraints.hex,
    colorNames: aggregatedConstraints.colorNames,
    minQuantity: aggregatedConstraints.minQuantity,
    fiber: aggregatedConstraints.fiber,
    weave: aggregatedConstraints.weave,
  }), [aggregatedConstraints]);

  // Search when constraints change
  useEffect(() => {
    if (panelState.isOpen && panelState.constraints.length > 0) {
      search(searchConstraints, boardId);
    }
    
    if (!panelState.isOpen) {
      reset();
    }
  }, [panelState.isOpen, panelState.constraints, searchConstraints, boardId, search, reset]);
  
  // Filter results by sufficiency
  const displayedResults = useMemo(() => {
    if (hideInsufficient && requiredMeters) {
      return searchState.results.filter(r => r.sufficiency?.sufficient);
    }
    return searchState.results;
  }, [searchState.results, hideInsufficient, requiredMeters]);
  
  if (!panelState.isOpen) return null;
  
  const hasConstraints = panelState.constraints.length > 0;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={closePanel}
      />
      
      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-50 dark:bg-gray-900 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Recherche contextuelle
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {hasConstraints && (
              <button
                onClick={clearConstraints}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600"
                title="Effacer toutes les contraintes"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={closeAndReset}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Constraints */}
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {hasConstraints ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Contraintes actives
              </p>
              <div className="flex flex-wrap gap-2">
                {panelState.constraints.map(constraint => (
                  <ConstraintChip
                    key={constraint.sourceElementId}
                    constraint={constraint}
                    onRemove={() => removeConstraint(constraint.sourceElementId)}
                  />
                ))}
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-3 text-sm pt-2">
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-gray-100">{searchState.total}</strong> résultat{searchState.total !== 1 ? 's' : ''}
                </span>
                
                {requiredMeters && searchState.aggregations && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {searchState.aggregations.sufficientCount}
                    </span>
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {searchState.aggregations.insufficientCount}
                    </span>
                  </>
                )}
              </div>
              
              {/* Hide insufficient toggle */}
              {requiredMeters && (
                <label className="flex items-center gap-2 text-sm pt-1">
                  <input
                    type="checkbox"
                    checked={hideInsufficient}
                    onChange={(e) => setHideInsufficient(e.target.checked)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    Masquer insuffisants
                  </span>
                </label>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucune contrainte active
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Cliquez sur <Search className="w-3 h-3 inline" /> sur une palette ou un calcul
              </p>
            </div>
          )}
        </div>
        
        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Loading state */}
          {searchState.isLoading && searchState.results.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          )}
          
          {/* Error state */}
          {searchState.error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {searchState.error}
            </div>
          )}
          
          {/* Empty state */}
          {!searchState.isLoading && !searchState.error && hasConstraints && displayedResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {hideInsufficient 
                  ? 'Aucun tissu avec stock suffisant'
                  : 'Aucun tissu trouvé pour ces contraintes'
                }
              </p>
              {hideInsufficient && searchState.results.length > 0 && (
                <button
                  onClick={() => setHideInsufficient(false)}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                >
                  Afficher tous les résultats ({searchState.results.length})
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
          {searchState.hasMore && (
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={loadMore}
                disabled={searchState.isLoading}
              >
                {searchState.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Charger plus
              </Button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {hasConstraints && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <p className="text-xs text-gray-500 text-center">
              {displayedResults.length} sur {searchState.total} affichés
              {hideInsufficient && searchState.results.length !== displayedResults.length && (
                <span> ({searchState.results.length - displayedResults.length} masqués)</span>
              )}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
