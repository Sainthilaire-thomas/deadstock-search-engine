
# Sprint 4 - Palette Avancée (Extraction + Harmonies) - COMPLET ✅

**Date** : 10-11 Janvier 2026
**Durée** : ~2h30
**Status** : ✅ Terminé

---

## 🎯 Objectif

Permettre aux utilisateurs de :

1. Extraire automatiquement une palette de couleurs depuis une image
2. Générer des harmonies de couleurs (complémentaire, analogues, triadique, etc.)
3. Afficher les palettes de manière compacte et professionnelle

---

## 📦 Fonctionnalités Implémentées

### 1. Extraction de couleurs (`colorExtractor.ts`)

**Fonctions d'extraction** :

* `extractColorsFromFile(file, count)` - Extrait une palette depuis un fichier uploadé
* `extractColorsFromUrl(url, count)` - Extrait une palette depuis une URL
* `extractDominantColorFromFile(file)` - Extrait la couleur dominante d'un fichier
* `extractDominantColorFromUrl(url)` - Extrait la couleur dominante d'une URL

**Fonctions de conversion** :

* `rgbToHex(rgb)` - RGB → HEX
* `hexToRgb(hex)` - HEX → RGB
* `rgbToHsl(r, g, b)` - RGB → HSL
* `hslToRgb(h, s, l)` - HSL → RGB
* `hslToHex(h, s, l)` - HSL → HEX

### 2. Génération d'harmonies (NEW)

**Interface ColorHarmonies** :

```typescript
interface ColorHarmonies {
  base: string;                      // Couleur de base
  complementary: string;             // +180°
  analogous: [string, string];       // ±30°
  triadic: [string, string];         // +120°, +240°
  splitComplementary: [string, string]; // +150°, +210°
  tetradic: [string, string, string];   // +90°, +180°, +270°
}
```

**Fonctions d'harmonies** :

* `generateHarmonies(baseColor)` - Génère toutes les harmonies
* `generateShades(baseColor, count)` - Génère des variations de luminosité
* `suggestPaletteFromColor(baseColor)` - Suggère une palette complète (5 couleurs)
* `getContrastRatio(color1, color2)` - Calcule le contraste WCAG
* `getTextColorForBackground(bgColor)` - Détermine si texte clair/foncé

### 3. PaletteEditor avec harmonies (NEW)

**Nouvelle section "Générer des harmonies"** :

* Icône 🪄 (Wand2) pour identifier la fonctionnalité
* Section dépliable (collapsible)
* 5 types d'harmonies affichées :
  * Complémentaire (1 couleur)
  * Analogues (2 couleurs)
  * Triadique (2 couleurs)
  * Split-complémentaire (2 couleurs)
  * Tétradique (3 couleurs)
* Clic sur une couleur pour l'ajouter à la palette
* Indicateur ✓ si couleur déjà présente
* Couleur de base identifiée avec label

### 4. PaletteElement compact (NEW)

**Améliorations visuelles** :

* Header compact (20px au lieu de 24px)
* Swatches horizontaux pleine largeur
* Coins arrondis uniformes (`rounded` + `overflow-hidden`)
* Hauteur contrainte (`min-h-[24px] max-h-[40px]`)
* Border visible autour des swatches
* Compteur de couleurs à droite du nom

**Interactions** :

* Hover : couleur s'agrandit (flex 1.3)
* Code HEX affiché au survol (si largeur > 150px)
* Texte adaptatif clair/foncé selon la couleur

---

## 🗂️ Fichiers Créés

| Fichier                                         | Description                              |
| ----------------------------------------------- | ---------------------------------------- |
| `src/features/boards/utils/colorExtractor.ts` | Extraction + Harmonies                   |
| `src/types/colorthief.d.ts`                   | Déclarations TypeScript pour colorthief |

---

## 📝 Fichiers Modifiés

| Fichier                | Modification                                      |
| ---------------------- | ------------------------------------------------- |
| `PaletteEditor.tsx`  | Section extraction + Section harmonies dépliable |
| `PaletteElement.tsx` | Design compact, swatches pleine largeur           |
| `package.json`       | Ajout dépendance colorthief                      |

---

## 📦 Dépendances

```json
{
  "colorthief": "^2.6.0",
  "react-colorful": "^5.6.1"  // Déjà présent depuis Sprint 3
}
```

---

## 🎨 Types d'Harmonies

| Type                            | Description             | Angle(s)              |
| ------------------------------- | ----------------------- | --------------------- |
| **Complémentaire**       | Couleur opposée        | +180°                |
| **Analogues**             | Couleurs adjacentes     | ±30°                |
| **Triadique**             | Triangle équilatéral  | +120°, +240°        |
| **Split-complémentaire** | Complémentaire divisé | +150°, +210°        |
| **Tétradique**           | Carré                  | +90°, +180°, +270° |

---

## 📸 Aperçu Interface

### PaletteEditor avec Harmonies

