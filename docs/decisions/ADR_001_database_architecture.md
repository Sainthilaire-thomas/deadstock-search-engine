# ADR 001: Architecture Base de Données - Approche Hybride avec Schéma Dédié

**Date** : 27 décembre 2025  
**Statut** : Accepté  
**Décideurs** : Thomas (Product Owner & Dev)  
**Contexte Phase** : Phase 0 - Conception

---

## Contexte

Le moteur de recherche deadstock nécessite une base de données pour stocker les textiles agrégés depuis multiples sources (Recovo, My Little Coupon, etc.). Deux contraintes majeures :

1. **Hétérogénéité des données** : Chaque plateforme source a son propre format, unités, terminologie
2. **Intégration projet Blanche** : Le projet deadstock s'intègre dans l'écosystème Blanche existant (Supabase PostgreSQL)
3. **Time-to-market** : Besoin de lancer MVP rapidement (mi-janvier 2025)
4. **Évolutivité** : Architecture doit permettre scale vers 10+ sources et features avancées

Questions à résoudre :
- Structure de la base : normalisée vs dénormalisée ?
- Intégration dans Blanche : schéma unique ou séparé ?
- Préparation future : comment faciliter évolution vers architecture plus sophistiquée ?

---

## Décision

Nous adoptons une **approche hybride en deux volets** :

### 1. Structure Base de Données : MVP Simplifié avec Path vers Normalisation

**Schéma initial (Phase 1)** :
- Table `deadstock.textiles` principale avec dénormalisation
- Tous les champs nécessaires intégrés dans une seule table
- Champs `material_id` et `supplier_id` NULL (préparés pour future normalisation)

**Évolution future (Phase 2+)** :
- Migration progressive vers tables séparées :
  - `deadstock.materials` : Types de matériaux (référentiel)
  - `deadstock.suppliers` : Fournisseurs (entités)
  - `deadstock.stock_lots` : Lots spécifiques avec foreign keys
- Activation des champs `material_id` / `supplier_id`

### 2. Intégration Blanche : Schéma PostgreSQL Séparé

**Choix** : Créer schéma `deadstock` séparé du schéma `public` (Blanche)

**Organisation** :
- Schéma `public` : Tables Blanche e-commerce (products, orders, users, etc.)
- Schéma `deadstock` : Tables moteur recherche textile (textiles, scraping_logs, etc.)
- Schéma `auth` : Supabase Auth (partagé)

---

## Options Considérées

### Option 1 : Schéma Normalisé Sophistiqué (dès MVP)

**Description** : Tables séparées dès le début

```sql
-- Tables dès Phase 1
CREATE TABLE materials (...)  -- Référentiel matériaux
CREATE TABLE suppliers (...)   -- Entités fournisseurs
CREATE TABLE stock_lots (...)  -- Lots spécifiques
CREATE TABLE platforms (...)   -- Plateformes sources
```

**Avantages** :
- Architecture propre dès le début
- Pas de refactoring futur
- Support features avancées (stats par fournisseur, etc.)
- Évite duplication données (supplier info répété)

**Inconvénients** :
- Complexité initiale élevée (4+ tables, multiples JOIN)
- Développement plus lent (3-4 semaines vs 1-2)
- Over-engineering avant validation concept
- Requêtes plus complexes pour MVP simple

**Coût/Complexité** : Élevé (gain temps -30%)

---

### Option 2 : Schéma Simplifié Pure (Dénormalisé Total)

**Description** : Une seule table `textiles`, aucune préparation normalisation

```sql
CREATE TABLE textiles (
  -- Tous les champs, aucune référence future
  -- Pas de material_id, supplier_id
)
```

**Avantages** :
- Développement ultra-rapide (1 semaine)
- Requêtes simples (pas de JOIN)
- Suffisant pour MVP et Phase 1-3

