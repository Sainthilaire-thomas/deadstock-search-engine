/**
 * Use Case: Normalize Textile
 *
 * Normalise les données d'un textile (matériau, couleur, motifs)
 * en utilisant les termes extraits par l'adapter
 */

import { MaterialType, Color, Pattern } from '../domain/ValueObjects';
import { normalizationService } from '../infrastructure/normalizationService';
import { unknownsRepo } from '@/features/tuning/infrastructure/unknownsRepo';
import type { Locale } from '@/features/tuning/domain/types';

export interface ExtractedTerms {
  materials: string[];
  colors: string[];
  patterns: string[];
  confidence: {
    materials: number;
    colors: number;
    patterns: number;
  };
  sourceLocale: Locale;  // ← AJOUTER cette ligne
}

export interface NormalizeTextileInput {
  name: string;
  description?: string;
  extractedTerms: ExtractedTerms;  // ← NOUVEAU : Termes déjà extraits
  sourcePlatform?: string;
  productId?: string;
  imageUrl?: string;
  productUrl?: string;
}

export interface NormalizeTextileOutput {
  material: MaterialType | null;
  color: Color | null;
  pattern: Pattern | null;
  unknowns: {
    material?: string;
    color?: string;
    pattern?: string;
  };
}

/**
 * Normalise un textile en utilisant les termes extraits
 */
export async function normalizeTextile(
  input: NormalizeTextileInput
): Promise<NormalizeTextileOutput> {

  const fullText = `${input.name} ${input.description || ''}`;
  const unknowns: any = {};

  // 1. Normaliser les matériaux
  let material: MaterialType | null = null;
  
  if (input.extractedTerms.materials.length > 0) {
    // Chercher chaque matériau extrait
    for (const term of input.extractedTerms.materials) {
      const result = await normalizationService.normalizeMaterial(
  term,
  input.extractedTerms.sourceLocale  // ← AJOUTER
);

// DEBUG LOG
console.log('DEBUG normalizeMaterial:', {
  term,
  sourceLocale: input.extractedTerms.sourceLocale,
  result
});
      
      if (result.found) {
        material = new MaterialType(result.value);
        break; // Premier trouvé = OK
      } else if (result.unknown) {
        // Logger unknown avec product info
        await unknownsRepo.logOrIncrement(
          term,  // ← Juste le terme, pas fullText !
           'fiber',
          fullText,
          input.sourcePlatform,
          input.productId,
          input.imageUrl,
          input.productUrl
        );
        unknowns.material = term;
      }
    }
  }

  // 2. Normaliser les couleurs
  let color: Color | null = null;
  
  if (input.extractedTerms.colors.length > 0) {
    // Chercher chaque couleur extraite
    for (const term of input.extractedTerms.colors) {
     const result = await normalizationService.normalizeColor(
  term,
  input.extractedTerms.sourceLocale  // ← AJOUTER
);
         // DEBUG LOG
    console.log('DEBUG normalizeColor:', {
      term,
      sourceLocale: input.extractedTerms.sourceLocale,
      result
    });

      if (result.found) {
        color = new Color(result.value);
        break; // Premier trouvé = OK
      } else if (result.unknown) {
        // Logger unknown avec product info
        await unknownsRepo.logOrIncrement(
          term,  // ← Juste le terme, pas fullText !
          'color',
          fullText,
          input.sourcePlatform,
          input.productId,
          input.imageUrl,
          input.productUrl
        );
        unknowns.color = term;
      }
    }
  }

  // 3. Normaliser les motifs
  let pattern: Pattern | null = null;
  
  if (input.extractedTerms.patterns.length > 0) {
    // Chercher chaque pattern extrait
    for (const term of input.extractedTerms.patterns) {
      const result = await normalizationService.normalizePattern(
  term,
  input.extractedTerms.sourceLocale  // ← AJOUTER
);

 // DEBUG LOG
    console.log('DEBUG normalizePattern:', {
      term,
      sourceLocale: input.extractedTerms.sourceLocale,
      result
    });
      
      if (result.found) {
        pattern = new Pattern(result.value);
        break; // Premier trouvé = OK
      } else if (result.unknown) {
        // Logger unknown avec product info
        await unknownsRepo.logOrIncrement(
          term,  // ← Juste le terme, pas fullText !
          'pattern',
          fullText,
          input.sourcePlatform,
          input.productId,
          input.imageUrl,
          input.productUrl
        );
        unknowns.pattern = term;
      }
    }
  }

  return {
    material,
    color,
    pattern,
    unknowns
  };
}
