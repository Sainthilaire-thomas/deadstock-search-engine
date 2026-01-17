// src/features/boards/components/elements/LinkElement.tsx
// Sprint 5 - Élément lien web avec preview
// Double-clic = édition (géré par ElementCard), bouton = ouvrir lien

'use client';

import React from 'react';
import { Globe, Image as ImageIcon } from 'lucide-react';

export interface LinkElementData {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  favicon?: string;
  siteName?: string;
}

interface LinkElementProps {
  data: LinkElementData;
  width: number;
  height: number;
}

/**
 * Extrait le domaine d'une URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Génère une URL de favicon depuis Google
 */
export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return '';
  }
}

export const LinkElement = React.memo(function LinkElement({ data, width, height }: LinkElementProps) {
  const domain = extractDomain(data.url);
  const faviconUrl = data.favicon || getFaviconUrl(data.url);
  const isCompact = height < 100;

  // Mode compact (petite hauteur)
  if (isCompact) {
    return (
      <div className="flex items-center gap-2 h-full">
        {/* Favicon */}
        <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              className="w-4 h-4"
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <Globe className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Texte */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {data.title || domain}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {domain}
          </p>
        </div>
      </div>
    );
  }

  // Mode normal avec image preview
  return (
    <div className="flex flex-col h-full">
      {/* Image preview */}
      <div className="relative flex-1 min-h-0 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.title || ''}
            className="w-full h-full object-cover"
            draggable={false}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="mt-2 space-y-0.5">
        {/* Site name + favicon */}
        <div className="flex items-center gap-1.5">
          {faviconUrl && (
            <img
              src={faviconUrl}
              alt=""
              className="w-3 h-3"
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
            {data.siteName || domain}
          </span>
        </div>

        {/* Titre */}
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
          {data.title || domain}
        </p>

        {/* Description */}
        {data.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {data.description}
          </p>
        )}
      </div>
    </div>
  );
});
