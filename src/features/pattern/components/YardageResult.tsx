// src/features/pattern/components/YardageResult.tsx

'use client';

import { 
  YardageCalculationResult, 
  PatternConfig,
  GARMENT_LABELS 
} from '../domain/types';

interface YardageResultProps {
  result: YardageCalculationResult;
  config: PatternConfig;
  patternName?: string | null;
  onAddToBoard?: () => void;
  onSearchFabrics?: () => void;
}

const PRECISION_LABELS = {
  1: { label: 'Extrait du patron', icon: '✅', color: 'text-green-600' },
  2: { label: 'Estimation précise', icon: '📐', color: 'text-blue-600' },
  3: { label: 'Estimation générique', icon: '⚠️', color: 'text-amber-600' },
};

export function YardageResult({ 
  result, 
  config,
  patternName,
  onAddToBoard,
  onSearchFabrics,
}: YardageResultProps) {
  const precision = PRECISION_LABELS[result.precisionLevel];
  const garmentLabel = GARMENT_LABELS[result.garmentType] || result.garmentType;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b border-border">
        <h3 className="text-lg font-semibold">
          {patternName || garmentLabel}
        </h3>
        <p className="text-sm text-muted-foreground">
          Taille {result.size} • ×{result.quantity}
        </p>
      </div>

      {/* Résultat */}
      {result.mode === 'single_width' && result.singleResult ? (
        // Mode largeur connue
        <div className="text-center space-y-4">
          <div className="p-6 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              Métrage nécessaire (tissu {result.singleResult.fabricWidthCm}cm)
            </p>
            <p className="text-4xl font-bold">
              {result.singleResult.withModifiers.toFixed(2)} m
            </p>
            <p className="text-lg text-muted-foreground mt-2">
              Recommandé : <span className="font-semibold text-foreground">{result.singleResult.recommended} m</span>
            </p>
          </div>
        </div>
      ) : (
        // Mode multi-largeurs
        <div className="space-y-4">
          <p className="text-sm font-medium text-center">Métrage selon la largeur du tissu</p>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Largeur</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Métrage</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Recommandé</th>
                </tr>
              </thead>
              <tbody>
                {result.multiResults.map((row, index) => (
                  <tr 
                    key={row.fabricWidthCm}
                    className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                  >
                    <td className="px-4 py-3 text-sm">{row.fabricWidthCm} cm</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {row.withModifiers.toFixed(2)} m
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      {row.recommended} m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Precision indicator */}
      <div className={`flex items-center justify-center gap-2 text-sm ${precision.color}`}>
        <span>{precision.icon}</span>
        <span>{precision.label}</span>
      </div>

      {/* Modifiers applied */}
      {(config.modifiers.directional || config.modifiers.patternMatching || config.modifiers.safetyMarginPercent > 0) && (
        <div className="text-xs text-muted-foreground text-center space-x-2">
          {config.modifiers.directional && <span>• Directionnel +10%</span>}
          {config.modifiers.patternMatching && <span>• Raccord +20%</span>}
          {config.modifiers.safetyMarginPercent > 0 && (
            <span>• Marge +{config.modifiers.safetyMarginPercent}%</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-4">
        {onSearchFabrics && (
          <button
            onClick={onSearchFabrics}
            className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            Chercher des tissus compatibles
          </button>
        )}
        {onAddToBoard && (
          <button
            onClick={onAddToBoard}
            className="w-full py-3 border border-border rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span>
            Ajouter au board
          </button>
        )}
      </div>
    </div>
  );
}
