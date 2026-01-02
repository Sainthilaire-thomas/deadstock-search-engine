/**
 * Favorites Repository - Server Version
 */

import { createClient } from '@/lib/supabase/client';
import type { FavoriteWithTextile } from '../domain/types';

export async function getFavoritesBySessionServer(sessionId: string): Promise<FavoriteWithTextile[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('favorites')
      .select('id, session_id, textile_id, created_at, textile:textiles(id, name, description, material_type, color, pattern, quantity_value, quantity_unit, price_value, price_currency, source_platform, source_url, image_url, additional_images, width_value, width_unit, weight_value, weight_unit, composition)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Server] Error fetching favorites:', error);
      return [];
    }

    return (data || []) as FavoriteWithTextile[];
  } catch (err) {
    console.error('[Server] Exception fetching favorites:', err);
    return [];
  }
}
