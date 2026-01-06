// src/features/pattern/components/PatternImportModal.tsx

'use client';

import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { 
  PatternConfig, 
  PatternAnalysisResult,
  YardageCalculationResult,
  PatternCalculationElementData,
  YardageSearchFilter,
  GARMENT_LABELS,
} from '../domain/types';
import { calculateYardage } from '../application/calculateYardage';
import { PatternConfigForm } from './PatternConfigForm';
import { ManualPatternForm } from './ManualPatternForm';
import { YardageResult } from './YardageResult';

// ============================================
// TYPES
// ============================================

type ModalStep = 'choice' | 'manual' | 'upload' | 'analysis' | 'config' | 'result';
type ModalContext = 'board' | 'search' | 'standalone';

interface PatternImportModalProps {
  open: boolean;
  onClose: () => void;
  context: ModalContext;
  
  // Callbacks selon contexte
  onAddToBoard?: (data: PatternCalculationElementData) => void;
  onApplySearchFilter?: (filter: YardageSearchFilter) => void;
}

// ============================================
// COMPONENT
// ============================================

export function PatternImportModal({
  open,
  onClose,
  context,
  onAddToBoard,
  onApplySearchFilter,
}: PatternImportModalProps) {
  // State
  const [step, setStep] = useState<ModalStep>('choice');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PatternAnalysisResult | null>(null);
  const [config, setConfig] = useState<PatternConfig | null>(null);
  const [result, setResult] = useState<YardageCalculationResult | null>(null);
  const [patternName, setPatternName] = useState<string | null>(null);

  // Reset on close
  const handleClose = useCallback(() => {
    setStep('choice');
    setIsLoading(false);
    setAnalysis(null);
    setConfig(null);
    setResult(null);
    setPatternName(null);
    onClose();
  }, [onClose]);

  // Handle manual form submit
  const handleManualSubmit = useCallback((formConfig: PatternConfig) => {
    setIsLoading(true);
    setConfig(formConfig);

    // Calcul
    const calculationResult = calculateYardage({
      config: formConfig,
    });

    setResult(calculationResult);
    setPatternName(GARMENT_LABELS[formConfig.garmentType]);
    setStep('result');
    setIsLoading(false);
  }, []);

  // Handle config form submit (after analysis)
  const handleConfigSubmit = useCallback((formConfig: PatternConfig) => {
    if (!analysis) return;

    setIsLoading(true);
    setConfig(formConfig);

    // Calcul avec analyse
    const calculationResult = calculateYardage({
      analysis,
      config: formConfig,
    });

    setResult(calculationResult);
    setStep('result');
    setIsLoading(false);
  }, [analysis]);

  // Add to board
  const handleAddToBoard = useCallback(() => {
    if (!result || !config || !onAddToBoard) return;

    const elementData: PatternCalculationElementData = {
      source: analysis ? 'pattern_import' : 'manual',
      patternName: patternName || GARMENT_LABELS[result.garmentType],
      garmentType: result.garmentType,
      selectedSize: result.size,
      quantity: result.quantity,
      modifiers: config.modifiers,
      precisionLevel: result.precisionLevel,
      yardageByWidth: result.yardageByWidth,
    };

    onAddToBoard(elementData);
    handleClose();
  }, [result, config, analysis, patternName, onAddToBoard, handleClose]);

  // Apply search filter
  const handleSearchFabrics = useCallback(() => {
    if (!result || !onApplySearchFilter) return;

    const filter: YardageSearchFilter = {
      active: true,
      patternName: patternName || GARMENT_LABELS[result.garmentType],
      garmentType: result.garmentType,
      size: result.size,
      yardageByWidth: result.yardageByWidth,
    };

    onApplySearchFilter(filter);
    handleClose();
  }, [result, patternName, onApplySearchFilter, handleClose]);

  // Don't render if closed
  if (!open) return null;

  // Title based on step
  const getTitle = () => {
    switch (step) {
      case 'choice': return 'Calculer le métrage';
      case 'manual': return 'Saisie manuelle';
      case 'upload': return 'Importer un patron';
      case 'analysis': return 'Analyse en cours...';
      case 'config': return 'Configurer le calcul';
      case 'result': return 'Résultat';
      default: return 'Patron';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{getTitle()}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step: Choice */}
          {step === 'choice' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-6">
                Comment souhaitez-vous renseigner votre patron ?
              </p>
              
              {/* Option: Upload (future) */}
              <button
                onClick={() => setStep('upload')}
                disabled
                className="w-full p-4 border border-border rounded-lg hover:border-primary transition-colors text-left opacity-50 cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-medium">Importer un fichier</p>
                    <p className="text-sm text-muted-foreground">
                      PDF ou image du patron (bientôt disponible)
                    </p>
                  </div>
                </div>
              </button>

              {/* Option: Manual */}
              <button
                onClick={() => setStep('manual')}
                className="w-full p-4 border border-border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✍️</span>
                  <div>
                    <p className="font-medium">Saisie manuelle</p>
                    <p className="text-sm text-muted-foreground">
                      Indiquer le type de vêtement et la taille
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step: Manual entry */}
          {step === 'manual' && (
            <div>
              <button
                onClick={() => setStep('choice')}
                className="text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                ← Retour
              </button>
              <ManualPatternForm
                onSubmit={handleManualSubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Step: Upload (placeholder) */}
          {step === 'upload' && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                L'import de fichiers sera disponible prochainement.
              </p>
              <button
                onClick={() => setStep('choice')}
                className="mt-4 text-sm text-primary hover:underline"
              >
                ← Retour
              </button>
            </div>
          )}

          {/* Step: Config (after analysis) */}
          {step === 'config' && analysis && (
            <div>
              <button
                onClick={() => setStep('choice')}
                className="text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                ← Retour
              </button>
              <PatternConfigForm
                analysis={analysis}
                onSubmit={handleConfigSubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Step: Result */}
          {step === 'result' && result && config && (
            <div>
              <button
                onClick={() => setStep('manual')}
                className="text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                ← Modifier
              </button>
              <YardageResult
                result={result}
                config={config}
                patternName={patternName}
                onAddToBoard={context === 'board' || context === 'standalone' ? handleAddToBoard : undefined}
                onSearchFabrics={context === 'search' || context === 'standalone' ? handleSearchFabrics : undefined}
              />
              
              {/* Both actions for standalone */}
              {context === 'standalone' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Vous pouvez ajouter ce calcul à un board et/ou chercher des tissus
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
