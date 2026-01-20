# Plan de Sprints : Cristallisation & Parcours Projet

**Version** : 1.2

**Date** : 16 Janvier 2026

**Référence** : PARCOURS_DESIGNER_REFERENCE.md

**Statut** : En cours d'implémentation

---

## Vue d'Ensemble

Ce document détaille les sprints techniques pour implémenter le parcours complet du designer : de la cristallisation jusqu'à la production.

### Sprints Prévus

| Sprint | Nom                               | Durée  | Priorité | Statut                   |
| ------ | --------------------------------- | ------ | -------- | ------------------------ |
| C1     | Zone + Éléments Solidaires        | 4-5h   | P1       | ✅ Terminé (16/01/2026)  |
| C2     | Projet Brouillon - Lecture Live   | 3-4h   | P1       | ✅ Terminé (16/01/2026)  |
| C3     | Action Passer Commande + Snapshot | 4-5h   | P1       | ✅ Terminé (16/01/2026)  |
| C3bis  | Multi-fournisseurs (optionnel)    | 1-2h   | P3       | 🔲 Optionnel             |
| C4     | Zone Commandée - Comportements    | 3h     | P1       | 🟡 Partiel (16/01/2026)  |
| C5     | Vue Journey - Liste par Phase     | 4-5h   | P2       | ✅ Terminé (16/01/2026)  |
| C6     | Suivi Post-Commande               | 3h     | P2       | 🔲 À faire               |

**Total estimé : 22-27h** | **Réalisé : ~15h**

---

## Sprint C4 : Zone Commandée - Comportements

**Objectif** : Une zone commandée peut être déplacée (seule) et réduite, mais pas modifiée.

**Durée estimée** : 3h | **Durée réelle** : ~1.5h (partiel)

**Statut** : 🟡 Partiel - C4.1, C4.2, C4.5 terminés

### Implémentation Réalisée

#### Fichiers modifiés :

* `src/features/boards/domain/types.ts` - **MODIFIÉ** : Ajout `ProjectStatus`, `linkedProjectStatus` dans `BoardZone`, helper `isZoneOrdered()`
* `src/features/boards/infrastructure/boardsRepository.ts` - **MODIFIÉ** : JOIN avec `projects` pour récupérer le statut
* `src/features/boards/components/ZoneCard.tsx` - **MODIFIÉ** : Resize conditionnel avec `isZoneOrdered`
* `src/features/boards/components/BoardCanvas.tsx` - **MODIFIÉ** : Blocage édition éléments dans zones commandées

#### Points clés de l'implémentation :

1. **`linkedProjectStatus`** : Nouveau champ dans `BoardZone` récupéré via JOIN avec la table `projects`
2. **`isZoneOrdered()`** : Helper qui retourne `true` si la zone est cristallisée ET le projet n'est plus en brouillon
3. **Resize conditionnel** : Les poignées de resize sont masquées pour les zones commandées
4. **Édition bloquée** : Double-clic sur un élément dans une zone commandée affiche un toast d'info

### C4.1 - Logique de déplacement conditionnel (✅ Fait)

Le déplacement solidaire (zone + éléments) fonctionne pour les deux cas :
- Zone brouillon : zone + éléments bougent ensemble
- Zone commandée : zone + éléments bougent ensemble

### C4.2 - Bloquer le resize des zones commandées (✅ Fait)

```typescript
// ZoneCard.tsx
const isOrdered = isZoneOrdered(zone);

// Resize handles masqués si commandé
{!isOrdered && (
  // ... poignées de resize
)}
```

### C4.3 - Mode réduit toggle (🔲 À faire)

**Objectif** : Permettre de réduire une zone commandée en une barre compacte pour libérer de l'espace.

**À implémenter** :
- Ajouter colonne `is_collapsed` dans `board_zones`
- Modifier `BoardZone` et `BoardZoneRow` types
- Bouton collapse/expand sur les zones commandées
- Rendu compact : `[🔒 Nom | 45€ | ▼]`

### C4.4 - Action toggle collapse (🔲 À faire)

**Fichier** : `src/features/boards/actions/zoneActions.ts`

```typescript
export async function toggleZoneCollapseAction(zoneId: string): Promise<ActionResult<void>>
```

### C4.5 - Bloquer modification éléments dans zone commandée (✅ Fait)

```typescript
// BoardCanvas.tsx
const handleDoubleClick = useCallback((element: BoardElement) => {
  const parentOrderedZone = zones.find(z => 
    isZoneOrdered(z) && isElementInZone(element, z)
  );

  if (parentOrderedZone) {
    toast.info('Cet élément fait partie d\'un projet commandé et ne peut pas être modifié.');
    return;
  }
  // ... reste de la logique
}, [zones]);
```

### Critères de Validation C4

