// src/features/boards/hooks/useContextualSearch.ts
// Sprint B2 - Hook pour la recherche contextuelle depuis les boards

'use client';

import { useState, useCallback, useRef } from 'react';
import type { ContextualSearchRequest } from '@/app/api/search/contextual/route';

// ============================================================================
// Types
// ============================================================================

export interface TextileResult {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  source_url: string;
  price_value: number | null;
  price_currency: string;
  price_per_meter: number | null;
  sale_type: string | null;
  quantity_value: number | null;
  quantity_unit: string | null;
  width_value: number | null;
  fiber: string | null;
  color: string | null;
  pattern: string | null;
  weave: string | null;
  available: boolean;
  supplier_name: string | null;
  colorMatch?: {
    matchedColor: string;
    confidence: number;
  };
  sufficiency?: {
    sufficient: boolean;
    reason: string;
  };
}

export interface SearchAggregations {
  byColor: Array<{ color: string; count: number; totalMeters: number }>;
  sufficientCount: number;
  insufficientCount: number;
}

export interface ContextualSearchState {
  results: TextileResult[];
  total: number;
  aggregations: SearchAggregations | null;
  searchedColors: string[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentConstraints: SearchConstraints | null;
}

export interface SearchConstraints {
  hex?: string;
  colorNames?: string[];
  minConfidence?: number;
  fiber?: string;
  weave?: string;
  pattern?: string;
  minQuantity?: number;
  includeCutToOrder?: boolean;
}

export interface UseContextualSearchReturn {
  state: ContextualSearchState;
  search: (constraints: SearchConstraints, boardId?: string, elementId?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
  setMinQuantity: (meters: number | undefined) => void;
}

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 20;

const INITIAL_STATE: ContextualSearchState = {
  results: [],
  total: 0,
  aggregations: null,
  searchedColors: [],
  isLoading: false,
  error: null,
  hasMore: false,
  currentConstraints: null,
};

// ============================================================================
// Hook
// ============================================================================

export function useContextualSearch(): UseContextualSearchReturn {
  const [state, setState] = useState<ContextualSearchState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);
  const offsetRef = useRef(0);

  /**
   * Execute a contextual search
   */
  const search = useCallback(async (
    constraints: SearchConstraints,
    boardId?: string,
    elementId?: string
  ) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Reset offset for new search
    offsetRef.current = 0;

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      currentConstraints: constraints,
    }));

    try {
      const requestBody: ContextualSearchRequest = {
        source: {
          type: constraints.hex ? 'palette_color' : 'textile',
          boardId,
          elementId,
        },
        constraints: {
          colors: constraints.hex ? {
            hex: constraints.hex,
            minConfidence: constraints.minConfidence ?? 20,
          } : undefined,
          colorNames: constraints.colorNames,
          fiber: constraints.fiber,
          weave: constraints.weave,
          pattern: constraints.pattern,
          minQuantity: constraints.minQuantity,
          includeCutToOrder: constraints.includeCutToOrder ?? true,
        },
        pagination: {
          limit: PAGE_SIZE,
          offset: 0,
        },
        sort: {
          field: 'created_at',
          direction: 'desc',
        },
      };

      const response = await fetch('/api/search/contextual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed: ${response.status}`);
      }

      const data = await response.json();

      setState({
        results: data.results,
        total: data.total,
        aggregations: data.aggregations,
        searchedColors: data.searchedColors,
        isLoading: false,
        error: null,
        hasMore: data.results.length < data.total,
        currentConstraints: constraints,
      });

      offsetRef.current = data.results.length;

    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }));
    }
  }, []);

  /**
   * Load more results (pagination)
   */
  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasMore || !state.currentConstraints) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const constraints = state.currentConstraints;
      
      const requestBody: ContextualSearchRequest = {
        constraints: {
          colors: constraints.hex ? {
            hex: constraints.hex,
            minConfidence: constraints.minConfidence ?? 20,
          } : undefined,
          colorNames: constraints.colorNames,
          fiber: constraints.fiber,
          weave: constraints.weave,
          pattern: constraints.pattern,
          minQuantity: constraints.minQuantity,
          includeCutToOrder: constraints.includeCutToOrder ?? true,
        },
        pagination: {
          limit: PAGE_SIZE,
          offset: offsetRef.current,
        },
      };

      const response = await fetch('/api/search/contextual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to load more results');
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        results: [...prev.results, ...data.results],
        isLoading: false,
        hasMore: prev.results.length + data.results.length < data.total,
      }));

      offsetRef.current += data.results.length;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load more',
      }));
    }
  }, [state.isLoading, state.hasMore, state.currentConstraints]);

  /**
   * Reset search state
   */
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    offsetRef.current = 0;
    setState(INITIAL_STATE);
  }, []);

  /**
   * Update minimum quantity constraint and re-search
   */
  const setMinQuantity = useCallback((meters: number | undefined) => {
    if (!state.currentConstraints) return;

    const newConstraints = {
      ...state.currentConstraints,
      minQuantity: meters,
    };

    search(newConstraints);
  }, [state.currentConstraints, search]);

  return {
    state,
    search,
    loadMore,
    reset,
    setMinQuantity,
  };
}

// ============================================================================
// Export types for external use
// ============================================================================

export type { ContextualSearchRequest };
