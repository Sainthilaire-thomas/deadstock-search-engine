// src/features/boards/context/ContextualSearchContext.tsx
// Sprint B3 - Contexte pour gérer les contraintes de recherche multiples

'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

/** Contrainte de couleur depuis une palette */
export interface ColorConstraint {
  type: 'color';
  sourceElementId: string;
  sourceElementName: string;
  hex: string;
  colorNames: string[];
}

/** Contrainte de métrage depuis un calcul */
export interface QuantityConstraint {
  type: 'quantity';
  sourceElementId: string;
  sourceElementName: string;
  meters: number;
  width?: number; // largeur de tissu si spécifiée
}

/** Contrainte de matière depuis un textile existant */
export interface MaterialConstraint {
  type: 'material';
  sourceElementId: string;
  sourceElementName: string;
  fiber?: string;
  weave?: string;
}

export type Constraint = ColorConstraint | QuantityConstraint | MaterialConstraint;

/** État global de la recherche contextuelle */
export interface ContextualSearchState {
  isOpen: boolean;
  constraints: Constraint[];
}

/** Contraintes agrégées pour l'API */
export interface AggregatedConstraints {
  hex?: string;
  colorNames?: string[];
  minQuantity?: number;
  fiber?: string;
  weave?: string;
}

interface ContextualSearchContextValue {
  state: ContextualSearchState;
  /** Ajouter ou toggle une contrainte */
  toggleConstraint: (constraint: Constraint) => void;
  /** Retirer une contrainte par ID d'élément source */
  removeConstraint: (sourceElementId: string) => void;
  /** Retirer toutes les contraintes */
  clearConstraints: () => void;
  /** Ouvrir le panneau (avec optionnellement une nouvelle contrainte) */
  openPanel: (constraint?: Constraint) => void;
  /** Fermer le panneau (conserve les contraintes) */
  closePanel: () => void;
  /** Fermer et reset les contraintes */
  closeAndReset: () => void;
  /** Vérifier si un élément est actif comme contrainte */
  isElementActive: (elementId: string) => boolean;
  /** Obtenir les contraintes agrégées pour l'API */
  aggregatedConstraints: AggregatedConstraints;
  /** Métrage requis (depuis contrainte quantity) */
  requiredMeters: number | undefined;
}

// ============================================================================
// Context
// ============================================================================

const ContextualSearchContext = createContext<ContextualSearchContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface ContextualSearchProviderProps {
  children: ReactNode;
}

