// src/features/boards/context/ZoneFocusContext.tsx
// NOTE: Fichier garde son nom pour compatibilité, mais utilise Board (ex-Zone)
'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Board } from '../domain/types';

interface ZoneFocusContextValue {
  // Nouveau nom (Board unifié)
  focusedChildBoard: Board | null;
  isFocusMode: boolean;
  overlayPosition: { x: number; y: number };
  openFocusMode: (childBoard: Board) => void;
  closeFocusMode: () => void;
  setOverlayPosition: (pos: { x: number; y: number }) => void;
  // Alias deprecated pour migration progressive
  /** @deprecated Use focusedChildBoard instead */
  focusedZone: Board | null;
}

const ZoneFocusContext = createContext<ZoneFocusContextValue | null>(null);

interface ZoneFocusProviderProps {
  children: ReactNode;
}

export function ZoneFocusProvider({ children }: ZoneFocusProviderProps) {
  const [focusedChildBoard, setFocusedChildBoard] = useState<Board | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 50, y: 50 });

  const openFocusMode = useCallback((childBoard: Board) => {
    setFocusedChildBoard(childBoard);
    setOverlayPosition({ x: 50, y: 50 });
  }, []);

  const closeFocusMode = useCallback(() => {
    setFocusedChildBoard(null);
  }, []);

  const value: ZoneFocusContextValue = {
    focusedChildBoard,
    isFocusMode: focusedChildBoard !== null,
    overlayPosition,
    openFocusMode,
    closeFocusMode,
    setOverlayPosition,
    // Alias deprecated
    focusedZone: focusedChildBoard,
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

export function useZoneFocusOptional() {
  return useContext(ZoneFocusContext);
}
