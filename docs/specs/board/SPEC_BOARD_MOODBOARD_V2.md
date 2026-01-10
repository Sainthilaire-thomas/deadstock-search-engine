# SPEC_BOARD_MOODBOARD_V2 - Board Épuré & Mode Projet

**Version:** 2.0  
**Date:** 09/01/2026  
**Statut:** Validé  
**Phase:** 1.5 - UX Refinement

---

## 1. Vision

### 1.1 Concept Unifié

> **Un seul concept : le Board**
> 
> Le Board est un espace de travail visuel où l'utilisateur accumule, organise et fait mûrir ses idées créatives. Il sert à la fois de **moodboard** (inspiration) et d'**espace projet** (réalisation).

### 1.2 Philosophie Design

Inspiré de **Milanote** : sobre, carré, professionnel.

| Principe | Application |
|----------|-------------|
| **Minimalisme** | Icônes outline, pas de couleurs vives |
| **Espace** | Canvas généreux, sidebar étroite |
| **Discrétion** | Zones invisibles par défaut |
| **Profondeur** | Détails au survol, pas en permanence |

### 1.3 Différenciation Deadstock

```
MILANOTE                          DEADSTOCK
─────────────────────────         ─────────────────────────
Moodboard générique               Moodboard + Sourcing intégré
                                  
📷 Images                         📷 Images
🎨 Palettes                       🎨 Palettes (extraction auto)
📝 Notes                          📝 Notes
🔗 Liens                          🔗 Liens web
                                  
                                  + 🧵 Tissus (prix, dispo, source)
                                  + 📐 Calcul métrage
                                  + ✂️ Patron
                                  + ⚡ Cristallisation → Projet
```

---

## 2. Architecture UX

### 2.1 Deux Modes de Vue

```
[👁 Inspiration]  [📋 Projet]     ← Toggle dans la toolbar

MODE INSPIRATION (défaut)              MODE PROJET
─────────────────────────────          ─────────────────────────────
┌─────────────────────────────┐        ┌─────────────────────────────┐
│                             │        │                             │
│   📷  📷  🎨  📷            │        │   📷  📷  🎨  📷            │
│      🎬  📷     🧵          │        │      🎬  📷     🧵          │
│   📷     🧵  📷             │        │   📷     🧵  📷             │
│      📐  📝                 │   →    │      📐  📝                 │
│                             │  [📋]  │                             │
│  Éléments libres            │        │  ┌ ─ ─ ─ ─ ─ ┐ ┌ ─ ─ ─ ─ ─ ┐│
│  Pas de zones visibles      │        │  │ + Veste    │ │ + Chemise │││
│  Focus : ambiance globale   │        │  └ ─ ─ ─ ─ ─ ┘ └ ─ ─ ─ ─ ─ ┘│
│                             │        │  Zones apparaissent         │
│                             │        │  Drag & drop pour grouper   │
└─────────────────────────────┘        └─────────────────────────────┘
```

### 2.2 Layout Épuré

```
AVANT (actuel)                        APRÈS (cible)
─────────────────────────────         ─────────────────────────────
┌──────────┬─────────────────┐        ┌────┬────────────────────────┐
│          │                 │        │    │                        │
│  MENU    │                 │        │ 📷 │                        │
│  large   │     Board       │        │ 🎬 │        Board           │
│  ~200px  │                 │        │ 🧵 │                        │
│          │                 │        │ 🎨 │       (canvas)         │
│  Texte + │                 │        │ 📐 │                        │
│  icônes  │                 │        │ 📝 │                        │
│          │                 │        │ ── │                        │
│          │                 │        │ 👁 │ ← Toggle vue           │
└──────────┴─────────────────┘        └────┴────────────────────────┘
   ~200px                               ~48px (icônes seulement)
```

### 2.3 Sidebar Gauche (48px)

Icônes **Lucide React**, style outline, monochrome.

| Icône | Tooltip | Action |
|-------|---------|--------|
| `Image` | Photo | Ajouter image (upload/URL) |
| `Video` | Vidéo | Ajouter vidéo (upload/embed) |
| `Shirt` | Tissu | Ajouter depuis favoris |
| `Palette` | Palette | Créer palette |
| `Ruler` | Calcul | Calculateur métrage |
| `StickyNote` | Note | Ajouter note texte |
| `Link` | Lien | Ajouter lien web |
| `FileText` | PDF | Ajouter PDF |
| `Scissors` | Patron | Ajouter patron |
| `User` | Silhouette | Ajouter silhouette |
| --- | --- | Séparateur |
| `Eye` / `Layout` | Mode | Toggle Inspiration/Projet |
| `Square` | Zone | Créer zone (mode projet) |

