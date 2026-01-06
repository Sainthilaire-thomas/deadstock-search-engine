// src/features/pattern/components/ManualPatternForm.tsx

'use client';

import { useState } from 'react';
import { 
  GarmentType, 
  GarmentCategory,
  PatternConfig,
  YardageModifiers,
  DEFAULT_MODIFIERS,
  GARMENT_CATEGORIES,
  GARMENT_LABELS,
  CATEGORY_LABELS,
  DEFAULT_SIZES,
} from '../domain/types';

interface ManualPatternFormProps {
  onSubmit: (config: PatternConfig) => void;
  isLoading?: boolean;
}

export function ManualPatternForm({ onSubmit, isLoading = false }: ManualPatternFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory>('dresses');
  const [garmentType, setGarmentType] = useState<GarmentType>('dress_midi');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState(1);
  const [modifiers, setModifiers] = useState<YardageModifiers>(DEFAULT_MODIFIERS);
  const [fabricWidthKnown, setFabricWidthKnown] = useState(false);
  const [knownFabricWidth, setKnownFabricWidth] = useState<number>(140);

  // Types disponibles pour la catégorie sélectionnée
  const availableTypes = GARMENT_CATEGORIES[selectedCategory] || [];

  const handleCategoryChange = (category: GarmentCategory) => {
    setSelectedCategory(category);
    // Sélectionner le premier type de la nouvelle catégorie
    const types = GARMENT_CATEGORIES[category];
    if (types && types.length > 0) {
      setGarmentType(types[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      garmentType,
      selectedSize,
      quantity,
      modifiers,
      knownFabricWidthCm: fabricWidthKnown ? knownFabricWidth : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Catégorie */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Catégorie</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(GARMENT_CATEGORIES) as GarmentCategory[]).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category)}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Type de vêtement */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type de vêtement</label>
        <div className="grid grid-cols-2 gap-2">
          {availableTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setGarmentType(type)}
              disabled={isLoading}
              className={`px-3 py-2 rounded-md text-sm border text-left transition-colors ${
                garmentType === type
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              }`}
            >
              {GARMENT_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Taille */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Taille</label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md border transition-colors ${
                selectedSize === size
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quantité */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Quantité</label>
        <input
          type="number"
          min={1}
          max={99}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={isLoading}
          className="w-24 px-3 py-2 border border-border rounded-md bg-background"
        />
      </div>

      {/* Tissu repéré ? */}
      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
        <label className="text-sm font-medium">Avez-vous déjà repéré un tissu ?</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fabricKnown"
              checked={!fabricWidthKnown}
              onChange={() => setFabricWidthKnown(false)}
              disabled={isLoading}
              className="w-4 h-4"
            />
            <span className="text-sm">Non, je cherche</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="fabricKnown"
              checked={fabricWidthKnown}
              onChange={() => setFabricWidthKnown(true)}
              disabled={isLoading}
              className="w-4 h-4"
            />
            <span className="text-sm">Oui, largeur :</span>
            {fabricWidthKnown && (
              <>
                <input
                  type="number"
                  min={90}
                  max={200}
                  value={knownFabricWidth}
                  onChange={(e) => setKnownFabricWidth(parseInt(e.target.value) || 140)}
                  disabled={isLoading}
                  className="w-20 px-2 py-1 border border-border rounded-md bg-background text-sm"
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Options</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={modifiers.directional}
              onChange={(e) => setModifiers({ ...modifiers, directional: e.target.checked })}
              disabled={isLoading}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Tissu directionnel</span>
            <span className="text-xs text-muted-foreground">+10%</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={modifiers.patternMatching}
              onChange={(e) => setModifiers({ ...modifiers, patternMatching: e.target.checked })}
              disabled={isLoading}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Motif à raccorder</span>
            <span className="text-xs text-muted-foreground">+20%</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={modifiers.safetyMarginPercent > 0}
              onChange={(e) => setModifiers({ 
                ...modifiers, 
                safetyMarginPercent: e.target.checked ? 10 : 0 
              })}
              disabled={isLoading}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Marge de sécurité</span>
            <span className="text-xs text-muted-foreground">+10%</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Calcul en cours...' : 'Calculer le métrage →'}
      </button>
    </form>
  );
}
