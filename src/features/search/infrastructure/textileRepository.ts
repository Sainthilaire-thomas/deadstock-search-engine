// src/features/search/infrastructure/textileRepository.ts

import { createClient } from '@/lib/supabase/client';
import type { SearchFilters, Textile, AvailableFilters } from '../domain/types';

export const textileRepository = {
  async search(filters: SearchFilters): Promise<Textile[]> {
    const supabase = createClient();
    
    let query = supabase
      .from('textiles')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false });
    
    // Filtres matériaux
    if (filters.materials && filters.materials.length > 0) {
      query = query.in('material_type', filters.materials);
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
      query = query.textSearch('search_vector', filters.keywords);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error searching textiles:', error);
      throw error;
    }
    
    return data || [];
  },

  async findById(id: string): Promise<Textile | null> {
    const supabase = createClient();
    
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
    
    // Get unique materials
    const { data: materials } = await supabase
      .from('textiles')
      .select('material_type')
      .not('material_type', 'is', null)
      .eq('available', true);
    
    // Get unique colors
    const { data: colors } = await supabase
      .from('textiles')
      .select('color')
      .not('color', 'is', null)
      .eq('available', true);
    
    // Get unique patterns
    const { data: patterns } = await supabase
      .from('textiles')
      .select('pattern')
      .not('pattern', 'is', null)
      .eq('available', true);
    
    return {
      materials: [...new Set(materials?.map(m => m.material_type))].sort(),
      colors: [...new Set(colors?.map(c => c.color))].sort(),
      patterns: [...new Set(patterns?.map(p => p.pattern))].sort(),
    };
  },
};
