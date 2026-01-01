/**
 * Extract textile terms from Shopify product data
 * 
 * Compatible avec normalizeTextile.ts existant
 * Version 2.2: Support complet 5 langues (fr, en, es, it, de) + stopwords
 */

import type { Locale } from '@/features/tuning/domain/types';

// ============================================================================
// INTERFACES - Compatible with normalizeTextile.ts
// ============================================================================

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

// ============================================================================
// STOPWORDS - Termes génériques à filtrer
// ============================================================================

const STOPWORDS = {
  materials: ['fabric', 'textile', 'cloth', 'material', 'tissu', 'matière', 'tela', 'tessuto', 'materiale', 'stoff', 'gewebe'],
  colors: ['color', 'colour', 'couleur', 'colore', 'farbe'],
  patterns: ['pattern', 'motif', 'patrón', 'motivo', 'muster']
};

// ============================================================================
// TEXTILE KEYWORDS
// ============================================================================

const TEXTILE_KEYWORDS = {
  materials: {
    fr: [
      'coton', 'soie', 'laine', 'lin', 'polyester', 'viscose', 'modal', 'lyocell',
      'tencel', 'nylon', 'acrylique', 'élasthanne', 'spandex', 'lycra', 'cachemire',
      'mohair', 'alpaga', 'chanvre', 'ramie'
    ],
    en: [
      'cotton', 'silk', 'wool', 'linen', 'polyester', 'viscose', 'modal', 'lyocell',
      'tencel', 'nylon', 'acrylic', 'elastane', 'spandex', 'lycra', 'cashmere',
      'mohair', 'alpaca', 'hemp', 'ramie'
    ],
    es: [
      'algodón', 'seda', 'lana', 'lino', 'poliéster', 'viscosa', 'modal', 'lyocell',
      'tencel', 'nylon', 'acrílico', 'elastano', 'spandex', 'lycra', 'cachemira'
    ],
    it: [
      'cotone', 'seta', 'lana', 'lino', 'poliestere', 'viscosa', 'modal', 'lyocell',
      'tencel', 'nylon', 'acrilico', 'elastan', 'spandex', 'lycra', 'cashmere',
      'mohair', 'alpaca', 'canapa'
    ],
    de: [
      'baumwolle', 'seide', 'wolle', 'leinen', 'polyester', 'viskose', 'modal', 'lyocell',
      'tencel', 'nylon', 'acryl', 'elasthan', 'spandex', 'lycra', 'kaschmir',
      'mohair', 'alpaka', 'hanf', 'ramie'
    ]
  },
  
  colors: {
    fr: [
      'blanc', 'noir', 'rouge', 'bleu', 'vert', 'jaune', 'orange', 'rose', 'violet',
      'gris', 'marron', 'beige', 'turquoise', 'indigo', 'bordeaux', 'corail',
      'olive', 'kaki', 'crème', 'ivoire', 'taupe', 'anthracite', 'or', 'argent',
      'marine', 'ciel', 'émeraude', 'framboise', 'lilas', 'écru'
    ],
    en: [
      'white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'pink', 'purple',
      'gray', 'grey', 'brown', 'beige', 'turquoise', 'indigo', 'burgundy', 'coral',
      'olive', 'khaki', 'cream', 'ivory', 'taupe', 'charcoal', 'gold', 'silver',
      'navy', 'sky', 'emerald', 'raspberry', 'lilac', 'ecru'
    ],
    es: [
      'blanco', 'negro', 'rojo', 'azul', 'verde', 'amarillo', 'naranja', 'rosa', 'púrpura',
      'gris', 'marrón', 'beige', 'turquesa', 'índigo', 'burdeos', 'coral',
      'oliva', 'caqui', 'crema', 'marfil', 'taupe', 'carbón', 'oro', 'plata'
    ],
    it: [
      'bianco', 'nero', 'rosso', 'blu', 'verde', 'giallo', 'arancione', 'rosa', 'viola',
      'grigio', 'marrone', 'beige', 'turchese', 'indaco', 'bordeaux', 'corallo',
      'oliva', 'cachi', 'crema', 'avorio', 'taupe', 'antracite', 'oro', 'argento',
      'navy', 'cielo', 'smeraldo', 'lampone', 'lilla', 'ecrù'
    ],
    de: [
      'weiß', 'schwarz', 'rot', 'blau', 'grün', 'gelb', 'orange', 'rosa', 'lila',
      'grau', 'braun', 'beige', 'türkis', 'indigo', 'bordeaux', 'koralle',
      'olive', 'khaki', 'creme', 'elfenbein', 'taupe', 'anthrazit', 'gold', 'silber',
      'marine', 'himmelblau', 'smaragd', 'himbeer', 'flieder', 'ecru'
    ]
  },
  
  patterns: {
    fr: [
      'uni', 'rayures', 'carreaux', 'vichy', 'pois', 'chevron', 'zigzag',
      'fleurs', 'fleuri', 'paisley', 'animal', 'imprimé', 'abstrait'
    ],
    en: [
      'solid', 'stripes', 'striped', 'checkered', 'checked', 'gingham', 'polka dot',
      'chevron', 'zigzag', 'floral', 'flowers', 'paisley', 'animal print', 'printed',
      'abstract'
    ],
    es: [
      'liso', 'rayas', 'cuadros', 'vichy', 'lunares', 'chevron', 'zigzag',
      'flores', 'floral', 'paisley', 'animal', 'estampado', 'abstracto'
    ],
    it: [
      'tinta unita', 'righe', 'quadri', 'vichy', 'pois', 'chevron', 'zigzag',
      'fiori', 'floreale', 'paisley', 'animale', 'stampato', 'astratto'
    ],
    de: [
      'einfarbig', 'streifen', 'kariert', 'vichy', 'punkte', 'chevron', 'zickzack',
      'blumen', 'blumig', 'paisley', 'tierprint', 'bedruckt', 'abstrakt'
    ]
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect locale from product text
 */
function detectLocale(title: string, bodyHtml: string, tags: string | string[]): Locale {
  const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);
  const allText = [title, bodyHtml || '', ...tagsArray].join(' ').toLowerCase();
  
  const scores = { fr: 0, en: 0, es: 0, it: 0, de: 0 };
  
  // French indicators
  if (allText.match(/\b(tissu|coton|soie|laine|matière|couleur)\b/)) scores.fr += 2;
  if (allText.match(/\b(le|la|les|du|de|des)\b/)) scores.fr += 1;
  
  // English indicators
  if (allText.match(/\b(fabric|cotton|silk|wool|material|color)\b/)) scores.en += 2;
  if (allText.match(/\b(the|of|and|with)\b/)) scores.en += 1;
  
  // Spanish indicators
  if (allText.match(/\b(tela|algodón|seda|lana|material|color)\b/)) scores.es += 2;
  if (allText.match(/\b(el|la|los|las|del|de)\b/)) scores.es += 1;
  
  // Italian indicators
  if (allText.match(/\b(tessuto|cotone|seta|lana|materiale|colore)\b/)) scores.it += 2;
  if (allText.match(/\b(il|lo|la|i|gli|le|del|della|di)\b/)) scores.it += 1;
  
  // German indicators
  if (allText.match(/\b(stoff|baumwolle|seide|wolle|material|farbe)\b/)) scores.de += 2;
  if (allText.match(/\b(der|die|das|den|dem|des)\b/)) scores.de += 1;
  
  const maxScore = Math.max(scores.fr, scores.en, scores.es, scores.it, scores.de);
  
  if (scores.fr === maxScore) return 'fr';
  if (scores.en === maxScore) return 'en';
  if (scores.es === maxScore) return 'es';
  if (scores.it === maxScore) return 'it';
  if (scores.de === maxScore) return 'de';
  
  return 'en'; // Default to English
}

/**
 * Check if tag contains keyword
 */
function containsKeyword(tag: string, keywords: string[]): boolean {
  const normalizedTag = tag.toLowerCase().trim();
  return keywords.some((keyword: string) => {
    const normalizedKeyword = keyword.toLowerCase();
    return normalizedTag === normalizedKeyword || 
           normalizedTag.includes(` ${normalizedKeyword} `) ||
           normalizedTag.startsWith(`${normalizedKeyword} `) ||
           normalizedTag.endsWith(` ${normalizedKeyword}`);
  });
}

/**
 * Check if term is a stopword (generic term to filter)
 */
function isStopword(term: string, category: 'materials' | 'colors' | 'patterns'): boolean {
  const normalizedTerm = term.toLowerCase().trim();
  return STOPWORDS[category].some(stopword => 
    normalizedTerm === stopword || normalizedTerm === stopword + 's'
  );
}

/**
 * Calculate confidence based on number of terms found
 */
function calculateConfidence(termsFound: number): number {
  if (termsFound === 0) return 0;
  if (termsFound === 1) return 0.7;
  if (termsFound === 2) return 0.85;
  return 1.0;
}

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

/**
 * Extract textile terms from Shopify product
 * Compatible with ShopifyProduct from scrapingService.ts
 */
export function extractTermsFromShopify(product: {
  title: string;
  body_html: string;
  tags: string | string[];
}): ExtractedTerms {
  // Detect locale
  const sourceLocale = detectLocale(product.title, product.body_html, product.tags);
  
  const materials: string[] = [];
  const colors: string[] = [];
  const patterns: string[] = [];
  
  // Get keywords for detected locale
  const materialKeywords = TEXTILE_KEYWORDS.materials[sourceLocale] || TEXTILE_KEYWORDS.materials.en;
  const colorKeywords = TEXTILE_KEYWORDS.colors[sourceLocale] || TEXTILE_KEYWORDS.colors.en;
  const patternKeywords = TEXTILE_KEYWORDS.patterns[sourceLocale] || TEXTILE_KEYWORDS.patterns.en;
  
  // Normalize tags to array
  const tags = Array.isArray(product.tags)
    ? product.tags
    : (product.tags ? product.tags.split(',').map(t => t.trim()) : []);
  
  // Process each tag
  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase().trim();
    
    if (!normalizedTag) continue;
    
    // Check materials (avec filtre stopwords)
    if (containsKeyword(normalizedTag, materialKeywords)) {
      const materialTerm = materialKeywords.find((keyword: string) =>
        normalizedTag.includes(keyword.toLowerCase())
      );
      if (materialTerm && !materials.includes(normalizedTag) && !isStopword(normalizedTag, 'materials')) {
        materials.push(normalizedTag);
      }
    }
    
    // Check colors (avec filtre stopwords)
    if (containsKeyword(normalizedTag, colorKeywords)) {
      const colorTerm = colorKeywords.find((keyword: string) =>
        normalizedTag.includes(keyword.toLowerCase())
      );
      if (colorTerm && !colors.includes(normalizedTag) && !isStopword(normalizedTag, 'colors')) {
        colors.push(normalizedTag);
      }
    }
    
    // Check patterns (avec filtre stopwords)
    if (containsKeyword(normalizedTag, patternKeywords)) {
      const patternTerm = patternKeywords.find((keyword: string) =>
        normalizedTag.includes(keyword.toLowerCase())
      );
      if (patternTerm && !patterns.includes(normalizedTag) && !isStopword(normalizedTag, 'patterns')) {
        patterns.push(normalizedTag);
      }
    }
  }
  
  // Fallback to title if no terms found
  if (materials.length === 0 || colors.length === 0 || patterns.length === 0) {
    const titleLower = product.title.toLowerCase();
    
    if (materials.length === 0) {
      const materialMatch = materialKeywords.find((keyword: string) =>
        titleLower.includes(keyword.toLowerCase())
      );
      if (materialMatch && !isStopword(materialMatch, 'materials')) {
        materials.push(materialMatch);
      }
    }
    
    if (colors.length === 0) {
      const colorMatch = colorKeywords.find((keyword: string) =>
        titleLower.includes(keyword.toLowerCase())
      );
      if (colorMatch && !isStopword(colorMatch, 'colors')) {
        colors.push(colorMatch);
      }
    }
    
    if (patterns.length === 0) {
      const patternMatch = patternKeywords.find((keyword: string) =>
        titleLower.includes(keyword.toLowerCase())
      );
      if (patternMatch && !isStopword(patternMatch, 'patterns')) {
        patterns.push(patternMatch);
      }
    }
  }
  
  return {
    materials,
    colors,
    patterns,
    confidence: {
      materials: calculateConfidence(materials.length),
      colors: calculateConfidence(colors.length),
      patterns: calculateConfidence(patterns.length)
    },
    sourceLocale
  };
}