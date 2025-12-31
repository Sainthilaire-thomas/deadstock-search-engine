/**
 * Domain Types - Tuning Feature
 * Centralized type definitions for the tuning domain
 */

export type TermCategory = 'material' | 'color' | 'pattern';

export type UnknownStatus = 'pending' | 'approved' | 'rejected';

export type MappingSource = 'manual' | 'llm_suggested' | 'user_feedback';

/**
 * User identifier - nullable until auth is implemented
 * Will be UUID when Supabase Auth is integrated
 */
export type UserId = string | null;

/**
 * Input for approving an unknown term
 */
export interface ApproveMappingInput {
  unknownId: string;
  value: string;
  validatedBy: UserId;
  notes?: string;
  sourceLocale?: Locale;      // ← AJOUTER
  targetLocale?: Locale;      // ← AJOUTER
}

/**
 * Input for rejecting an unknown term
 */
export interface RejectUnknownInput {
  unknownId: string;
  rejectedBy: UserId;
  notes?: string;
}

/**
 * Mapping entity data for creation
 */
export interface CreateMappingData {
  term: string;
  value: string;
  category: TermCategory;
  source: MappingSource;
  confidence: number;
  validatedBy: UserId;
  notes?: string;
}

/**
 * Supported locales
 */
export type Locale = 'fr' | 'en' | 'es' | 'it' | 'de';

/**
 * Translation map for a term
 * Example: { en: "silk", es: "seda", it: "seta" }
 */
export type Translations = Partial<Record<Locale, string>>;
