// src/features/search/application/searchTextiles.ts

import { textileRepository } from '../infrastructure/textileRepository';
import type { SearchFilters, SearchResult } from '../domain/types';

/**
 * Use Case: Search textiles with filters
 * Peut être appelé par: Web UI, CLI, API
 */
export async function searchTextiles(
  filters: SearchFilters = {}
): Promise<SearchResult> {
  // 1. Fetch textiles
  const textiles = await textileRepository.search(filters);
  
  // 2. Fetch available filters (pour affichage dynamique)
  const availableFilters = await textileRepository.getAvailableFilters();
  
  return {
    textiles,
    total: textiles.length,
    filters: availableFilters,
  };
}

/**
 * Use Case: Get textile by ID
 */
export async function getTextileById(id: string) {
  return await textileRepository.findById(id);
}
