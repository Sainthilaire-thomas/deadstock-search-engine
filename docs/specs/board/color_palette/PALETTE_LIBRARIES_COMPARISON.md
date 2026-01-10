# 🎨 Comparatif Librairies - Palette de Couleurs

**Date** : 9 Janvier 2026  
**Objectif** : Choisir les meilleures librairies pour la fonctionnalité palette du Board

---

## 📊 Vue d'ensemble des besoins

| Besoin | Description | Priorité |
|--------|-------------|----------|
| **Color Picker** | Sélecteur de couleur interactif | P1 |
| **Extraction Image** | Extraire palette depuis une image | P1 |
| **Manipulation Couleur** | Harmonies, saturate, darken, etc. | P2 |
| **Matching Couleur** | Distance perceptuelle (Delta E) | P2 |

---

## 1. 🎯 COLOR PICKERS (UI)

### Option A : react-colorful ⭐ RECOMMANDÉ

```
Taille : 2.8 KB (gzipped)
Downloads : 1.2M/semaine
Dernière MAJ : Active
TypeScript : Natif
```

**✅ Avantages**
- Ultra-léger (2.8KB vs 30KB+ pour react-color)
- Zéro dépendance
- Hooks + Functional Components only
- TypeScript natif
- Support Hex, RGB, HSL, HSV
- `HexColorInput` inclus pour saisie manuelle
- Tree-shakeable
- Testé jusqu'à IE11

**❌ Inconvénients**
- Pas de presets/swatches intégrés
- Un seul style visuel (carré + slider)
- Pas de roue chromatique native

**📦 Installation**
```bash
npm install react-colorful
```

**💻 Exemple**
```tsx
import { HexColorPicker, HexColorInput } from "react-colorful";

const [color, setColor] = useState("#aabbcc");

<HexColorPicker color={color} onChange={setColor} />
<HexColorInput color={color} onChange={setColor} prefixed />
```

---

### Option B : react-color

```
Taille : ~30 KB (gzipped)
Downloads : 800K/semaine
Dernière MAJ : Il y a 5 ans ⚠️
TypeScript : Via @types/react-color
```

**✅ Avantages**
- 13 styles différents (Sketch, Photoshop, Chrome, Twitter...)
- Swatches/presets intégrés
- Très populaire, beaucoup d'exemples
- Design familier (style Sketch/Adobe)

**❌ Inconvénients**
- **ABANDONNÉ** (dernière release 2019)
- 10x plus lourd que react-colorful
- Dépendances (lodash, etc.)
- Class components (legacy)
- Risques sécurité (deps non maintenues)

**⚠️ Verdict** : À éviter malgré la popularité. Non maintenu depuis 5 ans.

---

### Option C : react-color-palette

```
Taille : ~8 KB
Downloads : 50K/semaine
Dernière MAJ : Active (2024)
TypeScript : Natif
```

**✅ Avantages**
- Composants modulaires (Saturation, Hue, Alpha séparés)
- Layout personnalisable
- Callback `onChangeComplete` (pour save uniquement à la fin)
- TypeScript natif

**❌ Inconvénients**
- Moins populaire
- Documentation moins fournie
- Moins d'exemples en ligne

---

### Option D : @uiw/react-color

```
Taille : Variable (modulaire)
Downloads : 100K/semaine
Dernière MAJ : Active
TypeScript : Natif
```

**✅ Avantages**
- Ultra-modulaire (chaque picker séparé)
- Styles multiples disponibles
- Actif et maintenu
- Editeur de palette intégré

**❌ Inconvénients**
- Plus complexe à configurer
- Bundle size peut grossir si on importe tout

---

### 🏆 Recommandation Color Picker

| Critère | react-colorful | react-color | react-color-palette |
|---------|----------------|-------------|---------------------|
| Taille | ⭐⭐⭐ 2.8KB | ❌ 30KB | ⭐⭐ 8KB |
| Maintenance | ⭐⭐⭐ Active | ❌ Morte | ⭐⭐⭐ Active |
| DX/API | ⭐⭐⭐ Simple | ⭐⭐ Legacy | ⭐⭐ Correct |
| Personnalisation | ⭐⭐ Moyenne | ⭐⭐⭐ Multi-styles | ⭐⭐⭐ Modulaire |
| **TOTAL** | **9/12** | 5/12 | 8/12 |

**→ Choix : `react-colorful`** pour le meilleur ratio taille/fonctionnalités.

---

## 2. 🖼️ EXTRACTION COULEURS DEPUIS IMAGE

### Option A : colorthief ⭐ RECOMMANDÉ

```
Taille : ~5 KB
Downloads : 150K/semaine
Algorithme : MMCQ (Modified Median Cut Quantization)
Environnement : Browser + Node
```

