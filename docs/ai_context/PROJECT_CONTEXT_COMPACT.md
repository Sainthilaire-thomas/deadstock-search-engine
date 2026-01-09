# Deadstock Search Engine - Context Compact

**Version** : 1.0 | **Date** : 9 Janvier 2026 | **Session** : 21

---

## 🎯 Projet en Bref

**Plateforme B2B SaaS** agrégant les inventaires de tissus deadstock de multiples fournisseurs dans une interface de recherche unifiée pour créateurs de mode indépendants.

| Métrique | Valeur |
|----------|--------|
| MVP Phase 1 | ~92% complet |
| Textiles en base | 268 |
| Sources actives | 4 (MLC, Nona, TFS, Recovo) |
| Performance recherche | 2.8ms |

---

## 🏗️ Architecture

### Stack
- **Frontend** : Next.js 16, React 19, TypeScript, Tailwind
- **Backend** : Supabase PostgreSQL (schema `deadstock`)
- **Pattern** : Light DDD avec feature modules

### Structure Modules
```
src/features/
├── admin/          # Discovery, Scraping, Tuning
├── search/         # Recherche textiles  
├── favorites/      # Gestion favoris
├── boards/         # Canvas de travail
├── normalization/  # Pipeline normalisation
└── tuning/         # Gestion dictionnaire
```

---

## 📊 Base de Données - Tables Clés

### Tables Principales
| Table | Description | Rows |
|-------|-------------|------|
| `textiles` | Produits scrapés avec données fixes | 268 |
| `textile_attributes` | Attributs EAV (fiber, color, pattern) | ~500 |
| `dictionary_mappings` | Traductions/normalisation FR/EN | 256 |
| `sites` | Sources configurées | 4 |
| `site_profiles` | Résultats discovery | 4 |
| `textiles_search` | Vue matérialisée (recherche) | 268 |

### Colonnes `textiles` Importantes
```sql
-- Identité
name, description, image_url, source_url

-- Dimensions
width_value, weight_value, quantity_value

-- Commercial
price_value, price_per_meter, minimum_order_value
sale_type ENUM('fixed_length', 'hybrid', 'cut_to_order', 'by_piece')
available BOOLEAN

-- Classification (legacy → migrer vers textile_attributes)
material_type, color, pattern
```

### Architecture EAV
```
textiles (données fixes)     textile_attributes (classification)
─────────────────────────    ──────────────────────────────────
• name, price_value          • fiber: silk
• width_value, sale_type     • color: red  
• quantity_value             • pattern: solid
                             • weave: crepe
        ↓ JOIN
textiles_search (vue matérialisée optimisée)
```

---

## 🔄 Pipeline de Données

```
DISCOVERY → CONFIGURE → SCRAPING → SEARCH
     │           │           │          │
 Analyse     Admin       Fetch +    Materialized
 structure   review     Normalize   view + Filters
```

### Sale Types (Modèles de vente)
| Type | Description | quantity_value | price_per_meter |
|------|-------------|----------------|-----------------|
| `fixed_length` | Coupons fixes (MLC, Nona) | Longueur en m | price / quantity |
| `hybrid` | Coupons + coupe (Nona) | Longueur max | cutting variant price |
| `cut_to_order` | Vente au mètre (TFS) | Stock ou NULL | price_value |
| `by_piece` | Vente à la pièce | Nombre pièces | NULL |

### Variant Analysis (Nona Source)
- `option1` = Color
- `option2` = Length (meters)  
- `option3` = Lot reference OR "Cutting"
- Si "Cutting" présent → `sale_type = hybrid`

---

## 📁 Fichiers Clés par Module

### Admin - Scraping Pipeline
```
src/features/admin/
├── services/scrapingService.ts      # Orchestration
├── infrastructure/scrapingRepo.ts   # Persistence + normalisation
├── utils/variantAnalyzer.ts         # Analyse intelligente variants
└── utils/extractTerms.ts            # Extraction termes depuis tags
```

### Normalisation
```
src/features/normalization/
├── application/normalizeTextile.ts           # Entry point
└── infrastructure/normalizationService.ts    # Dictionary lookup
```