---

## 3. Types d'Éléments

### 3.1 Catalogue Complet

| Type | Icône | Sources | Affichage | Survol |
|------|-------|---------|-----------|--------|
| **Photo** | `Image` | Upload, URL, Clipboard | Miniature | Agrandie |
| **Vidéo** | `Video` | Upload, YouTube, Vimeo | Miniature + ▶ | Preview |
| **Tissu** | `Shirt` | Favoris Deadstock | Card 80x100 | Prix, dispo |
| **Palette** | `Palette` | Création, extraction | Swatches 5 couleurs | Noms hex |
| **Calcul** | `Ruler` | Calculateur intégré | Résumé 1 ligne | Détail complet |
| **Note** | `StickyNote` | Création | Texte tronqué | Texte complet |
| **Lien Web** | `Link` | URL | Card titre + image | Preview site |
| **PDF** | `FileText` | Upload | Miniature page 1 | Pages navigables |
| **Patron** | `Scissors` | Upload (PDF/image) | Miniature | Schéma agrandi |
| **Silhouette** | `User` | Upload, bibliothèque | Miniature | Agrandie |

### 3.2 Structure de Données (existante, étendue)

```typescript
// board_elements.element_type
type ElementType = 
  | 'textile'      // Existant ✅
  | 'palette'      // Existant ✅
  | 'inspiration'  // Existant ✅ → renommer 'image'
  | 'calculation'  // Existant ✅
  | 'note'         // Existant ✅
  | 'video'        // Nouveau 🆕
  | 'link'         // Nouveau 🆕
  | 'pdf'          // Nouveau 🆕
  | 'pattern'      // Nouveau 🆕
  | 'silhouette';  // Nouveau 🆕

// board_elements.element_data (JSONB)
interface ImageElementData {
  url: string;
  caption?: string;
  source?: string;  // URL origine si web
}

interface VideoElementData {
  type: 'upload' | 'youtube' | 'vimeo';
  url: string;
  thumbnail?: string;
  title?: string;
}

interface LinkElementData {
  url: string;
  title?: string;
  description?: string;
  image?: string;  // og:image
  favicon?: string;
}

interface PdfElementData {
  url: string;  // URL stockage
  filename: string;
  pageCount: number;
  thumbnail?: string;  // Page 1 en image
}

interface PatternElementData {
  url: string;
  name?: string;
  type?: 'pdf' | 'image';
  pageCount?: number;
}

interface SilhouetteElementData {
  url: string;
  name?: string;
  source?: 'upload' | 'library';
}
```

### 3.3 Affichage Compact avec Preview au Survol

```
ÉTAT NORMAL (60-100px)              SURVOL (200-400px tooltip)
───────────────────────              ───────────────────────────────
┌───────────┐                        ┌───────────┐ ┌─────────────────┐
│ 📄        │                        │ 📄        │ │                 │
│ patron    │          →             │ patron    │ │   PREVIEW       │
│ robe.pdf  │                        │ robe.pdf  │ │   PDF page 1    │
│ 3 pages   │                        │ 3 pages   │ │                 │
└───────────┘                        └───────────┘ └─────────────────┘
```

---

## 4. Zones - Mode Projet

### 4.1 Comportement des Zones

| Mode | Zones | Style |
|------|-------|-------|
| **Inspiration** | Invisibles | - |
| **Projet** | Visibles | Bordure pointillée grise, pas de fond |

### 4.2 Style Zones (Mode Projet)

```css
/* Zone discrète */
.zone {
  border: 2px dashed #374151;  /* gray-700 */
  border-radius: 4px;          /* Coins carrés, léger radius */
  background: transparent;
  
  /* Header minimal */
  .zone-header {
    font-size: 12px;
    color: #9CA3AF;  /* gray-400 */
    padding: 4px 8px;
  }
}

/* Zone hover */
.zone:hover {
  border-color: #6B7280;  /* gray-500 */
  background: rgba(55, 65, 81, 0.05);
}

/* Zone avec éléments */
.zone.has-elements {
  border-style: solid;
  border-color: #4B5563;  /* gray-600 */
}
```

### 4.3 Zones : Flottantes et Redimensionnables

Les zones restent **flottantes** (draggable) et **redimensionnables** (comme actuellement).

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│ + Veste           ⋮  │ ← Header avec menu
│                       │
│   🧵  📐             │ ← Éléments droppés
│                       │
│                    ◢ │ ← Handle resize
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### 4.4 Cristallisation

