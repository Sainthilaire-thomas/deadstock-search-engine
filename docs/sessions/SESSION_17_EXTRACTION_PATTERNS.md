# SESSION 17 : Système d'Extraction des Dimensions (Longueur, Largeur, Poids)

**Date** : 6 janvier 2026  
**Durée** : ~3h  
**Contexte** : Suite de la Session 16 (Admin Tuning Locale), implémentation Phase 1 des specs SPEC_ADMIN_DATA_TUNING_COMPLETE.md

---

## Objectifs de la Session

1. ✅ Implémenter le système de détection automatique des patterns d'extraction
2. ✅ Créer l'UI admin pour visualiser les patterns détectés
3. ✅ Intégrer l'extraction dans le pipeline de scraping
4. ✅ Stocker les dimensions extraites (longueur, largeur, poids) en base

---

## Contexte Initial

### Problème Identifié (Session 16)

| Dimension | État Avant | Cause |
|-----------|-----------|-------|
| Longueur | 0% | Hardcodé à `quantity_value = 1` |
| Largeur | 0% | Non extrait |
| Poids | ~75% | Seulement `variant.grams` (poids total, pas grammage) |

### Objectif
Permettre au système d'extraire automatiquement les dimensions depuis les données Shopify :
- **Longueur** : Depuis les tags ("3M") ou le body_html
- **Largeur** : Depuis le body_html ("Laize : 140cm") ou le titre ("130CM")
- **Poids** : Depuis le body_html ("Poids : 120g/m²") ou variant.grams

---

## Travail Réalisé

### 1. Architecture Choisie : Supervision Admin vs Hardcoding

**Décision** : Approche supervisée plutôt que hardcoding des patterns.

```
┌─────────────────────────────────────────────────────────────────┐
│  1. DISCOVERY                                                   │
│  Analyse produits sample et DÉTECTE patterns automatiquement   │
│  Stocke dans SiteProfile.extractionPatterns                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. ADMIN UI                                                    │
│  Admin VOIT patterns détectés avec couverture et exemples      │
│  Admin peut ACTIVER / DÉSACTIVER chaque pattern                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. SCRAPING                                                    │
│  Utilise UNIQUEMENT patterns enabled depuis SiteProfile        │
│  Stocke dimensions dans textiles (width_value, weight_value)   │
└─────────────────────────────────────────────────────────────────┘
```

**Avantages** :
- Zero hardcoding site-spécifique
- Patterns détectés automatiquement
- Admin garde contrôle (validation)
- Couverture visible (metrics)
- Scalable (nouveaux sites sans code)

### 2. Fichiers Créés

#### Types (`src/features/admin/domain/types.ts`)
```typescript
export type ExtractionField = 'length' | 'width' | 'weight' | 'composition';
export type ExtractionSource = 'tags' | 'title' | 'body_html' | 'variant';

export interface ExtractionPattern {
  id: string;
  field: ExtractionField;
  source: ExtractionSource;
  pattern: string;           // Regex string
  captureGroup: number;
  unit: string;              // m, cm, gsm
  coverage: number;          // 0-1
  matchCount: number;
  totalTested: number;
  examples: ExtractedExample[];
  enabled: boolean;
  confidence: number;
}

export interface ExtractionPatterns {
  patterns: ExtractionPattern[];
  analyzedAt: string;
  productsAnalyzed: number;
}
```

#### Détecteur (`src/features/admin/services/extractionPatternDetector.ts`)
- Analyse 50 produits samples du discovery
- Teste 15 patterns candidats (longueur, largeur, poids)
- Calcule couverture et confidence
- Auto-enable patterns avec couverture ≥ 30%
- Génère exemples (max 5 par pattern)

#### Service d'extraction (`src/features/admin/services/extractionService.ts`)
- `extractDimensions(product, patterns)` : Applique les patterns sur un produit
- `getExtractionPatternsForSite(siteId)` : Charge les patterns depuis le profile
- Gère la conversion d'unités (mètres → cm si nécessaire)

