// src/features/search/domain/types.ts
import type { GarmentType } from '@/features/pattern/domain/types';

export interface SearchFilters {
  keywords?: string;
  materials?: string[];
  colors?: string[];
  patterns?: string[];
  minQuantity?: number;
  maxQuantity?: number;
  minPrice?: number;
  maxPrice?: number;
  // NEW: Yardage filter from pattern import
  yardageFilter?: YardageSearchFilter | null;
}

// NEW: Yardage filter type
export interface YardageSearchFilter {
  active: boolean;
  patternName: string;
  garmentType: GarmentType;
  size: string;
  yardageByWidth: Record<number, number>;
}

export interface Textile {
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
  image_url: string | null;
  source_url: string;
  source_platform: string;
  supplier_name: string | null;
  available: boolean;
  created_at: string;
  // NEW: Computed field for yardage sufficiency
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

export interface AvailableFilters {
  materials: string[];
  colors: string[];
  patterns: string[];
}