Depuis la zone (comportement actuel conservé) :

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│ + Veste           ⋮  │
│                       │
│   🧵  📐  🎨         │
│                       │
│   [⚡ Cristalliser]   │ ← Bouton dans la zone
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

---

## 5. Palette de Couleurs (intégrée)

### 5.1 Stack Technique Validée

| Librairie | Taille | Usage |
|-----------|--------|-------|
| `react-colorful` | 2.8 KB | Color picker |
| `colorthief` | 5 KB | Extraction image |
| `chroma-js` | 13.5 KB | Harmonies, manipulation |
| **Total** | ~21 KB | |

### 5.2 Fonctionnalités Palette

| Feature | Sprint | Priorité |
|---------|--------|----------|
| Création manuelle (5 couleurs) | Sprint 3 | P1 |
| Affichage sur board (swatches) | Sprint 3 | P1 |
| Extraction depuis image | Sprint 4 | P1 |
| Harmonies (complémentaire, analogue) | Sprint 4 | P2 |
| Recherche tissus par couleur | Sprint 5 | P2 |
| Édition inline | Sprint 5 | P2 |

### 5.3 Élément Palette sur le Board

```
COMPACT (sur canvas)               ÉDITION (modal ou panel)
──────────────────────             ──────────────────────────
┌─────────────────────┐            ┌─────────────────────────┐
│ 🎨 Ma palette       │            │ 🎨 Ma palette           │
│ ┌──┬──┬──┬──┬──┐   │            │                         │
│ │  │  │  │  │  │   │            │  [Color Picker]         │
│ └──┴──┴──┴──┴──┘   │            │                         │
└─────────────────────┘            │  ■ #2D3748  Anthracite  │
     ~120px                        │  ■ #E53E3E  Corail      │
                                   │  ■ #ECC94B  Moutarde    │
                                   │  + Ajouter couleur      │
                                   │                         │
                                   │  [Extraire d'une image] │
                                   │  [Générer harmonies]    │
                                   └─────────────────────────┘
```

---

## 6. Sprints d'Implémentation

### Vue d'Ensemble

| Sprint | Focus | Effort | Priorité |
|--------|-------|--------|----------|
| 1 | Design Épuré | 4-5h | P0 |
| 2 | Toggle Mode Inspiration/Projet | 3-4h | P0 |
| 3 | Palette - Base | 4-5h | P1 |
| 4 | Palette - Avancé | 4-5h | P1 |
| 5 | Nouveaux Éléments (image, vidéo, lien) | 6-8h | P1 |
| 6 | Éléments PDF, Patron, Silhouette | 4-6h | P2 |
| **Total** | | **25-33h** | |

---

### Sprint 1 : Design Épuré (4-5h) - P0

**Objectif** : Interface minimaliste style Milanote

#### 1.1 Sidebar Gauche Compacte

```typescript
// Remplacer la sidebar actuelle par une version icônes-only
// Largeur : 48px
// Icônes : Lucide React, outline, 20px
// Tooltip au survol

// Fichiers à modifier :
// - src/features/boards/components/BoardSidebar.tsx (créer ou modifier)
// - src/app/(main)/boards/[boardId]/page.tsx (layout)
```

