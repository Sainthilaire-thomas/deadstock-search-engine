/**
 * Infrastructure: Normalization Service
 *
 * Service qui utilise le dictionnaire pour normaliser les termes
 * Version 2.0: i18n-ready with sourceLocale support
 */

import { dictionaryRepo } from '@/features/tuning/infrastructure/dictionaryRepo';
import type { Locale } from '@/features/tuning/domain/types';

interface NormalizationResult {
  found: boolean;
  value: string;
  unknown?: string;
}

interface DictionaryMapping {
  id: string;
  source_term: string;
  source_locale: Locale;
  translations: {
    en?: string;
    fr?: string;
    es?: string;
  };
  category: {
    value: string;
  };
  confidence: number;
  usage_count: number;
}

/**
 * Cache en mémoire pour éviter requêtes DB répétées
 */
class DictionaryCache {
  private cache: Map<string, DictionaryMapping[]> | null = null;

  async get(categoryName: string): Promise<DictionaryMapping[]> {
    if (!this.cache) {
      await this.loadAll();
    }
    return this.cache?.get(categoryName) || [];
  }

  async loadAll(): Promise<void> {
    const allMappings = await dictionaryRepo.getAll();

    this.cache = new Map();

    // Initialize empty arrays - using DB category names
    this.cache.set('fiber', []);
    this.cache.set('color', []);
    this.cache.set('pattern', []);
    this.cache.set('weave', []);

    // Group mappings by category slug
    allMappings.forEach((mapping: any) => {
      const categorySlug = mapping.category.value;  // 'fiber' | 'color' | 'pattern' | 'weave'

      if (this.cache!.has(categorySlug)) {
        const existing = this.cache!.get(categorySlug) || [];
        existing.push(mapping);
        this.cache!.set(categorySlug, existing);
      } else {
        console.warn(`[DictionaryCache] Unknown category slug: ${categorySlug}`);
      }
    });

    console.log('[DictionaryCache] Loaded categories:');
    this.cache.forEach((mappings, category) => {
      console.log(`  ${category}: ${mappings.length} mappings`);
    });
  }

  invalidate(): void {
    this.cache = null;
  }
}

const cache = new DictionaryCache();

/**
 * Service de normalisation
 */
export const normalizationService = {

  /**
   * Normaliser un matériau (fiber)
   */
  async normalizeMaterial(text: string, sourceLocale: Locale = 'fr'): Promise<NormalizationResult> {
    return this.normalize(text, 'fiber', sourceLocale);
  },

  /**
   * Normaliser une couleur
   */
  async normalizeColor(text: string, sourceLocale: Locale = 'fr'): Promise<NormalizationResult> {
    return this.normalize(text, 'color', sourceLocale);
  },

  /**
   * Normaliser un motif
   */
  async normalizePattern(text: string, sourceLocale: Locale = 'fr'): Promise<NormalizationResult> {
    return this.normalize(text, 'pattern', sourceLocale);
  },

  /**
   * Logique de normalisation générique
   */
  async normalize(text: string, category: string, sourceLocale: Locale = 'fr'): Promise<NormalizationResult> {
    const normalized = text.toLowerCase().trim();

    // 1. Charger dictionnaire depuis cache
    const mappings = await cache.get(category);

    if (mappings.length === 0) {
      console.warn(`[normalizationService] No mappings found for category: ${category}`);
      return {
        found: false,
        value: '',
        unknown: text
      };
    }

    // 2. Filtrer par sourceLocale
    const localeMappings = mappings.filter(m => m.source_locale === sourceLocale);

    // 3. Essayer exact match
    for (const mapping of localeMappings) {
      if (normalized === mapping.source_term.toLowerCase()) {
        // Incrémenter usage (async, non-bloquant)
        dictionaryRepo.incrementUsage(mapping.id).catch(err => {
          console.error('Failed to increment usage:', err);
        });

        return {
          found: true,
          value: mapping.translations.en || mapping.source_term
        };
      }
    }

    // 4. Essayer partial match (terme contenu dans texte)
    for (const mapping of localeMappings) {
      if (normalized.includes(mapping.source_term.toLowerCase())) {
        // Incrémenter usage
        dictionaryRepo.incrementUsage(mapping.id).catch(err => {
          console.error('Failed to increment usage:', err);
        });

        return {
          found: true,
          value: mapping.translations.en || mapping.source_term
        };
      }
    }

    // 5. Pas trouvé → unknown
    return {
      found: false,
      value: '',
      unknown: text
    };
  },

  /**
   * Invalider le cache (après ajout de mapping)
   */
  invalidateCache(): void {
    cache.invalidate();
  }
};
