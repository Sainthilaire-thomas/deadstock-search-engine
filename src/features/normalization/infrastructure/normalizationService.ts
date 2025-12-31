/**
 * Infrastructure: Normalization Service
 * 
 * Service qui utilise le dictionnaire pour normaliser les termes
 * Version 2.0: i18n-ready with sourceLocale support
 */

import { dictionaryRepo } from '@/features/tuning/infrastructure/dictionaryRepo';
import { DictionaryMapping } from '@/features/tuning/domain/DictionaryMapping';
import type { Locale } from '@/features/tuning/domain/types';

interface NormalizationResult {
  found: boolean;
  value: string;
  unknown?: string;
}

/**
 * Cache en mémoire pour éviter requêtes DB répétées
 */
class DictionaryCache {
  private cache: Map<string, DictionaryMapping[]> | null = null;
  
  async get(category: string): Promise<DictionaryMapping[]> {
    if (!this.cache) {
      await this.loadAll();
    }
    return this.cache?.get(category) || [];
  }
  
  async loadAll(): Promise<void> {
    const allMappings = await dictionaryRepo.getAll();
    
    this.cache = new Map();
    this.cache.set('material', []);
    this.cache.set('color', []);
    this.cache.set('pattern', []);
    
    allMappings.forEach(mapping => {
      const category = mapping.category.value;
      const existing = this.cache!.get(category) || [];
      existing.push(mapping);
      this.cache!.set(category, existing);
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
   * Normaliser un matériau
   */
  async normalizeMaterial(text: string, sourceLocale: Locale = 'fr'): Promise<NormalizationResult> {
    return this.normalize(text, 'material', sourceLocale);
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
    
    // 2. Filtrer par sourceLocale
    const localeMappings = mappings.filter(m => m.source_locale === sourceLocale);
    
    // 3. Essayer exact match
    for (const mapping of localeMappings) {
      if (normalized === mapping.source_term) {
        // Incrémenter usage (async, non-bloquant)
        dictionaryRepo.incrementUsage(mapping.id).catch(err => {
          console.error('Failed to increment usage:', err);
        });
        
        return {
          found: true,
          value: mapping.getTranslation('en') || ''
        };
      }
    }
    
    // 4. Essayer partial match (terme contenu dans texte)
    for (const mapping of localeMappings) {
      if (normalized.includes(mapping.source_term)) {
        // Incrémenter usage
        dictionaryRepo.incrementUsage(mapping.id).catch(err => {
          console.error('Failed to increment usage:', err);
        });
        
        return {
          found: true,
          value: mapping.getTranslation('en') || ''
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
