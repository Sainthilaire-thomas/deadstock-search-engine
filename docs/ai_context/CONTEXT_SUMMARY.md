
# 🧠 CONTEXT SUMMARY - Deadstock Search Engine

**Dernière MAJ** : 2 Janvier 2026

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

## 🎨 Parcours Designer (9 Étapes)

Le cœur de l'expérience utilisateur :

1. **💡 Idée** - Définir le concept de projet
2. **🎨 Inspiration** - Mood boards, palettes (Phase 2)
3. **✏️ Design** - Choix patron, type vêtement
4. **📏 Calcul** - Calculateur métrage automatique
5. **🔍 Sourcing** - Recherche unifiée multi-sources ✅
6. **✅ Validation** - Comparaison détaillée favoris ✅
7. **🛒 Achat** - Redirection vers sources externes ✅
8. **🏭 Production** - Tracking avancement (Phase 4)
9. **🌱 Impact** - Mesure CO2/eau économisés (Phase 5)

**État actuel** : Étapes 5, 6, 7 complètement fonctionnelles (Session 7)

---

## 🗂️ Architecture Technique

### Stack Principal

* **Frontend** : Next.js 16 (App Router), React 19, TypeScript
* **UI** : Tailwind CSS, Radix UI, Lucide Icons
* **Backend** : Supabase (PostgreSQL, Auth, Storage)
* **Scraping** : Node.js adapters (Shopify API)
* **State** : React Context (favoris), Server Components
* **Deployment** : Vercel

### Base de Données

**Schema `deadstock`** :

* `textiles` - Produits indexés (112 actuellement)
* `sites` - Sources scraped (3 actives)
* `site_profiles` - Configurations scraping
* `scraping_jobs` - Historique jobs
* `attribute_categories` - Taxonomie textile
* `textile_attributes` - Attributs normalisés
* `dictionary_mappings` - Normalisation FR→EN
* `favorites` - Favoris utilisateur (Session 7) ⭐

**RLS** : Row Level Security activé sur certaines tables

**Service Role** : Client admin avec bypass RLS (Session 8) 🔑

### Patterns Architecturaux

* **Adapter Pattern** : Scrapers multi-sources
* **Repository Pattern** : Accès données (client + server)
* **DDD Léger** : Organisation features/ par domaine
* **Server Actions** : Mutations Next.js 15+
* **Optimistic Updates** : UX instantanée favoris
* **Types Générés** : Source de vérité depuis Supabase (Session 8) 📋

---

## 📊 État Actuel (Session 8)

### Données Indexées

* **112 textiles** (67 MLC + 45 TFS)
* **3 sources** : My Little Coupon, The Fabric Sales, Recovo
* **8 collections** validées pour scraping
* **Quality Score** : 82% moyen

### Complétude Champs

| Champ                 | Complétude | Priorité      |
| --------------------- | ----------- | -------------- |
| name, price, quantity | 100%        | ✅ Critique    |
| material, color       | 80%/40%     | ⚠️ Important |
| composition           | 6%          | ❌ Manquant    |
| width, weight         | 0%          | ❌ Manquant    |
| certifications        | 0%          | ⏳ Phase 2     |

### Normalisation

* **Material** : 80% accuracy (156 mappings)
* **Color** : 40% accuracy (89 mappings)
* **Weave** : 34 mappings
* **Unknowns** : ~45 termes en attente

---

## 🎨 Design System (Session 6-7)

### Principes

* **Sobre & moderne** : Inspiration Linear, Vercel
* **Monochrome** : Gris + noir accent
* **Outline icons** : Lucide React
* **Hiérarchie claire** : Typographie Inter

### Composants Clés

* **Sidebar** : Collapsible 240px ↔ 56px
* **Cards** : Textiles, favoris
* **Badges** : Status, catégories
* **Filters** : Recherche avancée
* **Tooltips** : Aide contextuelle
* **Toasts** : Notifications actions (Session 8) 🔔

### Design Tokens (Session 7)

```css
--sidebar-width: 240px;
--sidebar-collapsed-width: 56px;
--transition-fast: 150ms;
--transition-base: 200ms;
```

---

## 💡 Innovations Clés

### 1. Système de Favoris (Session 7) ⭐

**Problème** : Impossible de comparer plusieurs textiles avant achat

**Solution** :

* Ajout favoris instantané (❤️ button)
* Liste favoris avec comparaison
* Détail complet par favori
* Navigation prev/next entre favoris
* Synchro instantanée (optimistic updates)

**Architecture** :

* Session temporaire (cookie 90 jours)
* React Context pour state partagé
* Server Actions pour persistence
* Migration user_id prévue Phase 2

### 2. Module Admin Complet (Session 8) 🔧

