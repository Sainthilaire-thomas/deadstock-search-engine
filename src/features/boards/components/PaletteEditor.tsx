// src/features/boards/components/PaletteEditor.tsx

'use client';

import { useState, useCallback } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { X, Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaletteElementData } from '../domain/types';

interface PaletteEditorProps {
  initialData?: PaletteElementData;
  onSave: (data: PaletteElementData) => void;
  onCancel: () => void;
}

const DEFAULT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

export function PaletteEditor({ initialData, onSave, onCancel }: PaletteEditorProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [colors, setColors] = useState<string[]>(
    initialData?.colors?.length ? initialData.colors : DEFAULT_COLORS
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [currentColor, setCurrentColor] = useState(colors[0] || '#FF6B6B');

  // Mettre à jour la couleur sélectionnée
  const handleColorChange = useCallback((newColor: string) => {
    setCurrentColor(newColor);
    setColors(prev => {
      const updated = [...prev];
      if (selectedIndex < updated.length) {
        updated[selectedIndex] = newColor;
      }
      return updated;
    });
  }, [selectedIndex]);

  // Sélectionner une couleur
  const handleSelectColor = useCallback((index: number) => {
    setSelectedIndex(index);
    setCurrentColor(colors[index]);
  }, [colors]);

  // Ajouter une couleur
  const handleAddColor = useCallback(() => {
    if (colors.length < 10) {
      const newColor = '#CCCCCC';
      setColors(prev => [...prev, newColor]);
      setSelectedIndex(colors.length);
      setCurrentColor(newColor);
    }
  }, [colors.length]);

  // Supprimer une couleur
  const handleRemoveColor = useCallback((index: number) => {
    if (colors.length > 1) {
      setColors(prev => prev.filter((_, i) => i !== index));
      const newIndex = Math.min(selectedIndex, colors.length - 2);
      setSelectedIndex(Math.max(0, newIndex));
      setCurrentColor(colors[newIndex] || colors[0]);
    }
  }, [colors, selectedIndex]);

  // Sauvegarder
  const handleSave = useCallback(() => {
    onSave({
      name: name.trim() || 'Palette sans nom',
      colors,
      source: initialData?.source || 'manual',
      sourceImageUrl: initialData?.sourceImageUrl,
    });
  }, [name, colors, initialData, onSave]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {initialData ? 'Modifier la palette' : 'Nouvelle palette'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Nom de la palette */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de la palette
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ma palette"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-400"
            />
          </div>

          {/* Liste des couleurs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Couleurs ({colors.length}/10)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`
                    relative group cursor-pointer
                    ${selectedIndex === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                  `}
                  onClick={() => handleSelectColor(index)}
                >
                  <div
                    className="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  {/* Bouton supprimer */}
                  {colors.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveColor(index);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full 
                               flex items-center justify-center opacity-0 group-hover:opacity-100 
                               transition-opacity shadow-sm"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                  {/* Indicateur sélection */}
                  {selectedIndex === index && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
              ))}
              {/* Bouton ajouter */}
              {colors.length < 10 && (
                <button
                  onClick={handleAddColor}
                  className="w-10 h-10 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 
                           flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 
                           transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Color Picker */}
          <div className="flex flex-col items-center gap-3">
            <HexColorPicker 
              color={currentColor} 
              onChange={handleColorChange}
              style={{ width: '100%', height: 180 }}
            />
            <div className="flex items-center gap-2 w-full">
              <div 
                className="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm shrink-0"
                style={{ backgroundColor: currentColor }}
              />
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Code HEX</label>
                <HexColorInput
                  color={currentColor}
                  onChange={handleColorChange}
                  prefixed
                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {initialData ? 'Enregistrer' : 'Créer la palette'}
          </Button>
        </div>
      </div>
    </div>
  );
}
