/**
 * i18n Configuration
 * 
 * Configuration centralisée pour l'internationalisation.
 * Compatible avec next-intl et l'architecture DDD hybride.
 * 
 * @see ADR-009: Internationalization Strategy
 */

// Locales supportées
export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

// Locale par défaut
export const defaultLocale: Locale = 'fr';

// Noms des locales pour l'UI
export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};

// Drapeaux pour l'UI (emoji)
export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
};

// Configuration des chemins (pour le routing)
// 'never' = pas de préfixe locale dans l'URL (/boards au lieu de /fr/boards)
// Phase 1: on garde les URLs simples, la locale est dans un cookie
export const localePrefix = 'never' as const;

// Validation
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
