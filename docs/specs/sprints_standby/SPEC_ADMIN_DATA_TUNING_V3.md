# Spécification Complète : Parcours Admin - Tuning Qualité des Données

**Date**: 2026-01-06
**Version**: 3.0 (intégrant ADR-020, ADR-021, Option B Extraction)
**Statut**: Draft
**Auteur**: Thomas

---

## 0. Vision Fonctionnelle : 3 Étapes Admin

```
         ┌────────────────────────────────────────────────────┐
         │                                                    │
         ▼                                                    │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 1. DISCOVERY    │ →  │ 2. SCRAPING     │ →  │ 3. TUNING       │
│ & PRÉPARATION   │    │ & CONTRÔLE      │    │ & AMÉLIORATION  │
│                 │    │                 │    │                 │
│ ~6 mois         │    │ quotidien/hebdo │    │ continu         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                      ▲                     │
         │                      │                     │
         │    ┌─────────────────┴──────────────┐     │
         │    │  DEMANDES UTILISATEURS         │     │
         │    │  (Demand-Driven Indexation)    │     │
         │    └────────────────────────────────┘     │
         │                                           │
         └───────────── FEEDBACK ───────────────────┘
```

### Étape 1 : Discovery & Préparation (~6 mois)
- Analyser structure du site (collections, tags, formats)
- Classifier les tags (fiber/color/pattern/length/stopword)
- Définir patterns extraction (dimensions, composition)
- Configurer source_locale
- Valider sur échantillon

### Étape 2 : Scraping & Contrôle (quotidien/hebdo)
- Scraping planifié (complet, delta, disponibilité)
- Scraping à la demande (admin ou utilisateur)
- Scraping intelligent (demand-driven)
- Contrôle qualité et métriques
- Logger unknowns pour tuning

### Étape 3 : Tuning & Amélioration (continu)
- Traiter unknowns → enrichir dictionnaire
- Ajuster règles extraction si problèmes
- Tests de non-régression
- Analyser métriques → identifier gaps
- Feedback vers Discovery si changement majeur

> **Voir aussi** : `SPEC_DEMAND_DRIVEN_INDEXATION.md` pour le flux utilisateur → admin

---

## 1. Vue d'Ensemble du Système

### 1.1 Les Dimensions de Données à Enrichir

| Dimension | Type | Source Brute | Méthode | État |
|-----------|------|--------------|---------|------|
| **Matière** (fiber) | Normalisation | tags, title, body_html | Dict multi-locale | ✅ Implémenté (ADR-021) |
| **Couleur** (color) | Normalisation | tags, title, body_html | Dict multi-locale | ✅ Implémenté (ADR-021) |
| **Motif** (pattern) | Normalisation | tags, title | Dict multi-locale | ✅ Implémenté (ADR-021) |
| **Armure** (weave) | Normalisation | body_html | Dict multi-locale | ⚠️ Partiel |
| **Longueur dispo** | Extraction | tags ("3M") | Patterns regex | ❌ Non implémenté |
| **Largeur (laize)** | Extraction | body_html, title | Patterns regex | ❌ Non implémenté |
| **Poids (grammage)** | Extraction | variants.grams, body_html | Partiel (variants) | ⚠️ Partiel |
| **Composition %** | Extraction | tags, body_html | Patterns regex | ❌ Non implémenté |
| **Certifications** | Extraction | tags, body_html | Keywords list | ❌ Non implémenté |

