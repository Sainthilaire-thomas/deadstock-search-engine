# ADR-025 : Clarification Architecture Admin - Discovery, Scraping et Tuning

**Date** : 9 Janvier 2026  
**Statut** : Accepté  
**Contexte** : Clarification suite à l'analyse du bug Nona Source  
**Impact** : Architecture Admin Module

---

## Résumé Exécutif

Ce document clarifie l'architecture cible du module Admin et identifie les écarts entre la vision et l'implémentation actuelle. Il sert de référence pour les développements futurs et priorise les correctifs nécessaires.

---

## 1. Vision Architecture Admin

### 1.1 Philosophie

Le module Admin repose sur une séparation claire entre **Discovery** (analyse) et **Scraping** (exécution) :

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PHILOSOPHIE ADMIN                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. DISCOVERY = Comprendre la structure du site                              │
│     ├── Analyser collections, tags, product types                            │
│     ├── Détecter patterns d'extraction (longueur, largeur, etc.)             │
│     ├── Évaluer couverture attributs (fiber, color, dimensions)              │
│     ├── Permettre à l'admin de voir comment les données seront mappées       │
│     └── Affiner manuellement les règles si auto-détection insuffisante       │
│                                                                              │
│  2. SCRAPING = Suivre les règles définies lors du Discovery                  │
│     ├── Appliquer les patterns activés                                       │
│     ├── Utiliser le dictionnaire pour normalisation                          │
│     ├── Remonter erreurs et unknowns                                         │
│     └── Valider que les attributs attendus sont bien populés                 │
│                                                                              │
│  3. TUNING = Améliorer continuellement la qualité                            │
│     ├── Résoudre les unknown_terms                                           │
│     ├── Enrichir le dictionnaire                                             │
│     └── Affiner les patterns d'extraction                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Workflow Cible

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   ADD SITE   │────▶│  DISCOVERY   │────▶│  CONFIGURE   │────▶│   SCRAPING   │
│              │     │              │     │              │     │              │
│ URL + Name   │     │ Auto-analyze │     │ Admin review │     │ Execute      │
│              │     │ structure    │     │ & customize  │     │ with rules   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │                    │                    │
                            ▼                    ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                     │  DÉTECTION   │     │  VALIDATION  │     │   FEEDBACK   │
                     │  PATTERNS    │     │  COUVERTURE  │     │   UNKNOWNS   │
                     │              │     │              │     │              │
                     │ - longueur   │     │ Admin voit:  │     │ - Termes ?   │
                     │ - largeur    │     │ "fiber: 95%" │     │ - Patterns ? │
                     │ - sale_type  │     │ "width: 45%" │     │ - Erreurs    │
                     │ - variants   │     │ "color: 80%" │     │              │
                     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 2. État Actuel vs Vision

### 2.1 Tableau de Comparaison

