// src/components/search/SearchInterface.tsx

'use client';

import { useState, useMemo, useCallback } from 'react';
import type { SearchResult, SearchFilters, Textile, PaginationMeta } from '@/features/search/domain/types';
import { SearchBar } from './SearchBar';
import { Filters } from './Filters';
import { TextileGrid } from './TextileGrid';
import { isTextileSufficient } from '@/features/pattern/application/calculateYardage';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface SearchInterfaceProps {
  initialData: SearchResult;
}

// Composant Pagination
function Pagination({
  pagination,
  onPageChange,
  isLoading,
}: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}) {
  const { page, totalPages, hasMore } = pagination;

  if (totalPages <= 1) return null;

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Toujours afficher la première page
      pages.push(1);

      if (page > 3) {
        pages.push('ellipsis');
      }

      // Pages autour de la page courante
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Toujours afficher la dernière page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {/* Bouton précédent */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || isLoading}
        className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Page précédente"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Numéros de page */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum, idx) =>
          pageNum === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`min-w-9 h-9 px-3 rounded-lg text-sm font-medium transition-colors
                ${page === pageNum
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border hover:bg-accent'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {pageNum}
            </button>
          )
        )}
      </div>

      {/* Bouton suivant */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasMore || isLoading}
        className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Page suivante"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Indicateur de chargement */}
      {isLoading && (
        <Loader2 className="w-4 h-4 ml-2 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

export function SearchInterface({ initialData }: SearchInterfaceProps) {
  const [results, setResults] = useState(initialData);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(initialData.pagination?.page ?? 1);
  const [isLoading, setIsLoading] = useState(false);
  const [hideInsufficient, setHideInsufficient] = useState(false);

  // Fonction de recherche centralisée
  const performSearch = useCallback(async (
    searchFilters: SearchFilters,
    page: number = 1
  ) => {
    setIsLoading(true);

    try {
      // Don't send yardageFilter to API (it's client-side only)
      const { yardageFilter, ...apiFilters } = searchFilters;

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...apiFilters,
          page,
          limit: 24,
        }),
      });
      const data = await response.json();
      setResults(data);
      setCurrentPage(page);
      
      // Scroll vers le haut des résultats lors du changement de page
      if (page !== currentPage) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

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
        textile.quantity_value ?? 0,
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
    setFilters(newFilters);
    // Reset to page 1 when filters change
    await performSearch(newFilters, 1);
  };

  const handlePageChange = async (page: number) => {
    await performSearch(filters, page);
  };

  const insufficientCount = textilesWithSufficiency.filter(
    t => t.yardageSufficiency && !t.yardageSufficiency.sufficient
  ).length;

  // Pagination metadata (avec fallback pour compatibilité)
  const pagination: PaginationMeta = results.pagination ?? {
    page: 1,
    limit: 24,
    totalPages: 1,
    hasMore: false,
  };

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
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.total} résultat{results.total > 1 ? 's' : ''}
              {pagination.totalPages > 1 && (
                <span className="ml-1">
                  — Page {pagination.page} sur {pagination.totalPages}
                </span>
              )}
              {filters.yardageFilter?.active && hideInsufficient && (
                <span className="ml-2 text-blue-600">
                  ({insufficientCount} masqués car insuffisants)
                </span>
              )}
            </p>
          </div>

          <TextileGrid
            textiles={displayedTextiles}
            isLoading={isLoading}
          />

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
}