### 1.2 Architecture Actuelle du Pipeline (Post ADR-021)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           1. DISCOVERY                                   │
│  discoveryService.ts                                                     │
│  ───────────────────────────────────────────────────────────────────────│
│  ✅ Analyse collections (pertinence, priorité)                          │
│  ✅ Analyse tags (fréquence, top 20)                                    │
│  ✅ Analyse product_types                                                │
│  ✅ Analyse prix (min/max/avg/distribution)                             │
│  ✅ Analyse poids variants (% avec données)                             │
│  ✅ Calcul Deadstock Score                                               │
│  ✅ Calcul Data Quality (images, prix, tags, description)               │
│  ❌ Détection patterns extraction (longueur, largeur)                   │
│  ❌ Analyse body_html pour infos structurées                            │
│  ❌ Classification tags par catégorie (→ site_extraction_rules)         │
│                                                                          │
│  Output: SiteProfile (stocké dans site_profiles)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                           2. SCRAPING                                    │
│  scrapingService.ts → scrapingRepo.ts (ADR-021)                         │
│  ───────────────────────────────────────────────────────────────────────│
│  ✅ Fetch produits Shopify API                                          │
│  ✅ Récupère site.source_locale (ADR-020)                               │
│  ✅ Passe sourceLocale à extractTermsFromShopify()                      │
│  ✅ Sauvegarde via scrapingRepo.saveProducts() avec normalisation       │
│  ❌ Extraction longueur depuis tags ("3M" → 3m)                         │
│  ❌ Extraction largeur depuis body_html/title                           │
│  ❌ Extraction composition % depuis tags/body_html                      │
│                                                                          │
│  Output: Produits avec ExtractedTerms + sourceLocale                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                  3. EXTRACTION (Keywords Hardcodés)                      │
│  extractTerms.ts                                                         │
│  ───────────────────────────────────────────────────────────────────────│
│  ✅ Keywords hardcodés par langue (fr, en, es, it, de)                  │
│  ✅ Paramètre forceLocale pour override détection auto (ADR-021)        │
│  ✅ Stopwords filtrés (fabric, colour, etc.)                            │
│  ❌ Keywords dynamiques depuis DB (Option B - À implémenter)            │
│                                                                          │
│  Output: ExtractedTerms { materials[], colors[], patterns[], locale }   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        4. NORMALISATION                                  │
│  normalizationService.ts + normalizeTextile.ts                          │
│  ───────────────────────────────────────────────────────────────────────│
│  ✅ DictionaryCache chargé par locale + catégorie                       │
│  ✅ Lookup exact match puis partial match                               │
│  ✅ Filtre par source_locale (ADR-020)                                  │
│  ✅ Log unknowns avec contexte enrichi                                  │
│  ❌ LLM fallback temps réel                                             │
│                                                                          │
│  Dictionnaire actuel:                                                    │
│  - FR: 75 mappings                                                       │
│  - EN: 180 mappings (seedé Session 16)                                   │
│                                                                          │
│  Output: Textile normalisé + unknowns loggés                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        5. STOCKAGE                                       │
│  Table deadstock.textiles                                               │
│  ───────────────────────────────────────────────────────────────────────│
│  ✅ Données normalisées: material_type, color, pattern                  │
│  ✅ Données originales: material_original, color_original, etc.         │
│  ✅ Métadonnées qualité: confidence, needs_review, review_reasons       │
│  ✅ Raw data complet: raw_data JSONB                                    │
│  ❌ Dimensions non extraites: quantity_value=1, width_value=NULL        │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        6. TUNING (Admin)                                 │
│  /admin/tuning + features/tuning                                        │
│  ───────────────────────────────────────────────────────────────────────│
│  ✅ Liste unknowns (UnknownsList.tsx)                                   │
│  ✅ Affiche contexte + image + lien produit                             │
│  ✅ Input traduction manuelle                                           │
│  ✅ Approve → Crée mapping dans dictionary_mappings                     │
│  ✅ Reject → Marque comme rejeté (stopword)                             │
│  ❌ Suggestion LLM automatique                                          │
│  ❌ Batch processing (traiter plusieurs à la fois)                      │
│  ❌ Dashboard qualité global                                             │
│  ❌ UI extraction rules par site (Option B)                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Cible : Extraction Dynamique (Option B)

### 2.1 Vision

