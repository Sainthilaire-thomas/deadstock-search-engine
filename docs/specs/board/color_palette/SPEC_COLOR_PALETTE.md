# SPEC_COLOR_PALETTE - Nuancier & Palettes Couleurs

**Version:** 0.1 (Canevas)  
**Date:** 05/01/2026  
**Statut:** À spécifier  
**Phase:** 2 - Design Tools  
**Priorité:** Moyenne

---

## 1. Vue d'ensemble

### 1.1 Objectif

Permettre aux designers de créer, gérer et utiliser des palettes de couleurs cohérentes pour leurs projets, avec des fonctionnalités d'extraction automatique et de recherche de tissus assortis.

### 1.2 Fonctionnalités envisagées

1. **Création de palette** - Manuelle ou depuis image
2. **Nuancier interactif** - Roue chromatique explorable
3. **Extraction depuis image** - Upload → palette automatique
4. **Harmonies couleurs** - Suggestions complémentaires/analogues
5. **Recherche tissus par couleur** - Filtrer par nuance précise
6. **Tissu assorti** - Trouver des tissus coordonnés

---

## 2. Questions à résoudre avant spécification

### 2.1 Création de palette

| Question | Options possibles | À décider |
|----------|-------------------|-----------|
| Comment créer une palette manuellement ? | Color picker natif / Roue chromatique custom / Input hex | ❓ |
| Nombre de couleurs par palette ? | Fixe (5) / Variable (3-7) / Illimité | ❓ |
| Peut-on nommer les couleurs individuellement ? | Oui / Non | ❓ |
| Format de stockage des couleurs ? | Hex / RGB / HSL / Plusieurs | ❓ |
| Les palettes sont-elles liées à un board ou globales ? | Par board / Bibliothèque personnelle / Les deux | ❓ |

### 2.2 Extraction depuis image

| Question | Options possibles | À décider |
|----------|-------------------|-----------|
| Quel algorithme d'extraction ? | K-means / Median cut / Octree / Service externe (API) | ❓ |
| Nombre de couleurs extraites ? | Fixe / Configurable par l'utilisateur | ❓ |
| Possibilité d'ajuster après extraction ? | Oui, édition libre / Non, on recommence | ❓ |
| Types d'images supportés ? | JPG/PNG uniquement / + URL web / + capture écran | ❓ |
| Extraction côté client ou serveur ? | Client (Canvas API) / Serveur (plus précis) / Hybride | ❓ |

### 2.3 Nuancier interactif

| Question | Options possibles | À décider |
|----------|-------------------|-----------|
| Type de visualisation ? | Roue chromatique / Spectre linéaire / Grille de nuances | ❓ |
| Interaction principale ? | Clic pour sélectionner / Drag pour explorer / Les deux | ❓ |
| Librairie UI à utiliser ? | react-color / Custom canvas / react-colorful / autre | ❓ |
| Afficher les tissus correspondants en temps réel ? | Oui (requêtes live) / Non (bouton "chercher") | ❓ |
| Intégration dans le board ? | Panel latéral / Modal / Page dédiée | ❓ |

### 2.4 Harmonies couleurs

| Question | Options possibles | À décider |
|----------|-------------------|-----------|
| Quelles harmonies proposer ? | Complémentaire / Analogue / Triade / Tétrade / Split / Toutes | ❓ |
| Comment les présenter ? | Suggestions automatiques / Bouton "générer harmonie" | ❓ |
| Basé sur quelle couleur ? | Couleur principale de la palette / Couleur sélectionnée | ❓ |
| Algorithme de calcul ? | Rotation HSL simple / Librairie (chroma.js, culori) | ❓ |

### 2.5 Recherche tissus par couleur

| Question | Options possibles | À décider |
|----------|-------------------|-----------|
| Comment matcher les couleurs ? | Distance euclidienne RGB / Delta E (perceptuel) / HSL proximity | ❓ |
| Tolérance de matching ? | Fixe / Configurable / Plusieurs niveaux (exact/proche/famille) | ❓ |
| Comment sont stockées les couleurs des tissus ? | Hex unique / Couleurs multiples / Tags couleur | ❓ |
| Faut-il une couleur dominante par tissu ? | Oui, extraction auto / Oui, annotation manuelle / Non | ❓ |
| UX de la recherche ? | Filtre dans search / Page dédiée / Depuis palette | ❓ |

### 2.6 "Trouver tissu assorti"