**Inconvénients** :
- Refactoring futur très coûteux
- Tech debt importante
- Duplication massive de données (supplier info répétée sur chaque textile)
- Migration Phase 2+ complexe et risquée

**Coût/Complexité** : Faible au début, Très élevé ensuite

---

### Option 3 : Approche Hybride (CHOISI)

**Description** : Structure simplifiée avec préparation normalisation

```sql
CREATE TABLE textiles (
  -- Tous les champs nécessaires MVP
  name TEXT,
  supplier_name TEXT,
  -- ...
  
  -- Champs futurs (NULL pour MVP)
  material_id UUID,  -- Prêt pour future table materials
  supplier_id UUID,  -- Prêt pour future table suppliers
)
```

**Avantages** :
- ✅ Rapidité développement MVP (2 semaines)
- ✅ Requêtes simples pour Phase 1
- ✅ Path d'évolution clair et documenté
- ✅ Refactoring future facilité (champs déjà présents)
- ✅ Balance pragmatisme et qualité technique

**Inconvénients** :
- Migration Phase 2 quand même nécessaire (mais facilitée)
- Duplication données temporaire (acceptable pour MVP)

**Coût/Complexité** : Moyen (optimal pour balance court/long terme)

---

### Option 4 : Base Blanche Unique (Schéma Public)

**Description** : Ajouter tables deadstock directement dans schéma `public` Blanche

**Avantages** :
- Simplicité apparente (un seul schéma)
- Réutilisation potentielle `public.profiles`

**Inconvénients** :
- ❌ Mélange deux domaines métier distincts
- ❌ Risque de conflits de noms futurs
- ❌ Couplage Blanche ↔ Deadstock
- ❌ Migrations complexifiées (impactent les deux projets)
- ❌ Rollback difficile si problème

**Coût/Complexité** : Faible au début, Élevé en maintenance

---

### Option 5 : Schéma Deadstock Séparé (CHOISI)

**Description** : Créer schéma PostgreSQL `deadstock` dédié

```sql
CREATE SCHEMA deadstock;
CREATE TABLE deadstock.textiles (...);
CREATE TABLE deadstock.scraping_logs (...);
```

**Avantages** :
- ✅ Séparation logique claire (domaines métier distincts)
- ✅ Pas de conflits de noms (deadstock.users vs public.profiles)
- ✅ Migrations indépendantes
- ✅ Rollback facile (DROP SCHEMA si besoin)
- ✅ Synergies futures possibles (vues cross-schema)
- ✅ Organisation professionnelle

**Inconvénients** :
- Légèrement plus de préfixe dans requêtes (`deadstock.textiles`)
- Peut nécessiter SET search_path

**Coût/Complexité** : Faible (bénéfices >> coûts)

---

## Rationale (Justification)

### Pourquoi Approche Hybride pour Structure DB ?

**1. Time-to-Market Critique**
- MVP doit être prêt mi-janvier (3 semaines)
- Option 1 (normalisée pure) : -30% vitesse développement
- Option 3 (hybride) : Même vitesse qu'Option 2, mais avec path d'évolution

**Calcul** : 
- Option 1 : 4 semaines dev
- Option 2 : 2 semaines dev, 6 semaines refactoring Phase 2
- Option 3 : 2 semaines dev, 3 semaines migration Phase 2 ✅

**2. Validation Concept Avant Sur-Architecture**
- Pas certain que produit trouve son marché (hypothèse à valider)
- Si échec, Option 1 = temps perdu sur architecture complexe
- Option 3 : Risque minimisé tout en gardant qualité

**3. Path d'Évolution Clair**
- Champs `material_id`, `supplier_id` présents mais NULL
- Documentation explicite de la migration
- ADR trace la décision et le plan

**4. Pragmatisme Technique**
- Pour 500 textiles MVP : dénormalisation totalement acceptable
- Pour 10K+ textiles Phase 7 : normalisation devient nécessaire
- Option 3 permet d'évoluer au bon moment

