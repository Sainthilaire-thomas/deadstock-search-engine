/**
 * Favorites Repository
 *
 * Gère les interactions avec la table favorites en base de données
 * Repository unifié pour client et serveur
 */

import { createClient } from '@/lib/supabase/client';
import type {
  Favorite,
  FavoriteWithTextile,
  AddFavoriteParams,
  RemoveFavoriteParams,
  IsFavoriteResult
} from '../domain/types';

// Colonnes textiles alignées avec le schéma DB
const TEXTILE_COLUMNS = `
  id,
  name,
  description,
  material_type,
  color,
  pattern,
  quantity_value,
  quantity_unit,
  price_value,
  price_currency,
  source_platform,
  source_url,
  image_url,
  additional_images,
  width_value,
  width_unit,
  weight_value,
  weight_unit,
  composition
`;

/**
 * Récupère tous les favoris d'une session avec les données des textiles
 */
export async function getFavoritesBySession(userId: string): Promise<FavoriteWithTextile[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('favorites')
      .select(`id, user_id, textile_id, created_at, textile:textiles(${TEXTILE_COLUMNS})`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }

    // Transformer les données : textile peut être un tableau ou un objet
    return (data || []).map((item) => ({
      ...item,
      textile: Array.isArray(item.textile) ? item.textile[0] : item.textile,
    })) as FavoriteWithTextile[];
  } catch (err) {
    console.error('Exception fetching favorites:', err);
    return [];
  }
}

/**
 * Ajoute un textile aux favoris
 */
export async function addFavorite(params: AddFavoriteParams): Promise<Favorite> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: params.user_id,
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
    .eq('user_id', params.user_id)
    .eq('textile_id', params.textile_id);

  if (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

/**
 * Vérifie si un textile est dans les favoris
 */
export async function isFavorite(userId: string, textileId: string): Promise<IsFavoriteResult> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
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
export async function getFavoritesCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error counting favorites:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Récupère un favori spécifique avec les données du textile
 */
export async function getFavoriteById(favoriteId: string, userId: string): Promise<FavoriteWithTextile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('favorites')
    .select(`id, user_id, textile_id, created_at, textile:textiles(${TEXTILE_COLUMNS})`)
    .eq('id', favoriteId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching favorite by id:', error);
    return null;
  }

  if (!data) return null;

  // Transformer : textile peut être un tableau ou un objet
  return {
    ...data,
    textile: Array.isArray(data.textile) ? data.textile[0] : data.textile,
  } as FavoriteWithTextile;
}