```
┌─────────────────────────────────────────────┐
│  Modifier la palette                   [×]  │
├─────────────────────────────────────────────┤
│                                             │
│  Nom de la palette                          │
│  ┌─────────────────────────────────────┐    │
│  │ Ma palette                          │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ✨ Extraire depuis une image               │
│  ┌─────────────────────────────────────┐    │
│  │ [Upload image]  [Depuis URL]        │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Couleurs (5/10)                            │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌╌╌┐            │
│  │██│ │██│ │██│ │██│ │██│ │+ │            │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └╌╌┘            │
│                                             │
│  [═══════ Color Picker ═══════]             │
│                                             │
│  🪄 Générer des harmonies              [▼]  │
│  ┌─────────────────────────────────────┐    │
│  │ Cliquez pour ajouter à la palette   │    │
│  │                                     │    │
│  │ Complémentaire                      │    │
│  │ [Base] → [████]                     │    │
│  │                                     │    │
│  │ Analogues                           │    │
│  │ [████] [Base] [████]                │    │
│  │                                     │    │
│  │ Triadique                           │    │
│  │ [Base] [████] [████]                │    │
│  │                                     │    │
│  │ Split-complémentaire                │    │
│  │ [Base] [████] [████]                │    │
│  │                                     │    │
│  │ Tétradique                          │    │
│  │ [Base] [████] [████] [████]         │    │
│  └─────────────────────────────────────┘    │
│                                             │
│           [Annuler]  [Enregistrer]          │
└─────────────────────────────────────────────┘
```

### PaletteElement Compact

```
Avant (Sprint 3)              Après (Sprint 4)
┌───────────────────┐         ┌───────────────────┐
│ 🎨 Palette        │         │ 🎨 Palette      5 │
│                   │         ├───────────────────┤
│ ┌──┬──┬──┬──┬──┐ │         │███████████████████│
│ │  │  │  │  │  │ │         └───────────────────┘
│ └──┴──┴──┴──┴──┘ │
│                   │         Hauteur: ~50px
│                   │         (vs ~80px avant)
└───────────────────┘
```

---

## 🧪 Tests Effectués

### Extraction d'images

| Test                    | Résultat                     |
| ----------------------- | ----------------------------- |
| Upload image locale JPG | ✅ 6 couleurs extraites       |
| Upload image locale PNG | ✅                            |
| Upload fichier > 5Mo    | ✅ Rejeté avec message       |
| URL Unsplash valide     | ✅ Couleurs extraites         |
| URL avec CORS bloqué   | ✅ Message d'erreur explicite |

### Harmonies

| Test                         | Résultat                    |
| ---------------------------- | ---------------------------- |
| Génération complémentaire | ✅ Couleur opposée correcte |
| Génération analogues       | ✅ ±30° corrects           |
| Génération triadique       | ✅ +120°, +240° corrects   |
| Clic ajouter couleur         | ✅ Ajoutée à la palette    |
| Couleur déjà présente     | ✅ Indicateur ✓ affiché    |
| Palette pleine (10)          | ✅ Boutons désactivés      |

### PaletteElement

| Test                     | Résultat                      |
| ------------------------ | ------------------------------ |
| Affichage compact        | ✅ ~50px hauteur               |
| Hover couleur agrandie   | ✅ flex 1.3                    |
| Code HEX au survol       | ✅ Affiché si largeur > 150px |
| Coins arrondis uniformes | ✅ Plus de coupure             |
| Compteur couleurs        | ✅ Affiché à droite          |

---

## 📐 Spécifications Techniques

### Algorithme de rotation HSL

```typescript
// Complémentaire : rotation de 180°
complementary = hslToHex((h + 180) % 360, s, l);

// Analogues : ±30°
analogous = [
  hslToHex((h - 30 + 360) % 360, s, l),
  hslToHex((h + 30) % 360, s, l)
];

// Triadique : +120° et +240°
triadic = [
  hslToHex((h + 120) % 360, s, l),
  hslToHex((h + 240) % 360, s, l)
];
```

### Détection couleur claire/foncée

```typescript
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Formule de luminosité perçue (ITU-R BT.601)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}
```

---

## 🚀 Améliorations Futures (Backlog)

1. **Nombre de couleurs configurable** : Slider 3-10 lors de l'extraction
2. **Réorganisation drag & drop** : Réordonner les couleurs de la palette
3. **Extraction depuis textile** : Extraire depuis image d'un tissu du board
4. **Export palette** : Télécharger en ASE/JSON pour Adobe/Figma
5. **Palettes prédéfinies** : Bibliothèque de palettes tendance/saison

---

## ✅ Checklist Finale

### Extraction (Session 1)

* [X] Utilitaire colorExtractor créé
* [X] Types TypeScript pour colorthief
* [X] Intégration PaletteEditor (upload + URL)
* [X] Preview image
* [X] Auto-génération nom
* [X] Gestion erreurs CORS

### Harmonies (Session 2)

* [X] Fonctions de conversion RGB/HSL/HEX
* [X] Fonction generateHarmonies()
* [X] Fonctions utilitaires (shades, contrast, textColor)
* [X] Section dépliable dans PaletteEditor
* [X] 5 types d'harmonies affichées
* [X] Clic pour ajouter couleur
* [X] Indicateur couleur déjà présente

### PaletteElement (Session 2)

* [X] Design compact
* [X] Swatches pleine largeur
* [X] Coins arrondis uniformes
* [X] Hover avec agrandissement
* [X] Code HEX au survol
* [X] Compteur de couleurs

---

**Sprint 4 : TERMINÉ** 🎉

**Prochaine étape** : Sprint 5 - Vidéo et Lien Web
