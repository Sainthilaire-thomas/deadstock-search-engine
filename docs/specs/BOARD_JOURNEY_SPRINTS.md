# BOARD + JOURNEY - Plan de Sprints

**Version** : 2.0
**Date** : 15 Janvier 2026
**Contexte** : Journey = Vue alternative par type/phase (ADR-029 révisé)

---

## Vision : Deux Vues du Même Projet

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   BOARD (Vue Spatiale)              JOURNEY (Vue par Phase/Type)        │
│   ════════════════════              ════════════════════════════        │
│                                                                         │
│   ┌─────────────────────┐           ┌─────────────────────────────┐    │
│   │  Zone "Veste"       │           │  📋 CONCEPTION               │    │
│   │  ┌───┐ ┌───┐ ┌───┐  │           │  ├── 💡 Idée (Board info)    │    │
│   │  │pat│ │cal│ │tis│  │  ←────→   │  ├── 🎨 Palettes (3)         │    │
│   │  └───┘ └───┘ └───┘  │           │  ├── ✂️ Patrons (2)          │    │
│   └─────────────────────┘           │  └── 👤 Silhouettes (1)      │    │
│                                     │                               │    │
│   ┌─────────────────────┐           │  📏 PRÉPARATION               │    │
│   │  Zone "Chemise"     │           │  ├── 📐 Calculs (2)           │    │
│   │  ┌───┐ ┌───┐        │           │  ├── 🧵 Tissus (4)            │    │
│   │  │pat│ │cal│        │           │  └── 📝 Notes (3)             │    │
│   │  └───┘ └───┘        │           │                               │    │
│   └─────────────────────┘           │  🛒 EXÉCUTION                  │    │
│                                     │  └── ⚡ Projets cristallisés   │    │
│   + éléments libres...              └─────────────────────────────┘    │
│                                                                         │
│   MÊME DONNÉES ←───────────────────────────────────────→ MÊME DONNÉES  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Mapping Éléments → Phases Journey

| Phase | Éléments Board | Icône | Mode Focus |
|-------|----------------|-------|------------|
| **CONCEPTION** | | | |
| └── Idée | Infos Board | 💡 | Édition nom/description |
| └── Inspiration | `inspiration` | 📷 | Extraction couleurs multiples |
| └── Palettes | `palette` | 🎨 | Harmonies, variantes, export |
| └── Patrons | `pattern` | ✂️ | **Extraction dimensions, calcul auto** |
| └── Silhouettes | `silhouette` | 👤 | Bibliothèque, annotation |
| └── Documents | `pdf` | 📄 | Visualisation |
| **PRÉPARATION** | | | |
| └── Calculs | `calculation` | 📐 | **Multi-vêtements, breakdown** |
| └── Tissus | `textile` | 🧵 | **Comparateur, specs** |
| └── Notes | `note` | 📝 | Édition enrichie |
| **EXÉCUTION** | | | |
| └── Projets | Zones cristallisées | ⚡ | Suivi, commandes |
| └── Ressources | `link`, `video` | 🔗 | Lecture |

---

## Inventaire de l'Existant

### ✅ Board - 100% Fonctionnel

| Composant | Fichier | État |
|-----------|---------|------|
| Canvas principal | `BoardCanvas.tsx` | ✅ |
| Toolbar 48px | `BoardToolbar.tsx` | ✅ |
| Zones | `ZoneCard.tsx` | ✅ |
| 10 types d'éléments | `elements/*.tsx` | ✅ |
| Recherche contextuelle | `ContextualSearchPanel.tsx` | ✅ |
| Cristallisation | `CrystallizationDialog.tsx` | ✅ |

### ✅ Module Journey Original - À Réutiliser

| Composant | Fichier | Réutilisation |
|-----------|---------|---------------|
| Config 9 étapes | `config/steps.ts` | Adapter pour 3 phases |
| Sidebar | `components/Sidebar.tsx` | Base pour menu Journey |
| Types complets | `domain/types.ts` | ✅ Tel quel |
| Config vêtements | `config/garments.ts` | ✅ Tel quel |
| Calculateur | `services/yardageCalculator.ts` | ✅ Tel quel |

### ✅ Module Pattern/Calculation - 100% Fonctionnel

| Composant | Fichier | État |
|-----------|---------|------|
| Modal calcul | `PatternImportModal.tsx` | ✅ Complet |
| Formulaire manuel | `ManualPatternForm.tsx` | ✅ |
| Calcul yardage | `calculateYardage.ts` | ✅ |
| Formules vêtements | `garmentFormulas.ts` | ✅ 20+ types |
| Affichage canvas | `CalculationPreview` | ✅ |

---

## Sprints à Réaliser

### Sprint J0 : Menu Journey avec Compteurs (3-4h) - **NOUVEAU**

**Objectif** : Adapter la sidebar Journey pour afficher les éléments du Board groupés par phase

