# ADR-021: Extraction Patterns System for Dimensions

**Date**: 2026-01-06  
**Status**: Implemented  
**Context**: Phase 1 - MVP Admin Module  
**Authors**: Thomas

---

## Context

### Problem Statement

Le système de scraping collecte des produits textiles mais n'extrait pas les dimensions critiques :
- **Longueur** : Quantité de tissu disponible (ex: "3M" dans tags)
- **Largeur** : Laize du tissu (ex: "Laize : 140cm" dans body_html)
- **Poids** : Grammage (ex: "Poids : 250g/m²" dans body_html)

Ces informations sont essentielles pour :
1. Le calculateur de métrage des designers
2. Le filtrage par dimensions dans la recherche
3. L'estimation du coût total d'un projet

### Current State (Before)

| Dimension | Table Column | Value | Source |
|-----------|-------------|-------|--------|
| Longueur | `quantity_value` | 1 (hardcodé) | Aucune |
| Largeur | `width_value` | NULL | Aucune |
| Poids | `weight_value` | variant.grams (si présent) | Shopify variant |

### Data Analysis

**My Little Coupon (FR)**
```
tags: ["3M", "Cotonnade", "Viscose"]
title: "CREPE VISCOSE POPPY 130CM"
body_html: "Laize : 140cm\nPoids : 120g"
```

**The Fabric Sales (EN)**
```
body_html: "<li>Width: 150cm</li><li>Weight: 150gr/m2</li>"
```

---

## Decision

### Approche : Détection Automatique avec Supervision Admin

Plutôt que de hardcoder des patterns par site, le système :
1. **Analyse** les produits lors du Discovery
2. **Détecte** automatiquement les patterns récurrents
3. **Stocke** les patterns dans le profile du site
4. **Affiche** les patterns détectés dans l'UI admin
5. **Applique** les patterns activés lors du scraping

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  DISCOVERY                                                      │
│  extractionPatternDetector.detectExtractionPatterns(products)  │
│  → Teste 15 patterns candidats sur 50 produits                 │
│  → Calcule coverage, génère exemples                           │
│  → Auto-enable si coverage ≥ 30%                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                 SiteProfile.extractionPatterns
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN UI                                                       │
│  /admin/discovery/[siteSlug] - Onglet Extraction               │
│  → Visualise patterns avec couverture et exemples              │
│  → Toggle enable/disable par pattern                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  SCRAPING                                                       │
│  extractionService.extractDimensions(product, patterns)        │
│  → Applique patterns enabled uniquement                        │
│  → Stocke dans textiles.width_value, weight_value, etc.        │
└─────────────────────────────────────────────────────────────────┘
```

### Data Model

```typescript
interface ExtractionPattern {
  id: string;
  field: 'length' | 'width' | 'weight' | 'composition';
  source: 'tags' | 'title' | 'body_html' | 'variant';
  pattern: string;        // Regex
  captureGroup: number;
  unit: string;           // m, cm, gsm
  coverage: number;       // 0-1
  matchCount: number;
  totalTested: number;
  examples: ExtractedExample[];
  enabled: boolean;
  confidence: number;
}

