
# 🚀 NEXT STEPS - Deadstock Search Engine

**Dernière MAJ** : 2 Janvier 2026

**Phase Actuelle** : MVP Demo Week 1

**Session Complétée** : Session 7 - Système de Favoris ✅

**Prochaine Session** : Session 8 - Calculateur de Métrage OU Enrichissement Données

---

## 🎯 Objectifs Semaine 1 (1-7 Janvier)

### MVP Demo : Interface Designer Complète

**Deliverable** : Application fonctionnelle démontrant le parcours complet designer

**État d'avancement : ~70% ✅**

**Composants** :

* ✅ Page recherche avec filtres avancés
* ✅ Page détail produit (favoris)
* ✅ Système de favoris complet
* ✅ Sidebar parcours designer
* ✅ Dark/Light mode
* ✅ Responsive mobile
* ⏳ Calculateur métrage
* ⏳ Page projets basique

---

## ✅ Session 7 Complétée (2 Janvier)

### Réalisations

**Design System** :

* ✅ Sidebar collapsible implémentée
* ✅ Design tokens CSS
* ✅ 9 étapes parcours designer
* ✅ Mobile navigation (bottom nav)

**Système de Favoris** :

* ✅ Architecture complète (DB, Repository, Actions, Context)
* ✅ 3 migrations appliquées (table, RLS, permissions)
* ✅ Boutons ❤️ avec optimistic updates
* ✅ Badge compteur synchronisé
* ✅ Page `/favorites` - Liste
* ✅ Page `/favorites/[id]` - Détail avec navigation
* ✅ Page 404 personnalisée

**Messages d'Aide** :

* ✅ Guide recherche contextuel
* ✅ Empty state favoris avec CTA
* ✅ Instructions navigation favoris

**Documentation** :

* ✅ SESSION_7_FAVORITES_SYSTEM.md
* ⏳ ADR-013 (Architecture favoris) - à créer

---

## 📋 Options pour Session 8

### Option A : Calculateur de Métrage (Recommandé)

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

### Option B : Enrichissement Données Scrapers

**Priorité** : Moyenne - Bloque qualité calculateur

**Durée estimée** : 3-4h

**Objectif** : Améliorer complétude données (width, weight, composition)

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

### Option C : Page Projets Basique

**Priorité** : Faible - Nice to have MVP

**Durée estimée** : 3-4h

**Objectif** : Étape 3 du parcours (Design)

#### Fonctionnalités Minimales

* [ ] CRUD projets (nom, description, date)
* [ ] Liste projets
* [ ] Détail projet
* [ ] Associer favoris à projet (optionnel)

---

## 🎯 Recommandation : Option A (Calculateur)

### Justification

**Pour** :

* ✅ Complète parcours MVP essentiel (étape 4)
* ✅ Killer feature différenciante
* ✅ Utilisable même avec données incomplètes (largeur par défaut)
* ✅ Démontre value prop immédiate

**Contre** :

* ⚠️ Précision limitée sans width exact (mitigation : indiquer "estimation")

**Blockers** :

* Aucun - Faisable avec données actuelles

---

## 📋 Session 9 : Tests & Polish MVP

**Durée estimée** : 2-3h

**Objectif** : Finaliser MVP pour démonstration

### Actions

**1. Tests Parcours Complet (1h)**

* [ ] Test end-to-end : Sourcing → Validation → Achat
* [ ] Test calculateur → recherche intégration
* [ ] Test responsive mobile/desktop
* [ ] Test dark/light mode toutes pages

**2. Corrections Bugs (1h)**

* [ ] Fix issues découverts en tests
* [ ] Vérifier loading states partout
* [ ] Vérifier empty states
* [ ] Vérifier messages erreur

**3. Polish Final (1h)**

* [ ] Optimiser images (Next.js Image)
* [ ] Vérifier performance Lighthouse
* [ ] Ajouter meta tags SEO
* [ ] Vérifier accessibilité (ARIA labels)

---

## 📋 Sessions Suivantes (Semaine 2)

### Session 10 : Module Admin - Sites

**Objectif** : Interface gestion sources de scraping

**Fonctionnalités** :

* Liste sites avec status
* Discovery interface
* Configuration scraping
* Trigger scraping manuel

### Session 11 : Module Admin - Tuning

**Objectif** : Interface normalisation données

**Fonctionnalités** :

* Review unknowns terms
* Dictionary management
* LLM suggestions
* Batch approvals

### Session 12 : Enrichissement Données

**Objectif** : Améliorer quality score global

**Actions** :

* Enrichir scrapers (si pas fait Session 8)
* Ajouter nouveaux sites (5-10 sources)
* Améliorer normalisation color (80%+ accuracy)
* Compléter compositions

