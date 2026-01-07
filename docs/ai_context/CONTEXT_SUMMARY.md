# Context Summary - Deadstock Search Engine

**Dernière mise à jour:** 7 Janvier 2026 (Session 18)

---

## 🎯 Vision Produit

**Deadstock** est un moteur de recherche textile B2B qui agrège les inventaires de tissus deadstock de multiples fournisseurs pour aider les designers indépendants à trouver des matériaux durables.

### Proposition de Valeur

* **Agrégation multi-sources** : Un seul endroit pour chercher
* **Normalisation intelligente** : Données standardisées (EN)
* **Outils créatifs** : Boards, calcul métrage, projets
* **Durabilité** : Focus deadstock = économie circulaire

### Marché Cible

* Designers textiles indépendants
* Créateurs DIY couture (1.25 Mrd€)
* Couturières professionnelles (40K entreprises)
* Tapissiers/décorateurs

---

## 🏗️ Architecture Technique

### Stack

```
Frontend: Next.js 15 + React 19 + TypeScript + Tailwind + shadcn/ui
Backend: Supabase (PostgreSQL) + Server Actions + RLS
Deploy: Vercel
```

### Pattern Architecture

* **Light DDD** : Séparation domain/infrastructure/application
* **Feature-based** : Un dossier par module fonctionnel
* **Server Actions** : Mutations via Next.js
* **Optimistic Updates** : UX fluide (favoris, boards)

### Architecture Données (ADR-024)

```
┌─────────────────────────────────────────────────────────────────┐
│                     STANDARD DEADSTOCK                          │
│                   (attribute_categories)                        │
│  fiber ⭐ │ color ⭐ │ pattern │ weave │ [extensible...]        │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                   DICTIONNAIRE                                  │
│                (dictionary_mappings)                            │
│  "soie" (fr) → "silk" (fiber)                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│              TEXTILES + ATTRIBUTES                              │
│  textiles (données fixes)     │  textile_attributes (classif.) │
│  • prix, dimensions           │  • fiber: silk                 │
│  • disponibilité              │  • color: red                  │
│  • source                     │  • pattern: solid              │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                   VUE MATÉRIALISÉE                              │
│                    (textiles_search)                            │
│  Performance: 2.8ms │ Scalable 1M+ │ Refresh nuit              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 État des Données

### Sources Actives

| Source           | Locale | Textiles | Qualité |
| ---------------- | ------ | -------- | -------- |
| My Little Coupon | FR     | ~100     | 98%      |
| The Fabric Sales | EN     | ~60      | 90%      |

### Normalisation

* **256 termes** dans le dictionnaire (181 EN, 75 FR)
* **4 catégories** : fiber, color, pattern, weave
* **<10 unknowns** restants

### Nouvelle Architecture

* `textile_attributes` : 293 rows (peuplé ✅)
* `textiles_search` : Vue matérialisée (créée ✅)
* Performance : 2.8ms par requête

---

## 🔧 Modules Fonctionnels

### Utilisateur

| Module                    | Fonction                        |
| ------------------------- | ------------------------------- |
| **Search**          | Recherche textiles avec filtres |
| **Favorites**       | Sauvegarde sélection           |
| **Boards**          | Organisation visuelle projets   |
| **Crystallization** | Board → Projet concret         |
| **Pattern Import**  | Upload PDF, calcul métrage     |

### Admin

| Module              | Fonction                       |
| ------------------- | ------------------------------ |
| **Sites**     | Gestion sources à scraper     |
| **Discovery** | Analyse automatique sites      |
| **Scraping**  | Lancement jobs extraction      |
| **Tuning**    | Gestion dictionnaire, unknowns |

---

## 🎯 Flux Utilisateur Principal

```
1. RECHERCHE
   Rechercher textiles → Filtrer → Voir résultats

2. SÉLECTION
   Ajouter favoris → Organiser sur Board

3. PROJET
   Créer zones → Cristalliser → Projet concret

4. RÉALISATION
   Calcul métrage → Liste courses → Achat
```

---

## 📋 Conventions Code

### Nommage

* **Fichiers** : kebab-case (`textile-repository.ts`)
* **Components** : PascalCase (`TextileCard.tsx`)
* **Functions** : camelCase (`getAvailableFilters`)
* **DB columns** : snake_case (`material_type`)

### Structure Feature

```
features/[name]/
├── domain/types.ts
├── infrastructure/[name]Repository.ts
├── application/[action].ts
├── components/[Component].tsx
└── context/[Name]Context.tsx
```

### Imports

```typescript
// Ordre: React → Next → Libs → Local → Types
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TextileCard } from './TextileCard';
import type { Textile } from '../domain/types';
```

---

## 🗺️ Roadmap

### MVP Phase 1 (90% ✅)

* ✅ Recherche avec filtres
* ✅ Favoris
* ✅ Boards
* ✅ Admin complet
* 🔄 Architecture données optimisée
* 🔲 Authentification

### Phase 2 (Prévue)

* API publique
* Multi-utilisateurs
* Alertes nouveaux textiles
* Historique prix

### Phase 3 (Vision)

* Marketplace accessoires
* Groupage commandes
* CO2 tracking
* Intégrations (Figma, Adobe)

---

## 📝 Sessions Récentes

| Session      | Focus                             | Résultat                                |
| ------------ | --------------------------------- | ---------------------------------------- |
| 17           | Extraction Patterns               | ✅ ADR-021, détection auto patterns     |
| **18** | **Textile Standard System** | **✅ ADR-024, vue matérialisée** |
| 19           | (À venir)                        | Connecter API à vue                     |

---

## 🔑 Points Clés pour IA

1. **Architecture EAV + Vue Mat.** : `textile_attributes` (flexible) → `textiles_search` (performant)
2. **Dual-level tuning** : Dictionnaire (global) + Patterns (par site)
3. **Standard extensible** : `attribute_categories` avec `is_searchable`
4. **Session-based** : Pas d'auth pour MVP, cookie session_id
5. **Refresh nocturne** : Vue rafraîchie après scraping, 0 impact utilisateur

---

## 📚 Documentation Clé

* `ADR_024_TEXTILE_STANDARD_SYSTEM.md` - Architecture données
* `SPEC_BOARD_MODULE.md` - Spécification boards
* `DATABASE_ARCHITECTURE.md` - Schéma complet
* `TUNING_SYSTEM.md` - Système normalisation

---

**Contact:** Thomas (Founder & Developer)