interface ExtractionPatterns {
  patterns: ExtractionPattern[];
  analyzedAt: string;
  productsAnalyzed: number;
}
```

### Pattern Candidates

**Longueur (4 patterns)**
| Source | Pattern | Example |
|--------|---------|---------|
| tags | `/^(\d+(?:[.,]\d+)?)\s*M$/i` | "3M" → 3 |
| tags | `/^(\d+)\s*(?:mètres?|meters?)$/i` | "3 mètres" → 3 |
| title | `/(\d+)\s*(?:mètres?|m)\b/i` | "3m" → 3 |
| body_html | `/(?:longueur|length)[:\s]*(\d+)/i` | "Longueur: 3m" → 3 |

**Largeur (3 patterns)**
| Source | Pattern | Example |
|--------|---------|---------|
| title | `/(\d{2,3})\s*cm\b/i` | "130CM" → 130 |
| body_html | `/(?:width|laize)[:\s]*(\d+)\s*cm/i` | "Laize : 140cm" → 140 |
| body_html | `/[LW][:\s]*(\d+)\s*cm/i` | "L: 140cm" → 140 |

**Poids (4 patterns)**
| Source | Pattern | Example |
|--------|---------|---------|
| body_html | `/(\d+)\s*(?:g\/m[²2]|gsm)/i` | "250g/m²" → 250 |
| body_html | `/(?:weight|poids)[:\s]*(\d+)/i` | "Poids: 120g" → 120 |
| body_html | `/(?:grammage)[:\s]*(\d+)/i` | "Grammage: 200" → 200 |
| variant | `variant.grams` | Direct read |

### Storage

```sql
-- Dans site_profiles JSONB
ALTER TABLE deadstock.site_profiles 
ADD COLUMN extraction_patterns JSONB DEFAULT '{
  "patterns": [],
  "analyzedAt": null,
  "productsAnalyzed": 0
}'::jsonb;
```

---

## Consequences

### Positive

- ✅ **Zero hardcoding** : Patterns détectés automatiquement
- ✅ **Scalable** : Nouveaux sites sans modification de code
- ✅ **Transparent** : Admin voit couverture et exemples
- ✅ **Contrôlable** : Enable/disable par pattern
- ✅ **Testable** : Patterns isolés, faciles à valider
- ✅ **Évolutif** : Ajout de nouveaux pattern candidats simple

### Negative

- ⚠️ Détection limitée aux patterns prédéfinis
- ⚠️ Nécessite re-discovery si patterns changent
- ⚠️ Conversion d'unités peut être imparfaite

### Measured Results

**My Little Coupon (26 produits testés)**

| Dimension | Avant | Après |
|-----------|-------|-------|
| Longueur | 0% | **100%** |
| Largeur | 0% | **100%** |
| Poids (grammage) | 0% | **86%** |

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `src/features/admin/services/extractionPatternDetector.ts` | Détection patterns |
| `src/features/admin/services/extractionService.ts` | Application patterns |
| `src/features/admin/components/ExtractionPatternsCard.tsx` | UI patterns |
| `src/app/admin/discovery/[siteSlug]/page.tsx` | Page détail site |
| `database/migrations/019_add_extraction_patterns.sql` | Migration DB |

### Files Modified

| File | Modification |
|------|--------------|
| `discoveryService.ts` | Intégration détection |
| `scrapingService.ts` | Chargement patterns |
| `scrapingRepo.ts` | Sauvegarde dimensions |

---

## Alternatives Considered

### Alternative 1: Hardcoded patterns per site
**Rejected**: Non-scalable, maintenance lourde pour 15+ sources

### Alternative 2: LLM extraction for each product
**Rejected**: Coût prohibitif ($0.01 × 1000 produits/jour)

### Alternative 3: Separate extraction_rules table
**Rejected**: Complexité accrue, profile JSONB suffit pour MVP

---

## Future Extensions

1. **Pattern Editor UI** : Permettre à l'admin d'ajouter des patterns custom
2. **Test Pattern Live** : Tester regex sur samples avant activation
3. **Cross-site Pattern Transfer** : Réutiliser patterns entre sites similaires
4. **ML Pattern Detection** : Suggérer patterns via analyse ML
5. **Composition Extraction** : "100% coton", "80% viscose 20% EA"

---

## References

- [ADR-008: Intelligent Data Extraction](/mnt/project/ADR_008_intelligent_data_extraction.md)
- [SPEC_ADMIN_DATA_TUNING_COMPLETE.md](/mnt/project/SPEC_ADMIN_DATA_TUNING_COMPLETE.md) - Section 5.3
- [SESSION_17](/mnt/project/SESSION_17_EXTRACTION_PATTERNS.md)

---

**Status**: Implemented  
**Validated**: 2026-01-06 - Test réussi sur My Little Coupon (100% extraction)
