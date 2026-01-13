// src/features/boards/components/PaletteEditor.tsx
// VERSION SPRINT 4 COMPLET - Avec extraction ET harmonies couleurs

'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { X, Plus, Check, Upload, Image as ImageIcon, Loader2, Sparkles, Wand2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  extractColorsFromFile, 
  extractColorsFromUrl,
  generateHarmonies,
  getTextColorForBackground,
  type ColorHarmonies
} from '../utils/colorExtractor';
import { ColorMatchDisplay } from './ColorMatchDisplay';
import type { PaletteElementData } from '../domain/types';

interface PaletteEditorProps {
  initialData?: PaletteElementData;
  onSave: (data: PaletteElementData) => void;
  onCancel: () => void;
}

const DEFAULT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

// Noms des types d'harmonies en français
const HARMONY_LABELS: Record<keyof Omit<ColorHarmonies, 'base'>, string> = {
  complementary: 'Complémentaire',
  analogous: 'Analogues',
  triadic: 'Triadique',
  splitComplementary: 'Split-complémentaire',
  tetradic: 'Tétradique',
};

export function PaletteEditor({ initialData, onSave, onCancel }: PaletteEditorProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [colors, setColors] = useState<string[]>(
    initialData?.colors?.length ? initialData.colors : DEFAULT_COLORS
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [currentColor, setCurrentColor] = useState(colors[0] || '#FF6B6B');
  
  // État pour l'extraction
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.sourceImageUrl || null
  );
  
  // État pour les harmonies
  const [showHarmonies, setShowHarmonies] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculer les harmonies pour la couleur sélectionnée
  const harmonies = useMemo(() => {
    try {
      return generateHarmonies(currentColor);
    } catch {
      return null;
    }
  }, [currentColor]);

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

  // Ajouter une couleur spécifique (depuis harmonies)
  const handleAddSpecificColor = useCallback((color: string) => {
    if (colors.length < 10 && !colors.includes(color)) {
      setColors(prev => [...prev, color]);
      // Sélectionner la nouvelle couleur
      setSelectedIndex(colors.length);
      setCurrentColor(color);
    }
  }, [colors]);

  // Supprimer une couleur
  const handleRemoveColor = useCallback((index: number) => {
    if (colors.length > 1) {
      setColors(prev => prev.filter((_, i) => i !== index));
      const newIndex = Math.min(selectedIndex, colors.length - 2);
      setSelectedIndex(Math.max(0, newIndex));
      setCurrentColor(colors[newIndex] || colors[0]);
    }
  }, [colors, selectedIndex]);

  // Extraction depuis fichier
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractionError(null);

    try {
      // Créer preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Extraire les couleurs
      const extractedColors = await extractColorsFromFile(file, 6);
      setColors(extractedColors);
      setSelectedIndex(0);
      setCurrentColor(extractedColors[0]);
      
      // Mettre à jour le nom si vide
      if (!name) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setName(`Palette - ${fileName}`);
      }
    } catch (error) {
      setExtractionError(error instanceof Error ? error.message : 'Erreur d\'extraction');
    } finally {
      setIsExtracting(false);
      // Reset input pour permettre de resélectionner le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [name]);

  // Extraction depuis URL
  const handleUrlExtract = useCallback(async () => {
    if (!imageUrl.trim()) return;

    setIsExtracting(true);
    setExtractionError(null);

    try {
      const extractedColors = await extractColorsFromUrl(imageUrl.trim(), 6);
      setColors(extractedColors);
      setSelectedIndex(0);
      setCurrentColor(extractedColors[0]);
      setPreviewImage(imageUrl.trim());
      setShowUrlInput(false);
      setImageUrl('');
      
      if (!name) {
        setName('Palette extraite');
      }
    } catch (error) {
      setExtractionError(error instanceof Error ? error.message : 'Erreur d\'extraction');
    } finally {
      setIsExtracting(false);
    }
  }, [imageUrl, name]);

  // Sauvegarder
  const handleSave = useCallback(() => {
    onSave({
      name: name.trim() || 'Palette sans nom',
      colors,
      source: previewImage ? 'extracted' : 'manual',
      sourceImageUrl: previewImage || undefined,
    });
  }, [name, colors, previewImage, onSave]);

  // Composant pour afficher une couleur cliquable (harmonies)
  const HarmonyColor = ({ color, label }: { color: string; label?: string }) => {
    const isInPalette = colors.includes(color);
    const textColor = getTextColorForBackground(color);
    
    return (
      <button
        onClick={() => !isInPalette && handleAddSpecificColor(color)}
        disabled={isInPalette || colors.length >= 10}
        className={`
          relative group flex flex-col items-center
          ${isInPalette ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isInPalette ? 'Déjà dans la palette' : `Ajouter ${color}`}
      >
        <div
          className={`
            w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm
            transition-transform
            ${!isInPalette && colors.length < 10 ? 'hover:scale-110' : ''}
          `}
          style={{ backgroundColor: color }}
        >
          {!isInPalette && colors.length < 10 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus 
                className="w-4 h-4" 
                style={{ color: textColor === 'light' ? '#fff' : '#000' }}
              />
            </div>
          )}
          {isInPalette && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check 
                className="w-4 h-4" 
                style={{ color: textColor === 'light' ? '#fff' : '#000' }}
              />
            </div>
          )}
        </div>
        {label && (
          <span className="text-[9px] text-gray-500 mt-0.5 truncate max-w-10">
            {label}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
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

        {/* Content - Scrollable */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
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

          {/* Section Extraction */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Extraire depuis une image
              </span>
            </div>

            {/* Preview image si extraite */}
            {previewImage && (
              <div className="mb-3 relative">
                <img 
                  src={previewImage} 
                  alt="Source" 
                  className="w-full h-24 object-cover rounded-md"
                />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 
                           rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* Boutons d'extraction */}
            <div className="flex gap-2">
              {/* Upload fichier */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="flex-1"
              >
                {isExtracting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload image
              </Button>

              {/* URL */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
                disabled={isExtracting}
                className="flex-1"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Depuis URL
              </Button>
            </div>

            {/* Input URL */}
            {showUrlInput && (
              <div className="mt-3 flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUrlExtract}
                  disabled={!imageUrl.trim() || isExtracting}
                >
                  {isExtracting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Extraire'
                  )}
                </Button>
              </div>
            )}

            {/* Erreur */}
            {extractionError && (
              <p className="mt-2 text-sm text-red-500">{extractionError}</p>
            )}
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
              style={{ width: '100%', height: 160 }}
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

          {/* Section Harmonies */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowHarmonies(!showHarmonies)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Générer des harmonies
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {showHarmonies ? '▼' : '▶'}
              </span>
            </button>
            
            {showHarmonies && harmonies && (
              <div className="p-3 space-y-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500">
                  Cliquez sur une couleur pour l'ajouter à votre palette
                </p>
                
                {/* Complémentaire */}
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    {HARMONY_LABELS.complementary}
                  </span>
                  <div className="flex gap-2">
                    <HarmonyColor color={currentColor} label="Base" />
                    <span className="text-gray-300 self-center">→</span>
                    <HarmonyColor color={harmonies.complementary} />
                  </div>
                </div>

                {/* Analogues */}
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    {HARMONY_LABELS.analogous}
                  </span>
                  <div className="flex gap-2">
                    <HarmonyColor color={harmonies.analogous[0]} />
                    <HarmonyColor color={currentColor} label="Base" />
                    <HarmonyColor color={harmonies.analogous[1]} />
                  </div>
                </div>

                {/* Triadique */}
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    {HARMONY_LABELS.triadic}
                  </span>
                  <div className="flex gap-2">
                    <HarmonyColor color={currentColor} label="Base" />
                    <HarmonyColor color={harmonies.triadic[0]} />
                    <HarmonyColor color={harmonies.triadic[1]} />
                  </div>
                </div>

                {/* Split-complémentaire */}
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    {HARMONY_LABELS.splitComplementary}
                  </span>
                  <div className="flex gap-2">
                    <HarmonyColor color={currentColor} label="Base" />
                    <HarmonyColor color={harmonies.splitComplementary[0]} />
                    <HarmonyColor color={harmonies.splitComplementary[1]} />
                  </div>
                </div>

                {/* Tétradique */}
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    {HARMONY_LABELS.tetradic}
                  </span>
                  <div className="flex gap-2">
                    <HarmonyColor color={currentColor} label="Base" />
                    <HarmonyColor color={harmonies.tetradic[0]} />
                    <HarmonyColor color={harmonies.tetradic[1]} />
                    <HarmonyColor color={harmonies.tetradic[2]} />
                  </div>
                </div>
              </div>
           )}
            
            {/* Section Color Matching - Sprint B1/B2 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trouver des tissus
                </span>
              </div>
              <ColorMatchDisplay
                hex={currentColor}
                onColorsSelected={(colors) => console.log('Search:', colors)}
                compact
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
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
