// src/features/boards/components/BoardToolPanel.tsx

'use client';

import { Plus, StickyNote, Palette, Calculator, Image, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBoard } from '../context/BoardContext';
import { ELEMENT_TYPE_LABELS } from '../domain/types';

export function BoardToolPanel() {
  const { 
    elements, 
    zones, 
    selectedElementIds, 
    addNote, 
    addPalette,
    removeElement,
    isLoading 
  } = useBoard();

  const handleAddNote = async () => {
    // Position aléatoire pour éviter l'empilement
    const position = {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    };
    await addNote(position);
  };

  const handleAddPalette = async () => {
    // Palette par défaut avec quelques couleurs
    const defaultColors = ['#1E3A5F', '#8B4513', '#FFFFFF', '#F4D03F', '#2ECC71'];
    const position = {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    };
    await addPalette(defaultColors, position);
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedElementIds) {
      await removeElement(id);
    }
  };

  return (
    <aside className="w-64 border-l bg-background p-4 hidden lg:flex flex-col">
      {/* Section Ajouter */}
      <div>
        <h2 className="font-medium mb-4">Ajouter</h2>

        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            disabled
            title="Bientôt disponible"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tissu depuis favoris
          </Button>

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
            disabled
            title="Bientôt disponible"
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
        </div>
      </div>

      {/* Section Sélection */}
      {selectedElementIds.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h2 className="font-medium mb-4">
            Sélection ({selectedElementIds.length})
          </h2>
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

      {/* Section Éléments */}
      <div className="mt-6 pt-6 border-t flex-1 overflow-auto">
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
              <li key={zone.id} className="flex items-center gap-2">
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
    </aside>
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
      return <div className="w-4 h-4 rounded bg-gradient-to-br from-pink-400 to-rose-500" />;
    case 'inspiration':
      return <Image className="w-4 h-4 text-green-500" />;
    default:
      return <div className="w-4 h-4 rounded bg-muted" />;
  }
}

// Helper pour afficher le label d'un élément
function getElementLabel(element: { elementType: string; elementData: any }): string {
  switch (element.elementType) {
    case 'note':
      return element.elementData?.content?.slice(0, 30) || 'Note vide';
    case 'palette':
      return element.elementData?.name || 'Palette';
    case 'calculation':
      return element.elementData?.summary || 'Calcul';
    case 'textile':
      return element.elementData?.snapshot?.name || 'Tissu';
    case 'inspiration':
      return element.elementData?.caption || 'Inspiration';
    default:
      return ELEMENT_TYPE_LABELS[element.elementType as keyof typeof ELEMENT_TYPE_LABELS] || 'Élément';
  }
}
