import { materials, colors, patterns } from './dictionaries';
import { logUnknownTerm } from './log-unknown';

/**
 * Normalise un texte en material type EN
 * Log automatiquement si unknown
 */
export function extractMaterialType(text: string): string | null {
  if (!text) return null;
  
  const normalized = text.toLowerCase().trim();
  
  // Try exact match
  if (materials.exact[normalized]) {
    return materials.exact[normalized].value;
  }
  
  // Try partial matches (cherche si terme est dans le texte)
  for (const [key, entry] of Object.entries(materials.exact)) {
    if (normalized.includes(key)) {
      return entry.value;
    }
  }
  
  // Unknown → Log
  logUnknownTerm({
    term: text,
    category: 'material',
    source_platform: 'my_little_coupon',
    context: text
  });
  
  return null;
}

/**
 * Extrait couleur du texte
 */
export function extractColor(text: string): string | null {
  if (!text) return null;
  
  const normalized = text.toLowerCase().trim();
  
  // Try exact match
  if (colors.exact[normalized]) {
    return colors.exact[normalized].value;
  }
  
  // Try partial matches
  for (const [key, entry] of Object.entries(colors.exact)) {
    if (normalized.includes(key)) {
      return entry.value;
    }
  }
  
  // Unknown → Log
  logUnknownTerm({
    term: text,
    category: 'color',
    source_platform: 'my_little_coupon',
    context: text
  });
  
  return null;
}

/**
 * Parse composition "80% coton 20% polyester"
 */
export function parseComposition(text: string): Record<string, number> {
  const composition: Record<string, number> = {};
  
  // Regex pour capturer pourcentages
  const regex = /(\d+)%?\s*([a-zé\s]+)/gi;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const percentage = parseInt(match[1]);
    const material = match[2].trim().toLowerCase();
    
    // Normaliser le matériau
    if (materials.exact[material]) {
      const normalized = materials.exact[material].value;
      composition[normalized] = percentage;
    }
  }
  
  return composition;
}

/**
 * Normalise un texte complet (titre + description)
 */
export function normalizeMaterial(text: string): string {
  return text.toLowerCase().trim();
}