/**
 * Favorite Actions
 * 
 * Server Actions pour gérer les favoris depuis les composants React
 */

'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/auth/getAuthUser';
import {
  addFavorite as addFavoriteRepo,
  removeFavorite as removeFavoriteRepo,
  getFavoritesBySession,
  isFavorite as isFavoriteRepo,
  getFavoritesCount as getFavoritesCountRepo,
} from '../infrastructure/favoritesRepository';

/**
 * Ajoute un textile aux favoris
 */
export async function addFavoriteAction(textileId: string) {
  try {
    const userId = await requireUserId();
    
    // Vérifier si déjà en favori
    const { isFavorite } = await isFavoriteRepo(userId, textileId);
    if (isFavorite) {
      return { success: true, message: 'Already in favorites' };
    }

    await addFavoriteRepo({ user_id: userId, textile_id: textileId });
    
    // Revalider les pages concernées
    revalidatePath('/favorites');
    revalidatePath('/search');
    
    return { success: true, message: 'Added to favorites' };
  } catch (error) {
    console.error('Error in addFavoriteAction:', error);
    return { success: false, message: 'Failed to add favorite' };
  }
}

/**
 * Supprime un textile des favoris
 */
export async function removeFavoriteAction(textileId: string) {
  try {
    const userId = await requireUserId();
    
    await removeFavoriteRepo({ user_id: userId, textile_id: textileId });
    
    // Revalider les pages concernées
    revalidatePath('/favorites');
    revalidatePath('/favorites/' + textileId);
    revalidatePath('/search');
    
    return { success: true, message: 'Removed from favorites' };
  } catch (error) {
    console.error('Error in removeFavoriteAction:', error);
    return { success: false, message: 'Failed to remove favorite' };
  }
}

/**
 * Récupère tous les favoris de la session courante
 */
export async function getFavoritesAction() {
  try {
    const userId = await requireUserId();
    const favorites = await getFavoritesBySession(userId);
    
    return { success: true, data: favorites };
  } catch (error) {
    console.error('Error in getFavoritesAction:', error);
    return { success: false, data: [] };
  }
}

/**
 * Vérifie si un textile est en favori
 */
export async function checkIsFavoriteAction(textileId: string) {
  try {
    const userId = await requireUserId();
    const result = await isFavoriteRepo(userId, textileId);
    
    return { success: true, ...result };
  } catch (error) {
    console.error('Error in checkIsFavoriteAction:', error);
    return { success: false, isFavorite: false };
  }
}

/**
 * Compte le nombre de favoris
 */
export async function getFavoritesCountAction() {
  try {
    const userId = await requireUserId();
    const count = await getFavoritesCountRepo(userId);
    
    return { success: true, count };
  } catch (error) {
    console.error('Error in getFavoritesCountAction:', error);
    return { success: false, count: 0 };
  }
}

/**
 * Toggle favori (ajoute ou supprime selon l'état actuel)
 */
export async function toggleFavoriteAction(textileId: string) {
  try {
    const userId = await requireUserId();
    const { isFavorite } = await isFavoriteRepo(userId, textileId);
    
    if (isFavorite) {
      await removeFavoriteRepo({ user_id: userId, textile_id: textileId });
      revalidatePath('/favorites');
      revalidatePath('/search');
      return { success: true, action: 'removed', message: 'Removed from favorites' };
    } else {
      await addFavoriteRepo({ user_id: userId, textile_id: textileId });
      revalidatePath('/favorites');
      revalidatePath('/search');
      return { success: true, action: 'added', message: 'Added to favorites' };
    }
  } catch (error) {
    console.error('Error in toggleFavoriteAction:', error);
    return { success: false, action: 'error', message: 'Failed to toggle favorite' };
  }
}
