// src/app/journey/[projectId]/design/page.tsx
// Étape 3 : Sélectionner les vêtements à créer

'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, Trash2, Copy, Loader2 } from 'lucide-react';
import { useProject } from '@/features/journey/context/ProjectContext';
import { GARMENT_TYPES, GARMENT_CATEGORIES, getGarmentsByCategory, getGarmentConfig } from '@/features/journey/config/garments';
import { cn } from '@/lib/utils';
import type { GarmentType, GarmentCategory, Size, GarmentVariations } from '@/features/journey/domain/types';

const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function DesignPage() {
  const {
    project,
    isLoading,
    isSaving,
    addGarment,
    updateGarment,
    removeGarment,
    duplicateGarment,
    saveProject,
    goToStep,
  } = useProject();

  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const garments = project.garments ?? [];

  const handleAddGarment = async (type: GarmentType) => {
    await addGarment({
      type,
      size: 'M',
      quantity: 1,
      variations: {},
    });
    setShowAddModal(false);
  };

  const handleContinue = async () => {
    await saveProject();
    goToStep('calculate');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
            Étape 3
          </span>
          <span>sur 9</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Design</h1>
        <p className="text-muted-foreground mt-1">
          Ajoutez les vêtements que vous souhaitez créer
        </p>
      </div>

      {/* Liste des vêtements */}
      <div className="space-y-4 mb-6">
        {garments.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-4">
              Aucun vêtement ajouté pour le moment
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
                "font-medium text-sm"
              )}
            >
              <Plus className="w-4 h-4" />
              Ajouter un vêtement
            </button>
          </div>
        ) : (
          <>
            {garments.map((garment) => (
              <GarmentCard
                key={garment.id}
                garment={garment}
                onUpdate={(updates) => updateGarment(garment.id, updates)}
                onRemove={() => removeGarment(garment.id)}
                onDuplicate={() => duplicateGarment(garment.id)}
              />
            ))}
            <button
              onClick={() => setShowAddModal(true)}
              className={cn(
                "w-full py-3 border border-dashed border-border rounded-lg",
                "text-muted-foreground hover:text-foreground hover:border-primary/50",
                "transition-colors flex items-center justify-center gap-2"
              )}
            >
              <Plus className="w-4 h-4" />
              Ajouter un autre vêtement
            </button>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <button
          onClick={() => goToStep('idea')}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <button
          onClick={handleContinue}
          disabled={isSaving || garments.length === 0}
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
              Calculer le métrage
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <AddGarmentModal
          onSelect={handleAddGarment}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// ============================================
// GARMENT CARD
// ============================================

interface GarmentCardProps {
  garment: {
    id: string;
    type: GarmentType;
    size: Size;
    quantity: number;
    name?: string;
    variations?: GarmentVariations;
  };
  onUpdate: (updates: Partial<GarmentCardProps['garment']>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

function GarmentCard({ garment, onUpdate, onRemove, onDuplicate }: GarmentCardProps) {
  const config = getGarmentConfig(garment.type);
  
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
  
  if (!config) return null;

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
         <h3 className="font-medium text-foreground">
  {garment.name || garmentLabels[garment.type] || config.type}
</h3>
          <p className="text-sm text-muted-foreground">
            {config.estimatedRange}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Dupliquer"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Taille */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Taille
          </label>
          <select
            value={garment.size}
            onChange={(e) => onUpdate({ size: e.target.value as Size })}
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm",
              "bg-background border border-input",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          >
            {SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Quantité */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Quantité
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={garment.quantity}
            onChange={(e) => onUpdate({ quantity: Math.max(1, parseInt(e.target.value) || 1) })}
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm",
              "bg-background border border-input",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>

        {/* Nom personnalisé */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Nom (optionnel)
          </label>
          <input
            type="text"
            value={garment.name ?? ''}
            onChange={(e) => onUpdate({ name: e.target.value || undefined })}
            placeholder="Ex: Robe Sarah"
            className={cn(
              "w-full px-3 py-2 rounded-lg text-sm",
              "bg-background border border-input",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>
      </div>

      {/* Variations (si disponibles) */}
      {config.availableVariations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Variations</p>
          <div className="flex flex-wrap gap-2">
            {config.availableVariations.includes('length') && (
              <select
                value={garment.variations?.length ?? ''}
                onChange={(e) => onUpdate({
                  variations: { ...garment.variations, length: e.target.value as 'mini' | 'midi' | 'maxi' || undefined }
                })}
                className="px-2 py-1 text-xs rounded border border-input bg-background"
              >
                <option value="">Longueur standard</option>
                <option value="mini">Mini</option>
                <option value="midi">Midi</option>
                <option value="maxi">Maxi</option>
              </select>
            )}
            {config.availableVariations.includes('sleeves') && (
              <select
                value={garment.variations?.sleeves ?? ''}
                onChange={(e) => onUpdate({
                  variations: { ...garment.variations, sleeves: e.target.value as 'none' | 'short' | 'three_quarter' | 'long' || undefined }
                })}
                className="px-2 py-1 text-xs rounded border border-input bg-background"
              >
                <option value="">Manches standard</option>
                <option value="none">Sans manches</option>
                <option value="short">Courtes</option>
                <option value="three_quarter">3/4</option>
                <option value="long">Longues</option>
              </select>
            )}
            {config.availableVariations.includes('lining') && (
              <label className="inline-flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={garment.variations?.lining ?? false}
                  onChange={(e) => onUpdate({
                    variations: { ...garment.variations, lining: e.target.checked }
                  })}
                  className="rounded"
                />
                Doublure
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// ADD GARMENT MODAL
// ============================================

interface AddGarmentModalProps {
  onSelect: (type: GarmentType) => void;
  onClose: () => void;
}

function AddGarmentModal({ onSelect, onClose }: AddGarmentModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory | null>(null);

  const categoryLabels: Record<string, string> = {
    tops: 'Hauts',
    bottoms: 'Bas',
    dresses: 'Robes',
    outerwear: 'Manteaux',
    accessories: 'Accessoires',
  };

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

  const garmentsToShow = selectedCategory 
    ? getGarmentsByCategory(selectedCategory) 
    : Object.values(GARMENT_TYPES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full mx-4 shadow-lg max-h-[80vh] overflow-auto">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Ajouter un vêtement
        </h3>

        {/* Catégories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {GARMENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {categoryLabels[cat.id] || cat.id}
            </button>
          ))}
        </div>

        {/* Liste des vêtements */}
        <div className="grid grid-cols-2 gap-2">
          {garmentsToShow.map((config) => (
            <button
              key={config.type}
              onClick={() => onSelect(config.type)}
              className={cn(
                "p-3 rounded-lg border border-border text-left",
                "hover:border-primary/50 hover:bg-accent/50 transition-colors"
              )}
            >
              <span className="font-medium text-foreground text-sm">
                {garmentLabels[config.type] || config.type}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {config.estimatedRange}
              </p>
            </button>
          ))}
        </div>

        {/* Fermer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
