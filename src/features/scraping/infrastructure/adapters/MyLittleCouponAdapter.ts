/**
 * Infrastructure Adapter: My Little Coupon
 * 
 * Fetch produits depuis My Little Coupon API (Shopify)
 * Source language: French
 */

import type { Locale } from '@/features/tuning/domain/types';

export interface RawProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  tags?: string;
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

export class MyLittleCouponAdapter {
  
  private readonly baseUrl = 'https://mylittlecoupon.fr';
  private readonly sourceLocale: Locale = 'fr';
  
  /**
   * Fetch products from My Little Coupon
   */
  async fetchProducts(limit: number = 10): Promise<ProductData[]> {
    const url = `${this.baseUrl}/collections/all/products.json?limit=${limit}`;
    
    // Headers réalistes pour éviter la détection de bot
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://mylittlecoupon.fr/',
        'Origin': 'https://mylittlecoupon.fr',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch MLC products: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const products: RawProduct[] = data.products;
    
    return products.map(p => this.transform(p));
  }
  
  /**
   * Transform raw MLC product to standard format
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
        colors: colors.length > 0 ? 0.8 : 0,
        patterns: patterns.length > 0 ? 0.7 : 0
      },
      sourceLocale: this.sourceLocale
    };
  }
  
  /**
   * Extraire les matériaux depuis les tags
   */
  private parseMaterials(raw: RawProduct): string[] {
    if (!raw.tags || typeof raw.tags !== 'string') return [];
    
    const tags = raw.tags.toLowerCase();
    const materials: string[] = [];
    
    // Regex pour capturer compositions (ex: "100% Soie", "80% Coton")
    const compositionRegex = /(\d+%?\s*)?(soie|coton|laine|lin|viscose|polyester|cachemire|élasthanne|nylon|acrylique)/gi;
    const matches = tags.matchAll(compositionRegex);
    
    for (const match of matches) {
      const material = match[2].toLowerCase();
      materials.push(material);
    }
    
    return [...new Set(materials)]; // Dédupliquer
  }
  
  /**
   * Extraire les couleurs depuis le titre
   */
  private parseColors(raw: RawProduct): string[] {
    const title = raw.title;
    const colors: string[] = [];
    
    // La couleur est généralement après la dernière virgule dans MLC
    const lastCommaIndex = title.lastIndexOf(',');
    
    if (lastCommaIndex !== -1) {
      const afterLastComma = title.substring(lastCommaIndex + 1).trim();
      
      // Si pas trop long (couleur simple), on prend
      if (afterLastComma.length > 0 && afterLastComma.length < 30) {
        colors.push(afterLastComma.toLowerCase());
      }
    }
    
    return colors;
  }
  
  /**
   * Extraire les patterns depuis les tags
   */
  private parsePatterns(raw: RawProduct): string[] {
    if (!raw.tags || typeof raw.tags !== 'string') return [];
    
    const tags = raw.tags.toLowerCase();
    const patterns: string[] = [];
    
    // Keywords patterns en français
    const patternKeywords = [
      'uni', 'imprimé', 'rayé', 'à rayures',
      'fleurs', 'fleuri', 'floral',
      'pois', 'à pois',
      'carreaux', 'à carreaux', 'vichy',
      'jacquard', 'brodé', 'dentelle'
    ];
    
    for (const keyword of patternKeywords) {
      if (tags.includes(keyword)) {
        patterns.push(keyword);
      }
    }
    
    return [...new Set(patterns)]; // Dédupliquer
  }
}
