# ROADMAP : Boards Imbriqués & Collections

**Version** : 1.1  
**Date de création** : 27 Janvier 2026  
**Dernière mise à jour** : 27 Janvier 2026  
**Statut global** : 3/11 sprints complétés

---

## 📊 Tableau de Suivi

| Sprint | Nom | Durée | Statut | Date Début | Date Fin |
|--------|-----|-------|--------|------------|----------|
| 1 | Appartenance `zoneId` | 2h | ✅ Terminé | 27 Jan 2026 | 27 Jan 2026 |
| 2 | ZoneCard Compacte | 3h | ✅ Terminé | 27 Jan 2026 | 27 Jan 2026 |
| 3 | Focus Mode Overlay | 4h | ✅ Terminé | 27 Jan 2026 | 27 Jan 2026 |
| 4 | Indicateur Visuel | 1h | ⬜ À faire | - | - |
| 5 | Boards Imbriqués DB | 2h | ⬜ À faire | - | - |
| 6 | Navigation Hiérarchique | 3h | ⬜ À faire | - | - |
| 7 | Journey Hiérarchique | 2h | ⬜ À faire | - | - |
| 8 | Page Boards Damier | 3h | ⬜ À faire | - | - |
| 9 | Auto-Arrange Hiérarchique | 2h | ⬜ À faire | - | - |
| 10 | Création Collection | 2h | ⬜ À faire | - | - |
| 11 | Polish & Edge Cases | 2h | ⬜ À faire | - | - |

**Légende** : ⬜ À faire | 🔄 En cours | ✅ Terminé | ⏸️ Bloqué

**Total estimé : 26h** | **Réalisé : ~9h**

---

## 🎯 Vision Globale

Transformer les boards Deadstock pour supporter une hiérarchie **Collection > Catégorie > Pièce**, permettant aux designers de structurer organiquement leur travail créatif.

```
Board "Collection Ébauche"
├── Éléments libres (palette globale, mood...)
├── ZoneCard ".tops" → Sous-board ".tops"
│   ├── Éléments (palette tops...)
│   └── ZoneCard "Top rouge" → Sous-board "Top rouge"
│       └── Éléments (tissu, calcul, patron...)
└── ZoneCard ".bottoms" → Sous-board ".bottoms"
```

---

# SPRINT 1 : Appartenance `zoneId`

**Durée estimée** : 2h  
**Statut** : ✅ Terminé  
**Date** : 27 Janvier 2026

## Objectif

Utiliser le champ `zoneId` existant (mais non utilisé) pour l'appartenance explicite des éléments aux zones, remplaçant le calcul par position.

## Réalisations

- ✅ Ajout `getElementsByZoneId()`, `getFreeElements()`, `elementBelongsToZone()` dans `zoneUtils.ts`
- ✅ Ajout `assignElementToZoneAction()` dans `elementActions.ts`
- ✅ Ajout action `ASSIGN_ELEMENT_TO_ZONE` dans `BoardContext` reducer
- ✅ Ajout callback `assignElementToZone()` exposé via `useBoard()`

## Notes de Session

```
Date: 27 Janvier 2026
Notes:
- Implémentation rapide, le champ zoneId existait déjà en DB
- Pattern établi pour l'appartenance explicite vs calcul par position
```

---

# SPRINT 2 : ZoneCard Compacte

**Durée estimée** : 3h  
**Statut** : ✅ Terminé  
**Date** : 27 Janvier 2026

## Objectif

Remplacer les zones (rectangles extensibles) par des cards compactes affichant des miniatures des éléments.

## Réalisations

- ✅ Créer `ZoneElementThumbnail.tsx` - miniatures 40x40px avec icônes cohérentes BoardToolbar
- ✅ Refondre `ZoneCard.tsx` en card compacte 280x140px
- ✅ Grille de 6 miniatures max avec "+N" pour le reste
- ✅ Supprimer les handles de resize (taille fixe)
- ✅ Garder l'édition du nom (double-clic sur header)
- ✅ Passer `elements[]` à ZoneCard depuis BoardCanvas
- ✅ Supprimer `useZoneResize` hook (code cleanup)
- ✅ Performance améliorée : ZoneCard plus réactive grâce à moins de props dynamiques

## Notes de Session

```
Date: 27 Janvier 2026
Notes:
- Icônes harmonisées avec BoardToolbar (Shirt, Palette, Ruler, etc.)
- Suppression du resize améliore les performances (moins de re-renders)
- ZoneCard notablement plus fluide au drag que les ElementCards
```

---

# SPRINT 3 : Focus Mode Overlay

**Durée estimée** : 4h  
**Statut** : ✅ Terminé  
**Date** : 27 Janvier 2026

## Objectif

Créer l'overlay semi-modal pour prévisualiser et éditer le contenu d'une zone. Le board parent reste visible (assombri) et permet le drag d'éléments vers la zone.

## Réalisations

- ✅ Créer `ZoneFocusContext.tsx` - état du focus mode avec `openFocusMode()`, `closeFocusMode()`
- ✅ Créer `ZoneFocusOverlay.tsx` - overlay 600x500px déplaçable
- ✅ Ajouter `ZoneFocusProvider` dans le layout du board
- ✅ Double-clic sur ZoneCard ouvre le Focus Mode
- ✅ Affichage des éléments de la zone en grille avec preview
- ✅ Overlay déplaçable via drag de la barre de titre (GripHorizontal)
- ✅ Fermeture avec Escape ou bouton X
- ✅ Backdrop semi-transparent `pointer-events-none` pour permettre le drag depuis le board
- ✅ Drag natif HTML5 pour dropper des éléments dans la zone
- ✅ Conditionner drag custom vs drag natif selon Focus Mode dans `ElementCard`
- ✅ Éléments avec `zoneId` masqués du canvas principal (filtre dans `elements.map`)
- ✅ Bouton "Retirer de la zone" dans Focus Mode
- ✅ Toast de confirmation pour ajout/retrait d'éléments

