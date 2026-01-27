# ROADMAP : Zones Imbriquées (Poupées Gigognes)

**Version** : 2.0  
**Date de création** : 27 Janvier 2026  
**Dernière mise à jour** : 27 Janvier 2026  
**Statut global** : 4/8 sprints complétés

---

## 🎯 Vision Globale

Les zones sont des **conteneurs universels** qui peuvent contenir :
- Des **éléments** (tissus, palettes, calculs, inspirations...)
- D'autres **zones** (imbrication infinie comme des poupées gigognes)

**Pas de distinction catégorie/pièce** - l'utilisateur organise comme il veut.

```
Board "Collection Été"
├── Éléments libres (mood global, palette collection...)
├── Zone ".tops"
│   ├── Éléments (palette tops...)
│   ├── Zone "Cardigan Rouge"
│   │   └── Éléments (tissu, calcul, patron...)
│   └── Zone "Cardigan Bleu"
│       └── Éléments (tissu, calcul...)
└── Zone ".bottoms"
    └── Zone "Pantalon Lin"
        └── Éléments (tissu, patron...)
```

### Flux Utilisateur

1. **Double-clic sur Zone** → Focus Mode (preview du contenu)
2. **Dans Focus Mode** :
   - Glisser des **éléments** depuis le canvas → les ajouter à la zone
   - Glisser des **zones** depuis le canvas → les imbriquer (poupées gigognes)
   - Bouton **"Ouvrir comme board"** → naviguer vers le sous-board
3. **Breadcrumb** pour remonter dans la hiérarchie

---

## 📊 Tableau de Suivi

| Sprint | Nom | Durée | Statut | Date Début | Date Fin |
|--------|-----|-------|--------|------------|----------|
| 1 | Appartenance `zoneId` | 2h | ✅ Terminé | 27 Jan 2026 | 27 Jan 2026 |
| 2 | ZoneCard Compacte | 3h | ✅ Terminé | 27 Jan 2026 | 27 Jan 2026 |
| 3 | Focus Mode Overlay | 4h | ✅ Terminé | 27 Jan 2026 | 27 Jan 2026 |
| 4 | Boards Imbriqués DB | 2h | ✅ Terminé | 27 Jan 2026 | 27 Jan 2026 |
| 5 | Navigation & Breadcrumb | 3h | ⬜ À faire | - | - |
| 6 | Zones Imbriquées (Drag) | 3h | ⬜ À faire | - | - |
| 7 | Page Boards (Root Only) | 2h | ⬜ À faire | - | - |
| 8 | Polish & Edge Cases | 2h | ⬜ À faire | - | - |

**Légende** : ⬜ À faire | 🔄 En cours | ✅ Terminé | ⏸️ Bloqué

**Total estimé : 21h** | **Réalisé : ~11h**

---

# SPRINTS TERMINÉS

## Sprint 1 : Appartenance `zoneId` ✅

**Date** : 27 Janvier 2026

Utiliser le champ `zoneId` existant pour l'appartenance explicite des éléments aux zones.

### Réalisations
- ✅ `getElementsByZoneId()`, `getFreeElements()`, `elementBelongsToZone()` dans `zoneUtils.ts`
- ✅ `assignElementToZoneAction()` dans `elementActions.ts`
- ✅ Action `ASSIGN_ELEMENT_TO_ZONE` dans `BoardContext` reducer
- ✅ Callback `assignElementToZone()` exposé via `useBoard()`

---

## Sprint 2 : ZoneCard Compacte ✅

**Date** : 27 Janvier 2026

Remplacer les zones extensibles par des cards compactes avec miniatures.

### Réalisations
- ✅ `ZoneElementThumbnail.tsx` - miniatures 40x40px
- ✅ `ZoneCard.tsx` refonte en card compacte 280x140px
- ✅ Grille de 6 miniatures max avec "+N"
- ✅ Suppression des handles de resize
- ✅ Bouton crayon pour éditer le nom

---

## Sprint 3 : Focus Mode Overlay ✅

**Date** : 27 Janvier 2026

Overlay semi-modal pour prévisualiser et éditer le contenu d'une zone.

### Réalisations
- ✅ `ZoneFocusContext.tsx` - état du focus mode
- ✅ `ZoneFocusOverlay.tsx` - overlay 600x500px déplaçable
- ✅ Double-clic sur ZoneCard ouvre le Focus Mode
- ✅ Drag natif HTML5 pour dropper des éléments
- ✅ Éléments avec `zoneId` masqués du canvas principal
- ✅ Bouton "Retirer de la zone"
- ✅ Toast de confirmation