**Problème** : Besoin outils pour gérer sources, scraping, qualité données

**Solution** :

* Dashboard admin avec métriques temps réel
* Gestion sites (liste, détail, création)
* Discovery automatique structure sites
* Configuration scraping par collection
* Monitoring jobs avec historique
* Interface tuning normalisation (à venir)

**Architecture** :

* Client Supabase admin (service role key)
* Types TypeScript générés depuis DB
* Repository pattern pour data access
* Server Actions pour mutations
* Toast notifications pour feedback

**Workflow** :

1. **Discovery** : Analyser structure site automatiquement
2. **Configure** : Sélectionner collections + filtres
3. **Scraping** : Preview (10 produits) ou Full
4. **Monitoring** : Suivre jobs, erreurs, quality scores

### 3. Normalisation Intelligente

**Problème** : FR "Coton bio bleu" vs EN "Blue organic cotton"

**Solution** :

* Dictionary-based normalization
* FR → EN automatique
* LLM fallback pour unknowns
* Tuning continu par admin

### 4. Multi-Source Unified Search

**Problème** : 10+ sites avec formats différents

**Solution** :

* Adapter pattern par plateforme
* Schema unifié `textiles`
* Agrégation temps réel

---

## 🚀 Roadmap & Phases

### Phase 1 : MVP (En Cours - 85% ✅)

**Objectif** : Démontrer value prop core

**Fonctionnalités** :

* ✅ Recherche unifiée avec filtres
* ✅ Système de favoris complet
* ✅ Détail produit avec specs
* ✅ Design system & navigation
* ✅ Module Admin complet (Dashboard, Sites, Jobs, Configure)
* ⏳ Calculateur métrage
* ⏳ Projets basiques

**Timeline** : Semaines 1-2 (Janvier 2026)

### Phase 2 : Product-Market Fit

**Objectif** : Features demandées par early adopters

**Fonctionnalités** :

* Authentification (Supabase Auth)
* Mood boards & palettes
* Upload patron PDF
* Sauvegarde projets
* Partage collaboratif

**Timeline** : Q1 2026

### Phase 3 : Monétisation

**Objectif** : Générer revenus

**Modèles** :

* API professionnelle (€49/mois)
* Reverse marketplace (commission)
* Premium features (projets illimités)

**Timeline** : Q2 2026

### Phase 4 : Workflow Complet

**Objectif** : Accompagner production

**Fonctionnalités** :

* Tracking production
* Gestion commandes
* Communication fournisseurs

**Timeline** : Q3-Q4 2026

### Phase 5 : Impact & Certifications

**Objectif** : Mesurer impact environnemental

**Fonctionnalités** :

* Calcul CO2 économisé
* Calcul eau économisée
* Certificats impact
* Rapport RSE

**Timeline** : 2027

---

## 🎯 Métriques de Succès

### MVP (Phase 1)

* **Utilisateurs** : 10-20 designers testeurs
* **Recherches** : 100+ par semaine
* **Favoris** : 50+ produits ajoutés
* **Feedback** : NPS > 40

### Product-Market Fit (Phase 2)

* **Utilisateurs actifs** : 500+
* **Rétention** : 40% semaine 2
* **Engagement** : 3+ projets/user
* **Référencement** : 30% par bouche-à-oreille

### Scale (Phase 3+)

* **ARR** : €50k+
* **Utilisateurs payants** : 100+
* **Churn** : < 5%/mois
* **Sources** : 20+ sites indexés

---

## 🔧 Décisions Architecturales Importantes

### ADR-001 : Database Architecture

* PostgreSQL avec schema dédié `deadstock`
* Séparation e-commerce vs deadstock
* Justification : Isolation, scalabilité

### ADR-005 : Light DDD Architecture

* Features organisées par domaine
* domain/, infrastructure/, application/
* Justification : Maintenabilité, clarté

### ADR-007 : Adapter Pattern Scrapers

* Interface uniforme, implémentations spécifiques
* Shopify, WooCommerce, custom
* Justification : Extensibilité, testabilité

### ADR-011 : Admin-Driven Scraping

* Découverte manuelle puis automatisation
* Quality > quantité
* Justification : Contrôle qualité, coûts

### ADR-013 : Favorites Architecture (Session 7) ⭐

* Session temporaire (cookie) pour MVP
* Migration user_id en Phase 2
* React Context + optimistic updates
* Justification : Friction zéro, UX instantanée

### ADR-014 : Admin Service Role Key (Session 8) 🔑

* Client Supabase admin avec service_role_key
* Bypass RLS pour opérations admin
* Séparation client user vs client admin
* Justification : Sécurité, permissions granulaires

### ADR-015 : TypeScript Types Generation (Session 8) 📋

