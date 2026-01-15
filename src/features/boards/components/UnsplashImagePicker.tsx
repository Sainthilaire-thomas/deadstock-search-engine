// src/features/boards/components/UnsplashImagePicker.tsx
'use client';

import { useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  searchUnsplashPhotos, 
  trackDownload, 
  type UnsplashPhoto 
} from '../services/unsplashService';

interface UnsplashImagePickerProps {
  onSelectImage: (imageUrl: string, photo: UnsplashPhoto) => void;
  isLoading?: boolean;
}

export function UnsplashImagePicker({ onSelectImage, isLoading }: UnsplashImagePickerProps) {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (resetPage = true) => {
    if (!query.trim()) return;
    
    setSearching(true);
    setError(null);
    const newPage = resetPage ? 1 : page;
    
    try {
      const result = await searchUnsplashPhotos(query.trim(), newPage, 12);
      setPhotos(resetPage ? result.results : [...photos, ...result.results]);
      setTotalPages(result.total_pages);
      setPage(newPage + 1);
    } catch {
      setError('Erreur lors de la recherche');
    } finally {
      setSearching(false);
    }
  }, [query, page, photos]);

  const handleSelectPhoto = useCallback(async (photo: UnsplashPhoto) => {
    await trackDownload(photo.links.download_location);
    onSelectImage(photo.urls.regular, photo);
  }, [onSelectImage]);

  return (
    <div className="space-y-3">
      {/* Barre de recherche */}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher des images..."
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(true)}
          className="flex-1"
        />
        <Button 
          onClick={() => handleSearch(true)} 
          disabled={searching || !query.trim()}
          size="sm"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Grille de résultats */}
      {photos.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => handleSelectPhoto(photo)}
                disabled={isLoading}
                className="relative aspect-square rounded-md overflow-hidden group
                         hover:ring-2 hover:ring-blue-500 transition-all
                         disabled:opacity-50"
              >
                <img
                  src={photo.urls.thumb}
                  alt={photo.alt_description || 'Unsplash'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 
                              transition-colors flex items-end">
                  <span className="text-[9px] text-white p-1 opacity-0 
                                 group-hover:opacity-100 truncate w-full">
                    📷 {photo.user.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {page <= totalPages && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearch(false)}
              disabled={searching}
              className="w-full"
            >
              {searching && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Charger plus
            </Button>
          )}

          <p className="text-[10px] text-gray-400 text-center">
            Photos par <a href="https://unsplash.com" target="_blank" 
            rel="noopener noreferrer" className="underline">Unsplash</a>
          </p>
        </>
      )}
    </div>
  );
}