---

## Sprint 4 : Boards Imbriqués DB ✅

**Date** : 27 Janvier 2026

Structure DB pour supporter la hiérarchie de boards et zones.

### Réalisations

**Migrations SQL :**
- ✅ `033_add_board_hierarchy.sql` : `parent_board_id`, `board_type` sur boards
- ✅ `034_add_zone_linked_board.sql` : `linked_board_id`, `zone_type` sur board_zones

**Types TypeScript :**
- ✅ `BoardType` : 'free' | 'piece' | 'category' | 'collection'
- ✅ `ZoneType` : 'piece' | 'category'
- ✅ Interfaces Board et BoardZone mises à jour
- ✅ Mappers et helpers

**Repository Boards :**
- ✅ `listRootBoards()` - boards sans parent
- ✅ `getBoardAncestors()` - chaîne de parents pour breadcrumb
- ✅ `getChildBoards()` - sous-boards d'un parent
- ✅ Fix relation Supabase ambiguë (`board_zones!board_zones_board_id_fkey`)

**Repository Zones :**
- ✅ `getZoneByLinkedBoard()` - zone pointant vers un board
- ✅ `linkZoneToBoard()` / `unlinkZoneFromBoard()`
- ✅ `getZonesByType()`, `getLinkedZones()`

---

# SPRINTS À FAIRE

## Sprint 5 : Navigation & Breadcrumb

**Durée estimée** : 3h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 4

### Objectif

Permettre de naviguer vers le sous-board d'une zone et afficher un breadcrumb pour remonter.

### 5.1 - Bouton "Ouvrir comme board" dans ZoneFocusOverlay

```typescript
// Dans ZoneFocusOverlay.tsx
const handleOpenAsBoard = async () => {
  if (!focusedZone) return;
  
  let targetBoardId = focusedZone.linkedBoardId;
  
  // Si pas de sous-board lié, en créer un
  if (!targetBoardId) {
    const result = await createLinkedBoardAction(
      focusedZone.id,
      focusedZone.boardId,
      focusedZone.name
    );
    if (result.success && result.data) {
      targetBoardId = result.data.id;
    }
  }
  
  if (targetBoardId) {
    router.push(`/boards/${targetBoardId}`);
  }
};
```

### 5.2 - Action création sous-board lié

```typescript
// src/features/boards/actions/zoneActions.ts

export async function createLinkedBoardAction(
  zoneId: string,
  parentBoardId: string,
  name: string
): Promise<ActionResult<Board>> {
  try {
    const userId = await requireUserId();
    
    // Créer le sous-board
    const newBoard = await boardsRepository.createBoard({
      name,
      parentBoardId,
      boardType: 'piece', // ou 'free', peu importe
    }, userId);
    
    // Lier la zone au nouveau board
    await zonesRepository.linkZoneToBoard(zoneId, newBoard.id);
    
    revalidatePath(`/boards/${parentBoardId}`);
    
    return { success: true, data: newBoard };
  } catch (error) {
    console.error('createLinkedBoardAction error:', error);
    return { success: false, error: 'Impossible de créer le sous-board' };
  }
}
```

### 5.3 - Breadcrumb dans SharedBoardHeader

```typescript
// Props ajoutées
interface SharedBoardHeaderProps {
  board: Board;
  ancestors?: Board[]; // Chaîne de parents
  // ...
}

// Dans le rendu
{ancestors && ancestors.length > 0 && (
  <nav className="flex items-center gap-1 text-sm text-gray-500">
    <Link href="/boards" className="hover:text-gray-700">
      Mes Projets
    </Link>
    {ancestors.map((ancestor) => (
      <React.Fragment key={ancestor.id}>
        <ChevronRight className="w-4 h-4" />
        <Link 
          href={`/boards/${ancestor.id}`}
          className="hover:text-gray-700 truncate max-w-[150px]"
        >
          {ancestor.name || 'Sans nom'}
        </Link>
      </React.Fragment>
    ))}
    <ChevronRight className="w-4 h-4" />
  </nav>
)}
```

### 5.4 - Charger les ancêtres dans la page board

```typescript
// src/app/(main)/boards/[boardId]/page.tsx

const ancestors = await boardsRepository.getBoardAncestors(boardId);

// Passer au header
<SharedBoardHeader 
  board={board} 
  ancestors={ancestors}
  // ...
/>
```