Remplacer les keywords hardcodés dans `extractTerms.ts` par des règles stockées en base de données, configurables par site via l'interface admin.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 DISCOVERY + ADMIN UI                                     │
│  ───────────────────────────────────────────────────────────────────────│
│  1. Discovery analyse tous les tags du site                             │
│  2. Admin classifie les tags via UI (fiber/color/pattern/ignore)        │
│  3. Règles stockées dans site_extraction_rules                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXTRACTION DYNAMIQUE                                 │
│  ───────────────────────────────────────────────────────────────────────│
│  • Charge les règles depuis DB au lieu de keywords hardcodés            │
│  • Une seule source de vérité (plus de double maintenance)              │
│  • Spécifique par site (TFS peut avoir des règles différentes de MLC)   │
│  • Pas de déploiement requis pour nouveaux termes                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                     NORMALISATION (inchangée)                            │
│  ───────────────────────────────────────────────────────────────────────│
│  • Dictionnaire Supabase pour traduction/standardisation                │
│  • Lookup par source_locale + category                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Nouvelle Table : `site_extraction_rules`

```sql
CREATE TABLE deadstock.site_extraction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  
  -- Pattern matching
  tag_pattern TEXT NOT NULL,           -- "wool", "3M", "laize*", regex possible
  is_regex BOOLEAN DEFAULT false,      -- Si true, tag_pattern est une regex
  
  -- Classification
  category TEXT NOT NULL,              -- 'fiber', 'color', 'pattern', 'length', 'width', 'stopword'
  action TEXT DEFAULT 'extract',       -- 'extract', 'ignore'
  
  -- Pour dimensions (length, width)
  extract_value_pattern TEXT,          -- Regex pour extraire la valeur: "(\d+)M" → groupe 1
  value_unit TEXT,                     -- 'm', 'cm', 'yards'
  value_multiplier NUMERIC DEFAULT 1,  -- Pour convertir: yards → m = 0.9144
  
  -- Métadonnées
  priority INT DEFAULT 0,              -- Pour résoudre conflits (plus haut = priorité)
  occurrences INT DEFAULT 0,           -- Combien de fois ce tag a été vu
  source TEXT DEFAULT 'discovery',     -- 'discovery', 'manual', 'llm_suggested'
  confidence NUMERIC DEFAULT 1.0,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(site_id, tag_pattern, category)
);

-- Index pour lookup rapide
CREATE INDEX idx_site_extraction_rules_site ON deadstock.site_extraction_rules(site_id);
CREATE INDEX idx_site_extraction_rules_category ON deadstock.site_extraction_rules(category);
```

