// src/features/pattern/components/PatternCalculationCard.tsx

'use client';

import { Calculator, Search, Link2 } from 'lucide-react';
import type { PatternCalculationElementData } from '../domain/types';
import { GARMENT_LABELS } from '../domain/types';

interface PatternCalculationCardProps {
  data: PatternCalculationElementData;
  onSearchFabrics?: () => void;
}

const PRECISION_INDICATORS = {
  1: { label: 'Précis', className: 'bg-green-100 text-green-700' },
  2: { label: 'Estimé', className: 'bg-blue-100 text-blue-700' },
  3: { label: 'Générique', className: 'bg-amber-100 text-amber-700' },
};

export function PatternCalculationCard({ data, onSearchFabrics }: PatternCalculationCardProps) {
  const precision = PRECISION_INDICATORS[data.precisionLevel];
  const garmentLabel = GARMENT_LABELS[data.garmentType] || data.garmentType;
  
  // Trier les largeurs
  const sortedWidths = Object.entries(data.yardageByWidth)
    .sort(([a], [b]) => parseInt(a) - parseInt(b));

  return (
    <div className="w-60 bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950 border-b border-border flex items-center gap-2">
        <Calculator className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-sm truncate flex-1">
          {data.patternName || garmentLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Taille {data.selectedSize} • ×{data.quantity}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${precision.className}`}>
            {precision.label}
          </span>
        </div>

        {/* Yardage table */}
        <div className="space-y-1">
          {sortedWidths.map(([width, yardage]) => (
            <div 
              key={width}
              className="flex items-center justify-between text-sm py-1 px-2 rounded bg-muted/50"
            >
              <span className="text-muted-foreground">{width}cm</span>
              <span className="font-mono font-medium">{yardage.toFixed(2)}m</span>
            </div>
          ))}
        </div>

        {/* Linked textile indicator */}
        {data.linkedTextileId && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Link2 className="w-3 h-3" />
            <span>Tissu lié</span>
          </div>
        )}

        {/* Actions */}
        {onSearchFabrics && !data.linkedTextileId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSearchFabrics();
            }}
            className="w-full py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors flex items-center justify-center gap-1"
          >
            <Search className="w-3 h-3" />
            Chercher tissus
          </button>
        )}
      </div>
    </div>
  );
}