| Fonctionnalité | Vision | Implémenté | Gap | Priorité |
|---------------|--------|------------|-----|----------|
| **DISCOVERY** |
| Analyse collections | ✅ Liste toutes collections | ✅ Oui | - | - |
| Analyse tags/types | ✅ Stats et fréquences | ✅ Oui | - | - |
| Deadstock Score | ✅ Score qualité source | ✅ Oui | - | - |
| Détection patterns longueur | ✅ Auto-detect regex | ⚠️ Spécifié non implémenté | UI manquante | P2 |
| Détection patterns largeur | ✅ Auto-detect regex | ⚠️ Spécifié non implémenté | UI manquante | P2 |
| Détection sale_type | ✅ fixed/hybrid/cut_to_order | ❌ Non | Logique manquante | P1 |
| Analyse variants | ✅ Comprendre structure | ❌ Non | Critique pour Nona | P1 |
| Preview mapping attributs | ✅ Voir couverture avant scrape | ❌ Non | UI à créer | P2 |
| **CONFIGURE** |
| Sélection collections | ✅ Checkboxes | ✅ Oui | - | - |
| Filtres basiques | ✅ Prix, dispo, images | ✅ Oui | - | - |
| Toggle patterns extraction | ✅ Enable/disable patterns | ❌ Non | UI à créer | P2 |
| Test pattern live | ✅ Tester sur échantillon | ❌ Non | UI à créer | P3 |
| Dashboard couverture | ✅ % par attribut | ❌ Non | UI à créer | P2 |
| **SCRAPING** |
| Fetch produits | ✅ Via Shopify API | ✅ Oui | - | - |
| Sauvegarde raw_data | ✅ Données brutes complètes | ✅ Oui | - | - |
| Normalisation | ✅ Via dictionnaire | ✅ Oui | - | - |
| Extraction premier variant | ⚠️ Devrait analyser TOUS | ❌ Bug | **P0 - Critique** | P0 |
| Calcul available | ✅ any(variants.available) | ❌ Bug | **P0 - Critique** | P0 |
| Calcul price_per_meter | ✅ Selon sale_type | ❌ Bug | **P0 - Critique** | P0 |
| Extraction quantity_value | ✅ Depuis variant.option2 | ❌ Bug | **P0 - Critique** | P0 |
| Remontée unknowns | ✅ Via unknown_terms | ✅ Oui | - | - |
| **TUNING** |
| Liste unknowns | ✅ Avec fréquence | ✅ Oui | - | - |
| Approve/Reject | ✅ Ajouter au dictionnaire | ✅ Oui | - | - |
| Multi-locale | ✅ FR/EN dictionnaires | ✅ Oui (ADR-020) | - | - |

### 2.2 Bugs Critiques Identifiés (P0)

#### Bug #1 : Extraction Variant Nona Source

**Problème** : Le scraper prend le PREMIER variant pour `price_value` et `available`, ignorant les autres.

**Impact** : 79% des textiles Nona Source marqués `available = false` alors qu'ils ont des variants disponibles.

**Cause racine** :
```typescript
// Code actuel (INCORRECT)
const textile = {
  price_value: parseFloat(product.variants[0].price),
  available: product.variants[0].available,
  // ...
};
```

**Solution** :
```typescript
// Code corrigé
const availableVariants = product.variants.filter(v => v.available);
const hasCutting = product.variants.some(v => v.option3 === 'Cutting');

const textile = {
  available: availableVariants.length > 0,
  sale_type: hasCutting ? 'hybrid' : 'fixed_length',
  price_value: hasCutting 
    ? product.variants.find(v => v.option3 === 'Cutting')?.price
    : Math.min(...availableVariants.map(v => parseFloat(v.price))),
  quantity_value: Math.max(...availableVariants.map(v => parseFloat(v.option2) || 0)),
  // ...
};
```

#### Bug #2 : quantity_value non extrait

**Problème** : `quantity_value = 1` (défaut) au lieu de la longueur réelle du coupon.

**Impact** : Impossible de savoir quelle longueur est disponible.

**Solution** : Extraire depuis `variant.option2` pour Nona Source.

#### Bug #3 : price_per_meter non calculé

**Problème** : `price_per_meter = NULL` pour tous les textiles Nona Source.

**Impact** : Comparaison de prix impossible.

**Solution** : 
- `fixed_length` : price_per_meter = price / length
- `hybrid` : price_per_meter = cutting_variant.price (déjà au mètre)

---

## 3. Architecture Cible Détaillée

### 3.1 Discovery Service - Enrichissement Requis

