'use client';

import { useState } from 'react';
import type { SearchResult, SearchFilters } from '@/features/search/domain/types';
import { SearchBar } from './SearchBar';
import { Filters } from './Filters';
import { TextileGrid } from './TextileGrid';

interface SearchInterfaceProps {
  initialData: SearchResult;
}

export function SearchInterface({ initialData }: SearchInterfaceProps) {
  const [results, setResults] = useState(initialData);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (newFilters: SearchFilters) => {
    setIsLoading(true);
    setFilters(newFilters);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFilters),
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
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
        </aside>
        
        <main className="lg:col-span-3">
          <div className="mb-4 text-sm text-muted-foreground">
            {results.total} résultat{results.total > 1 ? 's' : ''}
          </div>
          
          <TextileGrid 
            textiles={results.textiles} 
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
}
