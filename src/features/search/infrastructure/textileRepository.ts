// src/features/search/infrastructure/textileRepository.ts

import { createClient } from '@/lib/supabase/client';
import type { SearchFilters, Textile, AvailableFilters, FilterCategory } from '../domain/types';

/**
 * Type correspondant exactement à la vue matérialisée textiles_search
 */
interface TextileSearchRow {
  id: string;
  name: string | null;
  description: string | null;
  image_url: string | null;
  additional_images: string[] | null;
  source_url: string;
  source_platform: string;
  source_product_id: string | null;
  price: number | null;  // La vue a "price", pas "price_value"
  price_currency: string | null;
  price_per_meter: number | null;
  sale_type: string | null;
  quantity_value: number | null;
  quantity_unit: string | null;
  width_value: number | null;
  width_unit: string | null;
  weight_value: number | null;
  weight_unit: string | null;
  available: boolean;
  site_id: string | null;
  site_name: string | null;
  site_url: string | null;
  created_at: string;
  updated_at: string | null;
  fiber: string | null;
  color: string | null;
  pattern: string | null;
  weave: string | null;
}

/**
 * Mapper une row de textiles_search vers le type Textile utilisé dans l'app
 */
function mapSearchRowToTextile(row: TextileSearchRow): Textile {
  return {
    id: row.id,
    name: row.name ?? '',
    description: row.description,
    image_url: row.image_url,
    additional_images: row.additional_images,
    source_url: row.source_url,
    source_platform: row.source_platform,
    source_product_id: row.source_product_id,
    site_id: row.site_id,
    // Mapping price -> price_value pour compatibilité
    price_value: row.price,
    price_currency: row.price_currency ?? 'EUR',
    price_per_unit: null,
    price_per_unit_label: null,
    price_per_meter: row.price_per_meter,
    sale_type: row.sale_type as Textile['sale_type'],
    quantity_value: row.quantity_value,
    quantity_unit: row.quantity_unit,
    minimum_order_value: null,
    minimum_order_unit: null,
    width_value: row.width_value,
    width_unit: row.width_unit,
    weight_value: row.weight_value,
    weight_unit: row.weight_unit,
    available: row.available,
    supplier_name: row.site_name,
    supplier_location: null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    scraped_at: null,
    data_quality_score: null,
    // Attributs normalisés
    fiber: row.fiber,
    color: row.color,
    pattern: row.pattern,
    weave: row.weave,
    // Alias pour rétrocompatibilité
    material_type: row.fiber,
    // Confiances non disponibles dans la vue
    fiber_confidence: null,
    color_confidence: null,
    pattern_confidence: null,
    weave_confidence: null,
  };
}

export const textileRepository = {
  async search(
    filters: SearchFilters,
    page: number = 1,
    limit: number = 24
  ): Promise<{ textiles: Textile[]; total: number }> {
    const supabase = createClient();

    // Calculer l'offset
    const offset = (page - 1) * limit;

    // Utiliser la vue matérialisée textiles_search
    let query = supabase
      .from('textiles_search')
      .select('*', { count: 'exact' }) // Demander le count total
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1); // Pagination

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

    // Filtres prix (utiliser "price" car c'est le nom dans la vue)
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    // Recherche texte (si keywords)
    if (filters.keywords) {
      query = query.or(`name.ilike.%${filters.keywords}%,description.ilike.%${filters.keywords}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching textiles:', error);
      throw error;
    }

    // Mapper les résultats vers le type Textile
    const textiles = (data || []).map(row => mapSearchRowToTextile(row as TextileSearchRow));
    
    return {
      textiles,
      total: count ?? 0,
    };
  },

  async findById(id: string): Promise<Textile | null> {
    const supabase = createClient();

    // Pour findById, on utilise aussi la vue pour avoir les attributs normalisés
    const { data, error } = await supabase
      .from('textiles_search')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching textile:', error);
      return null;
    }

    return mapSearchRowToTextile(data as TextileSearchRow);
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

    // 2. UNE SEULE requête pour TOUTES les valeurs d'attributs
    const { data: allAttributesData, error: attrError } = await supabase
      .from('textile_attributes')
      .select('category_slug, value');

    if (attrError) {
      console.error('Error fetching attributes:', attrError);
    }

    // 3. Agrégation côté client (très rapide en JS)
    const valuesByCategory = new Map<string, Set<string>>();
    for (const attr of allAttributesData || []) {
      if (!attr.value) continue;
      if (!valuesByCategory.has(attr.category_slug)) {
        valuesByCategory.set(attr.category_slug, new Set());
      }
      valuesByCategory.get(attr.category_slug)!.add(attr.value);
    }

    // 4. Construire les catégories avec leurs valeurs
    const categories: FilterCategory[] = [];
    for (const cat of categoriesData || []) {
      const valuesSet = valuesByCategory.get(cat.slug);
      if (valuesSet && valuesSet.size > 0) {
        categories.push({
          slug: cat.slug,
          name: cat.name,
          displayOrder: cat.display_order ?? 0,
          values: [...valuesSet].sort(),
        });
      }
    }

    // 5. Legacy format pour rétrocompatibilité
    const fiberCategory = categories.find(c => c.slug === 'fiber');
    const colorCategory = categories.find(c => c.slug === 'color');
    const patternCategory = categories.find(c => c.slug === 'pattern');

    return {
      categories,
      // Legacy
      materials: fiberCategory?.values || [],
      colors: colorCategory?.values || [],
      patterns: patternCategory?.values || [],
    };
  },
};