### 2.3 UI Admin : Classification des Tags

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Admin > Sites > The Fabric Sales > Extraction Rules                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  📊 Tags découverts (dernière discovery: 06/01/2026)                       │
│  ────────────────────────────────────────────────────────────────────────  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  STATISTIQUES                                                        │  │
│  │  ───────────────────────────────────────────────────────────────────│  │
│  │  Total tags uniques: 847    Classifiés: 312 (37%)                   │  │
│  │  Non classifiés: 535        Ignorés: 89                              │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  FILTRES                                                             │  │
│  │  [Non classifiés ▼]  [Fréquence > 10 ▼]  [Recherche: ________]      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  TAG              │ FRÉQUENCE │ CATÉGORIE      │ ACTION              │  │
│  │  ─────────────────┼───────────┼────────────────┼───────────────────  │  │
│  │  wool             │ 1,247×    │ [fiber ▼]      │ ✅ Extraire         │  │
│  │  cotton           │ 1,089×    │ [fiber ▼]      │ ✅ Extraire         │  │
│  │  blue             │ 892×      │ [color ▼]      │ ✅ Extraire         │  │
│  │  3M               │ 654×      │ [length ▼]     │ ✅ Extraire         │  │
│  │  NEW              │ 543×      │ [stopword ▼]   │ ❌ Ignorer          │  │
│  │  fabric           │ 498×      │ [stopword ▼]   │ ❌ Ignorer          │  │
│  │  laize 150cm      │ 234×      │ [width ▼]      │ ✅ Extraire         │  │
│  │  ...              │           │                │                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  [💾 Sauvegarder règles]  [🔄 Re-découvrir]  [▶️ Tester sur 10 produits]   │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.4 UI Admin : Configuration Patterns Dimensions

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Admin > Sites > The Fabric Sales > Extraction Rules > Dimensions          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  📏 Configuration Extraction Dimensions                                     │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  LONGUEUR (tags)                                                     │  │
│  │  ───────────────────────────────────────────────────────────────────│  │
│  │  Pattern: [(\d+)M________________]  → Extrait "3" de "3M"           │  │
│  │  Unité:   [mètres ▼]                                                 │  │
│  │                                                                       │  │
│  │  Exemples détectés:                                                  │  │
│  │  • "3M" → 3 mètres ✅                                                │  │
│  │  • "5M" → 5 mètres ✅                                                │  │
│  │  • "1.5M" → 1.5 mètres ✅                                            │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  LARGEUR (body_html / title)                                         │  │
│  │  ───────────────────────────────────────────────────────────────────│  │
│  │  Pattern: [Width[:\s]*(\d+)\s*cm___]  → Extrait "150" de "Width: 150cm" │
│  │  Unité:   [centimètres ▼]                                            │  │
│  │                                                                       │  │
│  │  Exemples détectés:                                                  │  │
│  │  • "Width: 150cm" → 150 cm ✅                                        │  │
│  │  • "Laize 140 cm" → 140 cm ✅                                        │  │
│  │  • "150CM WIDTH" → 150 cm ✅                                         │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  [💾 Sauvegarder]  [▶️ Tester sur échantillon]                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.5 Modes de Scraping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MODES DE SCRAPING                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📅 PLANIFIÉ (Scheduled)                                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Scraping complet : hebdomadaire (dimanche 3h)                            │
│  • Scraping delta : quotidien (nouveaux produits uniquement)                │
│  • Vérification disponibilité : toutes les 6h                               │
│                                                                             │
│  🎯 À LA DEMANDE (On-Demand)                                                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Bouton admin "Scraper maintenant"                                        │
│  • Scraping ciblé (collections spécifiques)                                 │
│  • Scraping filtré (critères normalisés)                                    │
│                                                                             │
│  🔔 INTELLIGENT (Demand-Driven)                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Déclenché par recherches utilisateurs sans résultat                      │
│  • Parse requête → termes normalisés → scraping ciblé auto                  │
│  • Alerte admin si terme inconnu fréquent                                   │
│                                                                             │
│  > Voir SPEC_DEMAND_DRIVEN_INDEXATION.md pour le flux complet               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.6 UI Planification Scraping

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Admin > Sites > The Fabric Sales > Scraping                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  [Planification] [Historique] [Métriques] [Demandes utilisateurs]          │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  📅 SCRAPING PLANIFIÉ                                                │  │
│  │  ───────────────────────────────────────────────────────────────────│  │
│  │                                                                       │  │
│  │  Scraping complet                                                    │  │
│  │  [✓ Activé]  Fréquence: [Hebdomadaire ▼]  Jour: [Dimanche ▼]        │  │
│  │              Heure: [03:00 ▼]  Collections: [Toutes ▼]               │  │
│  │              Dernier: 05/01/2026 03:12 (847 produits)               │  │
│  │                                                                       │  │
│  │  Scraping delta (nouveautés)                                         │  │
│  │  [✓ Activé]  Fréquence: [Quotidien ▼]  Heure: [06:00 ▼]             │  │
│  │              Dernier: 06/01/2026 06:05 (23 nouveaux)                 │  │
│  │                                                                       │  │
│  │  Vérification disponibilité                                          │  │
│  │  [✓ Activé]  Fréquence: [Toutes les 6h ▼]                           │  │
│  │              Dernier: 06/01/2026 12:00 (12 changements)              │  │
│  │                                                                       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  🎯 SCRAPING À LA DEMANDE                                            │  │
│  │  ───────────────────────────────────────────────────────────────────│  │
│  │                                                                       │  │
│  │  Collections: [Sélectionner... ▼]                                    │  │
│  │  Filtres:     Matière [____] Couleur [____] Motif [____]            │  │
│  │  Limite:      [100 ▼] produits max                                   │  │
│  │                                                                       │  │
│  │  [▶️ Scraper maintenant]  [👁️ Preview (10 produits)]                 │  │
│  │                                                                       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  🔔 DEMANDES UTILISATEURS (3 en attente)                             │  │
│  │  ───────────────────────────────────────────────────────────────────│  │
│  │                                                                       │  │
│  │  • "soie bleue marine" - 5 demandes - Pattern connu ✓                │  │
│  │    [▶️ Scraper ciblé]                                                │  │
│  │                                                                       │  │
│  │  • "lin bio certifié" - 7 demandes - Terme inconnu ⚠️                │  │
│  │    [Ajouter au dictionnaire] [Ignorer]                               │  │
│  │                                                                       │  │
│  │  [→ Voir toutes les demandes]                                        │  │
│  │                                                                       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.7 Table : `scraping_schedules`

