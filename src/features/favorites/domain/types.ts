/**
 * Domain Types - Favorites
 */

export interface Favorite {
  id: string;
  user_id: string | null;
  textile_id: string;
  created_at: string | null;
}

export interface FavoriteWithTextile extends Favorite {
  textile: {
    id: string;
    name: string;
    description: string | null;
    material_type: string | null;
    color: string | null;
    pattern: string | null;
    quantity_value: number;
    quantity_unit: string;
    price_value: number | null;
    price_currency: string;
    source_platform: string;
    source_url: string;
    image_url: string | null;
    additional_images: string[] | null;
    width_value: number | null;
    width_unit: string | null;
    weight_value: number | null;
    weight_unit: string | null;
    composition: any | null;
  };
}

export interface AddFavoriteParams {
  user_id: string;
  textile_id: string;
}

export interface RemoveFavoriteParams {
  user_id: string;
  textile_id: string;
}
export interface IsFavoriteResult {
  isFavorite: boolean;
  favoriteId?: string;
}
