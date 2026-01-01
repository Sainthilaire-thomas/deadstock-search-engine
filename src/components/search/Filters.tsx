'use client';

import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import type { AvailableFilters, SearchFilters } from '@/features/search/domain/types';

interface FiltersProps {
  availableFilters: AvailableFilters;
  currentFilters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export function Filters({ availableFilters, currentFilters, onFiltersChange }: FiltersProps) {
  const handleMaterialToggle = (material: string) => {
    const current = currentFilters.materials || [];
    const updated = current.includes(material)
      ? current.filter(m => m !== material)
      : [...current, material];
    
    onFiltersChange({ ...currentFilters, materials: updated });
  };

  const handleColorToggle = (color: string) => {
    const current = currentFilters.colors || [];
    const updated = current.includes(color)
      ? current.filter(c => c !== color)
      : [...current, color];
    
    onFiltersChange({ ...currentFilters, colors: updated });
  };

  const handlePatternToggle = (pattern: string) => {
    const current = currentFilters.patterns || [];
    const updated = current.includes(pattern)
      ? current.filter(p => p !== pattern)
      : [...current, pattern];
    
    onFiltersChange({ ...currentFilters, patterns: updated });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = 
    (currentFilters.materials?.length || 0) > 0 ||
    (currentFilters.colors?.length || 0) > 0 ||
    (currentFilters.patterns?.length || 0) > 0;

  return (
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
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Matière</h3>
          <div className="space-y-2">
            {availableFilters.materials.map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={`material-${material}`}
                  checked={currentFilters.materials?.includes(material)}
                  onCheckedChange={() => handleMaterialToggle(material)}
                />
                <Label
                  htmlFor={`material-${material}`}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {material}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-medium text-sm">Couleur</h3>
          <div className="space-y-2">
            {availableFilters.colors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={currentFilters.colors?.includes(color)}
                  onCheckedChange={() => handleColorToggle(color)}
                />
                <Label
                  htmlFor={`color-${color}`}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {color}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-medium text-sm">Motif</h3>
          <div className="space-y-2">
            {availableFilters.patterns.map((pattern) => (
              <div key={pattern} className="flex items-center space-x-2">
                <Checkbox
                  id={`pattern-${pattern}`}
                  checked={currentFilters.patterns?.includes(pattern)}
                  onCheckedChange={() => handlePatternToggle(pattern)}
                />
                <Label
                  htmlFor={`pattern-${pattern}`}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {pattern}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
