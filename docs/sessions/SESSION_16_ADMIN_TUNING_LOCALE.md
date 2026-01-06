# SESSION 16 : Complete Admin Tuning Workflow Specification + Source Locale ADR

**Date** : 5 janvier 2026  
**Durée** : ~2h  
**Contexte** : Suite de la Session 15 (Cristallisation), focus sur le système de tuning admin complet

---

## Objectifs de la Session

1. ✅ Documenter exhaustivement le parcours admin de tuning des données
2. ✅ Analyser les gaps entre Discovery/Scraping/Normalisation
3. ✅ Créer l'ADR-020 pour la gestion des locales sources dans les scrapers
4. ✅ Identifier les unknowns problématiques (600+ pour TFS)

---

## Travail Réalisé

### 1. Analyse Complète du Système de Normalisation

**Architecture découverte :**
```
Discovery → Scraping → Normalisation → Storage → Tuning
```

**Fichiers clés identifiés :**
- `src/features/normalization/infrastructure/normalizationService.ts`
- `src/features/normalization/application/normalizeTextile.ts`
- `src/features/tuning/infrastructure/dictionaryRepo.ts`
- `src/features/tuning/infrastructure/unknownsRepo.ts`
- `src/app/admin/tuning/page.tsx`

**Flow de normalisation :**
1. Dictionary Lookup (DictionaryCache) - ~80-85% couverture
2. LLM Fallback (❌ NON IMPLÉMENTÉ - planifié ADR-004)
3. Log Unknown Term avec contexte enrichi

### 2. Gap Analysis - Dimensions de Données

| Dimension | Type | Source | État |
|-----------|------|--------|------|
| Matière (fiber) | Normalization | tags, title, body | ✅ Working |
| Couleur (color) | Normalization | tags, title, body | ✅ Working |
| Motif (pattern) | Normalization | tags, title | ✅ Working |
| Armure (weave) | Normalization | body_html | ⚠️ Partial |
| **Longueur** | Extraction | tags ("3M") | ❌ Hardcoded to 1 |
| **Largeur** | Extraction | body_html, title | ❌ Not extracted |
| Poids | Extraction | variants.grams | ⚠️ Partial |
| Composition % | Extraction | tags, body | ❌ Not extracted |

### 3. Analyse des Unknown Terms

**Export CSV analysé** - Problème majeur identifié :

| Source | Unknowns | Cause |
|--------|----------|-------|
| thefabricsales.com (EN) | ~600 | Dictionnaire sans termes EN |
| my_little_coupon (FR) | ~20 | Normal (nouveaux termes) |

**Termes EN basiques marqués "unknown" :**
- Colors : `blue`, `red`, `green`, `black`, `white`, `grey`, `pink`, `purple`...
- Fibers : `cotton`, `wool`, `silk`, `polyester`, `viscose`, `nylon`...
- Patterns : `solid`, `striped`, `floral`, `abstract`...

**Faux positifs / Bruit :**
- `fabric` (112×) - Stopword, pas une matière
- `solid` (101×) - Pattern mais aussi mot courant
- `colour` (4×) - Le mot "couleur" en anglais

### 4. Documents Créés

#### SPEC_ADMIN_DATA_TUNING_COMPLETE.md
Spécification exhaustive du workflow admin tuning :
- Navigation admin proposée (5 sections)
- UI mockups détaillés (Quality Dashboard, Extraction Patterns, Enhanced Unknowns)
- Plan d'implémentation en 7 phases
- Métriques de succès

#### ADR-020 : Source Locale Configuration for Scrapers
Décision architecturale pour résoudre le problème des unknowns EN :

**Solution :**
1. `sourceLocale` obligatoire par site (`'fr'`, `'en'`, `'es'`, `'it'`, `'de'`)
2. Dictionnaires séparés par langue source
3. Lookup `WHERE source_locale = X`
4. Passthrough EN → EN pour sources anglaises

**Impact attendu :**
- Unknowns TFS : 600 → <50
- Couverture dict EN : 0% → 90%

---

## Décisions Prises

### D1 : Architecture Multi-Locale pour Dictionnaires
- Chaque site a un `sourceLocale` configuré
- Le dictionnaire a des entrées par `source_locale`
- La normalisation filtre par locale source

### D2 : Dictionnaire EN = Passthrough
- Termes EN → EN (cotton → cotton)
- Simplifie le système pour sources anglaises
- Évite les faux unknowns

