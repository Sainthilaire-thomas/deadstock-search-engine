
# 🚀 NEXT STEPS - Deadstock Search Engine

**Dernière MAJ** : 2 Janvier 2026

**Phase Actuelle** : MVP Demo Week 1

**Session Completée** : Session 8 - Module Admin Complet ✅

**Prochaine Session** : Session 9 - Tests & Finalisation Admin OU Session 10 - Calculateur de Métrage

---

## 🎯 Objectifs Semaine 1 (1-7 Janvier)

### MVP Demo : Interface Designer + Admin Complète

**Deliverable** : Application fonctionnelle démontrant le parcours complet designer + outils admin

**État d'avancement : ~85% ✅**

**Composants** :

* ✅ Page recherche avec filtres avancés
* ✅ Page détail produit (favoris)
* ✅ Système de favoris complet
* ✅ Sidebar parcours designer
* ✅ Dark/Light mode
* ✅ Responsive mobile
* ✅ Module Admin complet (Dashboard, Sites, Jobs, Configure)
* ⏳ Calculateur métrage
* ⏳ Page projets basique

---

## ✅ Session 8 Completée (2 Janvier)

### Réalisations Majeures

**Module Admin Complet** :

* ✅ Dashboard admin avec métriques temps réel
* ✅ Page liste sites avec statuts
* ✅ Page détail site avec profile discovery
* ✅ Page configure scraping avec sélection collections
* ✅ Page liste jobs avec statistiques
* ✅ Formulaire création site

**Architecture Admin** :

* ✅ Types générés depuis Supabase (database.types.ts)
* ✅ Client Supabase admin avec service role key
* ✅ Client Supabase serveur avec cookies
* ✅ Repository pattern (sitesRepo, jobsRepo)
* ✅ Server Actions pour mutations
* ✅ Queries server-side avec schéma deadstock

**Composants Admin** :

* ✅ SiteActions (Discovery + Scraping buttons)
* ✅ ScrapingConfigForm (collections, filtres, limites)
* ✅ AddSiteForm (création site)
* ✅ Toast notifications (sonner)

**Configuration Scraping** :

* ✅ Sélection collections à scraper
* ✅ Filtres : prix min/max, images requises, disponibles uniquement
* ✅ Limite produits par collection
* ✅ Preview (10 produits) et Full scraping
* ✅ Sauvegarde configuration

**Décisions Techniques** :

* ✅ ADR-013 : Service role key pour admin (bypass RLS)
* ✅ ADR-014 : Types générés depuis Supabase
* ✅ ADR-015 : UX configure scraping (page dédiée)

**Corrections TypeScript** :

* ✅ Migration vers types Supabase générés
* ✅ Async params Next.js 15+
* ✅ Dates nullables gérées
* ✅ Json types castés correctement
* ⚠️ 9 erreurs restantes (scripts legacy, non bloquant)

---

## 📋 Options pour Session 9

### Option A : Tests & Finalisation Admin (Recommandé)

**Priorité** : Haute - Valider module créé Session 8

**Durée estimée** : 1-2h

**Objectif** : Tester et peaufiner module admin

#### Actions

**1. Tests Workflow Admin (45min)**

* [ ] Tester Discovery sur un nouveau site
* [ ] Vérifier que profile s'affiche après discovery
* [ ] Accéder à page configure
* [ ] Sélectionner collections et configurer filtres
* [ ] Tester bouton "Save Configuration"
* [ ] Tester bouton "Preview (10 products)"
* [ ] Tester bouton "Start Full Scraping"
* [ ] Vérifier que job apparaît dans liste jobs

**2. Corrections Bugs (30min)**

* [ ] Résoudre erreurs refetch console
* [ ] Vérifier tous loading states
* [ ] Tester gestion erreurs (site invalide, scraping failed)
* [ ] Valider que toasts apparaissent correctement

**3. Documentation Admin (15min)**

* [ ] Créer README module admin
* [ ] Documenter workflow Discovery → Configure → Scraping
* [ ] Screenshots des pages admin
* [ ] Guide utilisation pour futurs admins

**Validation** :

