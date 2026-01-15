# BOARD + JOURNEY - Plan de Sprints

**Version** : 2.2
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
│   │  ┌───┐ ┌───┐        │           │  ├── 🧵 Tissus (4 tabs)       │    │
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

## Architecture Implémentée (Sessions 15-16)

```
Flux Utilisateur
├── Login → /boards (liste des boards)
├── 0 board → CTA "Créer mon premier projet"
└── 1+ boards → Sélection → /boards/[id]

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
│   ├── Préparation (compteur)
│   │   └── Tissus → Vue avec 4 tabs ✨ NOUVEAU
│   └── Exécution (compteur)
├── Zone principale (liste éléments filtrés)
└── Stats par défaut si aucun type sélectionné

Journey > Préparation > Tissus (4 tabs) ✨ NOUVEAU
├── [Mes Tissus] → Éléments textile du board
├── [Recherche] → SearchInterface intégré
├── [Favoris] → FavoritesGrid intégré
└── [Comparaison] → Placeholder (à développer)
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
| └── Tissus | `textile` | 🧵 | **4 tabs: Board/Search/Favoris/Compare** ✅ |
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

---

### ✅ Sprint J1-Tissus : Vue Tissus avec Tabs - COMPLÉTÉ

**Session** : 16 (15/01/2026)
**Durée réelle** : ~2h

| Tâche | Fichier | Statut |
|-------|---------|--------|
| Refactor page Journey en Server Component | `src/app/(main)/boards/[boardId]/journey/page.tsx` | ✅ |
| Client Wrapper avec useBoard() | `src/features/journey/components/JourneyClientWrapper.tsx` | ✅ |
| Vue Tissus avec 4 tabs | `src/features/journey/components/views/TextileJourneyView.tsx` | ✅ |
| Suppression sidebar legacy | `src/app/(main)/layout.tsx` | ✅ |

**Fichiers créés** :
- `src/features/journey/components/JourneyClientWrapper.tsx`
- `src/features/journey/components/views/TextileJourneyView.tsx`

**Fichiers modifiés** :
- `src/app/(main)/boards/[boardId]/journey/page.tsx` - Server Component
- `src/app/(main)/layout.tsx` - Suppression padding sidebar legacy

---

### ✅ Nettoyage & Flux Utilisateur - COMPLÉTÉ

**Session** : 16 (15/01/2026)
**Durée réelle** : ~1h

| Tâche | Statut |
|-------|--------|
| Suppression legacy `/journey` (9 étapes) | ✅ |
| Backup pages `/search` et `/favorites` | ✅ |
| Redirection callback auth → `/boards` | ✅ |
| Redirection login page → `/boards` | ✅ |
| Fix authentification (debug + résolution) | ✅ |

**Fichiers supprimés** :
- `src/app/(main)/journey/` (ancien système 9 étapes)

**Fichiers déplacés vers `src/_backup/`** :
- `src/app/(main)/search/` → `src/_backup/search/`
- `src/app/(main)/favorites/` → `src/_backup/favorites/`

**Fichiers modifiés** :
- `src/app/api/auth/callback/route.ts` - `/boards` au lieu de `/search`
- `src/app/(auth)/login/page.tsx` - `/boards` au lieu de `/search`

---

### ⏳ Sprint J1-Calculs : Vue Calculs avec Tabs (À FAIRE)

**Objectif** : Même pattern que Tissus pour les Calculs

```
Journey > Préparation > Calculs (2 tabs)
├── [Mes Calculs] → Éléments calculation du board
└── [Calculateur] → Outil yardage-calculator intégré
```

**Estimation** : 2-3h

---

### ⏳ Sprint J2 : Mode Focus Routing (À FAIRE)

**Objectif** : Permettre d'ouvrir un élément en mode focus (plein écran)

```
/boards/[boardId]/journey/calculation/[id] # Mode focus calcul
/boards/[boardId]/journey/pattern/[id]     # Mode focus patron
/boards/[boardId]/journey/textile/[id]     # Mode focus textile
```

**Estimation** : 2-3h

---

### ⏳ Sprint J3 : Mode Focus Calcul - Multi-Vêtements (À FAIRE)

**Objectif** : Calculateur avancé avec support multi-vêtements

**Estimation** : 3-4h

---

## Résumé Planning

| Sprint | Nom | Durée | Priorité | Statut |
|--------|-----|-------|----------|--------|
| **J0** | Menu Journey + Compteurs | 3h | **P0** | ✅ Complété |
| **J1-Tissus** | Vue Tissus 4 tabs | 2h | **P0** | ✅ Complété |
| **Cleanup** | Flux utilisateur + auth | 1h | **P0** | ✅ Complété |
| **J1-Calculs** | Vue Calculs 2 tabs | 2-3h | **P1** | ⏳ À faire |
| J2 | Mode Focus Routing | 2-3h | P1 | ⏳ À faire |
| J3 | Focus Calcul Multi-vêtements | 3-4h | P2 | ⏳ À faire |
| J4 | Focus Patron Dimensions | 6-8h | P2 | ⏳ À faire |
| J5 | Focus Textile Comparateur | 4-5h | P2 | ⏳ À faire |

**Complété** : ~6h
**Restant P1** : ~4-6h
**Restant P2** : ~13-17h

---

## Structure des Routes Actuelle

```
/                                          # Landing page
/login                                     # Login → redirige vers /boards
/boards                                    # Liste des boards (point d'entrée)
/boards/[boardId]                          # Board (vue spatiale)
/boards/[boardId]/journey                  # Journey (vue par phase)
/boards/[boardId]/journey?type=textile     # Tissus avec 4 tabs ✅
/boards/[boardId]/journey?type=calculation # Calculs (liste simple pour l'instant)
/textiles/[id]                             # Détail textile (reste standalone)
/admin/*                                   # Admin (inchangé)
```

**Routes supprimées** :
- `/search` → Intégré dans Journey > Tissus > tab Recherche
- `/favorites` → Intégré dans Journey > Tissus > tab Favoris
- `/journey/*` → Ancien système remplacé par `/boards/[boardId]/journey`

---

## Fichiers Journey Actuels

```
src/features/journey/
├── config/
│   ├── steps.ts              # ✅ 3 phases + ElementTypeConfig
│   └── garments.ts           # Config vêtements (existant)
├── components/
│   ├── JourneyNavigation.tsx # ✅ Sidebar Journey
│   ├── JourneyClientWrapper.tsx # ✅ NOUVEAU - Client wrapper
│   ├── views/
│   │   └── TextileJourneyView.tsx # ✅ NOUVEAU - Vue 4 tabs
│   ├── Sidebar.tsx           # Désactivé (return null)
│   └── MobileJourneyNav.tsx  # Désactivé
├── domain/
│   └── types.ts              # Types complets
└── services/
    └── yardageCalculator.ts  # Calcul métrage

src/app/(main)/boards/[boardId]/journey/
└── page.tsx                  # ✅ Server Component

src/_backup/                  # Pages obsolètes (backup)
├── search/
└── favorites/
```

---

## Notes de Session

### Session 16 - 15/01/2026

**Réalisations** :
- Sprint J1-Tissus complété : Vue avec 4 tabs (Mes Tissus, Recherche, Favoris, Comparaison)
- Pattern Next.js optimal : Server Component charge les données, Client Component gère l'UI
- Nettoyage architecture : Suppression legacy Journey, backup pages standalone
- Flux utilisateur : Login → /boards (plus de /search orphelin)
- Fix authentification : Debug et résolution du problème de profil

**Décisions Architecture** :
- Les pages `/search` et `/favorites` sont obsolètes, fonctionnalités intégrées dans Journey
- Server Component pour charger `searchTextiles()` et `favorites` côté serveur
- Client Component (`JourneyClientWrapper`) pour `useBoard()` et gestion UI
- Backup des anciennes pages dans `src/_backup/` (pas de suppression définitive)

**Points techniques** :
- `JourneyClientWrapper` reçoit `initialSearchData` et `initialFavorites` en props
- `TextileJourneyView` gère les 4 tabs avec état local
- Tab Comparaison = placeholder pour développement futur
- Layout principal simplifié (suppression `md:pl-60` de l'ancienne sidebar)

**Bugs résolus** :
- Auth : `getUser()` retournait bien l'utilisateur mais le profil n'était pas affiché
- Cause : Le composant fonctionnait, problème de timing/cache résolu par restart serveur
- Redirection login : Changé de `/search` vers `/boards` dans callback ET page login

---

### Session 15 - 15/01/2026

**Réalisations** :
- Sprint J0 complété intégralement
- Bonus : Intégration des icônes Journey directement dans la toolbar Board
- Hover popup pour accès rapide aux types

---

## Suivi des Sessions

| Session | Date | Sprints | Durée | Notes |
|---------|------|---------|-------|-------|
| 14 | 15/01/2026 | Planification | 1h | ADR-029 v2, nouvelle vision Journey |
| 15 | 15/01/2026 | J0 ✅ | 3h | Menu Journey + Compteurs + Bonus toolbar |
| 16 | 15/01/2026 | J1-Tissus ✅ + Cleanup ✅ | 3h | Vue 4 tabs + flux utilisateur + fix auth |
| 17 | - | J1-Calculs + J2 | - | Vue calculs + routing mode focus |

---

## Prochaines Étapes (Session 17)

1. **Sprint J1-Calculs** : Créer `CalculationJourneyView` avec 2 tabs
   - Tab "Mes Calculs" : Liste des éléments calculation du board
   - Tab "Calculateur" : Intégrer `/tools/yardage-calculator`

2. **Sprint J2** : Routing mode focus pour édition avancée

3. **Optionnel** : Tab "Comparaison" dans Tissus (comparer favoris côte à côte)

---

**Document maintenu par** : Équipe Dev
**Dernière mise à jour** : 15/01/2026 - Session 16