### D3 : Plan d'Implémentation Admin en 7 Phases
1. Extraction dimensions (ADR-019) - 🔴 Critical
2. Dashboard qualité - 🔴 High
3. UI patterns extraction - 🟡 Medium
4. Test pattern live - 🟡 Medium
5. LLM suggestions unknowns - 🟡 Medium
6. Enrichir UI tuning - 🟢 Low
7. Re-scraping ciblé - 🟢 Low

---

## Fichiers Créés/Modifiés

### Créés
| Fichier | Description |
|---------|-------------|
| `SPEC_ADMIN_DATA_TUNING_COMPLETE.md` | Spec complète workflow tuning |
| `ADR_020_SCRAPER_SOURCE_LOCALE.md` | ADR source locale + dictionnaires |

### À Créer (Prochaine Session)
- Migration SQL : `source_locale` sur `sites`
- Seed SQL : Dictionnaire EN (~150 termes)
- Script cleanup : Unknowns EN existants

---

## État du Projet

### MVP Phase 1 : ~87% Complete

| Module | État | Notes |
|--------|------|-------|
| Search | ✅ 100% | Fonctionnel |
| Favorites | ✅ 100% | Sync instantanée |
| Board | ✅ 95% | Canvas drag-drop |
| Admin Sites | ✅ 90% | Discovery + Scraping |
| Admin Tuning | ⚠️ 70% | Unknowns basique, dict incomplet |
| Cristallisation | ✅ 85% | Règles + Migration |

### Bloquants Identifiés
1. **Dictionnaire EN vide** → ADR-020 résout
2. **Longueur/Largeur non extraits** → ADR-019 planifié
3. **LLM fallback non implémenté** → Phase 5 tuning

---

## Métriques

### Unknowns Analysis
- Total pending : ~620
- TFS (EN source) : ~600 (97%)
- MLC (FR source) : ~20 (3%)
- Post ADR-020 expected : <70

### Couverture Dictionnaire
- FR : ~85% (estimé)
- EN : 0% (à seeder)
- Cible post-seed : EN 90%

---

## Prochaine Session (17)

### Objectif : Implémentation Admin Module Complet

**Actions prioritaires :**

1. **Exécuter ADR-020** (30 min)
   - Migration `source_locale` sur `sites`
   - Seed dictionnaire EN (~150 termes)
   - Cleanup unknowns EN existants
   - Ajouter stopwords

2. **Phase 1 : Extraction Dimensions** (2h)
   - Détecter patterns longueur ("3M", "5 mètres")
   - Détecter patterns largeur ("Laize 150cm", "Width: 140cm")
   - Modifier scrapingService pour extraire
   - ADR-019 implémentation

3. **Phase 2 : Dashboard Qualité** (1h)
   - Métriques globales par dimension
   - Alertes sources problématiques
   - Stats couverture normalisation

4. **Tester Pipeline Complet**
   - Re-scraper TFS avec sourceLocale EN
   - Vérifier réduction unknowns
   - Valider extraction dimensions

---

## Notes Techniques

### DictionaryCache Architecture
```typescript
// Cache par locale (à implémenter)
Map<SourceLocale, Map<string, DictionaryMapping>>

// Lookup
cache.get(sourceLocale).get(`${term}:${categoryId}`)
```

### Seed Dictionnaire EN (extraits)
```sql
-- Colors
'red', 'blue', 'green', 'black', 'white', 'grey', 'gray',
'pink', 'purple', 'brown', 'beige', 'navy', 'navy blue'...

-- Fibers  
'cotton', 'silk', 'wool', 'linen', 'polyester', 'viscose',
'nylon', 'cashmere', 'acetate', 'rayon'...

-- Patterns
'solid', 'striped', 'floral', 'abstract', 'geometric',
'checks', 'plaid', 'houndstooth'...
```

### Questions Ouvertes
1. LLM fallback : real-time ou suggestions-only ?
2. Pattern storage : SiteProfile JSONB ou table séparée ?
3. Multi-patterns : priorité si plusieurs matchent ?

---

## Liens

- [ADR-002 : Normalisation EN + i18n](/mnt/project/ADR_002_normalization_english_i18n.md)
- [ADR-004 : Système Tuning Hybrid](/mnt/project/ADR_004_normalization_tuning_system.md)
- [ADR-007 : Adapter Pattern Scrapers](/mnt/project/ADR_007_adapter_pattern_scrapers.md)
- [DATABASE_ARCHITECTURE.md](/mnt/project/DATABASE_ARCHITECTURE.md)
- [SPEC_ADMIN_DATA_TUNING_COMPLETE.md](/mnt/project/SPEC_ADMIN_DATA_TUNING_COMPLETE.md)
