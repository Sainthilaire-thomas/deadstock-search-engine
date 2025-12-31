import { Dictionary } from './types';

export const materials: Dictionary = {
  exact: {
    // Existants (de ton normalize.ts actuel)
    "coton": {
      value: "cotton",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas"
    },
    "soie": {
      value: "silk",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas"
    },
    "laine": {
      value: "wool",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas"
    },
    "cachemire": {
      value: "cashmere",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas"
    },
    "viscose": {
      value: "viscose",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas"
    },
    "polyester": {
      value: "polyester",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas"
    },
    "élasthanne": {
      value: "elastane",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas"
    },
    "lin": {
      value: "linen",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas"
    },
    
    // À ENRICHIR : Analyse tes 10 textiles et ajoute termes manquants
    // Exemples probables :
    "bouclette": {
      value: "boucle",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas"
    },
    "crêpe": {
      value: "crepe",
      source: "manual",
      confidence: 1.0,
      validated_at: "2025-12-27",
      validated_by: "thomas"
    },
    "caban": {
      value: "coating",
      source: "manual",
      confidence: 0.9,
      validated_at: "2025-12-27",
      validated_by: "thomas",
      notes: "Caban est un type de manteau, tissu souvent en laine lourde/coating"
    }
  },
  
  patterns: [] // Vide pour Phase 1
};
