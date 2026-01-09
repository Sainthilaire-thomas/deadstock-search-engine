
# Next Steps - Deadstock Search Engine

**Dernière mise à jour** : 9 Janvier 2026

**Après Session** : 20

---

## 🎯 Priorité Immédiate (Session 21)

### 1. Consolidation Documentation (CRITIQUE)

**Problème** : La documentation projet occupe 22% du context window, limitant l'espace pour le code et les conversations.

**Action** : Créer un document unique `PROJECT_CONTEXT_COMPACT.md` (~20KB max) qui consolide :

* Architecture essentielle
* Tables DB actuelles (pas l'historique)
* Fichiers clés par module
* Patterns de code utilisés
* État actuel simplifié

**Documents à archiver** (ne plus charger systématiquement) :

* ADR_001 à ADR_023 (décisions historiques, consultables si besoin)
* SESSION_7 à SESSION_19 (historique, archivé)
* SPEC_* anciens (remplacés par implémentation)
* ARCHITECTURE_UX_BOARD_REALISATION.md (83K!)
* SPEC_ADMIN_DATA_TUNING_COMPLETE.md (83K!)

**Documents à conserver actifs** :

* `PROJECT_CONTEXT_COMPACT.md` (nouveau, consolidé)
* `CURRENT_STATE.md` (état actuel)
* `NEXT_STEPS.md` (roadmap)
* `ADR_024_TEXTILE_STANDARD_SYSTEM.md` (architecture actuelle)
* `ADR_025_ADMIN_ARCHITECTURE_CLARIFICATION.md` (récent, variant analysis)
* `GLOSSAIRE.md` (référence termes)

---

## 📋 Backlog Priorisé

### P1 - Court Terme (Sessions 21-22)

#### 1.1 Documentation Consolidée

* [ ] Créer `PROJECT_CONTEXT_COMPACT.md`
* [ ] Archiver documents obsolètes
* [ ] Tester que Claude peut travailler efficacement avec contexte réduit

#### 1.2 Interface Discovery Avancée

* [ ] Onglet "Extraction" dans `/admin/sites/[id]/configure`
* [ ] Toggle enable/disable patterns
* [ ] Dashboard couverture attributs (% fiber, color, width, etc.)
* [ ] Bouton "Test on 10 products"

#### 1.3 Scraping Scale

* [ ] Scraper plus de produits Nona Source (2500+ disponibles)
* [ ] Scraper plus de produits MLC (11000+ disponibles)
* [ ] Monitorer qualité données

### P2 - Moyen Terme (Sessions 23-25)

#### 2.1 Search UX Improvements

* [ ] Afficher `sale_type` dans les cards textiles
* [ ] Afficher `price_per_meter` formaté
* [ ] Afficher `quantity_value` avec unité
* [ ] Indicateur visuel disponibilité

#### 2.2 Filtres Dynamiques Complets

* [ ] Filtre par `sale_type`
* [ ] Filtre par `price_per_meter` range
* [ ] Filtre par `quantity_value` min

#### 2.3 Admin Quality Dashboard

* [ ] Métriques globales (textiles, coverage, unknowns)
* [ ] Qualité par source
* [ ] Alertes si qualité dégradée

### P3 - Long Terme (Phase 2)

* [ ] Authentification utilisateurs
* [ ] Subscriptions / Pricing
* [ ] API pour partenaires
* [ ] Nouvelles sources (Recovo complet, Queen of Raw, etc.)

---

## 🔧 Tâches Techniques en Attente

### Database

* [ ] Index sur `textiles.sale_type` si recherche fréquente
* [ ] Cleanup colonnes legacy si plus utilisées

### Code

* [ ] Tests unitaires `variantAnalyzer.ts`
* [ ] Tests E2E scraping pipeline

### DevOps

* [ ] Monitoring Supabase (usage, performance)
* [ ] Alertes si scraping échoue

---

## 📝 Notes pour Prochaine Session

### Contexte Minimal à Charger

Pour la session 21, charger uniquement :

1. `PROJECT_CONTEXT_COMPACT.md` (à créer)
2. `CURRENT_STATE.md`
3. `NEXT_STEPS.md`
4. `GLOSSAIRE.md` (si besoin termes métier)

### Questions Ouvertes

1. Faut-il détecter automatiquement le `sale_type` lors du Discovery (pas seulement Scraping) ?
2. Comment gérer les produits "hybrid" dans l'affichage (2 prix possibles) ?
3. Prioriser MLC ou Nona Source pour le prochain gros scraping ?

---

## ✅ Accompli Session 20

* [X] Analyse bug Nona Source (79% unavailable)
* [X] Migration 026 - fix données existantes avec `analyze_nona_variants()`
* [X] ADR-025 - documentation écart vision/implémentation
* [X] `variantAnalyzer.ts` - analyse intelligente variants
* [X] Modification `scrapingRepo.ts` pour utiliser analyzer
* [X] Test scraping 10 produits Nona Source
* [X] Vérification données corrigées (100% available)
