// src/features/boards/components/ZoomControls.tsx
// Sprint P1.3a - Contrôles visuels pour le zoom
'use client';

import { useState, useRef, useEffect } from 'react';
import { Minus, Plus, Maximize } from 'lucide-react';
import { useTransform, ZOOM_MIN, ZOOM_MAX } from '../context/TransformContext';

// Presets de zoom disponibles
const ZOOM_PRESETS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
  { label: '125%', value: 1.25 },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2 },
  { label: '300%', value: 3 },
];

interface ZoomControlsProps {
  /** Callback pour calculer les bounds du contenu (pour Fit) */
  onRequestFit?: () => void;
}

export function ZoomControls({ onRequestFit }: ZoomControlsProps) {
  const { transform, zoomIn, zoomOut, setScale, resetZoom } = useTransform();
  const [showPresets, setShowPresets] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPresets(false);
      }
    };

    if (showPresets) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPresets]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on est dans un input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            resetZoom();
            break;
          case '1':
            e.preventDefault();
            onRequestFit?.();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetZoom, onRequestFit]);

  const currentPercentage = Math.round(transform.scale * 100);

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-10">
      {/* Zoom Out */}
      <button
        onClick={zoomOut}
        disabled={transform.scale <= ZOOM_MIN}
        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Zoom arrière (Ctrl+Scroll)"
      >
        <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Pourcentage avec dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="px-2 py-1 min-w-13 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Cliquer pour choisir un niveau de zoom"
        >
          {currentPercentage}%
        </button>

        {/* Dropdown presets */}
        {showPresets && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-20">
            {ZOOM_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  setScale(preset.value);
                  setShowPresets(false);
                }}
                className={`w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  Math.abs(transform.scale - preset.value) < 0.01
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <button
              onClick={() => {
                resetZoom();
                setShowPresets(false);
              }}
              className="w-full px-3 py-1.5 text-sm text-left text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Réinitialiser (Ctrl+0)
            </button>
          </div>
        )}
      </div>

      {/* Zoom In */}
      <button
        onClick={zoomIn}
        disabled={transform.scale >= ZOOM_MAX}
        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Zoom avant (Ctrl+Scroll)"
      >
        <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Séparateur */}
      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* Fit to content */}
      <button
        onClick={onRequestFit}
        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Ajuster à la vue (Ctrl+1)"
      >
        <Maximize className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}
