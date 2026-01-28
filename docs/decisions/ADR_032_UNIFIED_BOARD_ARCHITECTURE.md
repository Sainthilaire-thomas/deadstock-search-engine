# ADR-032 : Architecture Boards Unifiée

**Date** : 28 Janvier 2026  
**Statut** : Accepté  
**Décideurs** : Thomas, Claude  
**Contexte** : Sprint 5 Navigation - Refactoring architecture

---

## Résumé

Fusionner les concepts `Board` et `Zone` en une seule entité hiérarchique pour simplifier l'architecture et permettre une imbrication infinie (poupées gigognes).

---

## Contexte

### Problème identifié

L'architecture actuelle utilise **3 niveaux de complexité** :

```
boards (table)
  └── board_zones (table)
        └── linked_board_id → pointe vers un autre board
        
board_elements (table)
  ├── board_id → appartient à un board
  └── zone_id → appartient à une zone (optionnel)
```

Cette architecture crée des incohérences :
1. Une zone peut contenir des éléments (`zone_id`) ET pointer vers un board (`linked_board_id`)
2. La récursivité nécessite de jongler entre zones et boards
3. Le Focus Mode doit gérer deux sources de données différentes
4. 218 références dans le code à maintenir en cohérence

### Flux utilisateur attendu

```
1. Designer crée un board "Ma Collection"
2. Ajoute des éléments libres (inspirations, tissus, palettes)
3. Crée une "zone" pour regrouper les éléments d'une pièce → Veste Beige
4. Glisse des éléments dans cette zone via Focus Mode
5. Double-clic sur la zone → Focus Mode (aperçu)
6. Clic sur "Ouvrir" → Navigation dans le board Veste Beige
7. Peut créer des sous-zones dedans (Manche, Col, etc.)
8. Peut regrouper plusieurs pièces dans une catégorie (.Hauts, .Bas)
```

Le concept de "Zone" est en réalité un **Board enfant** avec une représentation visuelle sur le canvas parent.

---

## Décision

### Fusionner `board_zones` dans `boards`

**AVANT** : 2 tables + liaison complexe
```sql
boards (id, parent_board_id, name, status, ...)
board_zones (id, board_id, linked_board_id, name, color, position_x, position_y, width, height, ...)
board_elements (id, board_id, zone_id, ...)
```

**APRÈS** : 1 hiérarchie simple
```sql
boards (id, parent_board_id, name, status, color, position_x, position_y, width, height, ...)
board_elements (id, board_id, ...)  -- plus de zone_id
```

### Règles de la nouvelle architecture

1. **Un board peut avoir un parent** (`parent_board_id`)
2. **Un board enfant a des coordonnées** (`position_x`, `position_y`) pour s'afficher sur le canvas parent
3. **Un élément appartient à un seul board** (`board_id`), plus de `zone_id`
4. **La récursivité est native** : board → board enfant → board petit-enfant → ...
5. **Le Focus Mode** affiche les éléments du board enfant
6. **La navigation** utilise le breadcrumb pour remonter la hiérarchie

### Représentation visuelle

```
Board "Collection Été" (id: B1, parent: null)
├── Element "Palette globale" (board_id: B1)
├── Element "Inspiration" (board_id: B1)
│
├── Board "Veste Beige" (id: B2, parent: B1, position: 100,200)
│   │   [Affiché comme carte sur le canvas de B1]
│   ├── Element "Tissu lin" (board_id: B2)
│   ├── Element "Patron" (board_id: B2)
│   └── Element "Calcul" (board_id: B2)
│
└── Board ".Hauts" (id: B3, parent: B1, position: 400,200)
    │   [Catégorie - affiché comme carte]
    ├── Board "Cardigan" (id: B4, parent: B3)
    └── Board "T-shirt" (id: B5, parent: B3)
```

---

## Conséquences

### Positives

| Aspect | Avant | Après | Amélioration |
|--------|-------|-------|--------------|
| Tables DB | 3 | 2 | -33% |
| Fichiers code | ~25 | ~18 | -28% |
| Références zone | 218 | 0 | -100% |
| Jointures requêtes | 3 tables | 2 tables | Plus rapide |
| Récursivité | Complexe (zone→board→zone) | Native (board→board) | Simplifié |
| Cohérence | Zone ≠ Board | Board = Board | Unifié |

### Négatives (temporaires)

- Migration des données existantes nécessaire
- Renommage de nombreux fichiers/fonctions
- Tests à refaire

### Neutres

- Le Focus Mode reste identique (aperçu + drag)
- Le breadcrumb reste identique
- La cristallisation s'adapte (status du board)

---

## Alternatives considérées

### Alternative 1 : Garder l'architecture actuelle et adapter

- **Avantage** : Pas de migration
- **Inconvénient** : Dette technique croissante, complexité maintenue
- **Rejeté** car : La complexité va augmenter avec les nouvelles features

### Alternative 2 : Supprimer les zones, garder uniquement les boards plats

- **Avantage** : Très simple
- **Inconvénient** : Perd la vision hiérarchique et l'organisation
- **Rejeté** car : Ne correspond pas au besoin UX du designer

---

## Plan d'implémentation

Voir `SPRINT_UNIFIED_BOARDS.md` pour le détail des sprints.

### Résumé

| Phase | Description | Durée |
|-------|-------------|-------|
| 1 | Migration DB | 1h |
| 2 | Types et Repository | 1h30 |
| 3 | Context et State | 1h30 |
| 4 | Composants UI | 2h |
| 5 | Hooks et Utils | 1h |
| 6 | Nettoyage | 30min |
| **Total** | | **7h30** |

---

## Métriques de succès

- [ ] Toutes les fonctionnalités existantes fonctionnent
- [ ] Performance identique ou meilleure
- [ ] Code réduit de ~25%
- [ ] Tests passent
- [ ] Pas de régression UX

---

## Références

- ADR-016 : Board Architecture (initiale)
- ADR-028 : Boards Roadmap
- ROADMAP_ZONES_IMBRIQUEES_V2.md
- SPRINT_PERFORMANCE_V2.md (préconisations performance)
- SESSION notes Sprint 5

---

## Préconisations Performance

L'implémentation DOIT respecter les optimisations définies dans `SPRINT_PERFORMANCE_V2.md` :

| Optimisation | Description | Obligatoire |
|--------------|-------------|-------------|
| REACT-1 | Lazy mount des overlays/modals | ✅ |
| REACT-2 | Props stables + CSS Transform | ✅ |
| SCALE-2 | RAF throttling + DOM direct pour drag | ✅ |
| FUTURE-3 | Callbacks mémorisés dans les listes | ✅ |

Ces optimisations ont permis de réduire le rendering de 359ms à 151ms (-58%) et doivent être maintenues.

---

**Auteurs** : Thomas, Claude  
**Dernière mise à jour** : 28 Janvier 2026
