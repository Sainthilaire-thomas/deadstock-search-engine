/**
 * Infrastructure Adapter: The Fabric Sales
 * 
 * Fetch produits depuis The Fabric Sales API (Shopify)
 * Source language: English
 */

import type { Locale } from '@/features/tuning/domain/types';

export interface RawProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  tags?: string | string[];  // ← Can be string OR array
  product_type?: string;
  vendor?: string;
  variants: Array<{
    price: string;
    available: boolean;
  }>;
  images: Array<{
    src: string;
  }>;
  available: boolean;
}

/**
 * Termes extraits intelligemment du produit
 */
export interface ExtractedTerms {
  materials: string[];
  colors: string[];
  patterns: string[];
  confidence: {
    materials: number;
    colors: number;
    patterns: number;
  };
  sourceLocale: Locale;
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  sourceUrl: string;
  available: boolean;
  extracted: ExtractedTerms;
  rawData: any;
}

export class TheFabricSalesAdapter {
  
  private readonly baseUrl = 'https://thefabricsales.com';
  private readonly sourceLocale: Locale = 'en';
  
  /**
   * Fetch products from TFS
   */
  async fetchProducts(limit: number = 10): Promise<ProductData[]> {
    const url = `${this.baseUrl}/products.json?limit=${limit}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch TFS products: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const products: RawProduct[] = data.products;
    
    return products.map(p => this.transform(p));
  }
  
  /**
   * Transform raw TFS product to standard format
   */
  private transform(raw: RawProduct): ProductData {
    const description = raw.body_html?.replace(/<[^>]*>/g, '') || '';
    const price = parseFloat(raw.variants[0]?.price || '0');
    const imageUrl = raw.images[0]?.src || null;
    const sourceUrl = `${this.baseUrl}/products/${raw.handle}`;
    
    // Smart Parsing : Extraire les termes intelligemment
    const extracted = this.smartParse(raw);
    
    return {
      id: raw.id.toString(),
      name: raw.title,
      description: description.substring(0, 500),
      price: price,
      imageUrl: imageUrl,
      sourceUrl: sourceUrl,
      available: raw.available,
      extracted: extracted,
      rawData: raw
    };
  }
  
  /**
   * Smart Parsing : Extraire materials, colors, patterns
   */
  private smartParse(raw: RawProduct): ExtractedTerms {
    const materials = this.parseMaterials(raw);
    const colors = this.parseColors(raw);
    const patterns = this.parsePatterns(raw);
    
    return {
      materials,
      colors,
      patterns,
      confidence: {
        materials: materials.length > 0 ? 0.9 : 0,
        colors: colors.length > 0 ? 0.9 : 0,
        patterns: patterns.length > 0 ? 0.9 : 0
      },
      sourceLocale: this.sourceLocale
    };
  }
  
  /**
   * Extraire les matériaux depuis les tags
   * TFS tags are already in English and clean
   */
  private parseMaterials(raw: RawProduct): string[] {
    if (!raw.tags) return [];
    
    // Convert array to string if needed
    const tagsString = Array.isArray(raw.tags) 
      ? raw.tags.join(' ').toLowerCase() 
      : raw.tags.toLowerCase();
    
    const materials: string[] = [];
    
    // Keywords matériaux en anglais
    const materialKeywords = [
      'silk',
      'cotton',
      'wool',
      'linen',
      'viscose',
      'polyester',
      'cashmere',
      'elastane', 'spandex',
      'nylon',
      'acrylic',
      'modal',
      'rayon',
      'velvet',
      'satin',
      'chiffon',
      'organza',
      'taffeta',
      'crepe',
      'jersey'
    ];
    
    // Chercher dans tags (simple keyword match)
    for (const keyword of materialKeywords) {
      if (tagsString.includes(keyword)) {
        materials.push(keyword);
      }
    }
    
    return [...new Set(materials)]; // Dédupliquer
  }
  
  /**
   * Extraire les couleurs depuis les tags
   * TFS met les couleurs directement dans tags !
   */
  private parseColors(raw: RawProduct): string[] {
    if (!raw.tags) return [];
    
    // Convert array to string if needed
    const tagsString = Array.isArray(raw.tags) 
      ? raw.tags.join(' ').toLowerCase() 
      : raw.tags.toLowerCase();
    
    const colors: string[] = [];
    
    // Keywords couleurs en anglais
    const colorKeywords = [
      'black', 'white', 'grey', 'gray',
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink',
      'brown', 'beige', 'cream', 'ivory',
      'navy', 'burgundy', 'maroon',
      'teal', 'turquoise', 'aqua',
      'lavender', 'lilac', 'violet',
      'gold', 'silver',
      'multicolor', 'multi', 'rainbow'
    ];
    
    // Chercher dans tags
    for (const keyword of colorKeywords) {
      if (tagsString.includes(keyword)) {
        colors.push(keyword);
      }
    }
    
    // Si pas de couleur trouvée, essayer dans le titre
    if (colors.length === 0) {
      const title = raw.title.toLowerCase();
      for (const keyword of colorKeywords) {
        if (title.includes(keyword)) {
          colors.push(keyword);
          break; // Prendre seulement la première du titre
        }
      }
    }
    
    return [...new Set(colors)]; // Dédupliquer
  }
  
  /**
   * Extraire les patterns depuis les tags
   */
  private parsePatterns(raw: RawProduct): string[] {
    if (!raw.tags) return [];
    
    // Convert array to string if needed
    const tagsString = Array.isArray(raw.tags) 
      ? raw.tags.join(' ').toLowerCase() 
      : raw.tags.toLowerCase();
    
    const patterns: string[] = [];
    
    // Keywords patterns en anglais
    const patternKeywords = [
      'solid', 'plain',
      'print', 'printed',
      'stripe', 'striped',
      'floral', 'flower',
      'abstract',
      'geometric',
      'dot', 'polka',
      'check', 'checked', 'plaid',
      'jacquard',
      'embroidered',
      'lace'
    ];
    
    for (const keyword of patternKeywords) {
      if (tagsString.includes(keyword)) {
        patterns.push(keyword);
      }
    }
    
    return [...new Set(patterns)]; // Dédupliquer
  }
}