export function ContextualSearchProvider({ children }: ContextualSearchProviderProps) {
  const [state, setState] = useState<ContextualSearchState>({
    isOpen: false,
    constraints: [],
  });

  // Toggle une contrainte (ajouter si absente, retirer si présente)
  const toggleConstraint = useCallback((constraint: Constraint) => {
    setState(prev => {
      const existingIndex = prev.constraints.findIndex(
        c => c.sourceElementId === constraint.sourceElementId
      );

      if (existingIndex >= 0) {
        // Retirer la contrainte existante
        return {
          ...prev,
          constraints: prev.constraints.filter((_, i) => i !== existingIndex),
        };
      } else {
        // Ajouter la nouvelle contrainte et ouvrir le panneau
        return {
          isOpen: true,
          constraints: [...prev.constraints, constraint],
        };
      }
    });
  }, []);

  // Retirer une contrainte par ID d'élément
  const removeConstraint = useCallback((sourceElementId: string) => {
    setState(prev => ({
      ...prev,
      constraints: prev.constraints.filter(c => c.sourceElementId !== sourceElementId),
    }));
  }, []);

  // Effacer toutes les contraintes
  const clearConstraints = useCallback(() => {
    setState(prev => ({
      ...prev,
      constraints: [],
    }));
  }, []);

  // Ouvrir le panneau
  const openPanel = useCallback((constraint?: Constraint) => {
    setState(prev => {
      if (constraint) {
        const exists = prev.constraints.some(
          c => c.sourceElementId === constraint.sourceElementId
        );
        return {
          isOpen: true,
          constraints: exists 
            ? prev.constraints 
            : [...prev.constraints, constraint],
        };
      }
      return { ...prev, isOpen: true };
    });
  }, []);

  // Fermer le panneau (conserve les contraintes)
  const closePanel = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Fermer et reset
  const closeAndReset = useCallback(() => {
    setState({ isOpen: false, constraints: [] });
  }, []);

  // Vérifier si un élément est actif
  const isElementActive = useCallback((elementId: string) => {
    return state.constraints.some(c => c.sourceElementId === elementId);
  }, [state.constraints]);

  // Agréger les contraintes pour l'API
  const aggregatedConstraints = useMemo((): AggregatedConstraints => {
    const result: AggregatedConstraints = {};

    for (const constraint of state.constraints) {
      switch (constraint.type) {
        case 'color':
          result.hex = constraint.hex;
          result.colorNames = constraint.colorNames;
          break;
        case 'quantity':
          result.minQuantity = constraint.meters;
          break;
        case 'material':
          if (constraint.fiber) result.fiber = constraint.fiber;
          if (constraint.weave) result.weave = constraint.weave;
          break;
      }
    }

    return result;
  }, [state.constraints]);

  // Métrage requis
  const requiredMeters = useMemo(() => {
    const quantityConstraint = state.constraints.find(
      (c): c is QuantityConstraint => c.type === 'quantity'
    );
    return quantityConstraint?.meters;
  }, [state.constraints]);

  const value: ContextualSearchContextValue = {
    state,
    toggleConstraint,
    removeConstraint,
    clearConstraints,
    openPanel,
    closePanel,
    closeAndReset,
    isElementActive,
    aggregatedConstraints,
    requiredMeters,
  };

  return (
    <ContextualSearchContext.Provider value={value}>
      {children}
    </ContextualSearchContext.Provider>
  );
}

// ============================================================================
// Hook principal
// ============================================================================

export function useContextualSearchPanel() {
  const context = useContext(ContextualSearchContext);
  
  if (!context) {
    throw new Error('useContextualSearchPanel must be used within ContextualSearchProvider');
  }
  
  return context;
}

// ============================================================================
// Hooks de convénience
// ============================================================================

/**
 * Hook pour toggle une contrainte couleur depuis une palette
 */
export function useColorConstraint() {
  const { toggleConstraint } = useContextualSearchPanel();
  
  return useCallback((params: {
    elementId: string;
    elementName: string;
    hex: string;
    colorNames: string[];
  }) => {
    toggleConstraint({
      type: 'color',
      sourceElementId: params.elementId,
      sourceElementName: params.elementName,
      hex: params.hex,
      colorNames: params.colorNames,
    });
  }, [toggleConstraint]);
}

/**
 * Hook pour toggle une contrainte métrage depuis un calcul
 */
export function useQuantityConstraint() {
  const { toggleConstraint } = useContextualSearchPanel();
  
  return useCallback((params: {
    elementId: string;
    elementName: string;
    meters: number;
    width?: number;
  }) => {
    toggleConstraint({
      type: 'quantity',
      sourceElementId: params.elementId,
      sourceElementName: params.elementName,
      meters: params.meters,
      width: params.width,
    });
  }, [toggleConstraint]);
}

/**
 * Hook pour toggle une contrainte matière depuis un textile
 */
export function useMaterialConstraint() {
  const { toggleConstraint } = useContextualSearchPanel();
  
  return useCallback((params: {
    elementId: string;
    elementName: string;
    fiber?: string;
    weave?: string;
  }) => {
    toggleConstraint({
      type: 'material',
      sourceElementId: params.elementId,
      sourceElementName: params.elementName,
      fiber: params.fiber,
      weave: params.weave,
    });
  }, [toggleConstraint]);
}