**Tâches :**
- [ ] Créer `BoardToolbar.tsx` (sidebar icônes verticale)
- [ ] Icônes Lucide : Image, Video, Shirt, Palette, Ruler, StickyNote, Eye
- [ ] Tooltips au survol (nom de l'outil)
- [ ] Réduire padding/margins du canvas

#### 1.2 Styles Zones Discrets

```typescript
// Fichiers à modifier :
// - src/features/boards/components/ZoneCard.tsx
// - src/features/boards/components/BoardCanvas.tsx
```

**Tâches :**
- [ ] Bordure pointillée grise (pas de fond coloré)
- [ ] Header minimal (texte petit, gris)
- [ ] Coins carrés (border-radius: 4px max)
- [ ] Suppression des couleurs vives

#### 1.3 Éléments Cards Épurés

**Tâches :**
- [ ] Unifier le style des ElementCard
- [ ] Coins carrés
- [ ] Ombres subtiles (shadow-sm)
- [ ] Bordures fines grises

---

### Sprint 2 : Toggle Mode (3-4h) - P0

**Objectif** : Basculer entre vue Inspiration et vue Projet

#### 2.1 Toggle Button

```typescript
// Nouveau composant ou état dans BoardCanvas
interface BoardViewMode {
  mode: 'inspiration' | 'project';
}
```

**Tâches :**
- [ ] Ajouter state `viewMode` dans BoardCanvas ou context
- [ ] Bouton toggle dans la toolbar (icône Eye / Layout)
- [ ] Persistence du mode (localStorage ou state)

#### 2.2 Comportement Zones

```typescript
// En mode inspiration : zones hidden via CSS
// En mode projet : zones visible

// Fichier : ZoneCard.tsx
const isVisible = viewMode === 'project' || zone.hasElements;
```

**Tâches :**
- [ ] Masquer zones en mode Inspiration (CSS ou conditional render)
- [ ] Afficher zones en mode Projet
- [ ] Animation transition (fade in/out)
- [ ] Les éléments restent visibles dans les deux modes

#### 2.3 Bouton Créer Zone

**Tâches :**
- [ ] Bouton "Zone" visible seulement en mode Projet
- [ ] Ou : toujours visible mais ouvre le mode Projet si cliqué

---

### Sprint 3 : Palette Base (4-5h) - P1

**Objectif** : Élément Palette fonctionnel sur le board

#### 3.1 Installation Librairies

```bash
npm install react-colorful chroma-js colorthief
npm install -D @types/chroma-js
```

#### 3.2 Composant PaletteElement

```typescript
// src/features/boards/components/elements/PaletteElement.tsx

interface PaletteElementProps {
  data: PaletteElementData;
  onUpdate: (data: PaletteElementData) => void;
}

// Affichage : 5 swatches horizontaux
// Double-clic : ouvre éditeur
```

**Tâches :**
- [ ] Composant PaletteElement (affichage swatches)
- [ ] Intégration dans ElementCard switch
- [ ] Style cohérent avec design épuré

#### 3.3 Éditeur Palette

```typescript
// src/features/boards/components/PaletteEditor.tsx

// Modal ou panel latéral
// - Color picker (react-colorful)
// - Liste des couleurs avec hex
// - Add/Remove couleur
// - Nommer la palette
```

**Tâches :**
- [ ] Modal PaletteEditor
- [ ] Color picker react-colorful intégré
- [ ] CRUD couleurs (add, remove, edit)
- [ ] Sauvegarde vers board_elements

#### 3.4 Action "Ajouter Palette"

**Tâches :**
- [ ] Bouton dans toolbar ouvre PaletteEditor
- [ ] Création d'un nouvel élément palette sur le board

---

### Sprint 4 : Palette Avancé (4-5h) - P1

**Objectif** : Extraction image et harmonies

#### 4.1 Extraction depuis Image

```typescript
// src/features/boards/utils/colorExtraction.ts

import ColorThief from 'colorthief';

async function extractPalette(imageUrl: string, count = 5): Promise<string[]> {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = imageUrl;
  await img.decode();
  
  const colorThief = new ColorThief();
  const palette = colorThief.getPalette(img, count);
  
  return palette.map(([r, g, b]) => 
    chroma(r, g, b).hex()
  );
}
```

**Tâches :**
- [ ] Fonction extractPalette
- [ ] Bouton "Extraire d'une image" dans PaletteEditor
- [ ] Upload image ou sélection depuis board
- [ ] Preview palette extraite avant validation

#### 4.2 Harmonies Couleurs

```typescript
// src/features/boards/utils/colorHarmonies.ts

import chroma from 'chroma-js';

function generateHarmonies(baseColor: string) {
  const base = chroma(baseColor);
  const hsl = base.hsl();
  
  return {
    complementary: chroma.hsl((hsl[0] + 180) % 360, hsl[1], hsl[2]).hex(),
    analogous: [
      chroma.hsl((hsl[0] + 30) % 360, hsl[1], hsl[2]).hex(),
      chroma.hsl((hsl[0] - 30 + 360) % 360, hsl[1], hsl[2]).hex(),
    ],
    triadic: [
      chroma.hsl((hsl[0] + 120) % 360, hsl[1], hsl[2]).hex(),
      chroma.hsl((hsl[0] + 240) % 360, hsl[1], hsl[2]).hex(),
    ],
  };
}
```

**Tâches :**
- [ ] Fonction generateHarmonies
- [ ] UI dans PaletteEditor : bouton "Générer harmonies"
- [ ] Affichage suggestions (complémentaire, analogue, triade)
- [ ] Clic pour ajouter à la palette

---

### Sprint 5 : Nouveaux Éléments Base (6-8h) - P1

**Objectif** : Image, Vidéo, Lien web

#### 5.1 Élément Image (refactor Inspiration)

```typescript
// Renommer 'inspiration' → 'image' (ou garder compatible)
// Ajouter sources : upload, URL, clipboard paste
```

**Tâches :**
- [ ] Upload image (input file + drag & drop sur canvas)
- [ ] Image depuis URL (modal input)
- [ ] Paste image depuis clipboard (Ctrl+V)
- [ ] Stockage : Supabase Storage ou base64 temporaire

#### 5.2 Élément Vidéo

```typescript
// Embed YouTube/Vimeo via iframe
// Upload vidéo vers Supabase Storage (optionnel, lourd)
```

**Tâches :**
- [ ] Composant VideoElement
- [ ] Parsing URL YouTube/Vimeo → embed
- [ ] Affichage miniature avec bouton play
- [ ] Lecture dans modal au clic

#### 5.3 Élément Lien Web

```typescript
// Fetch Open Graph metadata pour preview
// API route pour éviter CORS
```

**Tâches :**
- [ ] API route `/api/link-preview` (fetch og:title, og:image, og:description)
- [ ] Composant LinkElement (card avec preview)
- [ ] Clic ouvre le lien dans nouvel onglet

---

### Sprint 6 : Éléments Avancés (4-6h) - P2

**Objectif** : PDF, Patron, Silhouette

#### 6.1 Élément PDF

```typescript
// Upload PDF → Supabase Storage
// Génération thumbnail page 1 (côté client ou serveur)
// Optionnel : viewer PDF intégré
```

**Tâches :**
- [ ] Upload PDF
- [ ] Génération thumbnail (pdf.js ou API externe)
- [ ] Affichage miniature sur canvas
- [ ] Clic : ouvre PDF dans nouvel onglet ou modal viewer

#### 6.2 Élément Patron

```typescript
// Similaire à PDF mais spécialisé
// Reconnaissance future : extraction pièces (Phase 3+)
```

**Tâches :**
- [ ] Composant PatternElement
- [ ] Upload PDF ou image
- [ ] Icône distincte (Scissors)
- [ ] Metadata : nom du patron

#### 6.3 Élément Silhouette

```typescript
// Images de silhouettes (croquis de mode)
// Bibliothèque intégrée optionnelle (Phase 3+)
```

**Tâches :**
- [ ] Composant SilhouetteElement
- [ ] Upload image
- [ ] Optionnel : sélection depuis bibliothèque prédéfinie

---

## 7. Migration & Compatibilité

### 7.1 Données Existantes

| Table | Impact |
|-------|--------|
| `boards` | Aucun changement |
| `board_elements` | Nouveaux `element_type` supportés |
| `board_zones` | Ajout champ `visible_in_inspiration` (optionnel) |

### 7.2 Migration Éléments

```sql
-- Pas de migration destructive nécessaire
-- Les nouveaux types sont additifs
-- 'inspiration' reste supporté (alias de 'image')
```

---

## 8. Récapitulatif Visuel Final

```
┌────────────────────────────────────────────────────────────────────┐
│  DEADSTOCK        📋 Board: Collection Été        [Partager]  👤   │
├────┬───────────────────────────────────────────────────────────────┤
│    │                                                               │
│ 📷 │    📷        📷  🎨          📷                              │
│ 🎬 │         🎬                                                    │
│ 🧵 │    📷              🧵  🧵                                    │
│ 🎨 │                                                               │
│ 📐 │         📐  📝                                               │
│ 📝 │                                                               │
│ 🔗 │                                                               │
│ 📄 │    [Mode: Inspiration 👁]                                    │
│ ✂️ │                                                               │
│ 👤 │                                                               │
│ ── │                                                               │
│ 📋 │    Clic → passe en Mode Projet                               │
│ □  │    Les zones apparaissent pour grouper                       │
│    │                                                               │
└────┴───────────────────────────────────────────────────────────────┘
      48px                        Canvas pleine largeur
```

---

## 9. Critères de Succès

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| Temps création palette | < 30s | Chrono test utilisateur |
| Éléments par board | > 8 moyenne | Analytics |
| Usage mode Projet | > 50% des boards | Analytics |
| Toggle Inspiration/Projet | > 3x par session | Analytics |
| Extraction palette image | > 80% satisfaction | Feedback |

---

## 10. Références

- ARCHITECTURE_UX_BOARD_REALISATION.md (architecture de base)
- SPEC_CRISTALLISATION.md (workflow zones → projet)
- GLOSSAIRE.md (définitions Board, Zone, Élément)
- Milanote (benchmark UX)

---

**Document créé par :** Claude + Thomas  
**Validé le :** 09/01/2026  
**Prochaine révision :** Après Sprint 2
