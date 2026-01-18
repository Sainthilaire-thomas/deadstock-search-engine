// src/features/navigation/context/NavigationContext.tsx

'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ActiveBoard {
  id: string;
  name: string;
  returnPath: string;
}

interface NavigationContextType {
  activeBoard: ActiveBoard | null;
  setActiveBoard: (board: ActiveBoard | null) => void;
  clearActiveBoard: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeBoard, setActiveBoardState] = useState<ActiveBoard | null>(null);

  // Restaurer depuis sessionStorage au montage
  useEffect(() => {
    const stored = sessionStorage.getItem('activeBoard');
    if (stored) {
      try {
        setActiveBoardState(JSON.parse(stored));
      } catch {
        // Ignore parsing errors
      }
    }
  }, []);

  const setActiveBoard = useCallback((board: ActiveBoard | null) => {
    setActiveBoardState(board);
    if (board) {
      sessionStorage.setItem('activeBoard', JSON.stringify(board));
    } else {
      sessionStorage.removeItem('activeBoard');
    }
  }, []);

  const clearActiveBoard = useCallback(() => {
    setActiveBoardState(null);
    sessionStorage.removeItem('activeBoard');
  }, []);

  return (
    <NavigationContext.Provider value={{ activeBoard, setActiveBoard, clearActiveBoard }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
