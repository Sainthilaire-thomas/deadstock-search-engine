// src/features/boards/components/SilhouetteModal.tsx
// Sprint 6 - Modal pour ajouter/éditer une Silhouette (croquis de mode)

'use client';

import { useState, useRef, useCallback } from 'react';
import { X, User, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import type { SilhouetteElementData } from '../domain/types';
import { uploadImage } from '@/lib/storage/imageUpload';
import { useAuth } from '@/features/auth/context/AuthContext';

interface SilhouetteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SilhouetteElementData) => void;
  initialData?: SilhouetteElementData;
}

// Catégories de silhouettes
const CATEGORIES = [
  { value: 'femme', label: 'Femme' },
  { value: 'homme', label: 'Homme' },
  { value: 'enfant', label: 'Enfant' },
  { value: 'unisexe', label: 'Unisexe' },
  { value: 'accessoire', label: 'Accessoire' },
  { value: 'autre', label: 'Autre' },
];

export function SilhouetteModal({ isOpen, onClose, onSave, initialData }: SilhouetteModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [imageUrl, setImageUrl] = useState(initialData?.url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!initialData;

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Seules les images sont acceptées (JPG, PNG, SVG, WebP)');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      setError('L\'image est trop volumineuse (max 10 MB)');
      return;
    }

    if (!user?.id) {
      setError('Vous devez être connecté pour uploader une image');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Upload vers Supabase Storage
      const result = await uploadImage(file, user.id);
      setImageUrl(result.url);

      // Utiliser le nom du fichier si pas de nom défini
      if (!name) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setName(fileName);
      }
    } catch (err) {
      console.error('Erreur lors de l\'upload de l\'image:', err);
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [name]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSave = () => {
    if (!imageUrl) {
      setError('Veuillez sélectionner une image');
      return;
    }

    const data: SilhouetteElementData = {
      url: imageUrl,
      name: name || undefined,
      source: 'upload',
      category: category || undefined,
    };

    onSave(data);
    onClose();
  };

  const handleClear = () => {
    setImageUrl('');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEditMode ? 'Modifier la silhouette' : 'Ajouter une silhouette'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Zone de drop / Preview */}
          {!imageUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging 
                  ? 'border-slate-500 bg-slate-50 dark:bg-slate-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-slate-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
              ) : (
                <>
                  <div className="w-16 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center mb-3">
                    <User className="w-8 h-8 text-gray-300 dark:text-gray-600" strokeWidth={1} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Glissez votre silhouette ici ou <span className="text-slate-600 dark:text-slate-400 font-medium">cliquez</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Image (JPG, PNG, SVG) • Max 5 MB
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {/* Preview */}
                <div className="w-20 h-28 bg-slate-100 dark:bg-slate-900/30 rounded flex items-center justify-center shrink-0 overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Image sélectionnée
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Silhouette prête à être ajoutée
                  </p>
                  <button 
                    onClick={handleClear} 
                    className="text-xs text-slate-500 hover:text-slate-600 mt-2"
                  >
                    Changer d'image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input file caché */}
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            onChange={handleFileSelect} 
            className="hidden" 
          />

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom (optionnel)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Silhouette robe longue"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie (optionnel)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Sélectionner une catégorie</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!imageUrl || isLoading}
            className="px-4 py-2 text-sm bg-slate-600 hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded font-medium"
          >
            {isEditMode ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
