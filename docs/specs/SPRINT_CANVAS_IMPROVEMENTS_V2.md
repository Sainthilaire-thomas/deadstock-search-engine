
# SPRINT PLAN - Canvas Improvements (Zoom, Pan, Auto-arrange, Performance)

**Version** : 1.3

**Date** : 17 Janvier 2026

**Contexte** : Post-MVP Phase 1, amélioration UX BoardCanvas

**Auteur** : Thomas / Claude

---

## Table des Matières

1. [Vue d&#39;Ensemble](https://claude.ai/chat/c5264fda-02c0-4a97-ad4d-8c06d2e2b344#vue-densemble)
2. [Diagnostic Performance Actuel](https://claude.ai/chat/c5264fda-02c0-4a97-ad4d-8c06d2e2b344#diagnostic-performance-actuel)
3. [Sprint P0 : Performance Fondations](https://claude.ai/chat/c5264fda-02c0-4a97-ad4d-8c06d2e2b344#sprint-p0--performance-fondations) ✅ **TERMINÉ**
4. [Sprint P1 : Zoom &amp; Pan](https://claude.ai/chat/c5264fda-02c0-4a97-ad4d-8c06d2e2b344#sprint-p1--zoom--pan) ✅ **TERMINÉ**
5. [Sprint P2 : Auto-Arrange](https://claude.ai/chat/c5264fda-02c0-4a97-ad4d-8c06d2e2b344#sprint-p2--auto-arrange)
6. [Sprint P3 : Outils de Visualisation](https://claude.ai/chat/c5264fda-02c0-4a97-ad4d-8c06d2e2b344#sprint-p3--outils-de-visualisation)
7. [Récapitulatif et Priorisation](https://claude.ai/chat/c5264fda-02c0-4a97-ad4d-8c06d2e2b344#r%C3%A9capitulatif-et-priorisation)
8. [Annexes](https://claude.ai/chat/c5264fda-02c0-4a97-ad4d-8c06d2e2b344#annexes)

---

## Vue d'Ensemble

### Objectifs

Améliorer l'expérience utilisateur du BoardCanvas pour :

1. **Performance** : Garantir 60fps avec 50-100 éléments ✅
2. **Navigation** : Zoom infini et pan fluide ✅
3. **Organisation** : Auto-arrangement par phase Journey
4. **Visualisation** : Outils d'aide à la navigation et l'organisation

### Architecture Actuelle

```
BoardCanvas.tsx
├── BoardToolbar.tsx          # Outils création (gauche)
├── ZoomControls.tsx          # Contrôles zoom (bas droite) ✅ NEW
├── ZoneCard.tsx              # Zones (cristallisées ou non) - React.memo ✅
├── ElementCard.tsx           # Éléments (tous types) - React.memo ✅
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
│   └── TransformContext.tsx      # Zoom state + persistence ✅ NEW
└── ContextualSearchPanel.tsx
```

### État Actuel du Canvas

| Aspect                   | Implémentation actuelle                  |
| ------------------------ | ----------------------------------------- |
| **Performance**    | ✅ Optimisée (memo + ghost mode)         |
| **Zoom**           | ✅ Ctrl+Scroll (25%-300%) + UI contrôles |
| **Pan**            | ✅ Scroll natif + Space+Drag              |
| **Organisation**   | Manuelle uniquement (drag & drop)         |
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

**Note** : Le suivi de la souris peut être légèrement amélioré dans une future itération.

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

## Sprint P2 : Auto-Arrange

**Durée estimée** : 4-6h

**Prérequis** : P0 ✅

**Priorité** : P2

### Objectif

Permettre aux utilisateurs de ranger automatiquement les éléments du board par phase Journey.

### P2.1 - Algorithme de layout par phase

**Durée** : 2h

**Fichier** : `src/features/boards/utils/autoArrange.ts` (nouveau)

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

#### Algorithme

```typescript
interface ArrangeOptions {
  spacing: number;        // Espacement entre éléments (défaut: 24px)
  phaseSpacing: number;   // Espacement entre phases (défaut: 100px)
  startX: number;         // Position X de départ
  startY: number;         // Position Y de départ
}

interface ArrangeResult {
  elementMoves: Array<{ id: string; x: number; y: number }>;
  zoneMoves: Array<{ id: string; x: number; y: number }>;
}

function autoArrangeByPhase(
  elements: BoardElement[],
  zones: BoardZone[],
  options: ArrangeOptions
): ArrangeResult {
  // 1. Grouper les éléments libres par phase
  // 2. Pour chaque phase, layout en grille
  // 3. Les zones vont dans "Exécution"
  // 4. Les éléments DANS une zone ne bougent pas (positions relatives)
}
```

### P2.2 - Dialog de confirmation

**Durée** : 1h

**Fichier** : `src/features/boards/components/AutoArrangeDialog.tsx` (nouveau)

```
┌─────────────────────────────────────────┐
│ 🗂️ Ranger automatiquement              │
├─────────────────────────────────────────┤
│                                         │
│  Les éléments seront organisés par      │
│  phase : Mood → Conception → Exécution  │
│                                         │
│  📊 Aperçu :                            │
│  • 5 éléments Mood                      │
│  • 3 éléments Conception                │
│  • 2 zones Exécution                    │
│                                         │
│  Espacement : [────●────] 24px          │
│                                         │
│           [Annuler]  [Ranger]           │
└─────────────────────────────────────────┘
```

### P2.3 - Animation de transition

**Durée** : 1h

**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

```typescript
const [isArranging, setIsArranging] = useState(false);
const [arrangeTargets, setArrangeTargets] = useState<Map<string, {x: number, y: number}>>();

// Pendant l'animation, utiliser les positions cibles avec transition CSS
style={{
  left: isArranging && arrangeTargets?.get(element.id) 
    ? arrangeTargets.get(element.id)!.x 
    : element.positionX,
  top: isArranging && arrangeTargets?.get(element.id)
    ? arrangeTargets.get(element.id)!.y
    : element.positionY,
  transition: isArranging ? 'left 0.5s ease-out, top 0.5s ease-out' : 'none',
}}
```

### P2.4 - Bouton dans toolbar

**Durée** : 30min

Ajouter un bouton "Ranger" dans `BoardToolbar.tsx`.

### Critères de validation P2

* [ ] Bouton "Ranger" dans la toolbar
* [ ] Dialog de confirmation avec aperçu
* [ ] Éléments Mood groupés à gauche
* [ ] Éléments Conception groupés au centre
* [ ] Zones dans Exécution à droite
* [ ] Éléments dans une zone restent dans la zone
* [ ] Animation fluide de transition
* [ ] Positions sauvegardées en DB après arrangement

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
| **P2 : Auto-Arrange**  | 4-6h   | P2        | ⏳ Planifié         |
| **P3 : Visualisation** | 4-6h   | P3        | ⏳ Planifié         |

### Détail P1 ✅

| Tâche                 | Durée | Status       |
| ---------------------- | ------ | ------------ |
| P1.1 Transform Context | 1h     | ✅           |
| P1.2 Zoom Ctrl+Scroll  | 1h     | ✅           |
| P1.3a UI + Fit         | 1h     | ✅           |
| P1.4 Pan Space+Drag    | 30min  | ✅           |
| P1.5 Coordonnées      | 30min  | ✅           |
| P1.6 Pan custom (opt)  | -      | ⏭️ Skipped |

### Ordre d'exécution

```
✅ Fait :
├── P0 : Performance (2h)
└── P1 : Zoom & Pan (4h)

⏳ Planifié :
├── P2 : Auto-Arrange (4-6h)
└── P3 : Visualisation (4-6h)
```

### Dépendances

```
P0 Performance ✅ ──┬──────────────────────────────────┐
                    │                                  │
                    ▼                                  ▼
             P1 Zoom/Pan ✅                    P2 Auto-Arrange
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

### C. Statuts de zone/projet

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

| Item                    | Description                                  | Priorité |
| ----------------------- | -------------------------------------------- | --------- |
| Zoom centré curseur    | Le zoom se centre sur la position du curseur | Basse     |
| Améliorer suivi souris | Meilleure réactivité du drag avec zoom     | Moyenne   |
| Pan avec inertie        | Effet de glissement après relâchement      | Basse     |

---

## Changelog

| Version | Date       | Modifications                                                                                                       |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 17/01/2026 | Création initiale                                                                                                  |
| 1.1     | 17/01/2026 | P0 terminé                                                                                                         |
| 1.2     | 17/01/2026 | P1 révisé : persistence localStorage, P1.6 optionnel documenté, Zoom to Fit simplifié                           |
| 1.3     | 17/01/2026 | **P1 terminé**: TransformContext, Ctrl+Scroll zoom, ZoomControls UI, Space+Drag pan, coordonnées zoom-aware |
