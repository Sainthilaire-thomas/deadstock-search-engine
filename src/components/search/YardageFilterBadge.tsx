// src/components/search/YardageFilterBadge.tsx

'use client';

import { Calculator, X, Edit2 } from 'lucide-react';
import type { YardageSearchFilter } from '@/features/search/domain/types';
import { GARMENT_LABELS } from '@/features/pattern/domain/types';

interface YardageFilterBadgeProps {
  filter: YardageSearchFilter;
  onRemove: () => void;
  onEdit: () => void;
}

export function YardageFilterBadge({ filter, onRemove, onEdit }: YardageFilterBadgeProps) {
  const garmentLabel = GARMENT_LABELS[filter.garmentType] || filter.garmentType;
  
  // Formater les métrages pour affichage compact
  const yardageSummary = Object.entries(filter.yardageByWidth)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([width, yardage]) => `${width}cm→${yardage.toFixed(1)}m`)
    .join(' | ');

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <Calculator className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              📐 Filtre patron : {filter.patternName || garmentLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              Taille {filter.size} • Quantité suffisante requise
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono">
              {yardageSummary}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
            title="Retirer le filtre"
          >
            <X className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