* Workflow complet fonctionne end-to-end
* Aucune erreur console critique
* Documentation claire pour réutilisation

---

### Option B : Calculateur de Métrage

**Priorité** : Haute - Fonctionnalité critique MVP

**Durée estimée** : 2-3h

**Objectif** : Implémenter l'étape 4 du parcours designer

#### Structure à créer

```bash
src/app/tools/yardage-calculator/
└── page.tsx

src/features/calculator/
├── domain/
│   ├── types.ts               # Types vêtements, tailles
│   └── formulas.ts            # Logique calcul
└── components/
    ├── CalculatorForm.tsx     # Formulaire inputs
    └── ResultDisplay.tsx      # Affichage résultat
```

#### Fonctionnalités

**1. Formulaire (1h)**

* [ ] Dropdown type vêtement (dress, skirt, pants, shirt, jacket)
* [ ] Dropdown taille (XS, S, M, L, XL, XXL)
* [ ] Input quantité pièces (default 1)
* [ ] Input largeur tissu (default 140cm)
* [ ] Bouton "Calculer"

**2. Logic Calcul (45min)**

* [ ] Formules métrage par type/taille
* [ ] Ajustement selon largeur tissu
* [ ] Marge sécurité 10%
* [ ] Arrondi smart (0.5m)

**3. Affichage Résultat (45min)**

* [ ] Card résultat claire
* [ ] Métrage par pièce + total
* [ ] Explication calcul (optionnel)
* [ ] Bouton "Chercher des tissus" → `/search?minQuantity=X`

**Validation** :

* Calculs corrects pour tous types/tailles
* Redirection vers recherche fonctionne
* Design cohérent avec reste de l'app

---

## 🎯 Recommandation : Option A puis Option B

### Justification

**Session 9 : Tests Admin (1-2h)**

* ✅ Valider travail Session 8 (risque bugs cachés)
* ✅ S'assurer que module est réutilisable
* ✅ Corriger avant d'empiler nouveautés

**Session 10 : Calculateur (2-3h)**

* ✅ Complète parcours MVP essentiel (étape 4)
* ✅ Killer feature différenciante
* ✅ Utilisable même avec données incomplètes
* ✅ Démontre value prop immédiate

---

## 📋 Sessions Suivantes (Semaine 1-2)

### Session 11 : Enrichissement Données Scrapers

**Objectif** : Améliorer complétude width, weight, composition

**Durée estimée** : 3-4h

#### Actions

**1. Audit Scrapers Existants (30min)**

* [ ] Analyser HTML sources pour champs manquants
* [ ] Identifier patterns width/weight/composition
* [ ] Documenter sélecteurs CSS

**2. Améliorer Adapters (2h)**

* [ ] Ajouter extraction width_value, width_unit
* [ ] Ajouter extraction weight_value, weight_unit
* [ ] Améliorer extraction composition (parse HTML tables)
* [ ] Tester sur 10+ produits par source

**3. Re-scraping & Validation (1h)**

* [ ] Run scrapers sur collections validées
* [ ] Vérifier complétude champs
* [ ] Calculer nouveaux quality scores
* [ ] Mettre à jour métriques

**Validation** :

* Width complétude : 0% → 60%+
* Weight complétude : 0% → 50%+
* Composition complétude : 6% → 30%+

---

### Session 12 : Tests & Polish MVP

**Durée estimée** : 2-3h

**Objectif** : Finaliser MVP pour démonstration

#### Actions

**1. Tests Parcours Complet (1h)**

* [ ] Test end-to-end : Sourcing → Validation → Achat
* [ ] Test calculateur → recherche intégration
* [ ] Test admin : Discovery → Configure → Scraping
* [ ] Test responsive mobile/desktop
* [ ] Test dark/light mode toutes pages

**2. Corrections Bugs (1h)**

* [ ] Fix issues découverts en tests
* [ ] Vérifier loading states partout
* [ ] Vérifier empty states
* [ ] Vérifier messages erreur
* [ ] Corriger 9 erreurs TypeScript legacy

**3. Polish Final (1h)**

