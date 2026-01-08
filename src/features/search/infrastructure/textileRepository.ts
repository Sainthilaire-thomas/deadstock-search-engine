// src/features/search/infrastructure/textileRepository.ts

import { createClient } from '@/lib/supabase/client';
import type { SearchFilters, Textile, AvailableFilters } from '../domain/types';

export const textileRepository = {
  async search(filters: SearchFilters): Promise<Textile[]> {
    const supabase = createClient();

    // Utiliser la vue matérialisée textiles_search
    let query = supabase
      .from('textiles_search')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtres fiber (anciennement materials/material_type)
    if (filters.materials && filters.materials.length > 0) {
      query = query.in('fiber', filters.materials);
    }

    // Filtres couleurs
    if (filters.colors && filters.colors.length > 0) {
      query = query.in('color', filters.colors);
    }

    // Filtres patterns
    if (filters.patterns && filters.patterns.length > 0) {
      query = query.in('pattern', filters.patterns);
    }

    // Filtres quantité
    if (filters.minQuantity !== undefined) {
      query = query.gte('quantity_value', filters.minQuantity);
    }
    if (filters.maxQuantity !== undefined) {
      query = query.lte('quantity_value', filters.maxQuantity);
    }

    // Filtres prix
    if (filters.minPrice !== undefined) {
      query = query.gte('price_value', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price_value', filters.maxPrice);
    }

    // Recherche texte (si keywords)
    if (filters.keywords) {
      query = query.or(`name.ilike.%${filters.keywords}%,description.ilike.%${filters.keywords}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching textiles:', error);
      throw error;
    }

    // Mapper fiber vers material_type pour compatibilité avec le reste de l'app
    return (data || []).map(textile => ({
      ...textile,
      material_type: textile.fiber, // Alias pour rétrocompatibilité
    }));
  },

  async findById(id: string): Promise<Textile | null> {
    const supabase = createClient();

    // Garder la table textiles pour les lookups individuels (favoris, boards)
    const { data, error } = await supabase
      .from('textiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching textile:', error);
      return null;
    }

    return data;
  },

  async getAvailableFilters(): Promise<AvailableFilters> {
    const supabase = createClient();

    // Utiliser la vue matérialisée pour les filtres
    const { data: fibers } = await supabase
      .from('textiles_search')
      .select('fiber')
      .not('fiber', 'is', null);

    const { data: colors } = await supabase
      .from('textiles_search')
      .select('color')
      .not('color', 'is', null);

    const { data: patterns } = await supabase
      .from('textiles_search')
      .select('pattern')
      .not('pattern', 'is', null);

    return {
      materials: [...new Set(fibers?.map(f => f.fiber))].filter(Boolean).sort(),
      colors: [...new Set(colors?.map(c => c.color))].filter(Boolean).sort(),
      patterns: [...new Set(patterns?.map(p => p.pattern))].filter(Boolean).sort(),
    };
  },
};