#### J0.1 - Modifier config/steps.ts (30min)

```typescript
// Simplifier en 3 phases au lieu de 9 étapes
export const JOURNEY_PHASES = [
  {
    id: 'conception',
    title: 'Conception',
    icon: Lightbulb,
    elementTypes: ['palette', 'pattern', 'silhouette', 'inspiration'],
  },
  {
    id: 'preparation', 
    title: 'Préparation',
    icon: Calculator,
    elementTypes: ['calculation', 'textile', 'note'],
  },
  {
    id: 'execution',
    title: 'Exécution',
    icon: ShoppingCart,
    elementTypes: [], // Zones cristallisées
  },
];
```

#### J0.2 - Créer JourneyNavigation.tsx (1.5h)

```
Fichier : src/features/journey/components/JourneyNavigation.tsx

- [ ] Afficher les 3 phases
- [ ] Sous chaque phase : liste des types avec compteur
- [ ] Compteur dynamique basé sur les éléments du Board
- [ ] Clic sur type → filtre/liste les éléments
```

#### J0.3 - Route /boards/[boardId]/journey (1h)

```
Fichier : src/app/(main)/boards/[boardId]/journey/page.tsx

- [ ] Layout avec sidebar Journey à gauche
- [ ] Zone principale : liste des éléments du type sélectionné
- [ ] Header avec "← Retour au Board"
```

#### J0.4 - Bouton bascule Board ↔ Journey (30min)

```
- [ ] Ajouter bouton dans BoardHeader.tsx
- [ ] Icône : LayoutList ou TableOfContents
- [ ] Tooltip : "Vue Journey (par type)"
```

**Livrable** : Navigation Journey fonctionnelle avec compteurs

**Critères de validation** :
- [ ] Voir "Patrons (2)" si 2 éléments pattern sur le board
- [ ] Clic → liste des 2 patrons
- [ ] Retour au Board fluide

---

### Sprint J1 : Mode Focus avec Routing (2-3h)

**Objectif** : Permettre d'ouvrir un élément en mode focus (plein écran avec outils avancés)

#### J1.1 - Routes Mode Focus (1h)

```
src/app/(main)/boards/[boardId]/journey/
├── [elementType]/
│   └── [elementId]/
│       └── page.tsx          # Mode focus générique
```

#### J1.2 - Layout Mode Focus (1h)

```
Fichier : src/app/(main)/boards/[boardId]/journey/[elementType]/[elementId]/layout.tsx

- [ ] Header : "← Retour" + Nom élément + Type
- [ ] Pleine largeur
- [ ] Actions : Sauvegarder, Supprimer
```

#### J1.3 - Dispatch vers composant approprié (1h)

```typescript
// Dans page.tsx
switch (elementType) {
  case 'calculation': return <CalculationFocus element={element} />;
  case 'pattern': return <PatternFocus element={element} />;
  case 'textile': return <TextileFocus element={element} />;
  case 'palette': return <PaletteFocus element={element} />;
  default: return <GenericFocus element={element} />;
}
```

**Livrable** : Routes mode focus fonctionnelles

---

### Sprint J2 : Mode Focus Calcul - Multi-Vêtements (3-4h)

**Objectif** : Calculateur avancé avec support multi-vêtements

#### J2.1 - Composant CalculationFocus (2h)

```
Fichier : src/features/journey/components/focus/CalculationFocus.tsx

- [ ] Charger les données existantes de l'élément
- [ ] Liste des vêtements avec + / -
- [ ] Pour chaque vêtement : type, taille, quantité, variations
- [ ] Paramètres globaux : largeur, marge, modificateurs
```

#### J2.2 - Adapter calculateYardage (1h)

```
- [ ] Accepter array de vêtements
- [ ] Calculer par vêtement puis total
- [ ] Retourner breakdown détaillé
```

#### J2.3 - Composant BreakdownDisplay (1h)

```
- [ ] Tableau : Vêtement | Base | Modif | Total
- [ ] Sous-totaux par largeur tissu
- [ ] Total général avec recommandation
```

**Livrable** : Mode focus calcul avec multi-vêtements

**Critères de validation** :
- [ ] Ajouter 3+ vêtements
- [ ] Voir breakdown par vêtement
- [ ] Sauvegarder met à jour l'élément Board
- [ ] Retour au Board/Journey

---

### Sprint J3 : Mode Focus Patron - Extraction Dimensions (6-8h)

**Objectif** : Travailler un patron PDF pour extraire les dimensions et calculer automatiquement

#### J3.1 - Composant PatternFocus (2h)

```
- [ ] Viewer PDF intégré
- [ ] Panel latéral : liste des pièces
```

#### J3.2 - Définition des pièces (2h)