### Checklist de Validation

- [ ] Bouton "Ouvrir comme board" visible dans le Focus Mode
- [ ] Clic crée un sous-board si nécessaire
- [ ] Navigation vers `/boards/[sous-board-id]` fonctionne
- [ ] Breadcrumb affiche les ancêtres
- [ ] Clic sur un ancêtre navigue vers ce board
- [ ] Le sous-board a le bon `parentBoardId`
- [ ] La zone a le bon `linkedBoardId`

---

## Sprint 6 : Zones Imbriquées (Drag)

**Durée estimée** : 3h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 5

### Objectif

Permettre de glisser une zone dans le Focus Mode d'une autre zone pour créer l'imbrication (poupées gigognes).

### 6.1 - Rendre les ZoneCards draggables vers le Focus Mode

```typescript
// Dans ZoneCard.tsx - ajouter le drag natif
<div
  draggable={!isCrystallized}
  onDragStart={(e) => {
    e.dataTransfer.setData('application/zone-id', zone.id);
    e.dataTransfer.effectAllowed = 'move';
  }}
  // ...
>
```

### 6.2 - Drop zone dans ZoneFocusOverlay pour les zones

```typescript
// Dans ZoneFocusOverlay.tsx
const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault();
  
  // Cas 1: Drop d'un élément
  const elementId = e.dataTransfer.getData('application/element-id');
  if (elementId) {
    await assignElementToZone(elementId, focusedZone.id);
    toast.success('Élément ajouté à la zone');
    return;
  }
  
  // Cas 2: Drop d'une zone (imbrication)
  const zoneId = e.dataTransfer.getData('application/zone-id');
  if (zoneId && zoneId !== focusedZone.id) {
    await nestZoneIntoZone(zoneId, focusedZone.id);
    toast.success('Zone imbriquée');
  }
};
```

### 6.3 - Action pour imbriquer une zone dans une autre

```typescript
// src/features/boards/actions/zoneActions.ts

export async function nestZoneIntoZoneAction(
  childZoneId: string,
  parentZoneId: string
): Promise<ActionResult<void>> {
  try {
    // 1. Récupérer la zone parente
    const parentZone = await zonesRepository.getZoneById(parentZoneId);
    if (!parentZone) {
      return { success: false, error: 'Zone parente introuvable' };
    }
    
    // 2. S'assurer que la zone parente a un sous-board
    let targetBoardId = parentZone.linkedBoardId;
    if (!targetBoardId) {
      const userId = await requireUserId();
      const newBoard = await boardsRepository.createBoard({
        name: parentZone.name,
        parentBoardId: parentZone.boardId,
        boardType: 'free',
      }, userId);
      await zonesRepository.linkZoneToBoard(parentZoneId, newBoard.id);
      targetBoardId = newBoard.id;
    }
    
    // 3. Déplacer la zone enfant vers le sous-board
    await zonesRepository.updateZone(childZoneId, {
      boardId: targetBoardId,
    });
    
    // 4. Déplacer aussi les éléments de la zone enfant
    // (ils suivent automatiquement car liés par zoneId)
    
    revalidatePath(`/boards/${parentZone.boardId}`);
    revalidatePath(`/boards/${targetBoardId}`);
    
    return { success: true };
  } catch (error) {
    console.error('nestZoneIntoZoneAction error:', error);
    return { success: false, error: "Impossible d'imbriquer la zone" };
  }
}
```

### 6.4 - Mise à jour du repository zones

```typescript
// Ajouter dans zonesRepository.ts

export async function moveZoneToBoard(
  zoneId: string,
  newBoardId: string
): Promise<BoardZone | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('board_zones')
    .update({ board_id: newBoardId })
    .eq('id', zoneId)
    .select()
    .single();

  if (error) {
    console.error('moveZoneToBoard error:', error);
    throw error;
  }

  return mapZoneFromRow(data as unknown as BoardZoneRow);
}
```

### 6.5 - Afficher les zones imbriquées dans le Focus Mode

```typescript
// Dans ZoneFocusOverlay.tsx
// Afficher à la fois les éléments ET les zones du sous-board

const [childZones, setChildZones] = useState<BoardZone[]>([]);

useEffect(() => {
  if (focusedZone?.linkedBoardId) {
    // Charger les zones du sous-board
    loadChildZones(focusedZone.linkedBoardId);
  }
}, [focusedZone?.linkedBoardId]);

// Dans le rendu
<div className="grid grid-cols-3 gap-3">
  {/* Zones imbriquées */}
  {childZones.map((childZone) => (
    <ZoneMiniCard 
      key={childZone.id} 
      zone={childZone}
      onDoubleClick={() => openFocusMode(childZone)}
    />
  ))}
  
  {/* Éléments */}
  {zoneElements.map((element) => (
    <ElementPreview key={element.id} element={element} />
  ))}
</div>
```

