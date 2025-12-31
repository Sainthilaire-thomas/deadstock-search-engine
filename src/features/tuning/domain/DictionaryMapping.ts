/**
 * Domain Entity: DictionaryMapping
 * 
 * Représente un mapping terme source → traductions multiples
 * Contient les règles métier de validation
 * Version 2.0: i18n-ready
 */
import type { UserId, Locale, Translations } from './types';

export type CategoryType = 'fiber' | 'color' | 'pattern' | 'weave';
export type SourceType = 'manual' | 'llm_suggested' | 'user_feedback';

/**
 * Value Object: Category
 * Immutable, comparé par valeur
 */
export class Category {
  constructor(public readonly value: CategoryType) {
    if (!['fiber', 'color', 'pattern', 'weave'].includes(value)) {
      throw new Error(`Invalid category: ${value}`);
    }
  }
  
  equals(other: Category): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value;
  }
}

/**
 * Entity: DictionaryMapping
 * A une identité (id), peut changer dans le temps
 */
export class DictionaryMapping {
  constructor(
    public readonly id: string,
    public source_term: string,           // Changed from 'term'
    public source_locale: Locale,         // NEW
    public translations: Translations,    // Changed from 'value'
    public category: Category,
    public source: SourceType,
    public confidence: number,
    public validatedAt: Date,
    public validatedBy: string | null,
    public notes?: string,
    public usageCount: number = 0
  ) {
    this.validate();
  }
  
  /**
   * Business Rule: Validation du mapping
   */
  private validate(): void {
    // Confidence entre 0 et 1
    if (this.confidence < 0 || this.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }

    // Source term non vide
    if (this.source_term.trim().length === 0) {
      throw new Error('Source term cannot be empty');
    }

    // Translations non vide
    if (!this.translations || Object.keys(this.translations).length === 0) {
      throw new Error('Translations cannot be empty');
    }

    // Usage count >= 0
    if (this.usageCount < 0) {
      throw new Error('Usage count cannot be negative');
    }
  }

  /**
   * Business Method: Obtenir traduction
   */
  getTranslation(targetLocale: Locale = 'en'): string | null {
    return this.translations[targetLocale] || null;
  }

  /**
   * Business Method: Incrémenter usage
   */
  incrementUsage(): void {
    this.usageCount += 1;
  }

  /**
   * Business Method: Vérifier si mapping est fiable
   */
  isReliable(): boolean {
    return this.confidence >= 0.9;
  }

  /**
   * Business Method: Vérifier si suggéré par LLM
   */
  isLLMSuggested(): boolean {
    return this.source === 'llm_suggested';
  }
}
