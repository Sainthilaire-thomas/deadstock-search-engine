// src/features/boards/components/AutoArrangeDialog.tsx
// Sprint P2 - Dialog de confirmation pour l'auto-arrangement

'use client';

import { useState, useMemo } from 'react';
import { LayoutGrid, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import type { BoardElement, BoardZone } from '../domain/types';
import {
  getArrangePreview,
  countMovableItems,
  DEFAULT_ARRANGE_OPTIONS,
  type PhaseId,
  type ArrangeOptions,
} from '../utils/autoArrange';

// ============================================
// TYPES
// ============================================

export interface AutoArrangeDialogResult extends Partial<ArrangeOptions> {
  showPhaseColumns: boolean;
}

interface AutoArrangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: AutoArrangeDialogResult) => void;
  elements: BoardElement[];
  zones: BoardZone[];
  initialShowPhaseColumns?: boolean;
}

// ============================================
// PHASE ICON/COLOR
// ============================================

const PHASE_COLORS: Record<PhaseId, string> = {
  mood: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  conception: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  execution: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

const PHASE_ICONS: Record<PhaseId, string> = {
  mood: '🎨',
  conception: '📐',
  execution: '🚀',
};

// ============================================
// COMPONENT
// ============================================

export function AutoArrangeDialog({
  isOpen,
  onClose,
  onConfirm,
  elements,
  zones,
  initialShowPhaseColumns = true,
}: AutoArrangeDialogProps) {
  const [spacing, setSpacing] = useState(DEFAULT_ARRANGE_OPTIONS.spacing);
  const [phaseSpacing, setPhaseSpacing] = useState(DEFAULT_ARRANGE_OPTIONS.phaseSpacing);
  const [showPhaseColumns, setShowPhaseColumns] = useState(initialShowPhaseColumns);

  // Calculer l'aperçu
  const preview = useMemo(
    () => getArrangePreview(elements, zones),
    [elements, zones]
  );

  const counts = useMemo(
    () => countMovableItems(elements, zones),
    [elements, zones]
  );

  const handleConfirm = () => {
    onConfirm({ spacing, phaseSpacing, showPhaseColumns });
    onClose();
  };

  // Rien à ranger ?
  const nothingToArrange = counts.total === 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-gray-500" />
            Ranger automatiquement
          </DialogTitle>
          <DialogDescription>
            Les éléments seront organisés par phase : Mood → Conception → Exécution
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {nothingToArrange ? (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Aucun élément libre à ranger. Les éléments dans des zones ne sont pas déplacés.
              </p>
            </div>
          ) : (
            <>
              {/* Aperçu par phase */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Aperçu
                </Label>
                <div className="space-y-2">
                  {preview.map(({ phase, label, count }) => (
                    <div
                      key={phase}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg ${PHASE_COLORS[phase]}`}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <span>{PHASE_ICONS[phase]}</span>
                        {label}
                      </span>
                      <span className="text-sm">
                        {count} {phase === 'execution' ? (count > 1 ? 'zones' : 'zone') : (count > 1 ? 'éléments' : 'élément')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slider espacement vertical (entre éléments) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="spacing" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Espacement vertical
                  </Label>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {spacing}px
                  </span>
                </div>
                <Slider
                  id="spacing"
                  min={12}
                  max={48}
                  step={4}
                  value={[spacing]}
                  onValueChange={([value]) => setSpacing(value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Compact</span>
                  <span>Aéré</span>
                </div>
              </div>

              {/* Slider espacement horizontal (entre phases) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phaseSpacing" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Espacement entre phases
                  </Label>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {phaseSpacing}px
                  </span>
                </div>
                <Slider
                  id="phaseSpacing"
                  min={50}
                  max={200}
                  step={10}
                  value={[phaseSpacing]}
                  onValueChange={([value]) => setPhaseSpacing(value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Serré</span>
                  <span>Large</span>
                </div>
              </div>

              {/* Checkbox colonnes de phase */}
              <div className="flex items-center space-x-3 pt-2">
                <Checkbox
                  id="showPhaseColumns"
                  checked={showPhaseColumns}
                  onCheckedChange={(checked) => setShowPhaseColumns(checked === true)}
                />
                <Label 
                  htmlFor="showPhaseColumns" 
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Afficher les colonnes de phase (Mode Projet)
                </Label>
              </div>

              {/* Info */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Les éléments déjà placés dans une zone resteront à leur position relative.
              </p>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={nothingToArrange}
          >
            Ranger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
