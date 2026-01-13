# SPRINT PLAN - Boards & Admin Enhancement

**Version** : 2.1
**Date** : 13 Janvier 2026
**Contexte** : Post-MVP Phase 1, préparation Phase 2

---

## Vue d'Ensemble

```
SPRINTS BOARDS                          SPRINTS ADMIN
──────────────                          ─────────────

Sprint B1: Color Picker LAB     ✅      Sprint A1: Coverage par source
Sprint B2: Recherche contextuelle ✅    Sprint A2: Filtres unknowns
Sprint B3: Système contraintes  🔄      Sprint A3: Edit dictionary
Sprint B4: Potentiel Discovery          Sprint A4: Stock coverage dashboard
Sprint B5: Scraping guidé               Sprint A5: Scraping jobs UI
Sprint B6: Fusion contraintes           Sprint A6: Quality alerts
```

---

## État d'Avancement

| Sprint | Status | Date | Notes |
|--------|--------|------|-------|
| B1 | ✅ Complété | 13/01/2026 | Color matching LAB fonctionnel |
| B2 | ✅ Complété | 13/01/2026 | Panneau recherche contextuelle |
| B3 | 🔄 En cours | 13/01/2026 | Système contraintes multi-éléments |

---

## SPRINTS BOARDS (Recherche Contextuelle)

### Sprint B1 : Color Picker avec Distance LAB ✅ COMPLÉTÉ
**Durée estimée** : 4h | **Durée réelle** : 3h
**Dépendances** : Aucune

#### B1.1 - Utilitaires conversion couleur ✅
```
Fichier : src/lib/color/colorConversion.ts

- [x] Fonction hexToRgb(hex: string): RGB
- [x] Fonction rgbToXyz(rgb: RGB): XYZ
- [x] Fonction xyzToLab(xyz: XYZ): LAB
- [x] Fonction hexToLab(hex: string): LAB (composition)
- [x] Fonctions inverses (labToXyz, xyzToRgb, etc.)
- [x] Validation isValidHex, normalizeHex
```

#### B1.2 - Table référence 16 couleurs ✅
```
Fichier : src/lib/color/databaseColors.ts

- [x] Constante DATABASE_COLORS avec hex + LAB pré-calculés
- [x] Types ColorName, DatabaseColor
- [x] Labels français (labelFr)
- [x] Export pour réutilisation
```

#### B1.3 - Algorithme matching ✅
```
Fichier : src/lib/color/colorMatching.ts

- [x] Fonction labDistance(lab1, lab2): number
- [x] Fonction findMatchingColors(hex, maxDistance, maxResults): ColorMatch[]
- [x] Fonction getMatchingColorNames(hex, minConfidence): string[]
- [x] Interface ColorMatch { colorName, distance, confidence }
- [x] Helpers getConfidenceLevel, getConfidenceColorClass
```

#### B1.4 - Composant ColorMatchDisplay ✅
```
Fichier : src/features/boards/components/ColorMatchDisplay.tsx

- [x] Affichage couleur input avec preview
- [x] Liste des matches avec barres de confiance
- [x] Checkboxes pour sélection manuelle
- [x] Pré-sélection automatique si confiance >= 50%
- [x] Props: hex, onColorsSelected, maxResults, compact
```

**Livrable** : ✅ Module `src/lib/color/` complet + ColorMatchDisplay
**Tests validés** : #FF0000→Rouge 100%, #800020→Bordeaux 88%

---

### Sprint B2 : Recherche Contextuelle Basique ✅ COMPLÉTÉ
**Durée estimée** : 5h | **Durée réelle** : 4h
**Dépendances** : B1 ✅

#### B2.1 - API endpoint recherche contextuelle ✅
```
Fichier : src/app/api/search/contextual/route.ts

- [x] POST handler avec validation
- [x] Extraction contraintes (colorNames, fiber, minQuantity)
- [x] Query textiles_search avec filtres
- [x] Calcul suffisance stock (checkSufficiency)
- [x] Pagination et tri
- [x] Response avec résultats + aggregations
```

#### B2.2 - Hook useContextualSearch ✅
```
Fichier : src/features/boards/hooks/useContextualSearch.ts

- [x] State management (results, loading, error, total)
- [x] Fonction search(constraints)
- [x] Gestion pagination (loadMore)
- [x] Tracking searchedColors
- [x] Aggregations (sufficientCount, insufficientCount)
```