* [ ] Optimiser images (Next.js Image)
* [ ] Vérifier performance Lighthouse
* [ ] Ajouter meta tags SEO
* [ ] Vérifier accessibilité (ARIA labels)
* [ ] Screenshots documentation

---

### Session 13 : Ajouter Nouveaux Sites

**Objectif** : Élargir catalogue textile

**Actions** :

* [ ] Identifier 5-10 nouveaux sites deadstock
* [ ] Run discovery sur chaque site
* [ ] Configurer scraping pertinent
* [ ] Valider quality scores
* [ ] Objectif : 112 → 300+ produits

---

## 📋 Phase 2 Préparation (Semaine 3+)

### Session 14 : Authentification Supabase

**Objectif** : Préparer migration favoris session → user

**Actions** :

* Setup Supabase Auth
* Magic link login
* User profile basique
* Migration strategy favoris

### Session 15 : Page Projets

**Objectif** : Sauvegarder calculs + favoris

**Actions** :

* CRUD projets
* Associer favoris à projet
* Historique calculs métrage
* Export projet (PDF)

### Session 16 : Mood Boards

**Objectif** : Étape 2 du parcours (Inspiration)

**Actions** :

* Upload images inspiration
* Génération palette couleurs
* Recherche par couleur palette
* Sauvegarde mood board

---

## 🚧 Bloqueurs Actuels

### Données (Partiellement résolu)

* ✅ ~~Favoris système~~ - **Implémenté Session 7**
* ✅ ~~Module Admin~~ - **Implémenté Session 8**
* ⚠️ **Width/Weight manquants** → Calculateur sera "estimation"
* ⚠️ **Composition faible** → Limiter info produit

**Action** : Session 11 - Enrichir scrapers

### Technique

* ✅ ~~RLS Supabase~~ - **Résolu Session 7**
* ✅ ~~Optimistic updates~~ - **Implémenté Session 7**
* ✅ ~~Client Supabase serveur~~ - **Créé Session 8**
* ✅ ~~Types générés~~ - **Créés Session 8**
* ⚠️ **9 erreurs TypeScript legacy** - Non bloquant mais à corriger
* ⚠️ **Anti-bot protection** → Certains sites bloquent

**Action** : Session 12 - Corriger erreurs legacy

---

## 🎯 Critères de Succès MVP Demo

### Fonctionnel (85% ✅)

* ✅ Recherche unifiée fonctionne
* ✅ Filtres appliquent correctement
* ✅ Système favoris complet
* ✅ Détail produit affiche données
* ✅ Navigation fluide entre pages
* ✅ Responsive mobile/desktop
* ✅ Module Admin complet (Dashboard, Sites, Jobs, Configure)
* ⏳ Calculateur donne résultats (Session 10)

### UX (95% ✅)

* ✅ Sidebar parcours visible et claire
* ✅ Design sobre et professionnel
* ✅ Dark mode impeccable
* ✅ Messages d'aide contextuels
* ✅ Loading states (favoris)
* ✅ Empty states informatifs
* ✅ Toast notifications admin
* ⏳ Animations subtiles (à peaufiner)

### Performance (85% ✅)

* ✅ Pages chargent < 2s
* ✅ Optimistic updates instantanés
* ⚠️ Images optimisées (à vérifier)
* ⚠️ Pas de layout shifts (à tester)
* ✅ Transitions fluides
* ⚠️ Quelques refetch console (à corriger)

---

## 📅 Timeline Suggérée

**Semaine 1 (1-7 Jan)** : Frontend MVP Designer + Admin

* ✅ Jour 1 : Specs + Design System
* ✅ Jour 2 : Système de Favoris + Module Admin Complet
* ⏳ Jour 3 : Tests Admin + Calculateur Métrage
* ⏳ Jour 4 : Enrichissement Données
* ⏳ Jour 5 : Tests & Polish + Documentation
* Weekend : Buffer & préparation démo

**Semaine 2 (8-14 Jan)** : Data Quality + Tests

* Enrichissement scrapers (Session 11)
* Ajout nouveaux sites (5-10 sources)
* Tests end-to-end (Session 12)
* Corrections bugs
* Performance optimization

