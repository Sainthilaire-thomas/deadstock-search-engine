// src/features/boards/context/TransformContext.tsx
// Sprint P1.1 - Gestion du zoom et pan du canvas
'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';

// ============================================
// CONSTANTS
// ============================================
const ZOOM_STEP = 0.1; // 10% par step
const ZOOM_MIN = 0.25; // 25%
const ZOOM_MAX = 3; // 300%
const ZOOM_DEFAULT = 1; // 100%
const DEBOUNCE_DELAY = 300; // ms

// ============================================
// TYPES
// ============================================
export interface TransformState {
  scale: number; // 0.25 à 3 (25% à 300%)
  offsetX: number; // Pan horizontal (pour future évolution)
  offsetY: number; // Pan vertical (pour future évolution)
}

interface TransformContextValue {
  transform: TransformState;
  setScale: (scale: number) => void;
  zoomIn: () => void; // +10%
  zoomOut: () => void; // -10%
  resetZoom: () => void; // → 100%
  zoomToFit: (contentBounds: ContentBounds) => void;
  setOffset: (x: number, y: number) => void;
}

export interface ContentBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

// ============================================
// ACTIONS
// ============================================
type TransformAction =
  | { type: 'SET_SCALE'; payload: number }
  | { type: 'SET_OFFSET'; payload: { x: number; y: number } }
  | { type: 'SET_TRANSFORM'; payload: TransformState }
  | { type: 'ZOOM_IN' }
  | { type: 'ZOOM_OUT' }
  | { type: 'RESET_ZOOM' };

// ============================================
// REDUCER
// ============================================
function transformReducer(
  state: TransformState,
  action: TransformAction
): TransformState {
  switch (action.type) {
    case 'SET_SCALE': {
      const clampedScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, action.payload));
      return { ...state, scale: clampedScale };
    }
    case 'SET_OFFSET':
      return { ...state, offsetX: action.payload.x, offsetY: action.payload.y };
    case 'SET_TRANSFORM':
      return action.payload;
    case 'ZOOM_IN': {
      const newScale = Math.min(ZOOM_MAX, state.scale + ZOOM_STEP);
      return { ...state, scale: Math.round(newScale * 100) / 100 };
    }
    case 'ZOOM_OUT': {
      const newScale = Math.max(ZOOM_MIN, state.scale - ZOOM_STEP);
      return { ...state, scale: Math.round(newScale * 100) / 100 };
    }
    case 'RESET_ZOOM':
      return { ...state, scale: ZOOM_DEFAULT };
    default:
      return state;
  }
}

// ============================================
// INITIAL STATE
// ============================================
const initialState: TransformState = {
  scale: ZOOM_DEFAULT,
  offsetX: 0,
  offsetY: 0,
};

// ============================================
// CONTEXT
// ============================================
const TransformContext = createContext<TransformContextValue | null>(null);

// ============================================
// STORAGE HELPERS
// ============================================
function getStorageKey(boardId: string): string {
  return `deadstock_zoom_${boardId}`;
}

function loadFromStorage(boardId: string): TransformState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(getStorageKey(boardId));
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validation des données
      if (
        typeof parsed.scale === 'number' &&
        typeof parsed.offsetX === 'number' &&
        typeof parsed.offsetY === 'number' &&
        parsed.scale >= ZOOM_MIN &&
        parsed.scale <= ZOOM_MAX
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load transform from localStorage:', e);
  }
  return null;
}

function saveToStorage(boardId: string, state: TransformState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getStorageKey(boardId), JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save transform to localStorage:', e);
  }
}

// ============================================
// PROVIDER
// ============================================
interface TransformProviderProps {
  children: ReactNode;
  boardId: string;
  viewportWidth?: number;
  viewportHeight?: number;
}

export function TransformProvider({
  children,
  boardId,
  viewportWidth = 800,
  viewportHeight = 600,
}: TransformProviderProps) {
  const [state, dispatch] = useReducer(transformReducer, initialState);

  // Charger depuis localStorage au mount
  useEffect(() => {
    const saved = loadFromStorage(boardId);
    if (saved) {
      dispatch({ type: 'SET_TRANSFORM', payload: saved });
    }
  }, [boardId]);

  // Sauvegarder dans localStorage avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage(boardId, state);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [boardId, state]);

  // Actions
  const setScale = useCallback((scale: number) => {
    dispatch({ type: 'SET_SCALE', payload: scale });
  }, []);

  const zoomIn = useCallback(() => {
    dispatch({ type: 'ZOOM_IN' });
  }, []);

  const zoomOut = useCallback(() => {
    dispatch({ type: 'ZOOM_OUT' });
  }, []);

  const resetZoom = useCallback(() => {
    dispatch({ type: 'RESET_ZOOM' });
  }, []);

  const setOffset = useCallback((x: number, y: number) => {
    dispatch({ type: 'SET_OFFSET', payload: { x, y } });
  }, []);

  const zoomToFit = useCallback(
    (contentBounds: ContentBounds) => {
      if (contentBounds.width === 0 || contentBounds.height === 0) {
        // Pas de contenu, reset au zoom par défaut
        dispatch({ type: 'RESET_ZOOM' });
        return;
      }

      // Calculer le scale pour que tout le contenu tienne dans le viewport
      // avec un padding de 50px de chaque côté
      const padding = 50;
      const availableWidth = viewportWidth - padding * 2;
      const availableHeight = viewportHeight - padding * 2;

      const scaleX = availableWidth / contentBounds.width;
      const scaleY = availableHeight / contentBounds.height;

      // Prendre le plus petit pour que tout tienne
      let newScale = Math.min(scaleX, scaleY);

      // Limiter aux bornes
      newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, newScale));

      // Arrondir à 2 décimales
      newScale = Math.round(newScale * 100) / 100;

      dispatch({ type: 'SET_SCALE', payload: newScale });
    },
    [viewportWidth, viewportHeight]
  );

  const value: TransformContextValue = {
    transform: state,
    setScale,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToFit,
    setOffset,
  };

  return (
    <TransformContext.Provider value={value}>
      {children}
    </TransformContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================
export function useTransform(): TransformContextValue {
  const context = useContext(TransformContext);
  if (!context) {
    throw new Error('useTransform must be used within a TransformProvider');
  }
  return context;
}

// ============================================
// EXPORTS
// ============================================
export { ZOOM_MIN, ZOOM_MAX, ZOOM_DEFAULT, ZOOM_STEP };