```sql
CREATE TABLE deadstock.scraping_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  
  -- Type de scraping
  schedule_type TEXT NOT NULL,        -- 'full', 'delta', 'availability'
  
  -- Planification
  is_enabled BOOLEAN DEFAULT true,
  frequency TEXT NOT NULL,            -- 'daily', 'weekly', 'every_6h', 'every_12h'
  day_of_week INTEGER,                -- 0-6 pour weekly (0=dimanche)
  hour_of_day INTEGER DEFAULT 3,      -- 0-23
  
  -- Configuration
  collections TEXT[],                 -- NULL = toutes
  max_products INTEGER,
  filters JSONB,                      -- {only_available: true, min_price: 5}
  
  -- Statistiques
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT,               -- 'success', 'partial', 'failed'
  last_run_products INTEGER,
  next_run_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(site_id, schedule_type)
);
```

---

## 3. Modèle de Données Complet

### 3.1 Tables Existantes (à jour)

#### `deadstock.sites` (modifié ADR-020)
```sql
ALTER TABLE deadstock.sites 
ADD COLUMN source_locale TEXT NOT NULL DEFAULT 'fr'
CHECK (source_locale IN ('fr', 'en', 'es', 'it', 'de'));
```

#### `deadstock.dictionary_mappings`
```sql
CREATE TABLE deadstock.dictionary_mappings (
  id UUID PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES attribute_categories(id),
  source_term TEXT NOT NULL,           -- "coton", "soie", "lilac"
  source_locale TEXT NOT NULL,         -- "fr", "en", "es"
  translations JSONB NOT NULL,         -- {"en": "cotton", "fr": "coton"}
  source TEXT DEFAULT 'manual',        -- "manual", "llm_suggested", "user_feedback"
  confidence NUMERIC DEFAULT 1.0,
  usage_count INTEGER DEFAULT 0,
  validated_at TIMESTAMPTZ,
  validated_by UUID,
  notes TEXT,
  
  UNIQUE(source_term, source_locale, category_id)
);
```

**État actuel du dictionnaire:**
| Locale | Mappings | Catégories |
|--------|----------|------------|
| FR | 75 | fiber, color, pattern, weave |
| EN | 180 | fiber (50), color (55), pattern (45), weave (21) |
| ES | 0 | - |
| IT | 0 | - |
| DE | 0 | - |

#### `deadstock.unknown_terms`
```sql
CREATE TABLE deadstock.unknown_terms (
  id UUID PRIMARY KEY,
  term TEXT NOT NULL,
  category TEXT NOT NULL,              -- "fiber", "color", "pattern"
  status TEXT DEFAULT 'pending',       -- "pending", "approved", "rejected"
  occurrences INTEGER DEFAULT 1,
  contexts JSONB,                      -- [{image_url, product_url, full_text}]
  source_platform TEXT,
  
  -- LLM suggestions (future)
  llm_suggestion TEXT,
  llm_confidence NUMERIC,
  llm_reasoning TEXT,
  
  -- Review
  human_mapping TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_notes TEXT,
  
  -- Dict link
  added_to_dict BOOLEAN DEFAULT false,
  added_to_dict_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(term, category)
);
```