* Types générés depuis Supabase (database.types.ts)
* Source de vérité unique
* Utilisation dans domain types
* Justification : Cohérence, maintenabilité

### ADR-016 : Configure Scraping UX (Session 8) 🎨

* Page dédiée `/admin/sites/[id]/configure`
* Workflow linéaire : Discovery → Configure → Scraping
* Sélection collections + filtres + preview
* Justification : UX claire, espace suffisant

---

## 📚 Documentation Clé

### Spécifications Produit

* **SPEC_MODULE_RECHERCHE_DESIGNER.md** - UX complète
* **SPEC_MODULE_ADMIN.md** - Interface admin
* **SPEC_DESIGN_SYSTEM_PARCOURS.md** - Design & navigation
* **SYNTHESE_DONNEES_DESIGNER.md** - Analyse données

### Architecture & Décisions

* **ADR-001 à ADR-016** - Décisions techniques
* **DATABASE_ARCHITECTURE.md** - Schema détaillé
* **TUNING_SYSTEM.md** - Normalisation

### Roadmap & Vision

* **PRODUCT_VISION.md** - Vision long terme
* **PROJECT_OVERVIEW.md** - Vue d'ensemble
* **PHASES_V2.md** - Roadmap détaillée

### Sessions

* **SESSION_4_STRATEGIC_PIVOT.md** - Pivot vers designers
* **SESSION_7_FAVORITES_SYSTEM.md** - Implémentation favoris ⭐
* **SESSION_8_ADMIN_MODULE_COMPLETE.md** - Module admin complet 🔧

---

## 🎓 Apprentissages Clés

### Produit

1. **Designers ≠ Grandes marques** : Besoin outils, pas marketplace
2. **Killer feature** : Pattern PDF + calcul + sourcing combinés
3. **Deadstock = Urgence** : Stock limité, besoin décision rapide
4. **Quality > Quantity** : 100 bons produits > 10k médiocres
5. **Admin tools = MVP** : Impossible de scaler sans outils admin

### Technique

1. **Optimistic updates** : Essentiels pour UX moderne
2. **React Context** : Parfait pour state partagé simple
3. **Server Components** : Simplifier fetch data
4. **Session temporaire** : Réduire friction onboarding
5. **Service role key** : Nécessaire pour admin (bypass RLS)
6. **Types générés** : Source vérité évite drift DB ↔ code
7. **Client serveur** : Cookies() pour auth, service_role pour admin

### Business

1. **Niche claire** : Designers indépendants, pas B2B textile
2. **Value prop immédiate** : Gain temps mesurable (3-4h → 30min)
3. **Network effects faibles** : Valeur = données, pas users
4. **Monétisation** : API pro + features premium

---

## 🚧 Challenges Actuels

### Technique

* **Données incomplètes** : Width/weight manquants (0%)
* **Normalisation color** : 40% accuracy seulement
* **Anti-bot protection** : Certains sites bloquent scrapers
* **9 erreurs TypeScript** : Scripts legacy (non bloquant)

### Produit

* **Calculateur précis** : Nécessite dimensions exactes
* **Validation qualité** : Pas de retours/avis produits
* **Stock temps réel** : Pas d'API direct fournisseurs

### Business

* **Validation PMF** : Besoin tester avec vrais designers
* **Acquisition** : Comment toucher la niche ?
* **Concurrence indirecte** : Marketplaces génériques

---

## 🎯 Prochaines Étapes

### Immédiat (Cette Semaine)

1. ✅ ~~Implémenter système favoris~~ **FAIT Session 7**
2. ✅ ~~Créer module admin complet~~ **FAIT Session 8**
3. ⏳ Tester workflow admin end-to-end
4. ⏳ Créer calculateur métrage
5. ⏳ Enrichir données scrapers (width, weight)

### Court Terme (2-3 Semaines)

1. Finaliser MVP Phase 1 (calculateur + tests)
2. Onboarding 10-20 designers beta
3. Itérations rapides sur feedback
4. Enrichir données (300+ produits)

### Moyen Terme (1-2 Mois)

1. Authentification Supabase
2. Migration favoris → users
3. Mood boards & projets
4. Monétisation early adopters

---

## 💭 Citations & Insights

### Thomas (Founder)

> "Le but c'est pas de faire une marketplace, c'est de faire un outil pour designers."

> "Combining pattern PDF with yardage calculation and fabric sourcing — that's the killer feature."

> "Quality over quantity. Better 100 perfect textiles than 10k mediocre ones."

> "Admin tools are not optional - they're the foundation for scalable quality."

### Vision Long Terme

> "Accompagner le designer de l'idée jusqu'à la mesure de son impact CO2."

---

**Contexte maintenu à jour** - Session 8 : Module Admin complet ✅
