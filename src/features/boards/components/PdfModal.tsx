// src/features/boards/components/PdfModal.tsx
// Sprint 6 - Modal pour ajouter/éditer un PDF

'use client';

import { useState, useRef, useCallback } from 'react';
import { X, FileText, Upload, Loader2, File } from 'lucide-react';
import type { PdfElementData } from '../domain/types';
import { uploadPdf } from '@/lib/storage/imageUpload';
import { useAuth } from '@/features/auth/context/AuthContext';

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PdfElementData) => void;
  initialData?: PdfElementData;
}

export function PdfModal({ isOpen, onClose, onSave, initialData }: PdfModalProps) {
  const { user } = useAuth();
  const [filename, setFilename] = useState(initialData?.filename || '');
  const [fileUrl, setFileUrl] = useState(initialData?.url || '');
  const [pageCount, setPageCount] = useState(initialData?.pageCount || undefined);
  const [fileSize, setFileSize] = useState(initialData?.fileSize || undefined);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!initialData;

 /**
   * Traite le fichier uploadé - Upload vers Supabase Storage
   */
  const processFile = async (file: File) => {
    // Vérifier que c'est bien un PDF
    if (file.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptés');
      return;
    }

    // Limite de taille (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Le fichier est trop volumineux (max 10 MB)');
      return;
    }

    if (!user?.id) {
      setError('Vous devez être connecté pour uploader un fichier');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Upload vers Supabase Storage
      const result = await uploadPdf(file, user.id);

      setFilename(result.name);
      setFileUrl(result.url);
      setFileSize(result.size);

    } catch (err) {
      console.error('Erreur lors de l\'upload du fichier:', err);
      setError('Erreur lors de l\'upload du fichier');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gestion du drop
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  /**
   * Gestion de la sélection de fichier
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  /**
   * Sauvegarde
   */
  const handleSave = () => {
    if (!fileUrl || !filename) {
      setError('Veuillez sélectionner un fichier PDF');
      return;
    }

    const data: PdfElementData = {
      url: fileUrl,
      filename,
      pageCount,
      fileSize,
      thumbnailUrl: thumbnailUrl || undefined,
    };

    onSave(data);
    onClose();
  };

  /**
   * Reset le formulaire
   */
  const handleClear = () => {
    setFilename('');
    setFileUrl('');
    setPageCount(undefined);
    setFileSize(undefined);
    setThumbnailUrl('');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEditMode ? 'Modifier le PDF' : 'Ajouter un PDF'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Zone de drop / Preview */}
          {!fileUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8
                flex flex-col items-center justify-center
                cursor-pointer transition-colors
                ${isDragging 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-red-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              {isLoading ? (
                <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Glissez un PDF ici ou <span className="text-red-500 font-medium">cliquez pour parcourir</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    PDF uniquement • Max 10 MB
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-14 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center shrink-0">
                  <File className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {filename}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : 'PDF'}
                    {pageCount && ` • ${pageCount} page${pageCount > 1 ? 's' : ''}`}
                  </p>
                  <button
                    onClick={handleClear}
                    className="text-xs text-red-500 hover:text-red-600 mt-2"
                  >
                    Changer de fichier
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input file caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Erreur */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!fileUrl || isLoading}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded font-medium"
          >
            {isEditMode ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
