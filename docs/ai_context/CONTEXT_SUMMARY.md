
# 🧠 CONTEXT SUMMARY - Deadstock Search Engine

**Dernière MAJ** : 1 Janvier 2026

**Auteur** : Thomas

**Projet** : Plateforme deadstock textile pour designers

---

## 🎯 Vision du Projet

**Mission** : Devenir la plateforme centrale pour designers textiles, accompagnant tout le parcours de l'idée à la réalisation en deadstock.

**Problème Résolu** :

* Designers perdent 3-4h à chercher sur 10+ sites différents
* Terminologies hétérogènes (FR/EN/ES)
* Impossible de comparer prix/qualités
* Calculs métrage manuels avec risque d'erreurs

**Solution** :

* Recherche unifiée multi-sources
* Normalisation automatique des données
* Outils design intégrés (calculateur, mood boards)
* Parcours complet : Idée → Impact

---

## 👤 Utilisateurs Cibles

### Primaire : Designers Indépendants

* Créateurs mode, petites marques éthiques
* Besoin : Sourcing rapide, outils pratiques
* Usage : Projets petite échelle, recherche ponctuelle

### Secondaire : Studios & Marques

* Marques établies, studios design
* Besoin : Collaboration équipe, workflow pro
* Usage : Projets multiples, volumes moyens

### Tertiaire : Écoles & Étudiants

* Apprentissage, budget limité
* Besoin : Outils pédagogiques
* Usage : Projets académiques

---

## 🏗️ Architecture Technique

### Stack

* **Frontend** : Next.js 15, TypeScript, Tailwind CSS, Lucide React
* **Backend** : Supabase (PostgreSQL)
* **Scraping** : Node.js adapters pattern
* **Deployment** : Vercel

### Database (PostgreSQL)

**Schema `deadstock`** :

* `textiles` - Produits normalisés
* `sites` - Sources deadstock
* `collections` - Collections Shopify
* `attribute_categories` - Système attributs dynamiques
* `textile_attributes` - Relations textiles-attributs
* `dictionary_mappings` - Normalisation FR/EN/ES
* `unknown_terms` - Termes non reconnus
* `discovery_jobs`, `scraping_jobs` - Tracking

### Principes Architecturaux

1. **DDD Light** : Domain-driven sans over-engineering
2. **Adapter Pattern** : Scrapers modulaires par plateforme
3. **i18n First** : Architecture multilingue dès le début
4. **Dynamic Attributes** : Catégories en DB, pas en code
5. **Admin-Driven** : Workflow tuning permanent

---

## 📊 État des Données

### Sources Actives

1. **My Little Coupon** (FR) - 67 produits
2. **The Fabric Sales** (UK) - 45 produits
3. **Recovo** (ES) - Découvert, pas encore scrappé

### Qualité Données

* **Quality Score Moyen** : 82%
* **Composition** : 6% complétude
* **Dimensions (width/weight)** : 0% complétude
* **Normalisation Material** : 80% accuracy
* **Normalisation Color** : 40% accuracy

### Dictionary

* **Fiber** : 156 mappings
* **Color** : 89 mappings
* **Weave** : 34 mappings
* **Unknowns pending** : ~45 termes

---

## 🎨 Design System

### Principes

* **Sobre** : Minimal, pas de fioritures
* **Moderne** : Typographie claire, spacing généreux
* **Épuré** : Monochrome + 1 accent color
* **Professional** : Inspiré Linear, Vercel, Stripe

### Palette

* **Background** : #FFFFFF, #FAFAFA, #F5F5F5
* **Text** : #171717, #737373, #A3A3A3
* **Accent** : #0A0A0A (noir presque pur)
* **Borders** : #E5E5E5, #F0F0F0

### Composants

* Sidebar collapsible (56px → 240px)
* Cards sobre avec shadows légères
* Filters accordéon
* Icons Lucide React outline
* Animations subtiles (200ms cubic-bezier)

---

## 🚀 Parcours Designer (9 Étapes)

Interface structurée autour du workflow naturel :

1. 💡 **Idée** - Définir concept projet
2. 🎨 **Inspiration** - Mood boards, nuancier
3. ✏️ **Design** - Patron, type vêtement
4. 📏 **Calcul** - Métrage nécessaire
5. 🔍 **Sourcing** - Recherche deadstock
6. ✅ **Validation** - Vérifier caractéristiques
7. 🛒 **Achat** - Commander
8. 🏭 **Production** - Suivre avancement
9. 🌱 **Impact** - Mesurer CO2/eau économisés