#### UI Admin (`src/features/admin/components/ExtractionPatternsCard.tsx`)
- Visualisation des patterns détectés
- Badges de couverture colorés (vert/jaune/rouge)
- Expand pour voir regex, unité, exemples
- Toggle enable/disable (lecture seule pour l'instant)

#### Page détail (`src/app/admin/discovery/[siteSlug]/page.tsx`)
- Onglets : Extraction, Collections, Qualité, Données brutes
- Summary cards (collections, produits, qualité, date)
- Navigation depuis `/admin/discovery`

### 3. Modifications Existantes

#### discoveryService.ts
- Ajout Step 7 : Detect extraction patterns
- Appel `detectExtractionPatterns(allSampledProducts)`
- Stockage dans `SiteProfile.extractionPatterns`

#### scrapingService.ts
- Chargement des patterns avant sauvegarde
- Passage des patterns à `saveProducts()`

#### scrapingRepo.ts
- Nouveau paramètre `extractionPatterns`
- Appel `extractDimensions(product, extractionPatterns)`
- Sauvegarde `width_value`, `width_unit`, `weight_value`, `weight_unit`

### 4. Migration Base de Données

```sql
-- Migration 019: Add extraction_patterns to site_profiles
ALTER TABLE deadstock.site_profiles 
ADD COLUMN IF NOT EXISTS extraction_patterns JSONB 
DEFAULT '{"patterns": [], "analyzedAt": null, "productsAnalyzed": 0}'::jsonb;
```

---

## Résultats du Test

### Discovery My Little Coupon

```
🔍 Detecting extraction patterns...
   📏 length: Found 1 patterns, best coverage: 100%
   📏 width: Found 2 patterns, best coverage: 82%
   📏 weight: Found 3 patterns, best coverage: 86%

✅ Detected 5 extraction patterns
   ✅ length (tags): 100% coverage
   ✅ width (body_html): 82% coverage
   ⚪ width (title): 18% coverage
   ✅ weight (body_html): 86% coverage
   ✅ weight (variant): 86% coverage
```

### Scraping avec Extraction

```
🔍 Loading extraction patterns...
   ✅ Found 4 enabled patterns

💾 Saving 26 products with normalization...
   📏 Dimensions: length=3m, width=140cm, weight=210gsm
   📏 Dimensions: length=3m, width=130cm, weight=350gsm
   ...

✅ Save complete:
   New: 0
   Updated: 26
   Normalization coverage: 100%
```

### Données en Base

```sql
SELECT name, quantity_value, quantity_unit, width_value, width_unit, weight_value, weight_unit
FROM deadstock.textiles WHERE source_platform LIKE '%mylittlecoupon%';
```

| Champ | Avant | Après |
|-------|-------|-------|
| `quantity_value` | 1 (hardcodé) | **3** (longueur réelle) |
| `quantity_unit` | "unit" | **"m"** |
| `width_value` | null | **125-158** |
| `width_unit` | null | **"cm"** |
| `weight_value` | variant.grams | **210-570** (grammage) |
| `weight_unit` | null | **"gsm"** |

---

## Fichiers Créés/Modifiés

### Créés
| Fichier | Description |
|---------|-------------|
| `src/features/admin/services/extractionPatternDetector.ts` | Détection auto des patterns |
| `src/features/admin/services/extractionService.ts` | Application des patterns |
| `src/features/admin/components/ExtractionPatternsCard.tsx` | UI patterns |
| `src/app/admin/discovery/[siteSlug]/page.tsx` | Page détail site |
| `src/app/admin/discovery/[siteSlug]/loading.tsx` | Loading state |
| `database/migrations/019_add_extraction_patterns.sql` | Migration DB |

### Modifiés
| Fichier | Modification |
|---------|--------------|
| `src/features/admin/domain/types.ts` | Ajout types ExtractionPattern |
| `src/features/admin/services/discoveryService.ts` | Intégration détection |
| `src/features/admin/services/scrapingService.ts` | Chargement patterns |
| `src/features/admin/infrastructure/scrapingRepo.ts` | Sauvegarde dimensions |
| `src/features/admin/infrastructure/discoveryRepo.ts` | Support extractionPatterns |
| `src/features/admin/application/actions.ts` | Sauvegarde profile avec patterns |
| `src/app/admin/discovery/page.tsx` | Lien vers détail site |

---

## Décisions Techniques

### D1 : Patterns dans SiteProfile JSONB (pas table séparée)
- Simplicité : Tout le profile en un seul endroit
- Performance : Chargé avec le discovery
- Flexibilité : Structure évolutive

### D2 : Auto-enable si coverage ≥ 30%
- Balance entre faux positifs et faux négatifs
- Admin peut désactiver si problème
- Permet fonctionnement sans intervention

### D3 : Priorité patterns par coverage
- Pattern avec meilleure coverage utilisé en premier
- Fallback sur patterns secondaires si échec
- Un seul pattern actif par field dans l'extraction

### D4 : Conversion unités dans extractionService
- Largeur < 10 → probablement en mètres → × 100
- Normalisation vers cm pour largeur, gsm pour poids

---

## État du Projet

### MVP Phase 1 : ~90% Complete

| Module | État | Notes |
|--------|------|-------|
| Search | ✅ 100% | Fonctionnel |
| Favorites | ✅ 100% | Sync instantanée |
| Board | ✅ 95% | Canvas drag-drop |
| Admin Sites | ✅ 95% | Discovery + Scraping + Extraction |
| Admin Tuning | ⚠️ 75% | Unknowns + Dict, UI patterns ✅ |
| Cristallisation | ✅ 85% | Règles + Migration |

### Métriques Extraction (My Little Coupon)

| Dimension | Avant | Après |
|-----------|-------|-------|
| Longueur | 0% | **100%** |
| Largeur | 0% | **100%** |
| Poids (grammage) | 0% | **86%** |

---

## Prochaines Étapes

### Court Terme (Session 18)

1. **Tester sur The Fabric Sales (EN)**
   - Discovery avec patterns EN
   - Vérifier extraction dimensions
   - Patterns différents (body_html EN)

2. **Dashboard Qualité Unifié**
   - Page `/admin/tuning/quality`
   - Métriques globales par dimension
   - Alertes sources problématiques

3. **Toggle Patterns dans UI**
   - Server action pour enable/disable
   - Mise à jour profile en base
   - Re-scraping ciblé optionnel

### Moyen Terme

4. **Pattern Composition**
   - Détection "100% coton", "80% viscose 20% elasthanne"
   - Stockage dans `composition` JSONB

5. **Test Pattern Live**
   - Interface pour tester regex sur samples
   - Prévisualisation avant activation

---

## Liens

- [ADR-008 : Intelligent Data Extraction](/mnt/project/ADR_008_intelligent_data_extraction.md)
- [ADR-020 : Source Locale Scrapers](/mnt/project/ADR_020_SCRAPER_SOURCE_LOCALE.md)
- [SPEC_ADMIN_DATA_TUNING_COMPLETE.md](/mnt/project/SPEC_ADMIN_DATA_TUNING_COMPLETE.md)
- [SESSION_16](/mnt/project/SESSION_16_ADMIN_TUNING_LOCALE.md)