```typescript
// src/features/admin/services/discoveryService.ts

interface DiscoveryResult {
  // Existant ✅
  collections: CollectionAnalysis[];
  globalAnalysis: GlobalAnalysis;
  deadstockScore: DeadstockScore;
  
  // À ajouter ❌
  variantAnalysis: {
    structure: 'single' | 'color_size' | 'color_length' | 'color_length_lot';
    hasOptionCutting: boolean;
    detectedSaleType: 'fixed_length' | 'hybrid' | 'cut_to_order';
    optionMappings: {
      option1: 'color' | 'size' | 'material' | 'unknown';
      option2: 'length' | 'size' | 'quantity' | 'unknown';
      option3: 'lot_reference' | 'cutting' | null;
    };
  };
  
  extractionPatterns: {
    length: PatternMatch[];
    width: PatternMatch[];
    weight: PatternMatch[];
    composition: PatternMatch[];
  };
  
  coveragePreview: {
    fiber: { coverage: number; examples: string[] };
    color: { coverage: number; examples: string[] };
    width: { coverage: number; examples: string[] };
    length: { coverage: number; examples: string[] };
    price_per_meter: { coverage: number; examples: string[] };
  };
}
```

### 3.2 Scraping Service - Corrections Requises

```typescript
// src/features/admin/services/scrapingService.ts

interface ScrapingConfig {
  // Existant ✅
  collections: string[];
  maxProductsPerCollection: number;
  filters: ScrapingFilters;
  sourceLocale: SourceLocale;
  
  // À ajouter ❌
  variantStrategy: {
    saleTypeDetection: 'auto' | 'fixed_length' | 'hybrid' | 'cut_to_order';
    availabilityLogic: 'any_variant' | 'first_variant' | 'specific_option';
    priceStrategy: 'min_available' | 'first_variant' | 'cutting_price';
    quantityExtraction: {
      source: 'option1' | 'option2' | 'option3' | 'title' | 'tags';
      pattern?: string;
    };
  };
  
  extractionPatterns: EnabledPattern[];
}
```

### 3.3 Interface Admin - Pages Manquantes

```
/admin/sites/[id]/configure
├── Tab: Collections (existant ✅)
├── Tab: Extraction (à créer ❌)
│   ├── Variant Structure Analysis
│   ├── Detected Patterns (with toggle)
│   ├── Coverage Preview Dashboard
│   └── Test on Sample button
└── Tab: Quality (à créer ❌)
    ├── Current Unknowns for this site
    ├── Normalization success rate
    └── Re-scrape options
```

---

## 4. Plan de Correction

### Phase 1 : Correction Bug Critique (Immédiat)

**Objectif** : Corriger les 79% de textiles Nona Source mal importés

**Actions** :
1. ✅ Créer migration 026_fix_nona_source_variants.sql
2. ⏳ Exécuter la migration en production
3. ⏳ Vérifier résultats

**Livrables** :
- Column `sale_type` ajoutée à `textiles`
- Fonction `analyze_nona_variants()` créée
- Données Nona Source corrigées

### Phase 2 : Modification Scraper (Court terme - 1 semaine)

**Objectif** : Éviter que le bug se reproduise sur les futurs scrapings

**Actions** :
1. Modifier `scrapingService.ts` pour analyser tous les variants
2. Ajouter détection automatique de `sale_type`
3. Calculer `price_per_meter` selon le type de vente
4. Extraire `quantity_value` depuis les variants

**Fichiers à modifier** :
- `src/features/admin/services/scrapingService.ts`
- `src/features/admin/infrastructure/scrapingRepo.ts`
- `src/features/admin/utils/extractTerms.ts`

### Phase 3 : Interface Discovery Avancée (Moyen terme - 2-3 semaines)

**Objectif** : Permettre à l'admin de voir et configurer l'extraction

**Actions** :
1. Créer onglet "Extraction" dans `/admin/sites/[id]/configure`
2. Afficher analyse des variants avec structure détectée
3. Afficher patterns d'extraction avec toggle enable/disable
4. Créer dashboard de couverture attributs
5. Ajouter bouton "Test on sample"