**✅ Avantages**
- Simple et efficace
- API minimaliste : `getColor()` et `getPalette()`
- Fonctionne côté client (Canvas API)
- Paramètre `quality` pour performance
- Léger, pas de dépendances
- Retourne RGB direct

**❌ Inconvénients**
- Retourne RGB (pas hex direct, conversion simple)
- Pas de swatches sémantiques (vibrant, muted, etc.)
- Dernière release 2018 mais stable

**💻 Exemple**
```javascript
import ColorThief from 'colorthief';

const colorThief = new ColorThief();
const img = document.querySelector('img');

// Couleur dominante [R, G, B]
const dominant = colorThief.getColor(img);

// Palette de 5 couleurs
const palette = colorThief.getPalette(img, 5);
```

---

### Option B : node-vibrant

```
Taille : ~25 KB
Downloads : 200K/semaine
Algorithme : Vibrant (Android Palette API)
Environnement : Browser + Node
```

**✅ Avantages**
- Swatches sémantiques : Vibrant, Muted, DarkVibrant, LightVibrant, DarkMuted, LightMuted
- Inspiré d'Android Palette (Google)
- Retourne aussi couleur texte recommandée
- Plus "intelligent" pour UI theming

**❌ Inconvénients**
- Plus lourd (~25KB)
- API plus complexe
- Certains swatches peuvent être `undefined`
- Chargement image plus complexe

**💻 Exemple**
```javascript
import Vibrant from 'node-vibrant';

Vibrant.from('image.jpg').getPalette()
  .then(palette => {
    console.log(palette.Vibrant.hex);      // #cc3344
    console.log(palette.Muted.hex);        // #667788
    console.log(palette.DarkVibrant.hex);  // #442233
  });
```

---

### 🏆 Recommandation Extraction Image

| Critère | colorthief | node-vibrant |
|---------|------------|--------------|
| Taille | ⭐⭐⭐ 5KB | ⭐ 25KB |
| Simplicité API | ⭐⭐⭐ Très simple | ⭐⭐ Moyenne |
| Richesse résultats | ⭐⭐ RGB basique | ⭐⭐⭐ Swatches sémantiques |
| Performance | ⭐⭐⭐ Rapide | ⭐⭐ Correct |
| **TOTAL** | **11/12** | 8/12 |

**→ Choix : `colorthief`** pour la simplicité. node-vibrant si on veut des swatches sémantiques plus tard.

---

## 3. 🔧 MANIPULATION COULEURS (Harmonies, Conversions)

### Option A : chroma-js ⭐ RECOMMANDÉ

```
Taille : 13.5 KB
Downloads : 1.8M/semaine
Dernière MAJ : Stable (maintenance mode)
```

**✅ Avantages**
- **Le plus complet** pour manipulation couleurs
- Interpolation (gradients)
- `scale()` pour générer des gammes
- `saturate()`, `darken()`, `brighten()`
- `contrast()` pour accessibilité WCAG
- Support LAB, LCH (perceptuellement uniforme)
- `mix()` pour mélanger couleurs
- `bezier()` pour palettes fluides

**❌ Inconvénients**
- Plus lourd (13.5KB)
- En "maintenance mode" (pas abandonné, juste stable)
- API objet (pas fonctionnelle pure)

**💻 Exemple Harmonies**
```javascript
import chroma from 'chroma-js';

const base = '#1E3A5F';

// Complémentaire (rotation 180°)
const complementary = chroma(base).set('hsl.h', '+180').hex();

// Analogue (rotation ±30°)
const analogous = [
  chroma(base).set('hsl.h', '-30').hex(),
  base,
  chroma(base).set('hsl.h', '+30').hex(),
];

// Triade (rotation 120°)
const triadic = [
  base,
  chroma(base).set('hsl.h', '+120').hex(),
  chroma(base).set('hsl.h', '+240').hex(),
];

// Contraste WCAG
chroma.contrast('#ffffff', base); // => 8.4
```

---

### Option B : culori

```
Taille : ~15 KB (tree-shakeable)
Downloads : 300K/semaine
Dernière MAJ : Active
```

**✅ Avantages**
- API fonctionnelle (pas de classes)
- **Le plus précis** scientifiquement
- Support OKLab, OKLCH (espaces modernes)
- Delta E 2000 (meilleure distance perceptuelle)
- CSS Color 4 complet
- Tree-shakeable

**❌ Inconvénients**
- API moins intuitive
- Documentation plus technique
- Moins d'exemples "recettes"

**💻 Exemple**
```javascript
import { oklch, formatHex, differenceCiede2000 } from 'culori';

// Distance perceptuelle précise
const diff = differenceCiede2000(color1, color2);

// Manipulation OKLCH (meilleur que HSL)
const lighter = formatHex({
  ...oklch(color),
  l: oklch(color).l + 0.1
});
```

---

### Option C : color2k

