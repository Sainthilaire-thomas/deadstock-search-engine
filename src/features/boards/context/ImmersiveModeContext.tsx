// src/features/boards/context/ImmersiveModeContext.tsx

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ImmersiveModeContextValue {
  isImmersive: boolean;
  enterImmersiveMode: () => void;
  exitImmersiveMode: () => void;
  toggleImmersiveMode: () => void;
}

const ImmersiveModeContext = createContext<ImmersiveModeContextValue | null>(null);

export function ImmersiveModeProvider({ children }: { children: ReactNode }) {
  const [isImmersive, setIsImmersive] = useState(false);

  const enterImmersiveMode = useCallback(() => setIsImmersive(true), []);
  const exitImmersiveMode = useCallback(() => setIsImmersive(false), []);
  const toggleImmersiveMode = useCallback(() => setIsImmersive(prev => !prev), []);

  return (
    <ImmersiveModeContext.Provider
      value={{
        isImmersive,
        enterImmersiveMode,
        exitImmersiveMode,
        toggleImmersiveMode,
      }}
    >
      {children}
    </ImmersiveModeContext.Provider>
  );
}

export function useImmersiveMode() {
  const context = useContext(ImmersiveModeContext);
  if (!context) {
    throw new Error('useImmersiveMode must be used within ImmersiveModeProvider');
  }
  return context;
}

// Hook optionnel pour les composants qui peuvent être hors du provider
export function useImmersiveModeOptional() {
  return useContext(ImmersiveModeContext);
}