#### B2.3 - Panneau résultats latéral ✅
```
Fichier : src/features/boards/components/ContextualSearchPanel.tsx

- [x] Layout panneau slide-in depuis droite
- [x] Header avec résumé recherche
- [x] Liste résultats avec TextileCardCompact
- [x] Bouton "Ajouter au board" par résultat
- [x] État vide / loading / erreur
- [x] Toggle "Masquer insuffisants"
- [x] Compteur suffisants/insuffisants
```

#### B2.4 - Intégration PaletteEditor ✅
```
Fichier : src/features/boards/components/PaletteEditor.tsx

- [x] Section "Trouver des tissus" avec ColorMatchDisplay
- [x] Bouton "Rechercher" ouvre le panneau
```

**Livrable** : ✅ Recherche depuis palette fonctionnelle
**Tests validés** : #FF6B6B→Marron→8 résultats affichés

---

### Sprint B3 : Système de Contraintes Multi-Éléments 🔄 EN COURS
**Durée estimée** : 4h | **Durée réelle** : En cours
**Dépendances** : B2 ✅

#### B3.1 - Contexte contraintes refactorisé ✅
```
Fichier : src/features/boards/context/ContextualSearchContext.tsx

- [x] Types Constraint (ColorConstraint, QuantityConstraint, MaterialConstraint)
- [x] State avec array de contraintes (multi-sources)
- [x] toggleConstraint, removeConstraint, clearConstraints
- [x] isElementActive(elementId): boolean
- [x] aggregatedConstraints pour l'API
- [x] requiredMeters depuis contrainte quantity
```

#### B3.2 - Bouton contrainte sur éléments ✅
```
Fichier : src/features/boards/components/ConstraintToggleButton.tsx

- [x] Bouton 🔍 sobre (outline style)
- [x] État actif/inactif
- [x] ConstraintActiveBadge (point bleu)
```

#### B3.3 - Intégration ElementCard ✅
```
Fichier : src/features/boards/components/ElementCard.tsx

- [x] Bouton 🔍 sur palette et calculation
- [x] Handler palette → ColorConstraint (première couleur)
- [x] Handler calculation → QuantityConstraint (métrage)
- [x] Badge actif visible
```

#### B3.4 - Panneau avec contraintes chips ✅
```
Fichier : src/features/boards/components/ContextualSearchPanel.tsx (v2)

- [x] Affichage contraintes actives avec chips
- [x] Source de chaque contrainte visible
- [x] Bouton supprimer par contrainte
- [x] Recherche déclenchée par changement de contraintes
```

#### B3.5 - Popover sélection couleur ⏳ À FAIRE
```
Fichier : src/features/boards/components/ColorPickerPopover.tsx

- [ ] Popover au clic sur 🔍 de palette
- [ ] Affiche les couleurs de la palette
- [ ] Sélection + matching vers colorNames
- [ ] Ajout contrainte au contexte
```

#### B3.6 - Accordéon filtres avancés ⏳ À FAIRE
```
Fichier : src/features/boards/components/SearchFiltersAccordion.tsx

- [ ] Filtres couleur (multi-select)
- [ ] Filtres matière (fiber)
- [ ] Filtres motif (pattern)
- [ ] Filtres armure (weave)
- [ ] Métrage (lecture seule si contrainte)
- [ ] Sync avec recherche principale
```

**Livrable** : Système contraintes complet avec filtres avancés

---

### Sprint B4 : Estimation Potentiel Discovery
**Durée estimée** : 4h
**Dépendances** : B3

(Inchangé - voir version précédente)

---

### Sprint B5 : Scraping Guidé Utilisateur
**Durée estimée** : 6h
**Dépendances** : B4, A5

(Inchangé - voir version précédente)

---

### Sprint B6 : Fusion Contraintes Multiples
**Durée estimée** : 4h
**Dépendances** : B5

**Note** : Une partie de B6 (contexte contraintes, fusion) a été avancée dans B3.

(À réviser après B3)

---

## SPRINTS ADMIN

(Inchangé - voir version précédente)

---

## Ordre d'Exécution Mis à Jour

### Phase 1 : Fondations ✅ COMPLÉTÉ
```
Semaine 1:
├── B1: Color Picker LAB (4h)           ✅ Complété
├── A1: Coverage par source (2h)        ⏳ À faire
└── A2: Filtres unknowns (2h)           ⏳ À faire
```

### Phase 2 : Recherche Contextuelle Core ✅ COMPLÉTÉ
```
Semaine 2:
├── B2: Recherche contextuelle (5h)     ✅ Complété
├── B3: Système contraintes (4h)        🔄 En cours
└── A3: Edit dictionary (3h)            ⏳ À faire
```

