// src/features/search/application/searchTextiles.ts
import { textileRepository } from '../infrastructure/textileRepository';
import type { SearchFilters, SearchResult, PaginationParams } from '../domain/types';

/**
 * Use Case: Search textiles with filters and pagination
 * Peut être appelé par: Web UI, CLI, API
 */
export async function searchTextiles(
  filters: SearchFilters = {},
  pagination: PaginationParams = {}
): Promise<SearchResult> {
  const page = pagination.page ?? 1;
  const limit = pagination.limit ?? 24;

  // 1. Fetch textiles with pagination
  const { textiles, total } = await textileRepository.search(filters, page, limit);

  // 2. Fetch available filters (pour affichage dynamique)
  const availableFilters = await textileRepository.getAvailableFilters();

  // 3. Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);

  return {
    textiles,
    total,
    filters: availableFilters,
    pagination: {
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Use Case: Get textile by ID
 */
export async function getTextileById(id: string) {
  return await textileRepository.findById(id);
}