* [x] Zone commandée : peut être déplacée (avec éléments)
* [x] Zone commandée : pas de poignées de resize
* [ ] Zone commandée : bouton réduire visible
* [ ] Mode réduit : affichage compact (1 ligne)
* [ ] Mode réduit : bouton agrandir visible
* [ ] Toggle collapse sauvegardé en DB
* [x] Double-clic sur élément dans zone commandée → message info

### Bugs connus / À corriger

1. **Resize fonctionne sur toutes les zones** : Le `linkedProjectStatus` pourrait ne pas être chargé correctement dans certains cas. À investiguer.
2. **Suppression de zone commandée** : Pas de moyen de supprimer une zone cristallisée (bouton × masqué). À implémenter avec dialogue de confirmation.

---

## Sprint C5 : Vue Journey - Liste par Phase

**Objectif** : Page Journey affichant tous les projets groupés par statut.

**Durée estimée** : 4-5h | **Durée réelle** : ~2h

**Statut** : ✅ Terminé le 16/01/2026

### Implémentation Réalisée

#### Fichiers modifiés :

* `src/features/journey/components/JourneyClientWrapper.tsx` - **MODIFIÉ** : Vue par statut en 4 colonnes

#### Points clés de l'implémentation :

1. **4 colonnes Kanban** : Brouillons, Commandés, Reçus, Terminés
2. **Groupement par `linkedProjectStatus`** : Les zones sont groupées selon le statut du projet lié
3. **Affichage du contenu** : Clic sur un projet affiche ses éléments en dessous
4. **Bouton "Passer commande"** : Visible uniquement pour les projets brouillon

#### Code clé (JourneyClientWrapper.tsx) :

```typescript
const STATUS_COLUMNS = [
  { key: 'draft', title: 'Brouillons', icon: FileText, statuses: ['draft'] },
  { key: 'ordered', title: 'Commandés', icon: Package, statuses: ['ordered', 'shipped'] },
  { key: 'received', title: 'Reçus', icon: CheckCircle, statuses: ['received', 'in_production'] },
  { key: 'completed', title: 'Terminés', icon: Trophy, statuses: ['completed'] },
];

const zonesByStatus = useMemo(() => {
  const grouped = { draft: [], ordered: [], received: [], completed: [] };
  crystallizedZones.forEach((zone) => {
    const status = zone.linkedProjectStatus || 'draft';
    // ... groupement par statut
  });
  return grouped;
}, [crystallizedZones]);
```

### Critères de Validation C5

* [x] Page /journey affiche les 4 colonnes
* [x] Projets groupés par statut correctement
* [x] Compteur par colonne
* [x] Clic sur projet → contenu affiché en dessous
* [x] État vide si aucun projet
* [x] Bouton "Passer commande" uniquement pour brouillons

---

## Sprint C6 : Suivi Post-Commande

**Objectif** : Permettre de suivre l'avancement d'un projet après commande.

**Durée estimée** : 3h

**Statut** : 🔲 À faire

*(Contenu inchangé - voir version précédente)*

---

## Récapitulatif

| Sprint    | Objectif Principal                    | Durée  | Statut |
| --------- | ------------------------------------- | ------ | ------ |
| **C1**    | Zone + éléments solidaires            | 4-5h   | ✅     |
| **C2**    | Projet brouillon = lecture live       | 3-4h   | ✅     |
| **C3**    | Passer commande + snapshot + liens    | 4-5h   | ✅     |
| **C3bis** | Multi-fournisseurs (optionnel)        | 1-2h   | 🔲 Opt |
| **C4**    | Zone commandée (déplacer, réduire)    | 3h     | 🟡     |
| **C5**    | Vue Journey par phase                 | 4-5h   | ✅     |
| **C6**    | Suivi post-commande                   | 3h     | 🔲     |

**Total : 22-27h** | **Réalisé : ~15h**

---

## Prochaines Étapes

1. **C4.3/C4.4** : Implémenter le mode collapse pour les zones commandées
2. **Suppression zones/projets** : Ajouter dialogue de confirmation pour supprimer
3. **C6** : Suivi post-commande (timeline, actions)

---

## Notes Techniques

### Architecture linkedProjectStatus

```
board_zones                      projects
┌─────────────────────┐         ┌──────────────────┐
│ id                  │         │ id               │
│ linked_project_id ──┼────────►│ status           │
│ (linkedProjectStatus│         │ ...              │
│  récupéré via JOIN) │         └──────────────────┘
└─────────────────────┘

boardsRepository.getBoard() fait un JOIN pour récupérer
le statut du projet et l'injecter dans linkedProjectStatus
```

### Helpers Cristallisation

```typescript
// types.ts
isZoneCrystallized(zone) // zone.crystallizedAt !== null
isZoneOrdered(zone)      // cristallisée ET linkedProjectStatus !== 'draft'
```

---

**Document mis à jour le 16/01/2026.**