### Checklist de Validation

- [ ] ZoneCard est draggable (sauf si cristallisée)
- [ ] Drop d'une zone dans Focus Mode fonctionne
- [ ] La zone disparaît du canvas principal
- [ ] La zone apparaît dans le Focus Mode de la zone parente
- [ ] Le sous-board est créé automatiquement si nécessaire
- [ ] Double-clic sur zone imbriquée ouvre son Focus Mode
- [ ] Pas possible d'imbriquer une zone dans elle-même

---

## Sprint 7 : Page Boards (Root Only)

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Sprint 5

### Objectif

La page `/boards` n'affiche que les boards racines (sans parent).

### Réalisations prévues

- [ ] Utiliser `listRootBoards()` au lieu de `listBoards()`
- [ ] Ou filtrer `listBoardsWithPreview()` (déjà fait avec `is('parent_board_id', null)`)
- [ ] Vérifier que les sous-boards n'apparaissent pas dans la liste
- [ ] Optionnel : indicateur visuel si le board a des sous-boards

---

## Sprint 8 : Polish & Edge Cases

**Durée estimée** : 2h  
**Statut** : ⬜ À faire  
**Dépendances** : Tous les sprints précédents

### Objectif

Gérer les cas limites et améliorer l'expérience.

### Tâches prévues

- [ ] Empêcher les boucles d'imbrication (A dans B dans A)
- [ ] Suppression en cascade ou détachement ?
- [ ] Animation de transition Focus Mode → Navigation
- [ ] Profondeur max d'imbrication ? (performance)
- [ ] Retirer une zone de son parent (remonter d'un niveau)
- [ ] Tests E2E du flux complet

---

# 📎 Annexes

## A. Architecture Technique

### Stockage de l'imbrication

L'imbrication utilise **deux mécanismes** :

1. **Éléments dans Zone** : `board_elements.zone_id` → `board_zones.id`
2. **Zone dans Zone** : La zone enfant est dans le `linkedBoardId` de la zone parente
   - Zone parente a `linked_board_id` pointant vers un sous-board
   - La zone enfant a `board_id` = ce sous-board

```
Zone "Collection" (board_id: B1, linked_board_id: B2)
  └── Zone ".tops" (board_id: B2, linked_board_id: B3)
        └── Zone "Cardigan" (board_id: B3, linked_board_id: null)
              └── Élément "Tissu Lin" (board_id: B3, zone_id: Z-cardigan)
```

### Tables impliquées

```sql
-- boards
id, parent_board_id, board_type, name...

-- board_zones  
id, board_id, linked_board_id, zone_type, name...

-- board_elements
id, board_id, zone_id, element_type, element_data...
```

## B. Commandes Utiles

```powershell
# Dev server
npm run dev

# TypeScript check
npx tsc --noEmit

# Régénérer types Supabase
npx supabase gen types typescript --project-id <id> --schema deadstock > src/types/database.types.ts
```

## C. Fichiers Clés

```
src/features/boards/
├── components/
│   ├── ZoneCard.tsx           # Card compacte avec miniatures
│   ├── ZoneFocusOverlay.tsx   # Focus Mode overlay
│   ├── ZoneElementThumbnail.tsx
│   ├── SharedBoardHeader.tsx  # Header avec breadcrumb
│   └── BoardCanvas.tsx        # Canvas principal
├── context/
│   ├── BoardContext.tsx       # État du board
│   └── ZoneFocusContext.tsx   # État du Focus Mode
├── actions/
│   ├── elementActions.ts      # assignElementToZoneAction
│   └── zoneActions.ts         # createLinkedBoardAction, nestZoneIntoZoneAction
├── infrastructure/
│   ├── boardsRepository.ts    # getBoardAncestors, listRootBoards...
│   └── zonesRepository.ts     # linkZoneToBoard, moveZoneToBoard...
└── domain/
    └── types.ts               # BoardType, ZoneType, interfaces...
```

---

**Document mis à jour le** : 27 Janvier 2026  
**Auteur** : Thomas / Claude  
**Prochaine session** : Sprint 5 (Navigation & Breadcrumb)
