# SPRINT PLAN - Boards & Admin Enhancement

**Version** : 2.2
**Date** : 13 Janvier 2026
**Contexte** : Post-MVP Phase 1, préparation Phase 2

---

## Vue d'Ensemble

```
SPRINTS BOARDS                          SPRINTS ADMIN
──────────────                          ─────────────

Sprint B1: Color Picker LAB     ✅      Sprint A1: Coverage par source
Sprint B2: Recherche contextuelle ✅    Sprint A2: Filtres unknowns
Sprint B3: Système contraintes  ✅      Sprint A3: Edit dictionary
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
| B3 | ✅ Complété | 13/01/2026 | Système contraintes + filtres avancés |

---

## SPRINTS BOARDS (Recherche Contextuelle)

### Sprint B1 : Color Picker avec Distance LAB ✅ COMPLÉTÉ
**Durée estimée** : 4h | **Durée réelle** : 3h

(Voir version précédente pour détails)

---

### Sprint B2 : Recherche Contextuelle Basique ✅ COMPLÉTÉ
**Durée estimée** : 5h | **Durée réelle** : 4h

(Voir version précédente pour détails)

---

### Sprint B3 : Système de Contraintes Multi-Éléments ✅ COMPLÉTÉ
**Durée estimée** : 4h | **Durée réelle** : 6h
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
- [x] Handler palette → ouvre ColorPickerPopover
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
- [x] Bouton toolbar pour toggle panel
- [x] Badge contraintes actives sur bouton
```

#### B3.5 - Popover sélection couleur ✅
```
Fichier : src/features/boards/components/ColorPickerPopover.tsx

- [x] Popover au clic sur 🔍 de palette
- [x] Affiche les couleurs de la palette (preview)
- [x] Liste des couleurs catalogue disponibles avec count
- [x] Sélection manuelle (abandon matching LAB automatique)
- [x] API /api/colors/available pour couleurs dynamiques
```

#### B3.6 - Filtres avancés SearchFiltersCompact ✅
```
Fichier : src/features/boards/components/SearchFiltersCompact.tsx

- [x] Accordéon filtres (Matière, Couleur, Motif, Tissage)
- [x] Filtres ÉTENDENT les contraintes (union, pas remplacement)
- [x] Couleurs contraintes affichées comme verrouillées (●)
- [x] Compteur filtres actifs
- [x] Reset des filtres additionnels
- [x] Support pattern dans API contextual
```

#### B3.7 - Cleanup ColorMatchDisplay ⏳ À FAIRE
```
- [ ] Retirer ColorMatchDisplay de PaletteEditor (doublon)
- [ ] Nettoyer imports inutilisés
```

**Livrable** : ✅ Système contraintes complet avec filtres avancés

---

### Sprint B4 : Estimation Potentiel Discovery
**Durée estimée** : 4h
**Dépendances** : B3 ✅

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

**Note** : Fusionné dans B3 - logique de combinaison implémentée.

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
├── B3: Système contraintes (6h)        ✅ Complété
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
| B3: Système contraintes | 4h | 6h | ✅ |
| B4: Potentiel Discovery | 4h | - | ⏳ |
| B5: Scraping guidé | 6h | - | ⏳ |
| B6: Fusion contraintes | 4h | - | N/A (fusionné B3) |
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

### Sprint B3 ✅ VALIDÉ
- [x] Bouton 🔍 visible sur palette et calcul
- [x] Badge bleu sur élément actif
- [x] Contraintes combinables (couleur + métrage)
- [x] Chips contraintes dans panneau
- [x] ColorPickerPopover avec sélection couleurs catalogue
- [x] SearchFiltersCompact avec filtres avancés
- [x] Filtres étendent les contraintes (union)
- [x] Couleurs contraintes verrouillées dans filtres

---

## Fichiers Créés/Modifiés - Sprint B3 Complet

### Créés
```
- src/app/api/colors/available/route.ts
- src/features/boards/components/ConstraintToggleButton.tsx
- src/features/boards/components/ColorPickerPopover.tsx
- src/features/boards/components/SearchFiltersCompact.tsx
```

### Modifiés
```
- src/features/boards/context/ContextualSearchContext.tsx (v2 - multi-contraintes)
- src/features/boards/components/ContextualSearchPanel.tsx (v2 - chips + filtres)
- src/features/boards/components/ElementCard.tsx (bouton contrainte)
- src/features/boards/components/BoardCanvas.tsx (contraste)
- src/features/boards/components/BoardToolbar.tsx (bouton search)
- src/features/boards/hooks/useContextualSearch.ts (pattern support)
- src/app/api/search/contextual/route.ts (pattern filter)
- src/components/search/PriceDisplay.tsx (format unifié)
- src/lib/color/databaseColors.ts (gray, lilac, dark gray)
- src/lib/color/colorMatching.ts (findMatchingColorsFromAvailable)
- src/lib/color/index.ts (exports)
```

---

## Décisions Architecturales Session 13/01/2026

### ADR-026 : Abandon matching LAB automatique pour sélection couleur

**Contexte** : Le matching LAB automatique donnait des résultats contre-intuitifs (vert → beige).

**Décision** : Remplacer par sélection manuelle des couleurs catalogue.

**Conséquences** :
- UX plus prévisible et compréhensible
- Perte de la "magie" du matching automatique
- Code `findMatchingColorsFromAvailable` conservé pour usage futur

**Alternatives documentées pour le futur** :
- Stockage LAB natif sur textiles (extraction couleur dominante)
- Elastic Search vectoriel
- Palette dynamique reflétant l'inventaire

### ADR-027 : Filtres qui étendent vs remplacent

**Contexte** : Comment combiner contraintes (depuis éléments) et filtres additionnels ?

**Décision** : Les filtres additionnels font une **union** avec les contraintes.

**Implémentation** :
```typescript
const combinedColors = [...new Set([...baseColors, ...additionalColors])];
```

**Conséquences** :
- Élargissement naturel de la recherche
- Contrainte initiale toujours visible (verrouillée)
- Comportement intuitif pour l'utilisateur

---

## Prochaines Étapes

1. **B3.7 (cleanup)** : Retirer ColorMatchDisplay de PaletteEditor
2. **B4** : Potentiel Discovery - indicateurs stock par couleur
3. **Admin** : Sprints A1-A3 pour améliorer la qualité des données
