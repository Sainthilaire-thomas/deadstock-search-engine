// src/features/boards/context/ContextualSearchContext.tsx
// Sprint B2 - Contexte pour gérer l'état de la recherche contextuelle

'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SearchConstraints } from '../hooks/useContextualSearch';

// ============================================================================
// Types
// ============================================================================

interface ContextualSearchState {
  isOpen: boolean;
  constraints: SearchConstraints | null;
  sourceElementId: string | null;
  requiredMeters: number | undefined;
}

interface ContextualSearchContextValue {
  state: ContextualSearchState;
  openSearch: (params: {
    constraints: SearchConstraints;
    elementId?: string;
    requiredMeters?: number;
  }) => void;
  closeSearch: () => void;
  setRequiredMeters: (meters: number | undefined) => void;
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
    constraints: null,
    sourceElementId: null,
    requiredMeters: undefined,
  });

  const openSearch = useCallback((params: {
    constraints: SearchConstraints;
    elementId?: string;
    requiredMeters?: number;
  }) => {
    setState({
      isOpen: true,
      constraints: params.constraints,
      sourceElementId: params.elementId || null,
      requiredMeters: params.requiredMeters,
    });
  }, []);

  const closeSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const setRequiredMeters = useCallback((meters: number | undefined) => {
    setState(prev => ({
      ...prev,
      requiredMeters: meters,
    }));
  }, []);

  return (
    <ContextualSearchContext.Provider value={{ state, openSearch, closeSearch, setRequiredMeters }}>
      {children}
    </ContextualSearchContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useContextualSearchPanel() {
  const context = useContext(ContextualSearchContext);
  
  if (!context) {
    throw new Error('useContextualSearchPanel must be used within ContextualSearchProvider');
  }
  
  return context;
}

// ============================================================================
// Convenience hooks for specific use cases
// ============================================================================

/**
 * Hook to open color search from a palette
 */
export function useColorSearch() {
  const { openSearch } = useContextualSearchPanel();
  
  return useCallback((hex: string, options?: {
    colorNames?: string[];
    minConfidence?: number;
    elementId?: string;
    requiredMeters?: number;
  }) => {
    openSearch({
      constraints: {
        hex,
        colorNames: options?.colorNames,
        minConfidence: options?.minConfidence ?? 20,
      },
      elementId: options?.elementId,
      requiredMeters: options?.requiredMeters,
    });
  }, [openSearch]);
}

/**
 * Hook to open similar textile search
 */
export function useSimilarSearch() {
  const { openSearch } = useContextualSearchPanel();
  
  return useCallback((params: {
    fiber?: string;
    color?: string;
    weave?: string;
    elementId?: string;
    requiredMeters?: number;
  }) => {
    openSearch({
      constraints: {
        colorNames: params.color ? [params.color] : undefined,
        fiber: params.fiber,
        weave: params.weave,
      },
      elementId: params.elementId,
      requiredMeters: params.requiredMeters,
    });
  }, [openSearch]);
}