### 3.2 Nouvelles Tables (Option B)

#### `deadstock.site_extraction_rules`
Voir section 2.2

#### `deadstock.site_discovered_tags` (pour UI)
```sql
CREATE TABLE deadstock.site_discovered_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  occurrences INTEGER DEFAULT 1,
  sample_products JSONB,               -- [{id, title, image_url}] max 3
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Classification (si faite)
  classified_category TEXT,            -- NULL si non classifié
  classified_at TIMESTAMPTZ,
  classified_by UUID,
  
  UNIQUE(site_id, tag)
);

CREATE INDEX idx_site_discovered_tags_site ON deadstock.site_discovered_tags(site_id);
CREATE INDEX idx_site_discovered_tags_unclassified 
  ON deadstock.site_discovered_tags(site_id) 
  WHERE classified_category IS NULL;
```

---

## 4. Plan d'Implémentation Révisé

### Phase 0 : Corrections & Stabilisation (✅ Fait)
**Statut** : Complété Session 16-17

- [x] ADR-020 : source_locale sur sites
- [x] Seed dictionnaire EN (180 termes)
- [x] ADR-021 : Intégration normalisation dans scraping
- [x] Fix SiteAnalysisCard deadstockScore undefined

### Phase 1 : Dashboard Qualité Global - 4h
**Priorité** : 🔴 Critique

Créer `/admin/quality` avec vue d'ensemble :

