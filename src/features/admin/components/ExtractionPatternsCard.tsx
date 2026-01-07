// src/features/admin/components/ExtractionPatternsCard.tsx
'use client';

import { useState } from 'react';
import { 
  Ruler, 
  Move, 
  Scale, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  Info,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ExtractionPattern, ExtractionPatterns } from '../domain/types';

// ============================================================================
// TYPES
// ============================================================================

interface ExtractionPatternsCardProps {
  extractionPatterns: ExtractionPatterns | null;
  onTogglePattern?: (patternId: string, enabled: boolean) => void;
  readOnly?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

const FIELD_CONFIG = {
  length: {
    label: 'Longueur',
    icon: Ruler,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Longueur disponible du tissu (ex: 3M = 3 mètres)',
  },
  width: {
    label: 'Largeur',
    icon: Move,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Largeur/laize du tissu (ex: 140cm)',
  },
  weight: {
    label: 'Poids',
    icon: Scale,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Grammage du tissu (ex: 250g/m²)',
  },
  composition: {
    label: 'Composition',
    icon: Info,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Composition du tissu (ex: 100% coton)',
  },
};

const SOURCE_LABELS: Record<string, string> = {
  tags: 'Tags',
  title: 'Titre',
  body_html: 'Description',
  variant: 'Variant Shopify',
};

function formatCoverage(coverage: number): string {
  return `${Math.round(coverage * 100)}%`;
}

function getCoverageColor(coverage: number): string {
  if (coverage >= 0.8) return 'text-green-600';
  if (coverage >= 0.5) return 'text-yellow-600';
  return 'text-red-600';
}

// ============================================================================
// PATTERN ROW COMPONENT
// ============================================================================

function PatternRow({ 
  pattern, 
  onToggle, 
  readOnly 
}: { 
  pattern: ExtractionPattern; 
  onToggle?: (enabled: boolean) => void;
  readOnly?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = FIELD_CONFIG[pattern.field];
  const Icon = config?.icon || Info;

  return (
    <div className={`border rounded-lg p-4 ${pattern.enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
         <div className={`p-2 rounded-lg ${config?.bgColor || 'bg-gray-50'} dark:bg-gray-700`}>
            <Icon className={`h-4 w-4 ${config?.color || 'text-gray-600'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{config?.label || pattern.field}</span>
              <Badge variant="outline" className="text-xs">
                {SOURCE_LABELS[pattern.source] || pattern.source}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pattern.matchCount}/{pattern.totalTested} produits matchés
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Coverage */}
          <div className="text-right">
            <span className={`text-lg font-semibold ${getCoverageColor(pattern.coverage)}`}>
              {formatCoverage(pattern.coverage)}
            </span>
            <p className="text-xs text-muted-foreground">couverture</p>
          </div>

          {/* Toggle */}
          {!readOnly && onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(!pattern.enabled)}
              className="p-1"
            >
              {pattern.enabled ? (
                <ToggleRight className="h-6 w-6 text-green-600" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
            </Button>
          )}

          {/* Expand */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="p-1"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {/* Pattern Regex */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Pattern (Regex)</p>
            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded block overflow-x-auto">
              {pattern.pattern}
            </code>
          </div>

          {/* Unit */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Unité par défaut</p>
            <Badge variant="secondary">{pattern.unit}</Badge>
          </div>

          {/* Examples */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Exemples détectés</p>
            <div className="space-y-2">
              {pattern.examples.slice(0, 5).map((example, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground truncate max-w-50" title={example.productTitle}>
                    {example.productTitle}
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{example.raw}</code>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium">{example.extracted} {pattern.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ExtractionPatternsCard({ 
  extractionPatterns, 
  onTogglePattern,
  readOnly = true 
}: ExtractionPatternsCardProps) {
  if (!extractionPatterns || extractionPatterns.patterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Patterns d'Extraction
          </CardTitle>
          <CardDescription>
            Aucun pattern détecté. Lancez un discovery pour analyser les produits.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const enabledPatterns = extractionPatterns.patterns.filter(p => p.enabled);
  const disabledPatterns = extractionPatterns.patterns.filter(p => !p.enabled);

  // Group by field
  const patternsByField = extractionPatterns.patterns.reduce((acc, pattern) => {
    if (!acc[pattern.field]) acc[pattern.field] = [];
    acc[pattern.field].push(pattern);
    return acc;
  }, {} as Record<string, ExtractionPattern[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Patterns d'Extraction
            </CardTitle>
            <CardDescription>
              {enabledPatterns.length} pattern{enabledPatterns.length > 1 ? 's' : ''} actif{enabledPatterns.length > 1 ? 's' : ''} sur {extractionPatterns.patterns.length} détecté{extractionPatterns.patterns.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Analysé le {new Date(extractionPatterns.analyzedAt).toLocaleDateString('fr-FR')}</p>
            <p>{extractionPatterns.productsAnalyzed} produits analysés</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary badges */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(patternsByField).map(([field, patterns]) => {
            const enabledCount = patterns.filter(p => p.enabled).length;
            const config = FIELD_CONFIG[field as keyof typeof FIELD_CONFIG];
            return (
              <Badge 
                key={field} 
                variant={enabledCount > 0 ? 'default' : 'secondary'}
                className="gap-1"
              >
                {config?.label || field}
                {enabledCount > 0 && <Check className="h-3 w-3" />}
              </Badge>
            );
          })}
        </div>

        {/* Pattern list */}
        <div className="space-y-3">
          {extractionPatterns.patterns.map(pattern => (
            <PatternRow
              key={pattern.id}
              pattern={pattern}
              onToggle={onTogglePattern ? (enabled) => onTogglePattern(pattern.id, enabled) : undefined}
              readOnly={readOnly}
            />
          ))}
        </div>

        {/* Info box */}
       <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
  <p className="text-blue-800 dark:text-blue-200">
            <strong>Note :</strong> Les patterns avec une couverture {'>'} 30% sont activés automatiquement.
            Le scraping utilisera uniquement les patterns activés pour extraire les dimensions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
