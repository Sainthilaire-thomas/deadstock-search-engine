// src/features/boards/components/VideoModal.tsx
// Sprint 5 - Modal d'ajout de vidéo YouTube/Vimeo

'use client';

import { useState, useEffect } from 'react';
import { X, Video, Link2, Loader2, AlertCircle, Play } from 'lucide-react';
import { parseVideoUrl, type VideoElementData } from './elements/VideoElement';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VideoElementData) => void;
  initialData?: VideoElementData;
}

export function VideoModal({ isOpen, onClose, onSave, initialData }: VideoModalProps) {
  const [url, setUrl] = useState(initialData?.url || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Partial<VideoElementData> | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setUrl(initialData?.url || '');
      setTitle(initialData?.title || '');
      setError(null);
      setPreview(initialData ? {
        platform: initialData.platform,
        videoId: initialData.videoId,
        thumbnailUrl: initialData.thumbnailUrl,
      } : null);
    }
  }, [isOpen, initialData]);

  // Parse URL when it changes
  useEffect(() => {
    if (!url.trim()) {
      setPreview(null);
      setError(null);
      return;
    }

    // Debounce
    const timer = setTimeout(() => {
      const parsed = parseVideoUrl(url);
      
      if (parsed.platform === 'unknown') {
        setError('URL non reconnue. Collez une URL YouTube ou Vimeo.');
        setPreview(null);
      } else {
        setError(null);
        setPreview(parsed);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    if (!preview || preview.platform === 'unknown') {
      setError('URL non valide');
      return;
    }

    setIsLoading(true);
    
    try {
      const videoData: VideoElementData = {
        url: url.trim(),
        title: title.trim() || undefined,
        platform: preview.platform!,
        videoId: preview.videoId,
        thumbnailUrl: preview.thumbnailUrl,
      };

      onSave(videoData);
      onClose();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
            <Video className="w-5 h-5 text-red-500" />
            <h2 className="font-medium text-gray-900 dark:text-gray-100">
              {initialData ? 'Modifier la vidéo' : 'Ajouter une vidéo'}
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
              URL de la vidéo
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="
                  w-full pl-10 pr-4 py-2
                  border border-gray-300 dark:border-gray-600
                  rounded-lg
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400
                  focus:ring-2 focus:ring-red-500 focus:border-transparent
                "
                autoFocus
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Supporte YouTube et Vimeo
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview */}
          {preview && preview.platform !== 'unknown' && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="relative aspect-video bg-gray-900">
                {preview.thumbnailUrl ? (
                  <img
                    src={preview.thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                </div>
                
                {/* Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${preview.platform === 'youtube' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-blue-500 text-white'
                    }
                  `}>
                    {preview.platform === 'youtube' ? 'YouTube' : 'Vimeo'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Title Input (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre (optionnel)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre personnalisé..."
              className="
                w-full px-4 py-2
                border border-gray-300 dark:border-gray-600
                rounded-lg
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100
                placeholder-gray-400
                focus:ring-2 focus:ring-red-500 focus:border-transparent
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
              disabled={isLoading || !preview || preview.platform === 'unknown'}
              className="
                px-4 py-2
                bg-red-600 hover:bg-red-700
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
