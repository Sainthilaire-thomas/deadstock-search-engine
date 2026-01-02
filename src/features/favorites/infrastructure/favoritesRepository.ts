/**
 * Favorites Repository
 * 
 * Gère les interactions avec la table favorites en base de données
 */

import { createClient } from '@/lib/supabase/client';
import type { 
  Favorite, 
  FavoriteWithTextile, 
  AddFavoriteParams, 
  RemoveFavoriteParams,
  IsFavoriteResult 
} from '../domain/types';

/**
 * Récupère tous les favoris d'une session avec les données des textiles
 */
export async function getFavoritesBySession(sessionId: string): Promise<FavoriteWithTextile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('favorites')
    .select('id, session_id, textile_id, created_at, textile:textiles(id, name, slug, price, currency, quantity_available, unit, image_url, source_platform, source_url, material_en, color_en, pattern_en, weave_en, composition, width_cm, weight_gsm)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }

  return data as FavoriteWithTextile[];
}

/**
 * Ajoute un textile aux favoris
 */
export async function addFavorite(params: AddFavoriteParams): Promise<Favorite> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      session_id: params.session_id,
      textile_id: params.textile_id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }

  return data;
}

/**
 * Supprime un textile des favoris
 */
export async function removeFavorite(params: RemoveFavoriteParams): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('session_id', params.session_id)
    .eq('textile_id', params.textile_id);

  if (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

/**
 * Vérifie si un textile est dans les favoris
 */
export async function isFavorite(sessionId: string, textileId: string): Promise<IsFavoriteResult> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('session_id', sessionId)
    .eq('textile_id', textileId)
    .maybeSingle();

  if (error) {
    console.error('Error checking favorite:', error);
    return { isFavorite: false };
  }

  return {
    isFavorite: !!data,
    favoriteId: data?.id,
  };
}

/**
 * Compte le nombre de favoris d'une session
 */
export async function getFavoritesCount(sessionId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error counting favorites:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Récupère un favori spécifique avec les données du textile
 */
export async function getFavoriteById(favoriteId: string, sessionId: string): Promise<FavoriteWithTextile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('favorites')
    .select('id, session_id, textile_id, created_at, textile:textiles(id, name, slug, price, currency, quantity_available, unit, image_url, source_platform, source_url, material_en, color_en, pattern_en, weave_en, composition, width_cm, weight_gsm)')
    .eq('id', favoriteId)
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching favorite by id:', error);
    return null;
  }

  return data as FavoriteWithTextile | null;
}