### Session 13 : Authentification

**Objectif** : Préparer Phase 2

**Actions** :

* Setup Supabase Auth
* Magic link login
* Migration favoris session → user_id
* User profile basique

---

## 🚧 Bloqueurs Potentiels

### Données (Résolu partiellement)

* ✅ ~~Favoris système~~ - **Implémenté Session 7**
* ⚠️ **Width/Weight manquants** → Calculateur sera "estimation"
* ⚠️ **Composition faible** → Limiter info produit

**Action** : Ajouter disclaimers "estimation" dans calculateur

### Technique

* ✅ ~~RLS Supabase~~ - **Résolu Session 7**
* ✅ ~~Optimistic updates~~ - **Implémenté Session 7**
* ⚠️ **Anti-bot protection** → Certains sites bloquent

**Action** : Documenter sites problématiques, rotation IPs Phase 2

---

## 🎯 Critères de Succès MVP Demo

### Fonctionnel (70% ✅)

* ✅ Recherche unifiée fonctionne
* ✅ Filtres appliquent correctement
* ✅ Système favoris complet
* ✅ Détail produit affiche données
* ✅ Navigation fluide entre pages
* ✅ Responsive mobile/desktop
* ⏳ Calculateur donne résultats (Session 8)

### UX (90% ✅)

* ✅ Sidebar parcours visible et claire
* ✅ Design sobre et professionnel
* ✅ Dark mode impeccable
* ✅ Messages d'aide contextuels
* ✅ Loading states (favoris)
* ✅ Empty states informatifs
* ⏳ Animations subtiles (à peaufiner)

### Performance (80% ✅)

* ✅ Pages chargent < 2s
* ✅ Optimistic updates instantanés
* ⚠️ Images optimisées (à vérifier)
* ⚠️ Pas de layout shifts (à tester)
* ✅ Transitions fluides

---

## 📅 Timeline Suggérée

**Semaine 1 (1-7 Jan)** : Frontend MVP Designer

* ✅ Jour 1 : Specs + Design System
* ✅ Jour 2 : Système de Favoris
* ⏳ Jour 3 : Calculateur Métrage
* ⏳ Jour 4 : Tests & Polish
* ⏳ Jour 5 : Corrections + Documentation
* Weekend : Buffer & préparation démo

**Semaine 2 (8-14 Jan)** : Admin + Data Quality

* Module Admin Sites
* Module Admin Tuning
* Enrichissement scrapers
* Tests intégration

**Semaine 3 (15-21 Jan)** : Phase 2 Prep

* Authentification Supabase
* Migration favoris → users
* Projets avec historique
* Mood boards (si temps)

---

## 🎬 Prochaine Action Immédiate

### Session 8 : Démarrer par

**Si Option A (Calculateur)** - Recommandé :

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

**Si Option B (Données)** :

1. **Audit HTML sources**
2. **Améliorer adapters scrapers**
3. **Re-scraping collections validées**
4. **Validation complétude**

---

## 📊 Métriques à Suivre

### Développement

* **Code coverage** : Ajouter tests critiques
* **Build time** : Optimiser si > 30s
* **Bundle size** : Vérifier < 500kb

### Données

* **Products** : 112 → 200+ (semaine 2)
* **Width complétude** : 0% → 60%+
* **Composition** : 6% → 30%+
* **Quality score** : 82% → 85%+

### UX

* **Lighthouse score** : > 90
* **First Contentful Paint** : < 1.5s
* **Time to Interactive** : < 3s

---

## 🎓 Apprentissages Session 7

### Technique

* **React Context + Optimistic Updates** : Pattern parfait pour favoris
* **Server Components + Client Components** : Séparation claire nécessaire
* **RLS + GRANT** : Combinaison essentielle Supabase
* **Session temporaire** : Réduire friction onboarding

### Produit

* **Messages d'aide contextuels** : Critiques pour UX sans doc
* **Empty states** : Opportunités conversion (CTA recherche)
* **Navigation prev/next** : Attendue pour comparaison items

### Process

* **PowerShell limitations** : Éviter template strings complexes
* **Audit DB avant requêtes** : Éviter tâtonnements
* **Documentation progressive** : Session notes pendant dev

---

## 💡 Idées pour Plus Tard

### Features

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

### Monétisation

* [ ] API professionnelle (€49/mois)
* [ ] Projets illimités (€19/mois)
* [ ] Reverse marketplace (commission 5%)
* [ ] White label (€299/mois)

---

**Prêt pour Session 8 !** 🚀

**Décision à prendre** : Option A (Calculateur) ou Option B (Données) ?

**Recommandation** : **Option A** - Complète le parcours MVP essentiel