**Maquette UI** :
```
┌────────────────────────────────────────────────────────────────────┐
│  Nona Source > Configure > Extraction                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  VARIANT STRUCTURE                                    Auto-detect  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Detected: color_length_lot                                    │ │
│  │ • option1 = Color (100%)                                      │ │
│  │ • option2 = Length in meters (100%)                           │ │
│  │ • option3 = Lot reference OR "Cutting" (85%)                  │ │
│  │                                                               │ │
│  │ Sale Type: HYBRID (coupons fixes + coupe à la demande)        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  COVERAGE PREVIEW                                                  │
│  ┌────────────┬────────────┬────────────┬────────────────────────┐ │
│  │ Attribute  │ Coverage   │ Source     │ Sample                 │ │
│  ├────────────┼────────────┼────────────┼────────────────────────┤ │
│  │ fiber      │ ██████ 92% │ tags       │ "silk", "cotton"       │ │
│  │ color      │ █████░ 85% │ option1    │ "Black", "Porcelain"   │ │
│  │ length     │ ███████100%│ option2    │ "1m", "3m", "10m"      │ │
│  │ width      │ ██░░░░ 35% │ body_html  │ "140cm", "150cm"       │ │
│  │ price/m    │ ███████100%│ calculated │ "18€/m", "10€/m"       │ │
│  └────────────┴────────────┴────────────┴────────────────────────┘ │
│                                                                    │
│  [Test on 10 products]                    [Save & Start Scraping]  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5. Décisions Techniques

### D1 : `sale_type` comme colonne sur `textiles`

**Décision** : Ajouter `sale_type ENUM('fixed_length', 'hybrid', 'cut_to_order', 'by_piece')`

**Justification** :
- Clarifie l'interprétation de `quantity_value`
- Permet logique d'affichage différenciée côté frontend
- Facilite les comparaisons de prix

### D2 : Analyse variants au niveau Discovery ET Scraping

**Décision** : La détection de structure variant se fait en Discovery, mais le Scraping re-vérifie par sécurité.

**Justification** :
- Discovery peut être ancien (données changées depuis)
- Permet override manuel de la stratégie
- Robustesse accrue

### D3 : `price_per_meter` calculé, pas stocké brut

**Décision** : `price_per_meter` est calculé lors du scraping selon le `sale_type`.

**Calcul** :
```
fixed_length  → price_per_meter = price_value / quantity_value
hybrid        → price_per_meter = cutting_variant.price (déjà au mètre)
cut_to_order  → price_per_meter = price_value (déjà au mètre)
by_piece      → price_per_meter = NULL (non applicable)
```

---

## 6. Conséquences

### Positives

1. ✅ Données Nona Source correctes (79% → ~10% unavailable)
2. ✅ Clarté sur le modèle de vente de chaque textile
3. ✅ Comparaison de prix fiable via `price_per_meter`
4. ✅ Admin comprend la structure avant scraping
5. ✅ Réduction erreurs futurs via preview couverture

### Négatives

1. ⚠️ Complexité accrue du scraping (analyse multi-variants)
2. ⚠️ Interface admin plus complexe à développer
3. ⚠️ Besoin de re-scraper les sources existantes après fix

### Risques

1. 🔴 Autres sources peuvent avoir des structures variants différentes
2. 🟡 Performance si trop de variants à analyser
3. 🟡 Maintenance des patterns d'extraction par source

---

## 7. Références

- ADR-008 : Intelligent Data Extraction
- ADR-011 : Admin-Driven Scraping Strategy
- ADR-020 : Source Locale Configuration
- ADR-021 : Extraction Patterns System
- ADR-024 : Textile Standard System
- SPEC_ADMIN_DATA_TUNING_COMPLETE.md
- SESSION_9_SCRAPING_PIPELINE_COMPLETE.md

---

## 8. Historique

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-09 | Création ADR suite analyse bug Nona Source | Thomas |
| 2026-01-09 | Migration 026 créée pour fix données | Thomas |

---

**Status** : Accepté  
**Prochaine action** : Exécuter migration 026, puis modifier scrapingService.ts