### Search
```
src/features/search/
└── infrastructure/textileRepository.ts    # Queries sur textiles_search
```

### Favorites & Boards
```
src/features/favorites/contexts/FavoritesContext.tsx  # État global favoris
src/features/boards/components/BoardCanvas.tsx        # Canvas drag-drop
```

---

## 🎛️ Modules - État

| Module | Complétion | Notes |
|--------|------------|-------|
| Search | 100% | Filtres dynamiques via textiles_search |
| Favorites | 100% | Sync instantanée, optimistic updates |
| Boards | 95% | Canvas + cristallisation fonctionnels |
| Admin - Sites & Discovery | 95% | Deadstock Score, patterns detection |
| Admin - Scraping | 95% | Variant analysis intelligent (ADR-025) |
| Admin - Tuning | 90% | Multi-locale dictionaries FR/EN |
| Admin - Discovery UI Avancée | 30% | Toggle patterns, coverage à créer |

---

## ⚠️ Points d'Attention Actuels

### Ce qui fonctionne ✅
- Scraping avec `variantAnalyzer.ts` analyse tous les variants
- `sale_type` détecté au scraping (fixed_length, hybrid, cut_to_order)
- `price_per_meter` calculé selon sale_type
- `quantity_value` extrait depuis variants
- 100% textiles disponibles (bug 79% unavailable corrigé)

### Ce qui manque ❌
1. **Détection `sale_type` au Discovery** (pas seulement au Scraping)
2. **Affichage produits hybrid** (montrer les 2 options de prix)
3. **Interface Discovery avancée** (toggle patterns, coverage dashboard)

---

## 🔧 Patterns de Code

### Appel Repository
```typescript
const textiles = await textileRepository.search({
  filters: { fiber: ['silk'], color: ['red'] },
  pagination: { page: 1, limit: 20 }
});
```

### Normalisation
```typescript
const normalized = await normalizeTextile(rawProduct, {
  sourceLocale: 'en',
  siteId: 'nona-source'
});
```

### Variant Analysis
```typescript
import { analyzeVariants } from '@/features/admin/utils/variantAnalyzer';

const analysis = analyzeVariants(product.variants);
// { available: true, saleType: 'hybrid', pricePerMeter: 18, quantityValue: 2.5 }
```

---

## 📚 ADRs Actifs (à consulter si besoin)

| ADR | Sujet | Quand le lire |
|-----|-------|---------------|
| ADR-024 | Textile Standard System (EAV + Materialized View) | Architecture données |
| ADR-025 | Admin Architecture Clarification (Variant Analysis) | Pipeline scraping |
| ADR-020 | Source Locale Configuration | Multi-langue |

---

## 🚀 Prochaines Étapes

### Immédiat (Session 21)
1. ✅ Consolider documentation (ce document)
2. 🔲 ADR-026 : Sale Type Discovery + Hybrid Display
3. 🔲 Implémenter détection sale_type au Discovery

### Court Terme (Sessions 22-23)
- Interface Discovery avancée (toggle patterns, coverage)
- Affichage sale_type et prix dans cards textiles
- Scraping à plus grande échelle

### Moyen Terme
- Filtres dynamiques complets (sale_type, price range)
- Admin Quality Dashboard
- Authentification utilisateurs

---

## 📝 Glossaire Rapide

| Terme | Définition |
|-------|------------|
| **Deadstock** | Tissus invendus, fins de série, chutes réutilisables |
| **EAV** | Entity-Attribute-Value, pattern flexible pour attributs dynamiques |
| **Discovery** | Analyse automatique structure d'un site avant scraping |
| **Hybrid** | Produit vendu en coupons fixes ET à la coupe |
| **Materialized View** | Vue pré-calculée pour performance recherche |
| **Normalisation** | Conversion termes sources → standard Deadstock |

---

*Ce document remplace : CONTEXT_SUMMARY.md, DATABASE_ARCHITECTURE.md, PROJECT_OVERVIEW.md, PRODUCT_VISION.md, PHASES_V2.md et les sessions notes archivées.*