| Question | Options possibles | À décider |
|----------|-------------------|-----------|
| Input de la fonctionnalité ? | Tissu sélectionné / Couleur choisie / Palette entière | ❓ |
| Critères de matching ? | Couleur seule / Couleur + matière / Couleur + matière + usage | ❓ |
| Résultats présentés comment ? | Liste simple / Groupes par harmonie / Score de compatibilité | ❓ |
| Intégration avec le board ? | Ajouter directement depuis résultats / Via favoris | ❓ |

### 2.7 Élément palette sur le board

| Question | Options possibles | À décider |
|----------|-------------------|-----------|
| Apparence visuelle ? | Pastilles horizontales / Carré divisé / Swatches empilés | ❓ |
| Taille de la carte ? | Fixe / Redimensionnable / Plusieurs presets | ❓ |
| Interactions ? | Clic = copier hex / Clic = chercher tissus / Double-clic = éditer | ❓ |
| Peut-on lier une palette à un textile ? | Oui / Non | ❓ |
| Afficher les noms des couleurs ? | Oui (optionnel) / Non / Au survol | ❓ |

---

## 3. Inspirations et références à explorer

### 3.1 Outils couleur existants

- [ ] Coolors.co - Générateur de palettes
- [ ] Adobe Color - Roue chromatique + harmonies
- [ ] Khroma - IA pour palettes
- [ ] Colormind - ML-based palette generator
- [ ] Pantone Connect - Standard industrie mode

### 3.2 Librairies techniques à évaluer

- [ ] `chroma.js` - Manipulation couleurs JS
- [ ] `culori` - Espace couleurs perceptuels
- [ ] `color-thief` - Extraction couleurs images
- [ ] `vibrant.js` - Extraction couleurs vibrantes
- [ ] `react-colorful` - Color picker React léger

### 3.3 UX à étudier

- [ ] Figma - Color styles et palettes
- [ ] Canva - Extraction couleurs photos
- [ ] Dribbble - Palettes de designs
- [ ] Pinterest - Boards couleur

---

## 4. Données existantes à considérer

### 4.1 Structure actuelle de l'élément palette

```typescript
// Actuellement dans board_elements
interface PaletteElementData {
  colors: string[];  // Array de hex codes
  name?: string;
}
```

### 4.2 Données couleur des textiles

```typescript
// Actuellement dans textiles
{
  color: string | null,           // Couleur normalisée (ex: "blue", "beige")
  // Pas de code hex stocké actuellement
}
```

### 4.3 Questions sur l'existant

- Faut-il enrichir les textiles avec des codes hex ?
- Comment extraire la couleur dominante des images produits ?
- Les couleurs normalisées suffisent-elles pour le matching ?

---

## 5. Impact sur la cristallisation

### 5.1 Données à transférer vers le projet

Quand une zone avec une palette est cristallisée :
- La palette est-elle copiée dans le projet ?
- Format de stockage dans le projet Journey ?
- Lien avec les étapes "Couleurs" ou "Inspiration" ?

### 5.2 Questions ouvertes

| Question | Impact cristallisation |
|----------|----------------------|
| Une palette peut-elle être partagée entre zones ? | Duplication vs référence |
| La palette génère-t-elle des critères de recherche ? | Pré-filtrage dans projet |
| Historique des modifications de palette ? | Snapshot au moment de cristalliser |

---

## 6. Estimation préliminaire

### 6.1 Complexité par fonctionnalité

| Fonctionnalité | Complexité | Sessions estimées |
|----------------|------------|-------------------|
| Création manuelle palette | Faible | 0.5 |
| Élément palette sur board | Faible | 0.5 |
| Extraction depuis image | Moyenne | 1 |
| Nuancier interactif | Moyenne-Haute | 1-2 |
| Harmonies couleurs | Moyenne | 1 |
| Recherche tissus par couleur | Haute | 2 |
| Tissu assorti | Haute | 1-2 |
| **Total estimé** | | **7-9 sessions** |

### 6.2 Dépendances

- Enrichissement données textiles (couleurs hex)
- Algorithme de matching couleurs
- Intégration avec le module Search

---

## 7. Prochaines étapes

1. [ ] **Répondre aux questions** section 2 avec Thomas
2. [ ] **Explorer les inspirations** section 3
3. [ ] **Prototyper** l'UI palette sur le board
4. [ ] **Décider** de l'algorithme de matching couleurs
5. [ ] **Compléter** cette spec avec les décisions
6. [ ] **Planifier** l'implémentation par phases

---

## 8. Notes de session

*Espace pour capturer les décisions futures*

### Session XX (date à venir)

Décisions prises :
- ...

Questions résolues :
- ...

Nouvelles questions :
- ...

---

**Document créé par :** Claude + Thomas  
**À compléter lors d'une prochaine session**
