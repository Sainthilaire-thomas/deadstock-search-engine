// src/features/boards/components/ImageUploadModal.tsx
// VERSION AVEC UNSPLASH - Utilise InspirationElementData (standard DB)

'use client';

import { useState, useCallback, useRef } from 'react';
import { X, Upload, Link as LinkIcon, Loader2, AlertCircle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnsplashImagePicker } from './UnsplashImagePicker';
import type { InspirationElementData } from '../domain/types';
import { uploadImage, uploadFromUrl } from '@/lib/storage/imageUpload';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { UnsplashPhoto } from '../services/unsplashService';

interface ImageUploadModalProps {
  initialData?: InspirationElementData;
  onSave: (data: InspirationElementData) => void;
  onCancel: () => void;
}

type InputMode = 'choice' | 'upload' | 'url' | 'unsplash';

export function ImageUploadModal({ initialData, onSave, onCancel }: ImageUploadModalProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<InputMode>(initialData?.imageUrl ? 'url' : 'choice');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [caption, setCaption] = useState(initialData?.caption || '');
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl || '');
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

 // Upload fichier vers Supabase Storage
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 10 Mo');
      return;
    }

    if (!user?.id) {
      setError('Vous devez être connecté pour uploader une image');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Upload vers Supabase Storage (optimise automatiquement)
      const result = await uploadImage(file, user.id);
      
      setPreviewUrl(result.url);
      setImageUrl(result.url);
      setMode('upload');

      if (!caption) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setCaption(fileName);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [caption, user?.id]);

  // Valider URL
  const handleUrlValidate = useCallback(() => {
    if (!imageUrl.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    try {
      new URL(imageUrl.trim());
    } catch {
      setError('URL invalide');
      return;
    }

    setIsLoading(true);
    setError(null);

    const img = new Image();
    img.onload = () => {
      setPreviewUrl(imageUrl.trim());
      setSourceUrl(imageUrl.trim());
      setIsLoading(false);
    };
    img.onerror = () => {
      setError('Impossible de charger l\'image. Vérifiez l\'URL.');
      setIsLoading(false);
    };
    img.src = imageUrl.trim();
  }, [imageUrl]);

// Sélection Unsplash - utilise l'URL Unsplash directement (hotlinking autorisé)
  const handleUnsplashSelect = useCallback((url: string, photo: UnsplashPhoto) => {
    setPreviewUrl(url);
    setImageUrl(url);
    setSourceUrl(photo.links.html);
    setCaption(photo.alt_description || '');
    setMode('unsplash');
  }, []);

  // Sauvegarder
  const handleSave = useCallback(() => {
    if (!previewUrl) {
      setError('Veuillez d\'abord ajouter une image');
      return;
    }

    onSave({
      imageUrl: previewUrl,
      caption: caption.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
    });
  }, [previewUrl, caption, sourceUrl, onSave]);

  // Retour au choix
  const handleBack = useCallback(() => {
    setMode('choice');
    setError(null);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {initialData ? 'Modifier l\'image' : 'Ajouter une inspiration'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Choix initial */}
          {mode === 'choice' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                Comment voulez-vous ajouter votre image ?
              </p>

              {/* Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300
                         dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50/50
                         dark:hover:border-blue-500 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg
                              flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Uploader une image
                  </p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, GIF • Max 5 Mo
                  </p>
                </div>
              </button>

              {/* URL */}
              <button
                onClick={() => setMode('url')}
                className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300
                         dark:border-gray-600 rounded-lg hover:border-purple-400 hover:bg-purple-50/50
                         dark:hover:border-purple-500 dark:hover:bg-purple-900/20 transition-colors"
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg
                              flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Depuis une URL
                  </p>
                  <p className="text-sm text-gray-500">
                    Pinterest, etc.
                  </p>
                </div>
              </button>

              {/* Unsplash */}
              <button
                onClick={() => setMode('unsplash')}
                className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300
                         dark:border-gray-600 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/50
                         dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg
                              flex items-center justify-center">
                  <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Rechercher sur Unsplash
                  </p>
                  <p className="text-sm text-gray-500">
                    Photos libres de droits
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Mode URL */}
          {mode === 'url' && !previewUrl && (
            <div className="space-y-4">
              <button
                onClick={handleBack}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                ← Retour
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL de l'image
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlValidate()}
                  />
                  <Button
                    onClick={handleUrlValidate}
                    disabled={!imageUrl.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Charger'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mode Unsplash */}
          {mode === 'unsplash' && !previewUrl && (
            <div className="space-y-4">
              <button
                onClick={handleBack}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                ← Retour
              </button>

              <UnsplashImagePicker
                onSelectImage={handleUnsplashSelect}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Preview et édition */}
          {previewUrl && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setPreviewUrl('');
                  setImageUrl('');
                  setSourceUrl('');
                  setCaption('');
                  setMode('choice');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                ← Changer d'image
              </button>

              {/* Image preview */}
              <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-contain"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Légende (optionnel)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Décrivez cette inspiration..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Source (si URL ou Unsplash) */}
              {sourceUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20
                          border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700
                      bg-gray-50 dark:bg-gray-800/50 shrink-0">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!previewUrl || isLoading}
          >
            {initialData ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </div>
      </div>
    </div>
  );
}
