
# 🚀 NEXT STEPS - Deadstock Search Engine

**Dernière MAJ** : 1 Janvier 2026

**Phase Actuelle** : MVP Demo Week 1

**Prochaine Session** : Session 7 - Implémentation Design System

---

## 🎯 Objectifs Semaine 1 (1-7 Janvier)

### MVP Demo : Interface Designer Complète

**Deliverable** : Application fonctionnelle démontrant le parcours complet designer

**Composants** :

* ✅ Page recherche avec filtres avancés
* ✅ Page détail produit
* ✅ Calculateur métrage
* ✅ Sidebar parcours designer
* ✅ Dark/Light mode
* ✅ Responsive mobile

---

## 📋 Session 7 : Design System & Composants Base

**Durée estimée** : 2-3h

### 1. Setup Design Tokens (30min)

#### Tailwind Configuration

```bash
# Fichiers à créer/modifier
src/styles/design-tokens.css
tailwind.config.ts
```

**Actions** :

* [ ] Définir palette couleurs (neutral, accent, semantic)
* [ ] Setup typographie (Inter font)
* [ ] Spacing scale (base 4px)
* [ ] Border radius & shadows
* [ ] Dark mode variables

**Validation** : Page test avec tous les tokens

---

### 2. Composants UI Base (1h)

#### Créer dans `/src/components/ui/`

* [ ] `Button.tsx` - Variants (primary, secondary, ghost)
* [ ] `Card.tsx` - Container standard
* [ ] `Badge.tsx` - Labels (fiber, color, status)
* [ ] `Input.tsx` - Form fields
* [ ] `Select.tsx` - Dropdowns
* [ ] `Checkbox.tsx` - Filters
* [ ] `Slider.tsx` - Prix range

**Base** : Utiliser Radix UI + Tailwind (pattern shadcn/ui)

**Validation** : Storybook ou page `/dev/components`

---

### 3. Sidebar Parcours Designer (1h)

#### Fichiers à créer

```bash
src/features/journey/
├── domain/
│   └── types.ts                    # Types TypeScript
├── config/
│   └── steps.ts                    # Configuration 9 étapes
└── components/
    ├── Sidebar.tsx                 # Container principal
    ├── SidebarStep.tsx             # Item individuel
    └── MobileJourneyNav.tsx        # Bottom nav mobile
```

**Actions** :

* [ ] Créer types `DesignJourneyStep`
* [ ] Définir config 9 étapes avec icons Lucide
* [ ] Implémenter Sidebar collapsible
* [ ] Gérer état (collapsed/expanded) avec localStorage
* [ ] Tooltips au hover
* [ ] Animations transitions
* [ ] Responsive mobile (bottom nav)

**Validation** :

* Toggle collapse/expand fonctionne
* État persiste au refresh
* Tooltips s'affichent
* Mobile devient bottom nav

---

### 4. Intégration Layout (30min)

#### Fichier : `src/app/layout.tsx`

**Actions** :

* [ ] Wrapper `<Sidebar>` autour de {children}
* [ ] Calculer currentStep selon pathname
* [ ] Ajouter padding-left pour sidebar desktop
* [ ] Ajouter padding-bottom pour bottom nav mobile

**Validation** : Sidebar visible sur toutes les pages

---

## 📋 Session 8 : Page Recherche Complète

**Durée estimée** : 3-4h

### 1. Filtres Sidebar (1h30)

#### Composants

```bash
src/features/search/
└── components/
    ├── SearchFilters.tsx           # Container filtres
    ├── FilterSection.tsx           # Section accordéon
    ├── MaterialFilter.tsx          # Checkboxes matières
    ├── ColorFilter.tsx             # Checkboxes couleurs + preview
    ├── PatternFilter.tsx           # Checkboxes motifs
    ├── WeaveFilter.tsx             # Checkboxes tissages
    ├── PriceFilter.tsx             # Slider range
    └── QuantityFilter.tsx          # Input + checkbox
```

**Actions** :

* [ ] Fetch categories depuis `attribute_categories`
* [ ] Render checkboxes dynamiques
* [ ] Preview couleur (dot coloré)
* [ ] Count produits par filtre
* [ ] Slider prix responsive
* [ ] État filtres dans URL (searchParams)

**Validation** : Filtres appliquent query DB correctement

---

### 2. Grille Résultats (1h)

#### Composant : `TextileGrid.tsx`

**Actions** :

* [ ] Layout responsive (3/2/1 colonnes)
* [ ] Infinite scroll OU pagination
* [ ] Loading states (skeletons)
* [ ] Empty state ("Aucun résultat")
* [ ] Tri (récent, prix croissant/décroissant)

**Validation** : Scroll fluide, images chargent bien

---

### 3. Cards Produit (1h)

#### Composant : `TextileCard.tsx`

**Actions** :

* [ ] Image avec fallback
* [ ] Badges matière/couleur/motif
* [ ] Prix formaté
* [ ] Quantité disponible
* [ ] Source platform
* [ ] Bouton favoris (❤️)
* [ ] Hover state subtle
* [ ] Click → navigation `/textiles/[id]`

**Validation** : Cards affichent toutes infos correctement

---

### 4. Barre Recherche (30min)

#### Composant : `SearchBar.tsx`

**Actions** :

* [ ] Input avec icon Search
* [ ] Debounce 300ms
* [ ] Auto-complétion (optionnel Phase 2)
* [ ] Clear button (×)
* [ ] Enter → submit

