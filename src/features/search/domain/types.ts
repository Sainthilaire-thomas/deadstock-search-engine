// src/features/search/domain/types.ts
import type { GarmentType } from '@/features/pattern/domain/types';

// Filtres dynamiques par catégorie (slug -> valeurs sélectionnées)
export interface SearchFilters {
  keywords?: string;
  // Filtres dynamiques par catégorie slug
  categoryFilters?: Record<string, string[]>;
  // Legacy filters (pour rétrocompatibilité pendant transition)
  materials?: string[];
  colors?: string[];
  patterns?: string[];
  minQuantity?: number;
  maxQuantity?: number;
  minPrice?: number;
  maxPrice?: number;
  // Yardage filter from pattern import
  yardageFilter?: YardageSearchFilter | null;
}

export interface YardageSearchFilter {
  active: boolean;
  patternName: string;
  garmentType: GarmentType;
  size: string;
  yardageByWidth: Record<number, number>;
}

// Type pour les résultats de la vue matérialisée textiles_search
export interface Textile {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  additional_images: string[] | null;
  source_url: string;
  source_platform: string;
  source_product_id: string | null;
  site_id: string | null;
  price_value: number | null;
  price_currency: string;
  price_per_unit: number | null;
  price_per_unit_label: string | null;
  width_value: number | null;
  width_unit: string | null;
  weight_value: number | null;
  weight_unit: string | null;
  quantity_value: number | null;
  quantity_unit: string | null;
  minimum_order_value: number | null;
  minimum_order_unit: string | null;
  available: boolean;
  supplier_name: string | null;
  supplier_location: string | null;
  created_at: string;
  updated_at: string | null;
  scraped_at: string | null;
  data_quality_score: number | null;
  // Attributs normalisés (depuis textile_attributes via la vue)
  fiber: string | null;
  color: string | null;
  pattern: string | null;
  weave: string | null;
  // Scores de confiance
  fiber_confidence: number | null;
  color_confidence: number | null;
  pattern_confidence: number | null;
  weave_confidence: number | null;
  // Alias pour rétrocompatibilité
  material_type?: string | null;
  // Champ calculé pour yardage sufficiency
  yardageSufficiency?: {
    sufficient: boolean;
    needed: number;
    available: number;
  };
}

export interface SearchResult {
  textiles: Textile[];
  total: number;
  filters: AvailableFilters;
}

// Catégorie de filtre dynamique
export interface FilterCategory {
  slug: string;           // 'fiber', 'color', 'pattern', 'weave'
  name: string;           // 'Fiber', 'Color', etc.
  displayOrder: number;   // Ordre d'affichage
  values: string[];       // Valeurs disponibles ['silk', 'cotton', ...]
}

// Filtres disponibles (version dynamique)
export interface AvailableFilters {
  categories: FilterCategory[];
  // Legacy (pour rétrocompatibilité)
  materials: string[];
  colors: string[];
  patterns: string[];
}