### Phase 3 : Enrichissement (À venir)
```
Semaine 3:
├── B4: Potentiel Discovery (4h)        ⏳ À faire
├── A4: Stock coverage (3h)             ⏳ À faire
└── A5: Jobs UI (4h)                    ⏳ À faire
```

---

## Résumé Effort Mis à Jour

| Sprint | Durée Est. | Durée Réelle | Status |
|--------|------------|--------------|--------|
| **BOARDS** |
| B1: Color Picker LAB | 4h | 3h | ✅ |
| B2: Recherche contextuelle | 5h | 4h | ✅ |
| B3: Système contraintes | 4h | 2h+ | 🔄 |
| B4: Potentiel Discovery | 4h | - | ⏳ |
| B5: Scraping guidé | 6h | - | ⏳ |
| B6: Fusion contraintes | 4h | - | ⏳ |
| **ADMIN** |
| A1-A6 | 17h | - | ⏳ |

---

## Critères de Validation

### Sprint B1 ✅ VALIDÉ
- [x] `hexToLab('#8B0000')` retourne valeurs LAB correctes
- [x] `findMatchingColors('#8B0000')` retourne 'burgundy' en premier
- [x] Composant affiche barres de confiance
- [x] Checkboxes sélection fonctionnent

### Sprint B2 ✅ VALIDÉ
- [x] Clic sur "Rechercher" dans PaletteEditor ouvre panneau
- [x] Résultats affichent tissus de la bonne couleur
- [x] Bouton "Ajouter au board" fonctionne
- [x] Compteur résultats affiché

### Sprint B3 🔄 EN COURS
- [x] Bouton 🔍 visible sur palette et calcul
- [x] Badge bleu sur élément actif
- [x] Contraintes combinables (couleur + métrage)
- [x] Chips contraintes dans panneau
- [ ] Popover sélection couleur
- [ ] Accordéon filtres avancés

---

## Fichiers Créés/Modifiés - Session 13/01/2026

### Sprint B1
```
CRÉÉS:
- src/lib/color/colorConversion.ts
- src/lib/color/databaseColors.ts
- src/lib/color/colorMatching.ts
- src/lib/color/index.ts
- src/features/boards/components/ColorMatchDisplay.tsx
```

### Sprint B2
```
CRÉÉS:
- src/app/api/search/contextual/route.ts
- src/features/boards/hooks/useContextualSearch.ts
- src/features/boards/components/ContextualSearchPanel.tsx (v1)
- src/features/boards/context/ContextualSearchContext.tsx (v1)

MODIFIÉS:
- src/features/boards/components/PaletteEditor.tsx
- src/features/boards/components/BoardCanvas.tsx
- src/app/(main)/boards/[boardId]/page.tsx
```

### Sprint B3
```
CRÉÉS:
- src/features/boards/components/ConstraintToggleButton.tsx

MODIFIÉS:
- src/features/boards/context/ContextualSearchContext.tsx (v2 - multi-contraintes)
- src/features/boards/components/ContextualSearchPanel.tsx (v2 - chips)
- src/features/boards/components/ElementCard.tsx (bouton contrainte)
```

---

## Notes Session 13/01/2026

### Décisions UX Prises

1. **Séparation des concerns** :
   - Concern 1 : Sélection des contraintes (sur les éléments du board)
   - Concern 2 : Recherche avec contraintes (panneau latéral)

2. **Flux simplifié** :
   - Pour modifier une contrainte : décoche + recoche (pas d'édition inline)
   - Panneau = reflet de la recherche principale avec filtres additionnels

3. **Accordéon filtres** (à implémenter) :
   - Permet d'élargir la recherche au-delà des contraintes initiales
   - Filtres : couleur, matière, motif, armure, prix
   - Métrage reste lecture seule si vient d'un calcul

### Problèmes Identifiés et Résolus

1. **Conflit 2 points d'entrée** : ColorMatchDisplay dans PaletteEditor vs bouton 🔍 sur élément
   - Solution : À clarifier - privilégier le bouton sur élément

2. **Première couleur auto-sélectionnée** : UX confuse
   - Solution : Popover de sélection couleur à implémenter

---

## Prochaines Étapes

1. **Compléter B3** :
   - ColorPickerPopover pour sélection couleur explicite
   - SearchFiltersAccordion pour filtres avancés
   - Retirer/simplifier ColorMatchDisplay du PaletteEditor

2. **Tests utilisateur** :
   - Valider le flux contraintes avec utilisateurs réels
   - Ajuster UX selon feedback

3. **Documentation** :
   - Mettre à jour SPEC_CONTEXTUAL_SEARCH.md
   - Créer ADR pour architecture contraintes
