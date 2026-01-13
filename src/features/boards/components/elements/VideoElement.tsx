// src/features/boards/components/elements/VideoElement.tsx
// Sprint 5 - Élément vidéo YouTube/Vimeo

'use client';

import { Play, ExternalLink } from 'lucide-react';

export interface VideoElementData {
  url: string;
  title?: string;
  thumbnailUrl?: string;
  platform: 'youtube' | 'vimeo' | 'unknown';
  videoId?: string;
}

interface VideoElementProps {
  data: VideoElementData;
  width: number;
  height: number;
  isPreview?: boolean; // Mode aperçu (pas d'embed)
}

/**
 * Extrait les infos d'une URL vidéo YouTube ou Vimeo
 */
export function parseVideoUrl(url: string): Partial<VideoElementData> {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      const videoId = match[1];
      return {
        platform: 'youtube',
        videoId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      };
    }
  }
  
  // Vimeo patterns
  const vimeoPattern = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) {
    return {
      platform: 'vimeo',
      videoId: vimeoMatch[1],
      // Vimeo thumbnails require API call, on utilise un placeholder
      thumbnailUrl: undefined,
    };
  }
  
  return { platform: 'unknown' };
}

/**
 * Génère l'URL d'embed pour une vidéo
 */
function getEmbedUrl(data: VideoElementData): string | null {
  if (data.platform === 'youtube' && data.videoId) {
    return `https://www.youtube.com/embed/${data.videoId}?rel=0`;
  }
  if (data.platform === 'vimeo' && data.videoId) {
    return `https://player.vimeo.com/video/${data.videoId}`;
  }
  return null;
}

export function VideoElement({ data, width, height, isPreview = true }: VideoElementProps) {
  const embedUrl = getEmbedUrl(data);
  
  // Mode preview (thumbnail + bouton play)
  if (isPreview || !embedUrl) {
    return (
      <div className="h-full flex flex-col">
        {/* Thumbnail ou placeholder */}
        <div className="relative flex-1 min-h-0 bg-gray-900 rounded overflow-hidden">
          {data.thumbnailUrl ? (
            <img
              src={data.thumbnailUrl}
              alt={data.title || 'Vidéo'}
              className="w-full h-full object-cover"
              draggable={false}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-800 to-gray-900">
              <Play className="w-8 h-8 text-gray-500" />
            </div>
          )}
          
          {/* Overlay play button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>
          
          {/* Badge plateforme */}
          <div className="absolute top-2 left-2">
            <span className={`
              px-1.5 py-0.5 rounded text-[10px] font-medium uppercase
              ${data.platform === 'youtube' 
                ? 'bg-red-600 text-white' 
                : data.platform === 'vimeo'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-600 text-white'
              }
            `}>
              {data.platform === 'youtube' ? 'YT' : data.platform === 'vimeo' ? 'Vimeo' : 'Video'}
            </span>
          </div>
        </div>
        
        {/* Titre */}
        {data.title && (
          <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 truncate px-1">
            {data.title}
          </p>
        )}
      </div>
    );
  }
  
  // Mode embed (iframe)
  return (
    <div className="h-full flex flex-col">
      <div className="relative flex-1 min-h-0 rounded overflow-hidden bg-black">
        <iframe
          src={embedUrl}
          title={data.title || 'Vidéo'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      {/* Lien externe */}
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="w-3 h-3" />
        Ouvrir
      </a>
    </div>
  );
}
