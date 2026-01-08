// src/components/search/Filters.tsx

'use client';

import { useState } from 'react';
import { Filter, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import type { AvailableFilters, SearchFilters, YardageSearchFilter } from '@/features/search/domain/types';
import { PatternImportModal } from '@/features/pattern/components/PatternImportModal';
import { YardageFilterBadge } from './YardageFilterBadge';

// Traductions des noms de catégories
const categoryLabels: Record<string, string> = {
  fiber: 'Matière',
  color: 'Couleur',
  pattern: 'Motif',
  weave: 'Tissage',
};

interface FiltersProps {
  availableFilters: AvailableFilters;
  currentFilters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export function Filters({ availableFilters, currentFilters, onFiltersChange }: FiltersProps) {
  const [showPatternModal, setShowPatternModal] = useState(false);

  // Handler générique pour toggle une valeur dans une catégorie
  const handleCategoryToggle = (categorySlug: string, value: string) => {
    const currentCategoryFilters = currentFilters.categoryFilters || {};
    const currentValues = currentCategoryFilters[categorySlug] || [];
    
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    const updatedCategoryFilters = {
      ...currentCategoryFilters,
      [categorySlug]: updatedValues,
    };

    // Nettoyer les catégories vides
    if (updatedValues.length === 0) {
      delete updatedCategoryFilters[categorySlug];
    }

    onFiltersChange({ 
      ...currentFilters, 
      categoryFilters: updatedCategoryFilters,
    });
  };

  const handleYardageFilterApply = (filter: YardageSearchFilter) => {
    onFiltersChange({ ...currentFilters, yardageFilter: filter });
  };

  const handleYardageFilterRemove = () => {
    onFiltersChange({ ...currentFilters, yardageFilter: null });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = 
    Object.values(currentFilters.categoryFilters || {}).some(values => values.length > 0) ||
    currentFilters.yardageFilter?.active;

  // Vérifier si une valeur est sélectionnée
  const isValueSelected = (categorySlug: string, value: string): boolean => {
    return currentFilters.categoryFilters?.[categorySlug]?.includes(value) || false;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Réinitialiser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Yardage Filter Badge */}
          {currentFilters.yardageFilter?.active && (
            <YardageFilterBadge
              filter={currentFilters.yardageFilter}
              onRemove={handleYardageFilterRemove}
              onEdit={() => setShowPatternModal(true)}
            />
          )}

          {/* Pattern Import Button */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowPatternModal(true)}
          >
            <Calculator className="w-4 h-4 mr-2" />
            {currentFilters.yardageFilter?.active
              ? 'Modifier le patron'
              : "📐 J'ai un patron"}
          </Button>

          <Separator />

          {/* Dynamic Categories */}
          {availableFilters.categories?.map((category, index) => (
            <div key={category.slug}>
              {index > 0 && <Separator className="mb-6" />}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">
                  {categoryLabels[category.slug] || category.name}
                </h3>
                <div className="space-y-2">
                  {category.values.map((value) => (
                    <div key={`${category.slug}-${value}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${category.slug}-${value}`}
                        checked={isValueSelected(category.slug, value)}
                        onCheckedChange={() => handleCategoryToggle(category.slug, value)}
                      />
                      <Label
                        htmlFor={`${category.slug}-${value}`}
                        className="text-sm font-normal cursor-pointer capitalize"
                      >
                        {value}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pattern Import Modal */}
      <PatternImportModal
        open={showPatternModal}
        onClose={() => setShowPatternModal(false)}
        context="search"
        onApplySearchFilter={handleYardageFilterApply}
      />
    </>
  );
}