```
Taille : 2.9 KB
Downloads : 2M/semaine
```

**✅ Avantages**
- Ultra-léger (2.9KB)
- API simple
- Fonctions utiles : `darken`, `lighten`, `mix`, `contrast`

**❌ Inconvénients**
- Pas d'interpolation avancée
- Pas de scale/gradient
- Moins de fonctions de manipulation

---

### Option D : tinycolor2

```
Taille : 10 KB
Downloads : 5M/semaine
```

**✅ Avantages**
- Très populaire
- API simple et intuitive
- `complement()`, `analogous()`, `triad()` intégrés

**❌ Inconvénients**
- Moins précis que chroma.js
- API objet mutante

---

### 🏆 Recommandation Manipulation

| Critère | chroma-js | culori | color2k | tinycolor2 |
|---------|-----------|--------|---------|------------|
| Taille | ⭐⭐ 13KB | ⭐⭐ 15KB | ⭐⭐⭐ 3KB | ⭐⭐ 10KB |
| Fonctionnalités | ⭐⭐⭐ Très riche | ⭐⭐⭐ Très riche | ⭐⭐ Basique | ⭐⭐⭐ Riche |
| API/DX | ⭐⭐⭐ Intuitive | ⭐⭐ Technique | ⭐⭐⭐ Simple | ⭐⭐⭐ Simple |
| Harmonies | ⭐⭐⭐ Oui (via HSL) | ⭐⭐⭐ Oui (OKLCH) | ❌ Non | ⭐⭐⭐ Intégrées |
| **TOTAL** | **11/12** | 10/12 | 8/12 | 10/12 |

**→ Choix : `chroma-js`** pour le meilleur équilibre fonctionnalités/DX.

---

## 4. 📏 MATCHING COULEUR (Distance)

Pour trouver des tissus qui matchent une couleur de palette, on a besoin d'une mesure de **distance perceptuelle**.

### Options

| Méthode | Librairie | Précision | Performance |
|---------|-----------|-----------|-------------|
| Delta E 76 | chroma.js | ⭐⭐ Correcte | ⭐⭐⭐ Rapide |
| Delta E 2000 | culori | ⭐⭐⭐ Excellente | ⭐⭐ Moyenne |
| Euclidienne RGB | Native | ⭐ Mauvaise | ⭐⭐⭐ Très rapide |
| LAB Distance | chroma.js | ⭐⭐⭐ Bonne | ⭐⭐⭐ Rapide |

**→ Recommandation** : Utiliser `chroma.js` avec distance LAB (bon compromis).

```javascript
import chroma from 'chroma-js';

function colorDistance(color1, color2) {
  const lab1 = chroma(color1).lab();
  const lab2 = chroma(color2).lab();
  
  return Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +
    Math.pow(lab1[1] - lab2[1], 2) +
    Math.pow(lab1[2] - lab2[2], 2)
  );
}

// Distance < 10 = très proche
// Distance < 25 = même famille
// Distance > 50 = différent
```

---

## 5. 🎯 STACK RECOMMANDÉE FINALE

| Besoin | Librairie | Taille | Raison |
|--------|-----------|--------|--------|
| **Color Picker** | `react-colorful` | 2.8 KB | Léger, moderne, TypeScript |
| **Extraction Image** | `colorthief` | 5 KB | Simple, efficace, stable |
| **Manipulation** | `chroma-js` | 13.5 KB | Complet, intuitif, harmonies |

**Total bundle additionnel : ~21 KB**

### Alternative minimaliste (si vraiment contraint sur la taille)

| Besoin | Librairie | Taille |
|--------|-----------|--------|
| Color Picker | `react-colorful` | 2.8 KB |
| Extraction | Custom Canvas | 0 KB |
| Manipulation | `color2k` | 2.9 KB |

**Total : ~6 KB** (mais moins de fonctionnalités)

---

## 6. 📋 Décision à prendre

### Questions pour Thomas

1. **Priorité Harmonies ?**
   - Si P1 → chroma-js obligatoire
   - Si P3 → color2k suffit pour le MVP

2. **Extraction Image nécessaire Sprint 1 ?**
   - Si oui → colorthief dès le début
   - Si non → Ajouter Sprint 2

3. **Swatches sémantiques (vibrant/muted) ?**
   - Si oui → node-vibrant au lieu de colorthief
   - Si non → colorthief suffit

4. **Design du picker ?**
   - Carré + slider (react-colorful) OK ?
   - Ou besoin roue chromatique ? (custom ou @uiw/react-color)

---

## 7. 🚀 Installation recommandée

```bash
# Sprint 1 : Base
npm install react-colorful

# Sprint 2 : Extraction image
npm install colorthief

# Sprint 4 : Harmonies avancées
npm install chroma-js
```

---

**Document préparé par Claude**  
**À valider avec Thomas avant implémentation**
