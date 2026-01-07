/**
 * Extraction Pattern Detector
 * 
 * Analyse les produits pour détecter des patterns récurrents
 * de dimensions (longueur, largeur, poids).
 * 
 * Utilisé par Discovery pour suggérer des règles d'extraction
 * que l'admin peut ensuite valider/ajuster.
 */

import type { ExtractionPattern, ExtractionField, ExtractionSource, ExtractedExample } from '../domain/types';

// ============================================================================
// TYPES
// ============================================================================

interface ShopifyProductLike {
  title: string;
  body_html: string;
  tags: string | string[];
  variants?: Array<{
    grams?: number;
    weight?: number;
    weight_unit?: string;
  }>;
}

interface PatternCandidate {
  field: ExtractionField;
  source: ExtractionSource;
  pattern: RegExp;
  patternString: string;
  unit: string;
  captureGroup: number;
  description: string;
}

interface DetectionResult {
  patterns: ExtractionPattern[];
  analyzedAt: string;
  productsAnalyzed: number;
}

// ============================================================================
// PATTERN CANDIDATES
// Patterns à tester sur les produits
// ============================================================================

const PATTERN_CANDIDATES: PatternCandidate[] = [
  // =========================================================================
  // LENGTH (Longueur disponible)
  // =========================================================================
  {
    field: 'length',
    source: 'tags',
    pattern: /^(\d+(?:[.,]\d+)?)\s*M$/i,
    patternString: '^(\\d+(?:[.,]\\d+)?)\\s*M$',
    unit: 'm',
    captureGroup: 1,
    description: 'Tag format "3M" ou "5M" (mètres)',
  },
  {
    field: 'length',
    source: 'tags',
    pattern: /^(\d+(?:[.,]\d+)?)\s*(?:m(?:è|e)?tres?|meters?)$/i,
    patternString: '^(\\d+(?:[.,]\\d+)?)\\s*(?:m(?:è|e)?tres?|meters?)$',
    unit: 'm',
    captureGroup: 1,
    description: 'Tag "3 mètres" ou "3 meters"',
  },
  {
    field: 'length',
    source: 'title',
    pattern: /(\d+(?:[.,]\d+)?)\s*(?:m(?:è|e)?tres?|meters?|m)\b/i,
    patternString: '(\\d+(?:[.,]\\d+)?)\\s*(?:m(?:è|e)?tres?|meters?|m)\\b',
    unit: 'm',
    captureGroup: 1,
    description: 'Titre contenant "3m" ou "3 mètres"',
  },
  {
    field: 'length',
    source: 'body_html',
    pattern: /(?:longueur|length|largo|lunghezza)[:\s]*(\d+(?:[.,]\d+)?)\s*(?:m(?:è|e)?tres?|meters?|m)?/i,
    patternString: '(?:longueur|length|largo|lunghezza)[:\\s]*(\\d+(?:[.,]\\d+)?)\\s*(?:m(?:è|e)?tres?|meters?|m)?',
    unit: 'm',
    captureGroup: 1,
    description: 'Body HTML "Longueur: 3m"',
  },

  // =========================================================================
  // WIDTH (Largeur / Laize)
  // =========================================================================
  {
    field: 'width',
    source: 'title',
    pattern: /(\d{2,3})\s*cm\b/i,
    patternString: '(\\d{2,3})\\s*cm\\b',
    unit: 'cm',
    captureGroup: 1,
    description: 'Titre contenant "140cm" ou "150 cm"',
  },
  {
    field: 'width',
    source: 'body_html',
    pattern: /(?:laize|largeur|width|ancho|larghezza|breite)[:\s]*(\d+(?:[.,]\d+)?)\s*(?:cm|centim(?:è|e)?tres?)?/i,
    patternString: '(?:laize|largeur|width|ancho|larghezza|breite)[:\\s]*(\\d+(?:[.,]\\d+)?)\\s*(?:cm|centim(?:è|e)?tres?)?',
    unit: 'cm',
    captureGroup: 1,
    description: 'Body HTML "Width: 150cm" ou "Laize: 140cm"',
  },
  {
    field: 'width',
    source: 'body_html',
    pattern: /[LW][:\s]*(\d+(?:[.,]\d+)?)\s*cm/i,
    patternString: '[LW][:\\s]*(\\d+(?:[.,]\\d+)?)\\s*cm',
    unit: 'cm',
    captureGroup: 1,
    description: 'Body HTML "L: 140cm" ou "W: 150cm"',
  },

  // =========================================================================
  // WEIGHT (Poids / Grammage)
  // =========================================================================
  {
    field: 'weight',
    source: 'body_html',
    pattern: /(\d+(?:[.,]\d+)?)\s*(?:g(?:r(?:ams?)?)?\/m[²2]|gsm|gr\/m[²2])/i,
    patternString: '(\\d+(?:[.,]\\d+)?)\\s*(?:g(?:r(?:ams?)?)?/m[²2]|gsm|gr/m[²2])',
    unit: 'gsm',
    captureGroup: 1,
    description: 'Body HTML "250g/m²" ou "180gsm"',
  },
  {
    field: 'weight',
    source: 'body_html',
    pattern: /(?:poids|weight|peso|gewicht)[:\s]*(\d+(?:[.,]\d+)?)\s*(?:g(?:r(?:ams?)?)?(?:\/m[²2])?|gsm)?/i,
    patternString: '(?:poids|weight|peso|gewicht)[:\\s]*(\\d+(?:[.,]\\d+)?)\\s*(?:g(?:r(?:ams?)?)?(?:/m[²2])?|gsm)?',
    unit: 'gsm',
    captureGroup: 1,
    description: 'Body HTML "Weight: 150gr/m2"',
  },
  {
    field: 'weight',
    source: 'body_html',
    pattern: /(?:grammage|gramaje|grammatura)[:\s]*(\d+(?:[.,]\d+)?)/i,
    patternString: '(?:grammage|gramaje|grammatura)[:\\s]*(\\d+(?:[.,]\\d+)?)',
    unit: 'gsm',
    captureGroup: 1,
    description: 'Body HTML "Grammage: 200"',
  },
  {
    field: 'weight',
    source: 'variant',
    pattern: /^(\d+)$/,  // Special: check variant.grams directly
    patternString: 'variant.grams',
    unit: 'g',
    captureGroup: 1,
    description: 'Shopify variant.grams',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return `pat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function parseNumericValue(str: string): number {
  return parseFloat(str.replace(',', '.'));
}

function parseTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags.map(t => t.trim()).filter(t => t.length > 0);
  }
  if (typeof tags === 'string' && tags.trim()) {
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }
  return [];
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================================
// PATTERN TESTING
// ============================================================================

interface TestResult {
  matched: boolean;
  value?: number;
  raw?: string;
}

function testPatternOnProduct(
  product: ShopifyProductLike,
  candidate: PatternCandidate
): TestResult {
  // Special case: variant.grams
  if (candidate.source === 'variant' && candidate.patternString === 'variant.grams') {
    const grams = product.variants?.[0]?.grams;
    if (grams && grams > 0) {
      return {
        matched: true,
        value: grams,
        raw: `${grams}g (variant)`,
      };
    }
    return { matched: false };
  }

  // Get text to search based on source
  let textToSearch = '';
  
  switch (candidate.source) {
    case 'tags':
      const tags = parseTags(product.tags);
      // Test each tag individually
      for (const tag of tags) {
        const match = tag.match(candidate.pattern);
        if (match && match[candidate.captureGroup]) {
          const value = parseNumericValue(match[candidate.captureGroup]);
          if (value > 0) {
            return {
              matched: true,
              value,
              raw: tag,
            };
          }
        }
      }
      return { matched: false };

    case 'title':
      textToSearch = product.title || '';
      break;

    case 'body_html':
      textToSearch = cleanHtml(product.body_html || '');
      break;

    default:
      return { matched: false };
  }

  // Test pattern
  const match = textToSearch.match(candidate.pattern);
  if (match && match[candidate.captureGroup]) {
    const value = parseNumericValue(match[candidate.captureGroup]);
    if (value > 0) {
      return {
        matched: true,
        value,
        raw: match[0],
      };
    }
  }

  return { matched: false };
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

/**
 * Analyse un ensemble de produits pour détecter des patterns d'extraction
 * récurrents pour les dimensions (longueur, largeur, poids).
 */
export function detectExtractionPatterns(
  products: ShopifyProductLike[]
): DetectionResult {
  console.log(`\n🔬 Detecting extraction patterns on ${products.length} products...`);

  const results: Map<string, {
    candidate: PatternCandidate;
    matches: Array<{ product: ShopifyProductLike; result: TestResult }>;
  }> = new Map();

  // Initialize results for each candidate
  for (const candidate of PATTERN_CANDIDATES) {
    const key = `${candidate.field}_${candidate.source}_${candidate.patternString}`;
    results.set(key, { candidate, matches: [] });
  }

  // Test each product against each pattern
  for (const product of products) {
    for (const candidate of PATTERN_CANDIDATES) {
      const key = `${candidate.field}_${candidate.source}_${candidate.patternString}`;
      const result = testPatternOnProduct(product, candidate);
      
      if (result.matched) {
        results.get(key)!.matches.push({ product, result });
      }
    }
  }

  // Convert to ExtractionPattern array
  const patterns: ExtractionPattern[] = [];
  const totalProducts = products.length;

  // Group by field to pick best pattern per field
  const patternsByField: Map<ExtractionField, ExtractionPattern[]> = new Map();

  for (const [, { candidate, matches }] of results) {
    if (matches.length === 0) continue;

    const coverage = matches.length / totalProducts;
    
    // Only keep patterns with > 10% coverage
    if (coverage < 0.1) continue;

    // Calculate confidence based on coverage and consistency
    const confidence = Math.min(1, coverage * 1.2);

    // Get examples (max 5)
    const examples: ExtractedExample[] = matches.slice(0, 5).map(m => ({
      raw: m.result.raw || '',
      extracted: m.result.value || 0,
      productTitle: m.product.title.substring(0, 50),
    }));

    const pattern: ExtractionPattern = {
      id: generateId(),
      field: candidate.field,
      source: candidate.source,
      pattern: candidate.patternString,
      captureGroup: candidate.captureGroup,
      unit: candidate.unit,
      coverage,
      matchCount: matches.length,
      totalTested: totalProducts,
      examples,
      enabled: coverage >= 0.3, // Auto-enable if > 30% coverage
      confidence,
    };

    // Group by field
    if (!patternsByField.has(candidate.field)) {
      patternsByField.set(candidate.field, []);
    }
    patternsByField.get(candidate.field)!.push(pattern);
  }

  // Pick best pattern per field (highest coverage)
  for (const [field, fieldPatterns] of patternsByField) {
    // Sort by coverage descending
    fieldPatterns.sort((a, b) => b.coverage - a.coverage);
    
    // Keep top 2 patterns per field (in case admin wants alternative)
    const topPatterns = fieldPatterns.slice(0, 2);
    patterns.push(...topPatterns);

    console.log(`   📏 ${field}: Found ${fieldPatterns.length} patterns, best coverage: ${Math.round(topPatterns[0].coverage * 100)}%`);
  }

  // Sort final result by field then coverage
  patterns.sort((a, b) => {
    if (a.field !== b.field) {
      const order: ExtractionField[] = ['length', 'width', 'weight', 'composition'];
      return order.indexOf(a.field) - order.indexOf(b.field);
    }
    return b.coverage - a.coverage;
  });

  console.log(`\n✅ Detected ${patterns.length} extraction patterns`);

  return {
    patterns,
    analyzedAt: new Date().toISOString(),
    productsAnalyzed: totalProducts,
  };
}

/**
 * Export pattern candidates for reference/debugging
 */
export function getPatternCandidates(): PatternCandidate[] {
  return PATTERN_CANDIDATES;
}