**Semaine 3 (15-21 Jan)** : Phase 2 Prep

* Authentification Supabase
* Migration favoris → users
* Projets avec historique
* Mood boards (si temps)

---

## 🎬 Prochaine Action Immédiate

### Session 9 : Démarrer par

**Option A (Tests Admin)** - Recommandé :

1. **Tester workflow complet admin**

   * Créer nouveau site via formulaire
   * Lancer discovery
   * Configurer scraping
   * Vérifier jobs list
2. **Corriger bugs découverts**

   * Résoudre refetch errors
   * Valider tous loading states
   * Tester edge cases (site invalide, etc.)
3. **Documenter module admin**

   * Créer README admin
   * Screenshots workflow
   * Guide utilisation

**OU Option B (Calculateur)** :

1. **Créer structure calculateur**

```bash
mkdir -p src/features/calculator/{domain,components}
mkdir -p src/app/tools/yardage-calculator
```

2. **Définir formules métrage**

   * Rechercher formules standards couture
   * Créer fichier `formulas.ts` avec logique
   * Documenter sources/références
3. **Implémenter formulaire**

   * Créer `CalculatorForm.tsx`
   * Utiliser composants UI existants
   * Validation inputs
4. **Afficher résultats**

   * Créer `ResultDisplay.tsx`
   * Intégration avec recherche

---

## 📊 Métriques à Suivre

### Développement

* **TypeScript errors** : 9 → 0
* **Code coverage** : Ajouter tests critiques
* **Build time** : Optimiser si > 30s
* **Bundle size** : Vérifier < 500kb

### Données

* **Products** : 112 → 200+ (semaine 2)
* **Width complétude** : 0% → 60%+
* **Weight complétude** : 0% → 50%+
* **Composition** : 6% → 30%+
* **Quality score** : 82% → 85%+

### UX

* **Lighthouse score** : > 90
* **First Contentful Paint** : < 1.5s
* **Time to Interactive** : < 3s

---

## 🎓 Apprentissages Session 8

### Technique

* **Service Role Key** : Essentiel pour admin (bypass RLS)
* **Types générés Supabase** : Source de vérité pour cohérence types
* **Client serveur vs client** : Séparation claire nécessaire
* **Async params Next.js 15+** : Breaking change à gérer
* **Schema Supabase** : Spécifier `db: { schema: 'deadstock' }` dans client

### Produit

* **Page configure dédiée** : Meilleure UX que modal pour configuration complexe
* **Workflow Discovery → Configure → Scraping** : Logique et intuitive
* **Preview avant full scraping** : Critique pour validation
* **Toast notifications** : Feedback essentiel pour actions admin

### Process

* **Types générés d'abord** : Évite refactoring TypeScript massif
* **RLS vs Service Role** : Admin nécessite bypass RLS
* **Documentation progressive** : ADRs pendant décisions, pas après

---

## 💡 Idées pour Plus Tard

### Features Admin

* [ ] Monitoring jobs temps réel (websockets)
* [ ] Logs détaillés par job
* [ ] Retry failed jobs
* [ ] Schedule scraping automatique
* [ ] Dashboard analytics (produits/jour, sources populaires)

### Features Designer

* [ ] Export liste favoris (PDF, Excel)
* [ ] Partage favoris (lien public)
* [ ] Comparaison côte-à-côte (2-3 favoris)
* [ ] Historique prix (si scrapé régulièrement)
* [ ] Alertes stock (webhook sources)

### Optimisations

* [ ] Cache Redis (recherches populaires)
* [ ] CDN images (Cloudinary)
* [ ] Lazy loading images (viewport)
* [ ] Service Worker (offline mode)
* [ ] Incremental Static Regeneration

### Monétisation

* [ ] API professionnelle (€49/mois)
* [ ] Projets illimités (€19/mois)
* [ ] Reverse marketplace (commission 5%)
* [ ] White label (€299/mois)

---

**Prêt pour Session 9 !** 🚀

**Décision à prendre** : Option A (Tests Admin) ou Option B (Calculateur) ?

**Recommandation** : **Option A** - Valider module admin avant de continuer