```
┌────────────────────────────────────────────────────────────────────────┐
│  📊 Quality Dashboard                                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  COUVERTURE DONNÉES                                                    │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐             │
│  │ Matière  │ Couleur  │ Motif    │ Longueur │ Largeur  │             │
│  │   85%    │   72%    │   45%    │   15%    │   0%     │             │
│  │ ████████ │ ███████░ │ ████░░░░ │ █░░░░░░░ │ ░░░░░░░░ │             │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘             │
│                                                                        │
│  PAR SOURCE                                                            │
│  ┌─────────────────────┬─────────┬─────────┬─────────┬──────────┐     │
│  │ Source              │ Textiles│ Qualité │Unknowns │ Actions  │     │
│  ├─────────────────────┼─────────┼─────────┼─────────┼──────────┤     │
│  │ My Little Coupon    │ 1,247   │ 78%     │ 12      │ [Config] │     │
│  │ The Fabric Sales    │ 99      │ 92%     │ 3       │ [Config] │     │
│  │ Recovo              │ 0       │ -       │ 0       │ [Config] │     │
│  └─────────────────────┴─────────┴─────────┴─────────┴──────────┘     │
│                                                                        │
│  UNKNOWNS À TRAITER                                                    │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │ 🔴 15 unknowns pending (12 fiber, 2 color, 1 pattern)        │     │
│  │ [→ Voir tous les unknowns]                                    │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
│  DICTIONNAIRE                                                          │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │ FR: 75 mappings  │  EN: 180 mappings  │  ES: 0  │  IT: 0     │     │
│  │ [→ Gérer dictionnaire]                                        │     │
│  └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

**Fichiers à créer:**
- `src/app/admin/quality/page.tsx`
- `src/features/admin/components/QualityDashboard.tsx`
- `src/features/admin/infrastructure/qualityRepo.ts`

### Phase 2 : UI Unknowns Améliorée - 3h
**Priorité** : 🔴 Haute

Améliorer `/admin/tuning` existant :

1. **Filtres avancés** : Par source, catégorie, date
2. **Batch processing** : Sélection multiple, actions groupées
3. **Stats progression** : Unknowns traités cette semaine
4. **Suggestions rapides** : Bouton pour pré-remplir avec terme similaire

### Phase 3 : Browse Dictionnaire - 2h
**Priorité** : 🟡 Moyenne

Nouvel onglet `/admin/tuning/dictionary` :

1. Liste tous les mappings par catégorie
2. Recherche/filtre
3. Édition inline
4. Export CSV
5. Import bulk

### Phase 4 : Extraction Dimensions (ADR-019) - 4h
**Priorité** : 🟡 Moyenne

1. Patterns regex pour longueur/largeur
2. Modifier extractTerms.ts pour dimensions
3. UI configuration patterns par site
4. Test sur TFS

### Phase 5 : Classification Tags (Option B) - 6h
**Priorité** : 🟢 Basse (Phase 2 MVP)

1. Migration `site_extraction_rules` + `site_discovered_tags`
2. Discovery enrichie : stocke tags découverts
3. UI classification tags
4. Modifier extractTerms.ts pour charger règles depuis DB
5. Cache règles par site

### Phase 6 : LLM Suggestions - 3h
**Priorité** : 🟢 Basse

1. Service `suggestMapping()` avec Claude API
2. Bouton "Suggérer LLM" dans UI unknowns
3. Batch suggestions pour nouveaux unknowns
4. Coût tracking

### Phase 7 : Re-scraping Intelligent - 2h
**Priorité** : 🟢 Basse

1. Bouton "Re-normaliser" (sans re-fetch)
2. Re-scraping ciblé (textiles sans longueur, etc.)
3. Preview impact avant exécution

---

## 5. Navigation Admin Proposée

```
/admin
├── /admin/sites                    # Liste sites (existant)
│   └── /admin/sites/[id]           # Détail site
│       └── /admin/sites/[id]/configure  # Config scraping
│       └── /admin/sites/[id]/extraction # Config extraction (Option B)
│
├── /admin/quality                  # Dashboard qualité (nouveau)
│
├── /admin/tuning                   # Tuning (existant, amélioré)
│   ├── /admin/tuning/unknowns      # Liste unknowns (défaut)
│   ├── /admin/tuning/dictionary    # Browse dictionnaire (nouveau)
│   └── /admin/tuning/history       # Historique actions (futur)
│
└── /admin/jobs                     # Jobs scraping (existant)
```

---

## 6. Métriques de Succès

| Métrique | Avant ADR-021 | Après ADR-021 | Cible Phase 1 | Cible Final |
|----------|---------------|---------------|---------------|-------------|
| Unknowns TFS | ~600 | ~3 | <10 | <5 |
| Unknowns MLC | ~20 | ~12 | <10 | <5 |
| Textiles avec matière | 40% | 85% | 90% | 95% |
| Textiles avec couleur | 30% | 72% | 80% | 90% |
| Textiles avec longueur | 15% | 15% | 80% | 90% |
| Textiles avec largeur | 0% | 0% | 40% | 60% |
| Temps review unknown | 2 min | 2 min | 30 sec | 15 sec |
| Dictionnaire FR | 75 | 75 | 100 | 150 |
| Dictionnaire EN | 0 | 180 | 200 | 300 |

---

## 7. Questions Résolues

| Question | Décision | ADR |
|----------|----------|-----|
| Comment gérer sources multi-locales ? | `source_locale` par site | ADR-020 |
| Où faire la normalisation ? | Dans `scrapingRepo.saveProducts()` | ADR-021 |
| Keywords hardcodés ou DB ? | Hardcodés MVP, DB Phase 2 (Option B) | ADR-021 |
| LLM temps réel ou batch ? | Batch suggestions d'abord | - |

---

## 8. Questions Ouvertes

1. **Priorité Phase 1 vs Scraping complet TFS** : Dashboard qualité d'abord ou données d'abord ?
   - Recommandation : Dashboard d'abord pour avoir les métriques

2. **Option B timing** : Implémenter en Phase 1 MVP ou Phase 2 ?
   - Recommandation : Phase 2, keywords hardcodés suffisants pour MVP

3. **LLM provider** : Claude API ou autre ?
   - Recommandation : Claude (cohérence stack), budget ~$15/mois

4. **Stockage patterns dimensions** : Dans SiteProfile JSONB ou `site_extraction_rules` ?
   - Recommandation : `site_extraction_rules` pour cohérence Option B

---

**Prochaine étape** : Implémenter Phase 1 (Dashboard Qualité)