**MVP** : Étapes 1, 3, 4, 5, 6, 7

**Phase 2+** : Étapes 2, 8, 9

---

## 📁 Structure Documentation

```
/mnt/project/
├── docs/
│   ├── specs/
│   │   ├── SPEC_MODULE_RECHERCHE_DESIGNER.md
│   │   ├── SPEC_MODULE_ADMIN.md
│   │   ├── SPEC_DESIGN_SYSTEM_PARCOURS.md
│   │   └── SYNTHESE_DONNEES_DESIGNER.md
│   ├── CURRENT_STATE.md
│   ├── CONTEXT_SUMMARY.md
│   └── NEXT_STEPS.md
├── ADR_001_database_architecture.md
├── ADR_002_normalization_english_i18n.md
├── ... (ADR 003-012)
├── PRODUCT_VISION.md
├── PROJECT_OVERVIEW.md
├── PHASES_V2.md
├── DATABASE_ARCHITECTURE.md
└── TUNING_SYSTEM.md
```

---

## 🎯 Décisions Architecturales Clés

### ADR-002 : Normalisation EN + i18n

* Stockage EN pour scale international
* Traductions JSONB pour affichage locale
* Source locale trackée (FR/EN/ES)

### ADR-010 : Attributs Dynamiques

* Catégories en DB (pas hardcodées)
* Hiérarchie 3 niveaux (Weave > Twill > Herringbone)
* MVP : Fiber, Color, Weave, Pattern
* Future : Properties, Weight, Use, Finish

### ADR-011 : Admin-Driven Scraping

* Discovery → Scraping → Normalization → Tuning
* Workflow permanent supervision
* LLM suggestions + validation humaine
* Dictionary évolutif

### Design System

* Sidebar collapsible (Option 5 hybrid)
* Icons Lucide React outline
* Palette monochrome sobre
* Mobile : Bottom nav

---

## 💡 Insights Clés

### Apprentissages Techniques

1. **i18n early** évite refactoring coûteux
2. **Dynamic attributes** > hardcoded categories
3. **Quality score** guide amélioration données
4. **Admin workflow** essentiel pour data quality

### Insights Produit

1. **Parcours complet** > simple agrégateur
2. **Design sobre** > bling-bling
3. **Progressive disclosure** > tout montrer d'un coup
4. **Données manquantes** = opportunité amélioration scrapers

### Choix Design

1. **Sidebar toujours visible** (contexte permanent)
2. **Étapes futures visibles** (créer anticipation)
3. **Statuts clairs** (✓ ● 🔒 ⏳)
4. **Mobile-first** (bottom nav responsive)

---

## 🎭 Personas de Référence

### Sophie - Designer Indépendante

* Crée collection capsule 10 pièces
* Budget 500€ matières
* Besoin : Rapidité, qualité/prix
* Pain : Cherche 3h sur 10 sites

### Marc - Étudiant Mode

* Projet fin d'année
* Budget serré 200€
* Besoin : Calcul précis, pas de gaspillage
* Pain : Comprendre types tissus

### Atelier Luna - Studio 3 personnes

* Production 50 robes/mois
* Besoin : Volumes, collaboration, devis
* Pain : Gérer projets multiples

---

## 📈 Métriques de Succès

### Court Terme (MVP)

* 50+ designers beta
* 500+ produits indexés
* 85%+ quality score
* 5+ sources actives

### Moyen Terme (Phase 2-3)

* 500+ utilisateurs actifs
* 10+ sources
* Calculateur utilisé 60%+
* Devis générés 100+/mois

### Long Terme (Phase 4-6)

* 2000+ designers
* 15+ sources
* €25K MRR
* API publique

---

## 🔄 Workflow Développement

### Méthodologie

1. **Spec first** - Documentation avant code
2. **Incremental** - Step by step, pas de big bang
3. **Validation** - Preview/test avant full deploy
4. **Quality focus** - Mieux vaut 100 produits qualité que 1000 médiocres

### Pattern de Session

1. Analyse contexte (ADRs, specs)
2. Définition objectifs
3. Implémentation incrémentale
4. Tests & validation
5. Documentation mise à jour

---

**Ce document sert de référence rapide pour onboarding et context switching.**
