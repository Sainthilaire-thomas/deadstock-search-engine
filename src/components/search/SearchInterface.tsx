// src/components/search/SearchInterface.tsx

'use client';

import { useState, useMemo } from 'react';
import type { SearchResult, SearchFilters, Textile } from '@/features/search/domain/types';
import { SearchBar } from './SearchBar';
import { Filters } from './Filters';
import { TextileGrid } from './TextileGrid';
import { isTextileSufficient } from '@/features/pattern/application/calculateYardage';

interface SearchInterfaceProps {
  initialData: SearchResult;
}

export function SearchInterface({ initialData }: SearchInterfaceProps) {
  const [results, setResults] = useState(initialData);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hideInsufficient, setHideInsufficient] = useState(false);

  // Compute yardage sufficiency for each textile
  const textilesWithSufficiency = useMemo(() => {
    if (!filters.yardageFilter?.active) {
      return results.textiles;
    }

    return results.textiles.map((textile) => {
      // Estimate fabric width from quantity_unit or use default
      // Most deadstock fabrics are 140-150cm wide
      const estimatedWidth = 140; // Default assumption
      
      const sufficiency = isTextileSufficient(
        estimatedWidth,
        textile.quantity_value,
        filters.yardageFilter!.yardageByWidth
      );

      return {
        ...textile,
        yardageSufficiency: sufficiency,
      };
    });
  }, [results.textiles, filters.yardageFilter]);

  // Filter out insufficient textiles if option is enabled
  const displayedTextiles = useMemo(() => {
    if (!hideInsufficient || !filters.yardageFilter?.active) {
      return textilesWithSufficiency;
    }
    return textilesWithSufficiency.filter(t => t.yardageSufficiency?.sufficient);
  }, [textilesWithSufficiency, hideInsufficient, filters.yardageFilter?.active]);

  const handleSearch = async (newFilters: SearchFilters) => {
    setIsLoading(true);
    setFilters(newFilters);

    try {
      // Don't send yardageFilter to API (it's client-side only)
      const { yardageFilter, ...apiFilters } = newFilters;
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiFilters),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const insufficientCount = textilesWithSufficiency.filter(
    t => t.yardageSufficiency && !t.yardageSufficiency.sufficient
  ).length;

  return (
    <div className="space-y-6">
      <SearchBar
        onSearch={(keywords) => handleSearch({ ...filters, keywords })}
      />

      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <Filters
            availableFilters={results.filters}
            currentFilters={filters}
            onFiltersChange={handleSearch}
          />

          {/* Hide insufficient toggle */}
          {filters.yardageFilter?.active && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideInsufficient}
                  onChange={(e) => setHideInsufficient(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">
                  Masquer les insuffisants ({insufficientCount})
                </span>
              </label>
            </div>
          )}
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-4 text-sm text-muted-foreground">
            {displayedTextiles.length} résultat{displayedTextiles.length > 1 ? 's' : ''}
            {filters.yardageFilter?.active && hideInsufficient && (
              <span className="ml-2 text-blue-600">
                ({insufficientCount} masqués car insuffisants)
              </span>
            )}
          </div>
          <TextileGrid
            textiles={displayedTextiles}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
}
