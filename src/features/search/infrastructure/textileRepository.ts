// src/features/search/infrastructure/textileRepository.ts

import { createClient } from '@/lib/supabase/client';
import type { SearchFilters, Textile, AvailableFilters, FilterCategory } from '../domain/types';

export const textileRepository = {
  async search(filters: SearchFilters): Promise<Textile[]> {
    const supabase = createClient();

    // Utiliser la vue matérialisée textiles_search
    let query = supabase
      .from('textiles_search')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtres dynamiques par catégorie
    if (filters.categoryFilters) {
      for (const [slug, values] of Object.entries(filters.categoryFilters)) {
        if (values && values.length > 0) {
          // Le slug correspond à la colonne dans textiles_search (fiber, color, pattern, weave)
          query = query.in(slug, values);
        }
      }
    }

    // Legacy filters (rétrocompatibilité)
    if (filters.materials && filters.materials.length > 0) {
      query = query.in('fiber', filters.materials);
    }
    if (filters.colors && filters.colors.length > 0) {
      query = query.in('color', filters.colors);
    }
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
      material_type: textile.fiber,
    }));
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

    // 1. Récupérer les catégories searchable depuis attribute_categories
    const { data: categoriesData, error: catError } = await supabase
      .from('attribute_categories')
      .select('slug, name, display_order')
      .eq('is_searchable', true)
      .order('display_order', { ascending: true });

    if (catError) {
      console.error('Error fetching categories:', catError);
    }

    // 2. Pour chaque catégorie, récupérer les valeurs distinctes depuis textile_attributes
    const categories: FilterCategory[] = [];

    for (const cat of categoriesData || []) {
      const { data: valuesData } = await supabase
        .from('textile_attributes')
        .select('value')
        .eq('category_slug', cat.slug);

      const uniqueValues = [...new Set(valuesData?.map(v => v.value))]
        .filter(Boolean)
        .sort() as string[];

      // N'ajouter que si on a des valeurs
      if (uniqueValues.length > 0) {
        categories.push({
          slug: cat.slug,
          name: cat.name,
          displayOrder: cat.display_order,
          values: uniqueValues,
        });
      }
    }

    // 3. Récupérer le range de prix au mètre
    const { data: priceData } = await supabase
      .from('textiles_search')
      .select('price_per_meter')
      .not('price_per_meter', 'is', null)
      .gt('price_per_meter', 0);

    let priceRange: { min: number; max: number } | undefined;
    if (priceData && priceData.length > 0) {
      const prices = priceData.map(p => p.price_per_meter).filter((p): p is number => p !== null);
      if (prices.length > 0) {
        priceRange = {
          min: Math.floor(Math.min(...prices)),
          max: Math.ceil(Math.max(...prices)),
        };
      }
    }

    // 4. Legacy format pour rétrocompatibilité
    const fiberCategory = categories.find(c => c.slug === 'fiber');
    const colorCategory = categories.find(c => c.slug === 'color');
    const patternCategory = categories.find(c => c.slug === 'pattern');

    return {
      categories,
      priceRange,
      // Legacy
      materials: fiberCategory?.values || [],
      colors: colorCategory?.values || [],
      patterns: patternCategory?.values || [],
    };
  },
};