```
- [ ] Ajouter une pièce : nom, largeur, hauteur, quantité
- [ ] Sens du droit fil
- [ ] Import depuis métadonnées PDF (si disponibles)
```

#### J3.3 - Calcul automatique (2h)

```
- [ ] À partir des pièces définies → calcul métrage
- [ ] Optimisation basique disposition
- [ ] Comparaison avec estimation générique
```

#### J3.4 - Export vers Calculation (1h)

```
- [ ] Créer automatiquement un élément calculation lié
- [ ] Ou mettre à jour un existant
```

**Livrable** : Mode focus patron avec calcul automatique

---

### Sprint J4 : Mode Focus Textile - Comparateur (4-5h)

**Objectif** : Comparer plusieurs tissus côte à côte

#### J4.1 - Composant TextileFocus (2h)

```
- [ ] Tissu de départ (l'élément)
- [ ] Ajouter d'autres tissus : depuis Board, Favoris, Recherche
```

#### J4.2 - Tableau comparatif (2h)

```
- [ ] Colonnes : un tissu par colonne
- [ ] Lignes : prix, matière, couleur, largeur, quantité, source
- [ ] Mise en évidence des différences
```

#### J4.3 - Actions (1h)

```
- [ ] Remplacer le tissu de l'élément
- [ ] Ajouter aux favoris
- [ ] Ouvrir sur le site source
```

**Livrable** : Comparateur de tissus fonctionnel

---

## Résumé Planning

| Sprint | Nom | Durée | Priorité | Dépend de |
|--------|-----|-------|----------|-----------|
| **J0** | Menu Journey + Compteurs | 3-4h | **P0** | - |
| **J1** | Mode Focus Routing | 2-3h | **P1** | J0 |
| **J2** | Focus Calcul Multi-vêtements | 3-4h | **P1** | J1 |
| J3 | Focus Patron Dimensions | 6-8h | P2 | J1 |
| J4 | Focus Textile Comparateur | 4-5h | P2 | J1 |

**Phase 1 (P0-P1)** : 8-11h → Menu Journey + Calcul avancé
**Phase 2 (P2)** : 10-13h → Patron + Comparateur

---

## Structure des Routes Finale

```
/boards                                    # Liste des boards
/boards/[boardId]                          # Board (vue spatiale)
/boards/[boardId]/journey                  # Journey (vue par phase)
/boards/[boardId]/journey?type=pattern     # Filtre par type
/boards/[boardId]/journey/calculation/[id] # Mode focus calcul
/boards/[boardId]/journey/pattern/[id]     # Mode focus patron
/boards/[boardId]/journey/textile/[id]     # Mode focus textile
/boards/[boardId]/journey/palette/[id]     # Mode focus palette
```

---

## Fichiers à Créer

```
src/app/(main)/boards/[boardId]/journey/
├── page.tsx                              # Vue liste par phase
├── layout.tsx                            # Layout avec sidebar
└── [elementType]/
    └── [elementId]/
        └── page.tsx                      # Mode focus

src/features/journey/components/
├── JourneyNavigation.tsx                 # Menu phases + compteurs
├── ElementList.tsx                       # Liste éléments d'un type
└── focus/
    ├── CalculationFocus.tsx              # Mode focus calcul
    ├── PatternFocus.tsx                  # Mode focus patron
    ├── TextileFocus.tsx                  # Mode focus textile
    └── PaletteFocus.tsx                  # Mode focus palette
```

---

## Fichiers à Modifier

```
src/features/journey/config/steps.ts      # Simplifier en 3 phases
src/features/boards/components/
├── BoardHeader.tsx                       # Bouton bascule Journey
└── BoardCanvas.tsx                       # (optionnel) lien direct
```

---

## Notes de Session

### Session 14 - 15/01/2026 (Suite)

**Nouvelle vision validée** :
- Journey = Vue alternative par type/phase (pas juste mode focus)
- Le designer peut choisir : "Voir mon board" OU "Travailler mes patrons"
- Même données, deux façons de les voir et travailler

**Cas d'usage clé** :
> "Ce matin je veux travailler mes patrons"
> → Journey > Conception > Patrons (2)
> → Clic sur "Robe Magnolia.pdf"
> → Mode focus : définir les pièces, calculer le métrage

**Décision importante** :
- Garder le menu Journey existant (sidebar)
- L'adapter pour afficher les éléments du Board groupés
- Réutiliser `config/steps.ts` simplifié en 3 phases

---

## Suivi des Sessions

| Session | Date | Sprints | Notes |
|---------|------|---------|-------|
| 14 | 15/01/2026 | Planification | ADR-029 v2, nouvelle vision Journey |
| 15 | - | J0 | Menu Journey + Compteurs |
| 16 | - | J1+J2 | Routing + Calcul multi-vêtements |
| ... | | | |

---

**Document maintenu par** : Équipe Dev
**Dernière mise à jour** : 15/01/2026
