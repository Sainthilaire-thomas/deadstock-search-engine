// src/features/boards/context/ZoneFocusContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { BoardZone } from '../domain/types';

interface ZoneFocusContextValue {
  focusedZone: BoardZone | null;
  isFocusMode: boolean;
  overlayPosition: { x: number; y: number };
  openFocusMode: (zone: BoardZone) => void;
  closeFocusMode: () => void;
  setOverlayPosition: (pos: { x: number; y: number }) => void;
}

const ZoneFocusContext = createContext<ZoneFocusContextValue | null>(null);

interface ZoneFocusProviderProps {
  children: ReactNode;
}

export function ZoneFocusProvider({ children }: ZoneFocusProviderProps) {
  const [focusedZone, setFocusedZone] = useState<BoardZone | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 50, y: 50 }); // Position en % du viewport

  const openFocusMode = useCallback((zone: BoardZone) => {
    setFocusedZone(zone);
    // Reset position au centre
    setOverlayPosition({ x: 50, y: 50 });
  }, []);

  const closeFocusMode = useCallback(() => {
    setFocusedZone(null);
  }, []);

  const value: ZoneFocusContextValue = {
    focusedZone,
    isFocusMode: focusedZone !== null,
    overlayPosition,
    openFocusMode,
    closeFocusMode,
    setOverlayPosition,
  };

  return (
    <ZoneFocusContext.Provider value={value}>
      {children}
    </ZoneFocusContext.Provider>
  );
}

export function useZoneFocus() {
  const context = useContext(ZoneFocusContext);
  if (!context) {
    throw new Error('useZoneFocus must be used within a ZoneFocusProvider');
  }
  return context;
}

// Hook optionnel pour les composants qui peuvent être hors du provider
export function useZoneFocusOptional() {
  return useContext(ZoneFocusContext);
}
