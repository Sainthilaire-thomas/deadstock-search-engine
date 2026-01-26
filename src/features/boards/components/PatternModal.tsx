// src/features/boards/components/PatternModal.tsx
// Sprint 6 - Modal pour ajouter/éditer un Patron de couture

'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Scissors, Upload, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import type { PatternElementData } from '../domain/types';
import { uploadImage, uploadPdf } from '@/lib/storage/imageUpload';
import { useAuth } from '@/features/auth/context/AuthContext';

interface PatternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PatternElementData) => void;
  initialData?: PatternElementData;
}

// Marques de patrons connues
const KNOWN_BRANDS = [
  'Vogue',
  'Burda',
  'McCall\'s',
  'Simplicity',
  'Butterick',
  'New Look',
  'Kwik Sew',
  'Named',
  'Deer & Doe',
  'Republique du Chiffon',
  'Autre',
];

export function PatternModal({ isOpen, onClose, onSave, initialData }: PatternModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState(initialData?.name || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [fileUrl, setFileUrl] = useState(initialData?.url || '');
  const [fileType, setFileType] = useState<'pdf' | 'image'>(initialData?.fileType || 'pdf');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || '');
  const [pageCount, setPageCount] = useState(initialData?.pageCount || undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!initialData;

const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
  };

  const processFile = async (file: File) => {
    const isPdf = file.type === 'application/pdf';
    const isImage = isImageFile(file);

    if (!isPdf && !isImage) {
      setError('Format non supporté. Utilisez PDF ou image (JPG, PNG)');
      return;
    }

    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Le fichier est trop volumineux (max 15 MB)');
      return;
    }

    if (!user?.id) {
      setError('Vous devez être connecté pour uploader un fichier');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isPdf) {
        // Upload PDF vers Storage
        const result = await uploadPdf(file, user.id);
        setFileUrl(result.url);
        setFileType('pdf');
      } else {
        // Upload image vers Storage (avec optimisation)
        const result = await uploadImage(file, user.id, { generateThumbnail: true });
        setFileUrl(result.url);
        setFileType('image');
        setThumbnailUrl(result.thumbnailUrl || result.url);
      }

      if (!name) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setName(fileName);
      }

    } catch (err) {
      console.error('Erreur lors de l\'upload du fichier:', err);
      setError('Erreur lors de l\'upload du fichier');
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
    if (!fileUrl) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    const data: PatternElementData = {
      url: fileUrl,
      name: name || 'Patron sans nom',
      brand: brand || undefined,
      fileType,
      pageCount,
      thumbnailUrl: thumbnailUrl || undefined,
    };

    onSave(data);
    onClose();
  };

  const handleClear = () => {
    setFileUrl('');
    setThumbnailUrl('');
    setPageCount(undefined);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-violet-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEditMode ? 'Modifier le patron' : 'Ajouter un patron'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!fileUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging 
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Glissez votre patron ici ou <span className="text-violet-500 font-medium">cliquez</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">PDF ou image • Max 15 MB</p>
                </>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-20 bg-violet-100 dark:bg-violet-900/30 rounded flex items-center justify-center shrink-0 overflow-hidden">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : fileType === 'pdf' ? (
                    <FileText className="w-8 h-8 text-violet-500" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-violet-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Fichier sélectionné</p>
                  <p className="text-xs text-gray-500 mt-0.5">{fileType === 'pdf' ? 'Document PDF' : 'Image'}</p>
                  <button onClick={handleClear} className="text-xs text-violet-500 hover:text-violet-600 mt-2">
                    Changer de fichier
                  </button>
                </div>
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="application/pdf,image/*" onChange={handleFileSelect} className="hidden" />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du patron</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Robe Magnolia"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marque (optionnel)</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">Sélectionner une marque</option>
              {KNOWN_BRANDS.map((b) => (<option key={b} value={b}>{b}</option>))}
            </select>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!fileUrl || isLoading}
            className="px-4 py-2 text-sm bg-violet-500 hover:bg-violet-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded font-medium"
          >
            {isEditMode ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