**Validation** : Recherche fonctionne, debounce OK

---

## 📋 Session 9 : Page Détail Produit

**Durée estimée** : 2-3h

### Structure

```bash
src/app/textiles/[id]/
└── page.tsx
```

### Sections

**1. Galerie Images** (30min)

* [ ] Image principale grande taille
* [ ] Vignettes additional_images
* [ ] Zoom au hover
* [ ] Navigation prev/next

**2. Info Block** (30min)

* [ ] Titre produit (h1)
* [ ] Prix + unité
* [ ] Quantité disponible
* [ ] Minimum order (si existe)
* [ ] Bouton favoris
* [ ] Bouton "Acheter sur [source]"

**3. Caractéristiques** (45min)

* [ ] Tableau composition, matière, couleur, motif, tissage
* [ ] Width, weight (si disponibles)
* [ ] Certifications (si disponibles)
* [ ] Affichage conditionnel (hide si null)
* [ ] Disclaimers pour données manquantes

**4. Description** (15min)

* [ ] Texte formaté
* [ ] Truncate si long + "Lire plus"

**5. Source Info** (15min)

* [ ] Platform badge
* [ ] Lien externe vers source
* [ ] Supplier (si disponible)

**Validation** : Toutes données affichées proprement

---

## 📋 Session 10 : Calculateur Métrage

**Durée estimée** : 2h

### Structure

```bash
src/app/tools/yardage-calculator/
└── page.tsx
```

### Fonctionnalités

**1. Formulaire** (1h)

* [ ] Dropdown type vêtement (dress, skirt, pants, shirt, jacket)
* [ ] Dropdown taille (XS, S, M, L, XL, XXL)
* [ ] Input quantité pièces
* [ ] Input largeur tissu (default 140cm)
* [ ] Bouton "Calculer"

**2. Logic Calcul** (30min)

* [ ] Formules par type/taille
* [ ] Ajustement largeur tissu
* [ ] Marge sécurité 10%
* [ ] Arrondi recommandation (0.5m)

**3. Affichage Résultat** (30min)

* [ ] Métrage par pièce
* [ ] Total
* [ ] Marge
* [ ] Recommandation finale
* [ ] Bouton "Chercher des tissus" → /search avec filter quantity

**Validation** : Calculs corrects, redirection fonctionne

---

## 📋 Sessions Suivantes (Semaine 2)

### Session 11 : Favoris

* Page `/favorites`
* Système sauvegarde (localStorage ou DB)
* Grille similaire à recherche

### Session 12 : Projets Basiques

* CRUD projets simples
* Associer textiles à projets
* Budget tracker

### Session 13 : Tests & Polish

* Tests composants critiques
* Corrections bugs
* Performance optimizations
* Animations finales

### Session 14 : Module Admin - Sites

* Page `/admin/sites`
* Liste sources
* Discovery interface
* Scraping interface

### Session 15 : Module Admin - Tuning

* Page `/admin/tuning`
* Interface unknowns
* Dictionary management
* Batch approvals

---

## 🚧 Bloqueurs Potentiels

### Données

* **Width/Weight manquants** → Enrichir scrapers avant Session 10
* **Composition faible** → Améliorer extraction

**Action** : Intercaler session enrichissement scrapers si bloquant

### Design

* **Icons Lucide** → Vérifier tous icons disponibles
* **Dark mode** → Tester toutes pages

**Action** : Tests réguliers en dark mode

---

## 🎯 Critères de Succès MVP Demo

### Fonctionnel

* ✅ Recherche unifiée fonctionne
* ✅ Filtres appliquent correctement
* ✅ Détail produit affiche toutes données
* ✅ Calculateur donne résultats justes
* ✅ Navigation fluide entre pages
* ✅ Responsive mobile/desktop

### UX

* ✅ Sidebar parcours visible et claire
* ✅ Design sobre et professionnel
* ✅ Dark mode impeccable
* ✅ Animations subtiles
* ✅ Loading states partout
* ✅ Empty states informatifs

### Performance

* ✅ Pages chargent < 2s
* ✅ Images optimisées
* ✅ Pas de layout shifts
* ✅ Transitions 60fps

---

## 📅 Timeline Suggérée

**Semaine 1 (1-7 Jan)** : Frontend MVP Designer

* Jour 1 : Design System + Sidebar ✅
* Jour 2 : Page Recherche
* Jour 3 : Page Détail
* Jour 4 : Calculateur
* Jour 5 : Favoris + Polish
* Weekend : Tests & bugs

**Semaine 2 (8-14 Jan)** : Admin + Data Quality

* Enrichissement scrapers
* Module Admin Sites
* Module Admin Tuning
* Tests intégration

**Semaine 3 (15-21 Jan)** : Features Phase 2

* Projets basiques
* Mood boards (si temps)
* Optimisations

---

## 🎬 Prochaine Action Immédiate

### Session 7 : Démarrer par

1. **Setup Tailwind tokens** (fichier design-tokens.css)
2. **Installer Lucide React** : `npm install lucide-react`
3. **Créer structure features/journey**
4. **Implémanter Sidebar.tsx**

**Commande de départ** :

```bash
npm install lucide-react
mkdir -p src/features/journey/{domain,config,components}
mkdir -p src/components/ui
touch src/styles/design-tokens.css
```

---

**Prêt pour Session 7 !** 🚀
