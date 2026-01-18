
# SPRINT PLAN - Canvas Improvements (Zoom, Pan, Auto-arrange, Performance)

**Version** : 2.0

**Date** : 17 Janvier 2026

**Contexte** : Post-MVP Phase 1, amélioration UX BoardCanvas

**Auteur** : Thomas / Claude

---

## Table des Matières

1. [Vue d&#39;Ensemble](https://claude.ai/chat/d5b66da0-9bfc-476e-8fd0-bdd18e3843ed#vue-densemble)
2. [Diagnostic Performance Actuel](https://claude.ai/chat/d5b66da0-9bfc-476e-8fd0-bdd18e3843ed#diagnostic-performance-actuel)
3. [Sprint P0 : Performance Fondations](https://claude.ai/chat/d5b66da0-9bfc-476e-8fd0-bdd18e3843ed#sprint-p0--performance-fondations) ✅ **TERMINÉ**
4. [Sprint P1 : Zoom &amp; Pan](https://claude.ai/chat/d5b66da0-9bfc-476e-8fd0-bdd18e3843ed#sprint-p1--zoom--pan) ✅ **TERMINÉ**
5. [Sprint P2 : Auto-Arrange](https://claude.ai/chat/d5b66da0-9bfc-476e-8fd0-bdd18e3843ed#sprint-p2--auto-arrange) ✅ **TERMINÉ**
6. [Sprint P3 : Outils de Visualisation](https://claude.ai/chat/d5b66da0-9bfc-476e-8fd0-bdd18e3843ed#sprint-p3--outils-de-visualisation)
7. [Récapitulatif et Priorisation](https://claude.ai/chat/d5b66da0-9bfc-476e-8fd0-bdd18e3843ed#r%C3%A9capitulatif-et-priorisation)
8. [Annexes](https://claude.ai/chat/d5b66da0-9bfc-476e-8fd0-bdd18e3843ed#annexes)

---

## Vue d'Ensemble

### Objectifs

Améliorer l'expérience utilisateur du BoardCanvas pour :

1. **Performance** : Garantir 60fps avec 50-100 éléments ✅
2. **Navigation** : Zoom infini et pan fluide ✅
3. **Organisation** : Auto-arrangement par phase Journey ✅
4. **Visualisation** : Outils d'aide à la navigation et l'organisation

### Architecture Actuelle

```
BoardCanvas.tsx
├── BoardToolbar.tsx          # Outils création + bouton Auto-arrange ✅
├── ZoomControls.tsx          # Contrôles zoom (bas droite) ✅
├── PhaseColumns.tsx          # Colonnes visuelles de phase ✅ NEW
├── AutoArrangeDialog.tsx     # Dialog configuration arrangement ✅ NEW
├── ZoneCard.tsx              # Zones - React.memo + style prop ✅
├── ElementCard.tsx           # Éléments - React.memo + style prop ✅
│   └── elements/
│       ├── PaletteElement.tsx    - React.memo ✅
│       ├── ImageElement.tsx      - React.memo ✅
│       ├── VideoElement.tsx      - React.memo ✅
│       ├── LinkElement.tsx       - React.memo ✅
│       ├── PdfElement.tsx        - React.memo ✅
│       ├── PatternElement.tsx    - React.memo ✅
│       └── SilhouetteElement.tsx - React.memo ✅
├── canvas/
│   └── hooks/
│       ├── useElementDrag.ts     # + scale support ✅
│       ├── useZoneDrag.ts        # Ghost Mode + scale ✅
│       ├── useZoneResize.ts      # + scale support ✅
│       └── useKeyboardShortcuts.ts
├── context/
│   └── TransformContext.tsx      # Zoom state + persistence ✅
├── utils/
│   └── autoArrange.ts            # Algorithme layout par phase ✅ NEW
└── ContextualSearchPanel.tsx
```

### État Actuel du Canvas

| Aspect                   | Implémentation                           |
| ------------------------ | ----------------------------------------- |
| **Performance**    | ✅ Optimisée (memo + ghost mode)         |
| **Zoom**           | ✅ Ctrl+Scroll (25%-300%) + UI contrôles |
| **Pan**            | ✅ Scroll natif + Space+Drag              |
| **Organisation**   | ✅ Auto-arrange par phase + colonnes      |
| **Limites canvas** | Dynamiques (max positions + 100px)        |

---

## Diagnostic Performance Actuel

### Analyse des Composants (Post-P0)

| Composant          | Lignes | React.memo | Hook contexte                  | Risque perf |
| ------------------ | ------ | ---------- | ------------------------------ | ----------- |
| `ElementCard`    | ~350   | ✅ Oui     | ✅`useContextualSearchPanel` | 🟢 Faible   |
| `ZoneCard`       | ~230   | ✅ Oui     | ❌ Non                         | 🟢 Faible   |
| `PaletteElement` | ~60    | ✅ Oui     | ❌ Non                         | 🟢 Faible   |
| `ImageElement`   | ~40    | ✅ Oui     | ❌ Non                         | 🟢 Faible   |
| Autres elements/   | ~40-80 | ✅ Oui     | ❌ Non                         | 🟢 Faible   |

### Problèmes Résolus ✅

#### 1. ~~Absence de mémoïsation~~ → Résolu P0.1-P0.3

Tous les composants sont maintenant wrappés avec `React.memo`.

#### 2. ~~Drag de zone avec éléments~~ → Résolu P0.4 (Ghost Mode)

Les éléments sont masqués pendant le drag, évitant les re-renders massifs.

**Impact** : Zone avec 20 éléments = **1 render** au lieu de 1200 re-renders/seconde

---

## Sprint P0 : Performance Fondations ✅ TERMINÉ

**Durée réelle** : ~2h

**Date** : 17 Janvier 2026

### P0.1 - React.memo sur ElementCard ✅

### P0.2 - React.memo sur ZoneCard ✅

### P0.3 - React.memo sur éléments enfants ✅

Fichiers modifiés :

* `PaletteElement.tsx`
* `ImageElement.tsx`
* `VideoElement.tsx`
* `LinkElement.tsx`
* `PdfElement.tsx`
* `PatternElement.tsx`
* `SilhouetteElement.tsx`

### P0.4 - Ghost Mode pour drag de zone ✅

**Fichiers modifiés** :

* `useZoneDrag.ts` : Ajout de `draggingZoneId`, `draggingElementIds`, `draggingElementCount`
* `BoardCanvas.tsx` : Masquage des éléments pendant le drag
* `ZoneCard.tsx` : Props `isDragging` et `ghostElementCount`, affichage visuel

**Comportement** :

* Bordure bleue pointillée pendant le drag
* Badge central "X éléments"
* Éléments réapparaissent au relâchement

---

## Sprint P1 : Zoom & Pan ✅ TERMINÉ

**Durée réelle** : ~4h

**Date** : 17 Janvier 2026

### Architecture implémentée

**Approche** : Scroll natif (`overflow-auto`) conservé + CSS `transform` pour le zoom.

| Aspect                | Implémentation           | Status |
| --------------------- | ------------------------- | ------ |
| **Zoom**        | CSS transform scale()     | ✅     |
| **Pan**         | Scroll natif + Space+Drag | ✅     |
| **Persistence** | localStorage par boardId  | ✅     |
| **Zoom to Fit** | Calcul bounds dynamique   | ✅     |

---

### P1.1 - Transform Context + Persistence ✅

**Fichiers créés** :

* `src/features/boards/context/TransformContext.tsx`

**Fonctionnalités** :

* State: `{ scale, offsetX, offsetY }`
* Actions: `zoomIn`, `zoomOut`, `resetZoom`, `setScale`, `zoomToFit`
* Limites: 25% - 300%
* Persistence localStorage avec debounce 300ms
* Clé: `deadstock_zoom_{boardId}`

---

### P1.2 - Zoom avec Ctrl+Scroll ✅

**Fichier modifié** : `BoardCanvas.tsx`

**Implémentation** :

* Event listener `wheel` avec `passive: false`
* Détection Ctrl/Cmd pour différencier zoom vs scroll
* Zoom par paliers de 10%
* Wrapper contenu avec `transform: scale()`

**Comportement** :

* `Ctrl + Scroll Up` → Zoom in
* `Ctrl + Scroll Down` → Zoom out
* Scroll normal fonctionne toujours

---

### P1.3a - UI Contrôles Zoom + Zoom to Fit ✅

**Fichier créé** : `src/features/boards/components/ZoomControls.tsx`

**Design** :

```
┌─────────────────────────────────────────────────────────┐
│ Canvas                                                  │
│                                                         │
│                                                         │
│                                    ┌─────────────────┐  │
│                                    │ [-] 100% [+] │⛶│  │
│                                    └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Fonctionnalités** :

* Boutons +/- pour zoom in/out
* Pourcentage cliquable → dropdown avec presets (25%, 50%, 75%, 100%, 125%, 150%, 200%, 300%)
* Bouton Maximize → Zoom to Fit (ajuste pour voir tout le contenu)
* Raccourcis: `Ctrl+0` (reset 100%), `Ctrl+1` (fit)

---

### P1.4 - Pan Space+Drag ✅

**Fichier modifié** : `BoardCanvas.tsx`

**Implémentation** :

* État `isPanMode` activé par touche Space
* Curseur `grab` / `grabbing` selon état
* Scroll du canvas via manipulation `scrollLeft`/`scrollTop`

**Comportement** :

* `Space` → Curseur main ouverte
* `Space + Drag` → Pan du canvas, curseur main fermée
* Relâcher Space → Retour au mode normal
* Inputs texte non affectés

---

### P1.5 - Adaptation coordonnées ✅

**Fichiers modifiés** :

* `useElementDrag.ts` : Ajout prop `scale`, division des deltas
* `useZoneDrag.ts` : Ajout prop `scale`, division des deltas
* `useZoneResize.ts` : Ajout prop `scale`, division des deltas
* `BoardCanvas.tsx` : Passage de `transform.scale` aux hooks

**Principe** :

```typescript
// Diviser par scale pour compenser le zoom
const dx = (e.clientX - startX) / scale;
const dy = (e.clientY - startY) / scale;
```

---

### Résumé P1 ✅

| Tâche | Durée | Status       | Description                               |
| ------ | ------ | ------------ | ----------------------------------------- |
| P1.1   | 1h     | ✅           | Transform Context + localStorage          |
| P1.2   | 1h     | ✅           | Zoom Ctrl+Scroll                          |
| P1.3a  | 1h     | ✅           | UI Contrôles + Zoom to Fit               |
| P1.4   | 30min  | ✅           | Pan Space+Drag                            |
| P1.5   | 30min  | ✅           | Adaptation coordonnées                   |
| P1.6   | -      | ⏭️ Skipped | Pan custom avec inertie (non nécessaire) |

**Total réel** : ~4h

### Critères de validation P1 ✅

* [X] Ctrl+Scroll zoome/dézoome
* [X] Boutons +/- fonctionnels
* [X] Pourcentage affiché et cliquable
* [X] Bouton Fit fonctionne
* [X] Ctrl+0 → 100%, Ctrl+1 → Fit
* [X] Space+Drag pour pan
* [X] Curseur change en main pendant pan
* [X] Drag d'éléments fonctionne avec zoom (à améliorer)
* [X] Resize de zone fonctionne avec zoom (à améliorer)
* [X] Zoom persisté en localStorage
* [X] Pas de régression sur Ghost Mode

---

## Sprint P2 : Auto-Arrange ✅ TERMINÉ

**Durée réelle** : ~3h

**Date** : 17 Janvier 2026

### Objectif

Permettre aux utilisateurs de ranger automatiquement les éléments du board par phase Journey, avec colonnes visuelles de délimitation.

---

### P2.1 - Algorithme de layout par phase ✅

**Fichier créé** : `src/features/boards/utils/autoArrange.ts`

#### Mapping ElementType → Phase

```typescript
const ELEMENT_TO_PHASE: Record<ElementType, PhaseId> = {
  // Mood
  inspiration: 'mood',
  palette: 'mood',
  silhouette: 'mood',
  video: 'mood',
  link: 'mood',
  pdf: 'mood',
  note: 'mood',
  
  // Conception
  pattern: 'conception',
  calculation: 'conception',
  textile: 'conception',
};
```

#### Fonctions exportées

* `autoArrangeByPhase(elements, zones, options)` → `ArrangeResult`
* `getArrangePreview(elements, zones)` → `PhasePreview[]`
* `countMovableItems(elements, zones)` → compteurs
* `calculatePhaseBounds(result, elements, zones, options)` → `PhaseBounds[]`

#### Comportement

* Les éléments **libres** sont groupés par phase (Mood → Conception)
* Les **zones** vont dans la phase "Exécution"
* Les éléments **dans une zone** ne bougent pas individuellement mais suivent leur zone
* Layout en colonnes verticales avec passage à nouvelle colonne si >12 éléments

---

### P2.2 - Dialog de confirmation ✅

**Fichier créé** : `src/features/boards/components/AutoArrangeDialog.tsx`

```
┌─────────────────────────────────────────┐
│ 🗂️ Ranger automatiquement              │
├─────────────────────────────────────────┤
│                                         │
│  Les éléments seront organisés par      │
│  phase : Mood → Conception → Exécution  │
│                                         │
│  📊 Aperçu :                            │
│  🎨 Mood         - 5 éléments           │
│  📐 Conception   - 3 éléments           │
│  🚀 Exécution    - 2 zones              │
│                                         │
│  Espacement vertical : [────●────] 24px │
│  Espacement phases :   [────●────] 100px│
│                                         │
│  ☑ Afficher les colonnes de phase      │
│                                         │
│           [Annuler]  [Ranger]           │
└─────────────────────────────────────────┘
```

**Fonctionnalités** :

* Aperçu coloré par phase avec compteurs
* Slider espacement vertical (12-48px)
* Slider espacement entre phases (50-200px)
* Checkbox pour afficher les colonnes de phase
* Message si rien à ranger

---

### P2.3 - Animation de transition ✅

**Fichier modifié** : `BoardCanvas.tsx`

**Implémentation** :

* État `isArranging` et `arrangeTargets` (Map des positions cibles)
* Prop `style` ajoutée à `ElementCard` et `ZoneCard`
* Transition CSS de 500ms sur `left` et `top`
* Les éléments dans une zone suivent le déplacement de leur zone

```typescript
style={isArranging && arrangeTarget ? {
  transition: 'left 0.5s ease-out, top 0.5s ease-out',
} : undefined}
```

---

### P2.4 - Bouton dans toolbar ✅

**Fichier modifié** : `BoardToolbar.tsx`

* Import `AlignLeft` de lucide-react
* Nouvelle prop `onAutoArrange?: () => void`
* Bouton placé après la recherche contextuelle

---

### P2.5 - Colonnes visuelles de phase ✅

**Fichier créé** : `src/features/boards/components/PhaseColumns.tsx`

**Design** :

```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│ │ 🎨 Mood      │ │ 📐 Conception│ │ 🚀 Exécution           │ │
│ │   5 éléments │ │   3 éléments │ │   2 zones              │ │
│ ├──────────────┤ ├──────────────┤ ├────────────────────────┤ │
│ │ (violet)     │ │ (bleu)       │ │ (vert)                 │ │
│ │              │ │              │ │                        │ │
│ │  [palette]   │ │  [textile]   │ │  ┌─────────────┐       │ │
│ │  [image]     │ │  [calcul]    │ │  │   Zone 1    │       │ │
│ │  [video]     │ │  [pattern]   │ │  └─────────────┘       │ │
│ │              │ │              │ │                        │ │
│ └──────────────┘ └──────────────┘ └────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Fonctionnalités** :

* Colonnes de fond semi-transparentes colorées par phase
* Header sticky avec icône, nom de phase et compteur
* Visible uniquement en **Mode Projet** et si checkbox cochée
* Calculé dynamiquement après chaque arrangement

---

### P2.6 - Slider espacement phases ✅

**Fichier modifié** : `AutoArrangeDialog.tsx`

* Nouveau slider `phaseSpacing` (50-200px, step 10)
* Passé à `autoArrangeByPhase` via options

---

### Résumé P2 ✅

| Tâche | Durée | Status | Description                         |
| ------ | ------ | ------ | ----------------------------------- |
| P2.1   | 1h     | ✅     | Algorithme layout par phase         |
| P2.2   | 30min  | ✅     | Dialog de confirmation avec aperçu |
| P2.3   | 30min  | ✅     | Animation de transition             |
| P2.4   | 15min  | ✅     | Bouton dans toolbar                 |
| P2.5   | 30min  | ✅     | Colonnes visuelles de phase         |
| P2.6   | 15min  | ✅     | Slider espacement phases            |

**Total réel** : ~3h

### Critères de validation P2 ✅

* [X] Bouton "Ranger" dans la toolbar
* [X] Dialog de confirmation avec aperçu par phase
* [X] Slider espacement vertical fonctionnel
* [X] Slider espacement entre phases fonctionnel
* [X] Checkbox colonnes de phase
* [X] Éléments Mood groupés à gauche
* [X] Éléments Conception groupés au centre
* [X] Zones dans Exécution à droite
* [X] Éléments dans une zone restent dans la zone (position relative)
* [X] Animation fluide de transition (500ms)
* [X] Colonnes colorées visibles en Mode Projet
* [X] Positions sauvegardées en DB après arrangement
* [X] Toast de confirmation

---

## Sprint P3 : Outils de Visualisation

**Durée estimée** : 4-6h

**Prérequis** : P1 ✅

**Priorité** : P3

### P3.1 - Minimap

**Durée** : 2h

**Fichier** : `src/features/boards/components/Minimap.tsx` (nouveau)

Vue miniature du canvas entier avec rectangle viewport.

### P3.2 - Navigation rapide vers zone

**Durée** : 1h

**Fichier** : `src/features/boards/components/ZoneNavigator.tsx` (nouveau)

Dropdown "Aller à..." avec liste des zones et phases.

### P3.3 - Guides d'alignement

**Durée** : 2h

**Fichier** : `src/features/boards/components/AlignmentGuides.tsx` (nouveau)

Lignes d'aide à l'alignement pendant le drag.

### P3.4 - Recherche sur board

**Durée** : 1h

**Fichier** : `src/features/boards/components/BoardSearch.tsx` (nouveau)

Ctrl+F pour chercher un élément par nom/contenu.

---

## Récapitulatif et Priorisation

### Vue d'ensemble des sprints

| Sprint                       | Durée | Priorité | Status               |
| ---------------------------- | ------ | --------- | -------------------- |
| **P0 : Performance**   | 2h     | P0        | ✅**TERMINÉ** |
| **P1 : Zoom & Pan**    | 4h     | P1        | ✅**TERMINÉ** |
| **P2 : Auto-Arrange**  | 3h     | P2        | ✅**TERMINÉ** |
| **P3 : Visualisation** | 4-6h   | P3        | ⏳ Planifié         |

### Ordre d'exécution

```
✅ Fait :
├── P0 : Performance (2h)
├── P1 : Zoom & Pan (4h)
└── P2 : Auto-Arrange (3h)

⏳ Planifié :
└── P3 : Visualisation (4-6h)
```

### Dépendances

```
P0 Performance ✅ ──┬──────────────────────────────────┐
                    │                                  │
                    ▼                                  ▼
             P1 Zoom/Pan ✅                    P2 Auto-Arrange ✅
                    │
                    ▼
             P3 Visualisation
```

---

## Annexes

### A. Raccourcis clavier

| Raccourci               | Action                         | Status      |
| ----------------------- | ------------------------------ | ----------- |
| `Suppr`/`Backspace` | Supprimer sélection           | ✅ Existant |
| `Escape`              | Fermer modal / Déselectionner | ✅ Existant |
| `Ctrl+Scroll`         | Zoom                           | ✅ P1.2     |
| `Space+Drag`          | Pan                            | ✅ P1.4     |
| `Ctrl+0`              | Zoom 100%                      | ✅ P1.3a    |
| `Ctrl+1`              | Zoom to fit                    | ✅ P1.3a    |
| `Ctrl+F`              | Recherche                      | ⏳ P3.4     |

### B. localStorage keys

| Clé                         | Valeur                          | Status  |
| ---------------------------- | ------------------------------- | ------- |
| `deadstock_zoom_{boardId}` | `{ scale, offsetX, offsetY }` | ✅ P1.1 |

### C. Fichiers créés/modifiés Sprint P2

**Fichiers créés :**

* `src/features/boards/utils/autoArrange.ts`
* `src/features/boards/components/AutoArrangeDialog.tsx`
* `src/features/boards/components/PhaseColumns.tsx`

**Fichiers modifiés :**

* `src/features/boards/components/BoardCanvas.tsx`
* `src/features/boards/components/BoardToolbar.tsx`
* `src/features/boards/components/ElementCard.tsx`
* `src/features/boards/components/ZoneCard.tsx`

### D. Statuts de zone/projet

```typescript
type ProjectStatus =
  | 'draft'
  | 'in_progress'
  | 'ordered'
  | 'shipped'
  | 'received'
  | 'in_production'
  | 'completed'
  | 'archived';
```

---

## Améliorations futures (backlog)

| Item                    | Description                                     | Priorité |
| ----------------------- | ----------------------------------------------- | --------- |
| Zoom centré curseur    | Le zoom se centre sur la position du curseur    | Basse     |
| Améliorer suivi souris | Meilleure réactivité du drag avec zoom        | Moyenne   |
| Pan avec inertie        | Effet de glissement après relâchement         | Basse     |
| Re-arrangement partiel  | Ranger uniquement les éléments sélectionnés | Moyenne   |
| Sauvegarde layout       | Mémoriser les bounds de phase par board        | Basse     |

---

## Changelog

| Version | Date       | Modifications                                                                                                                |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 17/01/2026 | Création initiale                                                                                                           |
| 1.1     | 17/01/2026 | P0 terminé                                                                                                                  |
| 1.2     | 17/01/2026 | P1 révisé : persistence localStorage, P1.6 optionnel documenté, Zoom to Fit simplifié                                    |
| 1.3     | 17/01/2026 | **P1 terminé** : TransformContext, Ctrl+Scroll zoom, ZoomControls UI, Space+Drag pan, coordonnées zoom-aware         |
| 2.0     | 17/01/2026 | **P2 terminé** : Auto-arrange par phase, dialog avec sliders, animation, colonnes visuelles, éléments suivent zones |
