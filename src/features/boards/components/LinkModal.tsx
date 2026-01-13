// src/features/boards/components/LinkModal.tsx
// Sprint 5 - Modal d'ajout de lien web avec preview og:meta

'use client';

import { useState, useEffect } from 'react';
import { X, Link2, Loader2, AlertCircle, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { extractDomain, getFaviconUrl, type LinkElementData } from './elements/LinkElement';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LinkElementData) => void;
  initialData?: LinkElementData;
}

/**
 * Fetch les métadonnées Open Graph d'une URL via notre API
 * Note: Dans un vrai projet, ceci serait une API route Next.js
 * Pour la démo, on utilise un service externe ou on simule
 */
async function fetchLinkMetadata(url: string): Promise<Partial<LinkElementData>> {
  // Essayer d'utiliser un service de preview
  // Option 1: API maison (à créer)
  // Option 2: Service externe comme microlink.io
  
  try {
    // Utiliser microlink.io pour récupérer les métadonnées
    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return {
        title: data.data.title,
        description: data.data.description,
        imageUrl: data.data.image?.url,
        siteName: data.data.publisher,
        favicon: data.data.logo?.url,
      };
    }
  } catch (error) {
    console.warn('Microlink failed, using fallback:', error);
  }
  
  // Fallback: extraire le domaine comme titre
  return {
    title: extractDomain(url),
    siteName: extractDomain(url),
    favicon: getFaviconUrl(url),
  };
}

export function LinkModal({ isOpen, onClose, onSave, initialData }: LinkModalProps) {
  const [url, setUrl] = useState(initialData?.url || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Partial<LinkElementData> | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUrl(initialData?.url || '');
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setError(null);
      setPreview(initialData ? {
        imageUrl: initialData.imageUrl,
        siteName: initialData.siteName,
        favicon: initialData.favicon,
      } : null);
    }
  }, [isOpen, initialData]);

  const handleFetchMetadata = async () => {
    if (!url.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    // Valider URL
    try {
      new URL(url);
    } catch {
      setError('URL invalide');
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const metadata = await fetchLinkMetadata(url);
      setPreview(metadata);
      
      // Auto-remplir si vide
      if (!title && metadata.title) {
        setTitle(metadata.title);
      }
      if (!description && metadata.description) {
        setDescription(metadata.description);
      }
    } catch (err) {
      setError('Impossible de récupérer les métadonnées');
    } finally {
      setIsFetching(false);
    }
  };

  // Auto-fetch on URL change (debounced)
  useEffect(() => {
    if (!url.trim()) {
      setPreview(null);
      return;
    }

    // Valider URL d'abord
    try {
      new URL(url);
    } catch {
      return;
    }

    const timer = setTimeout(() => {
      handleFetchMetadata();
    }, 800);

    return () => clearTimeout(timer);
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    // Valider URL
    try {
      new URL(url);
    } catch {
      setError('URL invalide');
      return;
    }

    setIsLoading(true);
    
    try {
      const linkData: LinkElementData = {
        url: url.trim(),
        title: title.trim() || extractDomain(url),
        description: description.trim() || undefined,
        imageUrl: preview?.imageUrl,
        siteName: preview?.siteName,
        favicon: preview?.favicon || getFaviconUrl(url),
      };

      onSave(linkData);
      onClose();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const domain = url ? extractDomain(url) : '';
  const faviconUrl = preview?.favicon || (url ? getFaviconUrl(url) : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="
        relative z-10
        bg-white dark:bg-gray-800
        rounded-lg shadow-xl
        w-full max-w-md
        mx-4
        overflow-hidden
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-500" />
            <h2 className="font-medium text-gray-900 dark:text-gray-100">
              {initialData ? 'Modifier le lien' : 'Ajouter un lien'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemple.com/article"
                className="
                  w-full pl-10 pr-10 py-2
                  border border-gray-300 dark:border-gray-600
                  rounded-lg
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
                autoFocus
              />
              {url && (
                <button
                  type="button"
                  onClick={handleFetchMetadata}
                  disabled={isFetching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  title="Rafraîchir les métadonnées"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-400 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Card */}
          {(preview || url) && !error && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Image */}
              {preview?.imageUrl && (
                <div className="aspect-2/1 bg-gray-100 dark:bg-gray-700">
                  <img
                    src={preview.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Infos */}
              <div className="p-3 space-y-1">
                {/* Domain avec favicon */}
                <div className="flex items-center gap-2">
                  {faviconUrl && (
                    <img
                      src={faviconUrl}
                      alt=""
                      className="w-4 h-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {preview?.siteName || domain}
                  </span>
                  {isFetching && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                </div>
                
                {/* Titre */}
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {title || preview?.title || domain || 'Lien'}
                </p>
                
                {/* Description */}
                {(description || preview?.description) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {description || preview?.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={preview?.title || 'Titre du lien'}
              className="
                w-full px-4 py-2
                border border-gray-300 dark:border-gray-600
                rounded-lg
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100
                placeholder-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
              "
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={preview?.description || 'Description du lien...'}
              rows={2}
              className="
                w-full px-4 py-2
                border border-gray-300 dark:border-gray-600
                rounded-lg
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100
                placeholder-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                resize-none
              "
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-700
                rounded-lg
                transition-colors
              "
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="
                px-4 py-2
                bg-blue-600 hover:bg-blue-700
                disabled:bg-gray-300 dark:disabled:bg-gray-600
                text-white
                rounded-lg
                transition-colors
                flex items-center gap-2
              "
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialData ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
