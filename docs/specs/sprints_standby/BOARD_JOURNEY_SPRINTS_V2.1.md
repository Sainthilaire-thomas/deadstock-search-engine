# BOARD + JOURNEY - Plan de Sprints

**Version** : 2.1
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

## Architecture Implémentée (Session 15)

```
Board (canvas)
├── Toolbar gauche (48px)
│   ├── Outils création (Note, Palette, Tissu, Calcul...)
│   ├── Médias (Image, Vidéo, Lien)
│   ├── Documents (PDF, Patron, Silhouette)
│   ├── ─────────────────────────
│   ├── 💡 Conception (N) → hover popup → accès direct par type
│   ├── 📏 Préparation (N) → hover popup → accès direct par type
│   ├── 🛒 Exécution (N) → hover popup → accès direct par type
│   ├── ─────────────────────────
│   └── Contrôles (Recherche, Immersif, Vue, Zone)
└── Header
    └── Bouton "Journey" → vue complète /journey

Journey (vue par phase)
├── Sidebar gauche (JourneyNavigation)
│   ├── Retour au Board
│   ├── Conception (compteur)
│   │   ├── Palettes (N)
│   │   ├── Patrons (N)
│   │   └── ...
│   ├── Préparation (compteur)
│   └── Exécution (compteur)
├── Zone principale (liste éléments filtrés)
└── Stats par défaut si aucun type sélectionné
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

## État des Sprints

### ✅ Sprint J0 : Menu Journey avec Compteurs - COMPLÉTÉ

**Session** : 15 (15/01/2026)
**Durée réelle** : ~3h

| Tâche | Fichier | Statut |
|-------|---------|--------|
| J0.1 - Config 3 phases | `src/features/journey/config/steps.ts` | ✅ |
| J0.2 - JourneyNavigation | `src/features/journey/components/JourneyNavigation.tsx` | ✅ |
| J0.3 - Route Journey | `src/app/(main)/boards/[boardId]/journey/page.tsx` | ✅ |
| J0.4 - Bouton Journey header | `src/features/boards/components/BoardHeader.tsx` | ✅ |
| **Bonus** - Icônes toolbar | `src/features/boards/components/BoardToolbar.tsx` | ✅ |
| **Bonus** - Compteurs dynamiques | `src/features/boards/components/BoardCanvas.tsx` | ✅ |

**Fichiers créés** :
- `src/features/journey/components/JourneyNavigation.tsx`
- `src/app/(main)/boards/[boardId]/journey/page.tsx`

**Fichiers modifiés** :
- `src/features/journey/config/steps.ts` - Refonte (3 phases, types config)
- `src/features/journey/components/Sidebar.tsx` - Temporairement désactivé
- `src/features/journey/components/MobileJourneyNav.tsx` - Temporairement désactivé
- `src/features/boards/components/BoardHeader.tsx` - Bouton Journey
- `src/features/boards/components/BoardToolbar.tsx` - Section Journey avec hover popup
- `src/features/boards/components/BoardCanvas.tsx` - elementCounts

**Critères validés** :
- ✅ Compteurs visibles dans toolbar Board (badges)
- ✅ Hover popup avec liste des types par phase
- ✅ Navigation directe vers `/journey?type=XXX`
- ✅ Vue Journey avec sidebar et liste filtrée
- ✅ Retour au Board fluide

---

### ⏳ Sprint J1 : Mode Focus avec Routing (2-3h)

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

### ⏳ Sprint J2 : Mode Focus Calcul - Multi-Vêtements (3-4h)

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

---

### ⏳ Sprint J3 : Mode Focus Patron - Extraction Dimensions (6-8h)

**Objectif** : Travailler un patron PDF pour extraire les dimensions et calculer automatiquement

---

### ⏳ Sprint J4 : Mode Focus Textile - Comparateur (4-5h)

**Objectif** : Comparer plusieurs tissus côte à côte

---

## Résumé Planning

| Sprint | Nom | Durée | Priorité | Statut |
|--------|-----|-------|----------|--------|
| **J0** | Menu Journey + Compteurs | 3h | **P0** | ✅ Complété |
| **J1** | Mode Focus Routing | 2-3h | **P1** | ⏳ À faire |
| **J2** | Focus Calcul Multi-vêtements | 3-4h | **P1** | ⏳ À faire |
| J3 | Focus Patron Dimensions | 6-8h | P2 | ⏳ À faire |
| J4 | Focus Textile Comparateur | 4-5h | P2 | ⏳ À faire |

**Phase 1 (P0-P1)** : J0 ✅ + J1 + J2 = ~8-11h restant ~5-7h
**Phase 2 (P2)** : J3 + J4 = ~10-13h

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

## Fichiers Journey Actuels

```
src/features/journey/
├── config/
│   ├── steps.ts              # ✅ 3 phases + ElementTypeConfig
│   └── garments.ts           # Config vêtements (existant)
├── components/
│   ├── JourneyNavigation.tsx # ✅ NOUVEAU - Sidebar Journey
│   ├── Sidebar.tsx           # Désactivé temporairement
│   ├── SidebarStep.tsx       # Existant (non utilisé)
│   └── MobileJourneyNav.tsx  # Désactivé temporairement
├── domain/
│   └── types.ts              # Types complets (existant)
└── services/
    └── yardageCalculator.ts  # Calcul métrage (existant)

src/app/(main)/boards/[boardId]/journey/
└── page.tsx                  # ✅ NOUVEAU - Vue liste par phase
```

---

## Notes de Session

### Session 15 - 15/01/2026

**Réalisations** :
- Sprint J0 complété intégralement
- Bonus : Intégration des icônes Journey directement dans la toolbar Board
- Hover popup pour accès rapide aux types

**Décisions UX** :
- Garder le bouton "Journey" dans le header comme raccourci
- Ajouter les icônes phases dans la toolbar avec badges compteurs
- Hover popup pour navigation directe sans quitter le Board
- Mode immersif masque tout (y compris les icônes Journey)

**Points techniques** :
- `steps.ts` refactoré en 3 phases avec `ElementTypeConfig`
- Composant `JourneyButton` avec hover popup dans toolbar
- `elementCounts` calculés dans `BoardCanvas` et passés à `BoardToolbar`
- Fix hover popup : `ml-1` + zone invisible `before:` pour garder le hover actif

---

### Session 14 - 15/01/2026

**Nouvelle vision validée** :
- Journey = Vue alternative par type/phase (pas juste mode focus)
- Le designer peut choisir : "Voir mon board" OU "Travailler mes patrons"
- Même données, deux façons de les voir et travailler

---

## Suivi des Sessions

| Session | Date | Sprints | Notes |
|---------|------|---------|-------|
| 14 | 15/01/2026 | Planification | ADR-029 v2, nouvelle vision Journey |
| 15 | 15/01/2026 | J0 ✅ | Menu Journey + Compteurs + Bonus toolbar |
| 16 | - | J1+J2 | Routing + Calcul multi-vêtements |
| ... | | | |

---

**Document maintenu par** : Équipe Dev
**Dernière mise à jour** : 15/01/2026 - Session 15
