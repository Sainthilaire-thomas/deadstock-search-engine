// src/features/boards/components/BoardToolPanel.tsx

'use client';

import { useState } from 'react';
import { StickyNote, Palette, Calculator, Image, Trash2, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBoard } from '../context/BoardContext';
import { ELEMENT_TYPE_LABELS } from '../domain/types';
import { FavoritesSelector } from './FavoritesSelector';
import { PatternImportModal } from '@/features/pattern/components/PatternImportModal';

import type { PatternCalculationElementData } from '@/features/pattern/domain/types';
import type { CalculationElementData } from '../domain/types';
export function BoardToolPanel() {
  const {
    elements,
    zones,
    selectedElementIds,
    selectedZoneId,
    addNote,
    addPalette,
    addZone,
    addElement,
    removeElement,
    removeZone,
    selectZone,
    isLoading
  } = useBoard();

  const [showZoneInput, setShowZoneInput] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [showPatternModal, setShowPatternModal] = useState(false);

  // Éléments sélectionnés pour affichage
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));

  const handleAddNote = async () => {
    const position = {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    };
    await addNote(position);
  };

  const handleAddPalette = async () => {
    const defaultColors = ['#1E3A5F', '#8B4513', '#FFFFFF', '#F4D03F', '#2ECC71'];
    const position = {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    };
    await addPalette(defaultColors, position);
  };

  const handleAddZone = async () => {
    const position = {
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
    };
    await addZone(zoneName || 'Nouvelle zone', position);
    setZoneName('');
    setShowZoneInput(false);
  };

 const handleAddPatternCalculation = async (data: PatternCalculationElementData) => {
  const position = {
    x: 100 + Math.random() * 200,
    y: 100 + Math.random() * 200,
  };
  
  // Construire les données compatibles avec CalculationElementData
  const elementData: CalculationElementData = {
    summary: `${data.patternName} ${data.selectedSize} ×${data.quantity}`,
    garmentType: data.garmentType,
    // Format Pattern Import
    source: data.source,
    patternId: data.patternId,
    patternName: data.patternName,
    patternBrand: data.patternBrand,
    selectedSize: data.selectedSize,
    quantity: data.quantity,
    modifiers: data.modifiers,
    precisionLevel: data.precisionLevel,
    yardageByWidth: data.yardageByWidth,
    linkedTextileId: data.linkedTextileId,
  };
  
  await addElement({
    elementType: 'calculation',
    elementData,
    positionX: position.x,
    positionY: position.y,
    width: 240,
    height: 200,
  });
};

  const handleDeleteSelected = async () => {
    for (const id of selectedElementIds) {
      await removeElement(id);
    }
  };

  const handleDeleteSelectedZone = async () => {
    if (selectedZoneId) {
      await removeZone(selectedZoneId);
    }
  };

  return (
    <>
      <aside className="w-64 border-l bg-background hidden lg:flex flex-col h-full">
        {/* Conteneur scrollable pour tout le panneau */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Section Ajouter */}
          <div>
            <h2 className="font-medium mb-4">Ajouter</h2>

            <div className="space-y-2">
              <FavoritesSelector />

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleAddNote}
                disabled={isLoading}
              >
                <StickyNote className="w-4 h-4 mr-2" />
                Note
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleAddPalette}
                disabled={isLoading}
              >
                <Palette className="w-4 h-4 mr-2" />
                Palette
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPatternModal(true)}
                disabled={isLoading}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calcul métrage
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
                title="Bientôt disponible"
              >
                <Image className="w-4 h-4 mr-2" />
                Inspiration
              </Button>

              {/* Zone button with input */}
              {showZoneInput ? (
                <div className="space-y-2 p-2 border rounded-lg bg-muted/50">
                  <Input
                    placeholder="Nom de la zone"
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddZone();
                      if (e.key === 'Escape') setShowZoneInput(false);
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddZone} disabled={isLoading}>
                      Créer
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowZoneInput(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowZoneInput(true)}
                  disabled={isLoading}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Zone
                </Button>
              )}
            </div>
          </div>

          {/* Section Sélection Éléments - Affichée en premier si sélection active */}
          {selectedElementIds.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h2 className="font-medium mb-3">
                Sélection ({selectedElementIds.length})
              </h2>

              {/* Liste des éléments sélectionnés */}
              <ul className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                {selectedElements.map((element) => (
                  <li
                    key={element.id}
                    className="flex items-center gap-2 p-1.5 text-sm bg-accent/50 rounded"
                  >
                    <ElementIcon type={element.elementType} />
                    <span className="truncate flex-1">
                      {getElementLabel(element)}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          )}

          {/* Section Sélection Zone */}
          {selectedZoneId && (
            <div className="mt-6 pt-6 border-t">
              <h2 className="font-medium mb-3">Zone sélectionnée</h2>
              <p className="text-sm text-muted-foreground mb-3">
                {zones.find((z) => z.id === selectedZoneId)?.name || 'Zone'}
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteSelectedZone}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer la zone
              </Button>
            </div>
          )}

          {/* Section Éléments */}
          <div className="mt-6 pt-6 border-t">
            <h2 className="font-medium mb-4">Éléments ({elements.length})</h2>

            {elements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun élément sur ce board. Ajoutez des notes, palettes ou tissus
                pour commencer.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {elements.map((element) => (
                  <li
                    key={element.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      selectedElementIds.includes(element.id)
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <ElementIcon type={element.elementType} />
                    <span className="truncate flex-1">
                      {getElementLabel(element)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Section Zones */}
          {zones.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h2 className="font-medium mb-4">Zones ({zones.length})</h2>
              <ul className="space-y-2 text-sm">
                {zones.map((zone) => (
                  <li
                    key={zone.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      selectedZoneId === zone.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => selectZone(zone.id)}
                  >
                    <span
                      className="w-3 h-3 rounded border"
                      style={{ backgroundColor: zone.color }}
                    />
                    {zone.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Pattern Import Modal */}
      <PatternImportModal
        open={showPatternModal}
        onClose={() => setShowPatternModal(false)}
        context="board"
        onAddToBoard={handleAddPatternCalculation}
      />
    </>
  );
}

// Helper pour afficher l'icône selon le type
function ElementIcon({ type }: { type: string }) {
  switch (type) {
    case 'note':
      return <StickyNote className="w-4 h-4 text-yellow-500" />;
    case 'palette':
      return <Palette className="w-4 h-4 text-purple-500" />;
    case 'calculation':
      return <Calculator className="w-4 h-4 text-blue-500" />;
    case 'textile':
      return <div className="w-4 h-4 rounded bg-linear-to-br from-pink-400 to-rose-500" />;
    case 'inspiration':
      return <Image className="w-4 h-4 text-green-500" />;
    default:
      return <div className="w-4 h-4 rounded bg-muted" />;
  }
}

// Helper pour afficher le label d'un élément
function getElementLabel(element: { elementType: string; elementData: unknown }): string {
  const data = element.elementData as Record<string, unknown>;
  switch (element.elementType) {
    case 'note':
      return (data?.content as string)?.slice(0, 30) || 'Note vide';
    case 'palette':
      return (data?.name as string) || 'Palette';
    case 'calculation':
      return (data?.patternName as string) || (data?.summary as string) || 'Calcul';
    case 'textile':
      return (data?.snapshot as { name?: string })?.name || 'Tissu';
    case 'inspiration':
      return (data?.caption as string) || 'Inspiration';
    default:
      return ELEMENT_TYPE_LABELS[element.elementType as keyof typeof ELEMENT_TYPE_LABELS] || 'Élément';
  }
}
