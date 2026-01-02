'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFavoritesCountAction } from '../actions/favoriteActions';

interface FavoritesContextType {
  favoriteIds: Set<string>;
  count: number;
  addFavorite: (textileId: string) => void;
  removeFavorite: (textileId: string) => void;
  isFavorite: (textileId: string) => boolean;
  refreshCount: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ 
  children, 
  initialFavorites = [] 
}: { 
  children: React.ReactNode;
  initialFavorites?: string[];
}) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set(initialFavorites));
  const [count, setCount] = useState(initialFavorites.length);

  const addFavorite = useCallback((textileId: string) => {
    setFavoriteIds(prev => new Set([...prev, textileId]));
    setCount(prev => prev + 1);
  }, []);

  const removeFavorite = useCallback((textileId: string) => {
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(textileId);
      return newSet;
    });
    setCount(prev => Math.max(0, prev - 1));
  }, []);

  const isFavorite = useCallback((textileId: string) => {
    return favoriteIds.has(textileId);
  }, [favoriteIds]);

  const refreshCount = useCallback(async () => {
    const result = await getFavoritesCountAction();
    if (result.success) {
      setCount(result.count);
    }
  }, []);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, count, addFavorite, removeFavorite, isFavorite, refreshCount }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