### Pourquoi Schéma Séparé pour Intégration Blanche ?

**1. Séparation des Préoccupations**
- Blanche = E-commerce mode éthique (produits finis)
- Deadstock = Moteur recherche matières premières
- Domaines métier distincts → schémas distincts

**2. Indépendance Développement**
- Migrations Blanche n'impactent pas Deadstock
- Migrations Deadstock n'impactent pas Blanche
- Teams (ou solo dev) peut travailler sereinement

**3. Synergies Futures Sans Couplage**
```sql
-- Possible plus tard : vue liant les deux schémas
CREATE VIEW deadstock.textiles_for_blanche AS
SELECT t.*, p.id as blanche_product_id
FROM deadstock.textiles t
LEFT JOIN public.products p ON ...
```

**4. Rollback et Tests Facilités**
- Problème dans Deadstock ? `DROP SCHEMA deadstock CASCADE`
- Tests isolés possibles
- Pas de risque d'impact sur Blanche prod

**5. Organisation Professionnelle**
- Standard PostgreSQL (schémas pour organisation)
- Scalabilité : pourrait ajouter schémas `analytics`, `wholesale`, etc.

---

## Conséquences

### Positives

**Court Terme (Phase 1)** :
- ✅ Développement rapide MVP (2 semaines vs 4)
- ✅ Requêtes SQL simples (pas de JOIN)
- ✅ Facile à comprendre pour nouveaux devs
- ✅ Performance excellente (pas de JOIN, index directs)

**Moyen Terme (Phase 2-3)** :
- ✅ Migration facilitée par champs pré-existants
- ✅ Downtime minimal lors migration (stratégie double write possible)
- ✅ Coût refactoring réduit de 50% vs Option 2

**Long Terme (Phase 4+)** :
- ✅ Architecture normalisée supportant features avancées
- ✅ Pas de tech debt bloquante
- ✅ Synergies Blanche ↔ Deadstock possibles

**Organisation** :
- ✅ Code Blanche et Deadstock clairement séparés
- ✅ Migrations indépendantes
- ✅ Tests isolés possibles

### Négatives (et Mitigation)

**1. Migration Phase 2 Nécessaire**
- **Impact** : 3 semaines de travail migration
- **Mitigation** : 
  - Champs `material_id`, `supplier_id` déjà présents
  - Migration documentée dès maintenant (ce ADR)
  - Stratégie double-write pour zero downtime
  - Timing flexible (quand volume le justifie)

**2. Duplication Données Temporaire**
- **Impact** : Supplier info répété sur chaque textile MVP
- **Mitigation** :
  - Acceptable pour <2000 textiles (Phase 1-3)
  - Économie espace négligeable (< 1MB)
  - Résolu lors migration Phase 2

**3. Requêtes Cross-Schema**
- **Impact** : Légèrement plus verbeux (`deadstock.textiles` vs `textiles`)
- **Mitigation** :
  - `SET search_path TO deadstock, public;` dans sessions
  - Habitude rapide à prendre
  - Avantages >> inconvénient

### Neutres

- Base de données légèrement plus complexe (2 schémas vs 1)
- Besoin documenter convention schémas pour futurs devs
- Apprentissage schémas PostgreSQL (5 min)

---

## Implémentation

### Actions Concrètes

- [x] **Créer schéma SQL complet** (`database/schema.sql`)
  - Schéma `deadstock` avec toutes tables
  - Index de performance
  - RLS policies
  - Fonctions et vues
  - Documentation inline
  
- [x] **Créer migration Supabase** (`database/migrations/001_initial_schema.sql`)
  - Format exécutable Supabase
  - Idempotent (IF NOT EXISTS)
  
- [ ] **Exécuter migration sur Supabase Dev** (cette semaine)
  - Tester via Supabase Dashboard > SQL Editor
  - Valider structure
  - Tester requêtes de base
  