## Notes de Session

```
Date: 27 Janvier 2026
Notes:
- Challenge principal : cohabitation drag custom (canvas) et drag natif (Focus Mode)
- Solution : `isFocusModeOpen` conditionne le type de drag dans ElementCard
- Backdrop pointer-events-none permet de cliquer/dragger les éléments derrière l'overlay
- Éléments assignés à une zone disparaissent du canvas = nettoyage visuel
- Bouton "Ouvrir comme board" préparé mais désactivé (Sprint 6)
```

---

# SPRINT 4 : Indicateur Visuel

**Durée estimée** : 1h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 1  
**Prérequis** : Appartenance `zoneId` fonctionnelle

## Objectif

Ajouter un indicateur visuel sur les éléments appartenant à une zone quand ils sont affichés (ex: dans une vue liste).

---

# SPRINT 5 : Boards Imbriqués DB

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 2  
**Prérequis** : ZoneCard compacte

## Objectif

Ajouter les champs DB pour supporter la hiérarchie de boards (parentBoardId, linkedBoardId sur zones).

---

# SPRINT 6 : Navigation Hiérarchique

**Durée estimée** : 3h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 5  
**Prérequis** : DB hiérarchique

## Objectif

Permettre de naviguer vers un sous-board depuis une ZoneCard, avec breadcrumb de retour.

---

# SPRINT 7 : Journey Hiérarchique

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 6  
**Prérequis** : Navigation fonctionnelle

## Objectif

Adapter la vue Journey pour afficher les éléments du niveau actuel uniquement.

---

# SPRINT 8 : Page Boards Damier

**Durée estimée** : 3h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 5  
**Prérequis** : DB hiérarchique

## Objectif

Modifier la page /boards pour n'afficher que les boards racines et utiliser un layout en damier.

---

# SPRINT 9 : Auto-Arrange Hiérarchique

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 1  
**Prérequis** : Appartenance `zoneId` fonctionnelle

## Objectif

Adapter l'auto-arrange pour respecter la hiérarchie : les éléments avec `zoneId` ne sont pas déplacés individuellement.

---

# SPRINT 10 : Création Collection

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 5, Sprint 6  
**Prérequis** : DB et navigation fonctionnelles

## Objectif

Permettre de transformer un board simple en collection et d'ajouter des catégories.

---

# SPRINT 11 : Polish & Edge Cases

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Tous les sprints précédents  
**Prérequis** : Fonctionnalités principales terminées

## Objectif

Gérer les cas limites, améliorer l'expérience et tester le flux complet.

---

# 📎 Annexes

## A. Commandes Utiles

```powershell
# Lancer le dev server
npm run dev

# Vérifier TypeScript
npx tsc --noEmit

# Voir un fichier
Get-Content -LiteralPath "src/path/to/file.tsx"

# Chercher dans les fichiers
Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" | Select-String -Pattern "zoneId"
```

## B. Documents Liés

- `PROJECT_CONTEXT_V4_2.md` - Contexte technique global
- `SPRINT_PLAN.md` - Plan des sprints Boards & Admin
- `ADR_018_CRYSTALLIZATION_RULES.md` - Règles de cristallisation

## C. Décisions d'Architecture

| Décision | Choix | Raison |
|----------|-------|--------|
| Appartenance éléments | `zoneId` explicite | Plus fiable que calcul par position |
| Focus Mode vs Navigation | Les deux | Focus = preview rapide, Navigation = travail complet |
| Boards imbriqués | `parentBoardId` | Hiérarchie claire et requêtes simples |
| Page Boards | Boards racines uniquement | Performance et clarté |
| Vue Journey | Niveau actuel uniquement | Cohérence avec isolation |
| Drag dans Focus Mode | HTML5 natif | Cohabitation avec drag custom existant |
| Éléments avec zoneId | Masqués du canvas | Nettoyage visuel, éléments dans ZoneCard |

## D. Fichiers Créés/Modifiés (Sprints 1-3)

### Créés
- `src/features/boards/context/ZoneFocusContext.tsx`
- `src/features/boards/components/ZoneFocusOverlay.tsx`
- `src/features/boards/components/ZoneElementThumbnail.tsx`

### Modifiés
- `src/features/boards/utils/zoneUtils.ts` - Ajout fonctions getElementsByZoneId, etc.
- `src/features/boards/actions/elementActions.ts` - Ajout assignElementToZoneAction
- `src/features/boards/context/BoardContext.tsx` - Ajout action ASSIGN_ELEMENT_TO_ZONE
- `src/features/boards/components/ZoneCard.tsx` - Refonte complète en card compacte
- `src/features/boards/components/BoardCanvas.tsx` - Intégration Focus Mode, filtre éléments
- `src/features/boards/components/ElementCard.tsx` - Drag conditionnel custom/natif
- `src/app/(main)/boards/[boardId]/layout.tsx` - Ajout ZoneFocusProvider
- `src/lib/auth/getAuthUser.ts` - Fix sécurité getSession → getUser

---

**Document mis à jour le** : 27 Janvier 2026  
**Auteur** : Thomas / Claude  
**Prochaine session** : Sprint 4 (Indicateur Visuel) ou Sprint 5 (Boards Imbriqués DB)
