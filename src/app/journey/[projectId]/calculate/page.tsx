// src/app/journey/[projectId]/calculate/page.tsx
// Étape 4 : Calculer le métrage nécessaire

'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Info, Check } from 'lucide-react';
import { useProject } from '@/features/journey/context/ProjectContext';
import { FABRIC_WIDTHS, MARGIN_PERCENTAGES } from '@/features/journey/config/garments';
import { cn } from '@/lib/utils';
import type { FabricModifiers, GarmentType } from '@/features/journey/domain/types';

const garmentLabels: Record<GarmentType, string> = {
  shirt: 'Chemise',
  blouse: 'Blouse',
  tshirt: 'T-shirt',
  top: 'Top',
  sweater: 'Pull',
  vest: 'Gilet',
  pants: 'Pantalon',
  shorts: 'Short',
  skirt: 'Jupe',
  dress: 'Robe',
  jumpsuit: 'Combinaison',
  romper: 'Combishort',
  blazer: 'Blazer',
  jacket: 'Veste',
  coat: 'Manteau',
  trench: 'Trench',
  scarf: 'Écharpe',
  bag: 'Sac',
  belt: 'Ceinture',
  bowtie: 'Nœud papillon',
};

export default function CalculatePage() {
  const {
    project,
    isLoading,
    isSaving,
    updateCalculationParams,
    getCalculationResult,
    saveCalculation,
    goToStep,
  } = useProject();

  const [localFabricWidth, setLocalFabricWidth] = useState(project?.fabricWidth ?? 140);
  const [localMarginPercent, setLocalMarginPercent] = useState(project?.marginPercent ?? 10);
  const [localModifiers, setLocalModifiers] = useState<FabricModifiers>(
    project?.fabricModifiers ?? {
      directional: false,
      patternMatch: false,
      velvet: false,
      stretch: false,
    }
  );

  // Update context when local state changes
  useEffect(() => {
    updateCalculationParams({
      fabricWidth: localFabricWidth,
      marginPercent: localMarginPercent,
      fabricModifiers: localModifiers,
    });
  }, [localFabricWidth, localMarginPercent, localModifiers]);

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const garments = project.garments ?? [];
  const result = getCalculationResult();

  const handleSaveAndContinue = async () => {
    await saveCalculation();
    goToStep('sourcing');
  };

  const toggleModifier = (key: keyof FabricModifiers) => {
    setLocalModifiers(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (garments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            Vous devez d'abord ajouter des vêtements à votre projet
          </p>
          <button
            onClick={() => goToStep('design')}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors",
              "font-medium text-sm"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au Design
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
            Étape 4
          </span>
          <span>sur 9</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Calcul du métrage</h1>
        <p className="text-muted-foreground mt-1">
          Configurez les paramètres pour calculer vos besoins en tissu
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Paramètres */}
        <div className="space-y-6">
          {/* Largeur du tissu */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Largeur du tissu
            </label>
            <select
              value={localFabricWidth}
              onChange={(e) => setLocalFabricWidth(parseInt(e.target.value))}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg",
                "bg-background border border-input",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            >
              {FABRIC_WIDTHS.map((fw) => (
                <option key={fw.value} value={fw.value}>{fw.label}</option>
              ))}
            </select>
          </div>

          {/* Marge de sécurité */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Marge de sécurité
            </label>
            <select
              value={localMarginPercent}
              onChange={(e) => setLocalMarginPercent(parseInt(e.target.value))}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg",
                "bg-background border border-input",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            >
              {MARGIN_PERCENTAGES.map((mp) => (
                <option key={mp.value} value={mp.value}>{mp.label}</option>
              ))}
            </select>
          </div>

          {/* Caractéristiques du tissu */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Caractéristiques du tissu
            </label>
            <div className="space-y-2">
              {[
                { key: 'directional' as const, label: 'Tissu à sens', info: '+10%', description: 'Motif directionnel ou poils' },
                { key: 'patternMatch' as const, label: 'Raccord motif', info: '+20%', description: 'Carreaux, rayures à raccorder' },
                { key: 'velvet' as const, label: 'Velours/Velvet', info: '+10%', description: 'Nécessite coupe dans le même sens' },
                { key: 'stretch' as const, label: 'Tissu stretch', info: '-10%', description: 'Jersey, lycra, élasthanne' },
              ].map(({ key, label, info, description }) => (
                <label
                  key={key}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    localModifiers[key]
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-secondary/50 border border-transparent hover:bg-secondary"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={localModifiers[key]}
                    onChange={() => toggleModifier(key)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        key === 'stretch' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                      )}>
                        {info}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div>
          <div className="sticky top-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Résultat du calcul
              </h2>

              {result ? (
                <>
                  {/* Total recommandé */}
                  <div className="text-center py-6 border-b border-border mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Métrage recommandé</p>
                    <p className="text-4xl font-bold text-primary">
                      {result.recommendedYardage}
                      <span className="text-lg font-normal text-muted-foreground ml-1">m</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      (arrondi au 0.5m supérieur)
                    </p>
                  </div>

                  {/* Détail par vêtement */}
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Détail par vêtement</p>
                    {result.breakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-1">
                        <span className="text-foreground">
                          {garmentLabels[item.garmentType]} ({item.size}) × {item.quantity}
                        </span>
                        <span className="text-muted-foreground">{item.totalForQuantity.toFixed(2)}m</span>
                      </div>
                    ))}
                  </div>

                  {/* Sous-total et ajustements */}
                  <div className="border-t border-border pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="text-foreground">{result.subtotal.toFixed(2)}m</span>
                    </div>
                    {result.fabricWidthAdjustment !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ajustement largeur</span>
                        <span className={result.fabricWidthAdjustment > 0 ? "text-orange-600" : "text-green-600"}>
                          {result.fabricWidthAdjustment > 0 ? '+' : ''}{result.fabricWidthAdjustment.toFixed(2)}m
                        </span>
                      </div>
                    )}
                    {result.modifiersAmount !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Caractéristiques tissu</span>
                        <span className={result.modifiersAmount > 0 ? "text-orange-600" : "text-green-600"}>
                          {result.modifiersAmount > 0 ? '+' : ''}{result.modifiersAmount.toFixed(2)}m
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Marge ({localMarginPercent}%)</span>
                      <span className="text-orange-600">+{result.marginAmount.toFixed(2)}m</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-border">
                      <span className="text-foreground">Total calculé</span>
                      <span className="text-foreground">{result.totalYardage.toFixed(2)}m</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Ajoutez des vêtements pour voir le calcul
                </p>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50 flex gap-2">
              <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Ces calculs sont des estimations basées sur des patrons standards. 
                Les besoins réels peuvent varier selon le patron utilisé.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
        <button
          onClick={() => goToStep('design')}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <button
          onClick={handleSaveAndContinue}
          disabled={isSaving || !result}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "font-medium text-sm",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Enregistrer et chercher des tissus
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