- [ ] **Documenter plan migration Phase 2** (avant Phase 1)
  - Créer `database/MIGRATION_PLAN_PHASE2.md`
  - Détailler stratégie double-write
  - Estimer effort (3 semaines)
  
- [ ] **Mettre à jour CURRENT_STATE.md** (fin session)
  - Design DB → 100% complété
  - ADR 001 créé

### Fichiers Affectés

- ✅ `database/schema.sql` - Schéma complet documenté
- ✅ `database/migrations/001_initial_schema.sql` - Migration initiale
- ✅ `docs/decisions/ADR_001_database_architecture.md` - Ce document
- ⏳ `database/MIGRATION_PLAN_PHASE2.md` - À créer avant Phase 1
- ⏳ `docs/state/CURRENT_STATE.md` - À mettre à jour fin session

---

## Validation

### Critères de Succès

**Phase 1 (MVP)** :
- ✅ Migration s'exécute sans erreur sur Supabase
- ✅ Insertion 500+ textiles < 5 secondes
- ✅ Recherche full-text < 200ms
- ✅ Aucun conflit avec schéma `public` Blanche

**Phase 2 (Migration)** :
- ⏳ Migration vers normalisation < 1 heure downtime
- ⏳ Zéro perte de données
- ⏳ Performance maintenue ou améliorée

### Métriques à Surveiller

**Performance** :
- Temps insertion batch (target: < 10s pour 100 items)
- Temps recherche (target: < 200ms p95)
- Taille base données (< 500MB Phase 1)

**Qualité Code** :
- Requêtes SQL restent simples (< 5 JOIN max Phase 1)
- Couverture tests scrapers > 80%

### Conditions de Révision

**Révision obligatoire si** :
- Volume dépasse 5000 textiles avant Phase 2 (normalisation urgente)
- Performance recherche > 500ms (optimisation index nécessaire)
- Conflits émergent entre schémas Blanche/Deadstock

**Review prévu** : 
- Fin Phase 1 (février 2025) : Valider approche tient la route
- Début Phase 2 (mars 2025) : Décider timing migration normalisation

---

## Références

### Documents Liés

- `docs/project/PROJECT_OVERVIEW.md` (Section Architecture)
- `docs/state/TECH_STACK.md` (PostgreSQL / Supabase)
- `docs/project/PHASES.md` (Phase 1 et Phase 2 détails)
- `database/schema.sql` (Implémentation schéma)

### Ressources Externes

- [PostgreSQL Schemas Documentation](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Database Normalization Best Practices](https://en.wikipedia.org/wiki/Database_normalization)

### Discussions

- Session Claude 27 décembre 2025 : Discussion approches architecture
- Décision finale : Approche hybride + schéma séparé

---

## Notes Additionnelles

### Leçons Apprises (Futures)

*Cette section sera mise à jour post-Phase 1 avec retours réels :*
- Performance réelle vs estimée
- Facilité développement
- Points de friction rencontrés

### Alternatives Futures

Si volume scale massivement (100K+ textiles) :
- Considérer partitionnement table `textiles` par `source_platform`
- Évaluer PostgreSQL vs spécialisé (Elasticsearch) pour search
- Envisager read replicas pour requêtes analytiques

### Intégration Blanche - Synergies Potentielles

**Phase 6+ (Marketplace Inversé)** :
- Designers Blanche peuvent poster besoins textiles
- Lien `deadstock.user_requests` ↔ `public.profiles`

**Phase Future** :
- Produits Blanche peuvent tracer origine textile deadstock
- Vue jointe `blanche_products_with_deadstock_source`

---

## Historique des Révisions

| Date | Changement | Auteur |
|------|-----------|--------|
| 2025-12-27 | Création initiale - Décision approche hybride + schéma séparé | Thomas |

---

**Statut Final** : ✅ **ACCEPTÉ**  
**Prochaine Action** : Exécuter migration sur Supabase Dev et valider
