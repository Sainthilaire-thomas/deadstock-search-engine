# ADR-016 : Architecture Module Boards

**Date:** 04/01/2026
**Statut:** ✅ Accepté et Implémenté
**Contexte:** Session 12 - Implémentation module Boards

---

## Contexte

Suite au pivot UX de la Session 11 (Journey linéaire → Boards flexible), nous devions implémenter un module Board complet permettant aux designers d'organiser visuellement leurs idées, tissus, notes et calculs sur un canvas interactif.

---

## Décisions

### 1. Structure Polymorphe des Éléments

**Décision:** Utiliser une table unique `board_elements` avec un champ JSONB `element_data` et un discriminant `element_type`.

**Alternatives considérées:**
- Tables séparées par type d'élément
- Héritage de tables PostgreSQL
- JSON schema validation

**Justification:**
- Flexibilité pour ajouter de nouveaux types sans migration
- Requêtes simples (une seule table)
- TypeScript union types pour type safety
- Pattern éprouvé (Notion, Linear)

**Implémentation:**
```typescript
type ElementType = 'textile' | 'note' | 'palette' | 'calculation' | 'inspiration';

type ElementData = 
  | TextileElementData 
  | NoteElementData 
  | PaletteElementData 
  | CalculationElementData 
  | InspirationElementData;

// Type guards pour runtime
function isTextileElement(data: ElementData): data is TextileElementData {
  return 'textileId' in data;
}
```

---

### 2. Session-Based Ownership

**Décision:** Utiliser `session_id` (cookie) pour l'ownership des boards, même pattern que les favoris.

**Alternatives considérées:**
- Authentification utilisateur complète
- localStorage
- Anonymous Supabase auth

**Justification:**
- Cohérence avec système favoris existant
- MVP rapide sans friction utilisateur
- Migration vers `user_id` planifiée Phase 2
- Cookie 90 jours = persistence raisonnable

**Implémentation:**
```typescript
// Toutes les requêtes filtrent par session_id
const { data } = await supabase
  .from('boards')
  .select('*')
  .eq('session_id', sessionId);
```

---

### 3. Optimistic Updates pour Drag & Drop

**Décision:** Mettre à jour le state local immédiatement lors du drag, persister en base en arrière-plan (fire and forget).

**Alternatives considérées:**
- Attendre la réponse serveur avant mise à jour UI
- Debounce des sauvegardes
- WebSocket temps réel

**Justification:**
- UX fluide essentielle pour manipulation canvas
- Latence réseau invisible pour l'utilisateur
- Simplicité d'implémentation
- Cohérence éventuelle acceptable (pas de collaboration)

**Implémentation:**
```typescript
const moveElement = useCallback(async (id: string, x: number, y: number) => {
  // Optimistic update immédiat
  dispatch({ type: 'MOVE_ELEMENT', payload: { id, x, y } });
  
  // Persist to database (fire and forget)
  moveElementAction(id, { positionX: x, positionY: y });
}, []);
```

---

### 4. Zones comme Entité Séparée

**Décision:** Créer une table `board_zones` distincte plutôt que d'intégrer les zones comme type d'élément.

**Alternatives considérées:**
- Zone comme `element_type = 'zone'`
- Groupes virtuels (tag sur éléments)
- Conteneurs imbriqués

**Justification:**
- Sémantique différente (zone = conteneur, élément = contenu)
- z-index séparé (zones toujours en arrière-plan)
- Possibilité future d'assigner éléments à zones
- Requêtes distinctes pour chargement

**Implémentation:**
```sql
CREATE TABLE board_zones (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES boards(id),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 300,
  height INTEGER DEFAULT 200
);
```

---

### 5. Snapshot des Tissus

**Décision:** Stocker un snapshot des données textile au moment de l'ajout au board, pas juste une référence.

**Alternatives considérées:**
- Référence simple (textile_id)
- Lien dynamique avec rechargement
- Copie complète dans élément

**Justification:**
- Prix et disponibilité peuvent changer
- Historique du board préservé
- Textile source peut être supprimé
- `textileId` conservé pour lien vers détail

**Implémentation:**
```typescript
interface TextileElementData {
  textileId: string;  // Pour lien vers détail
  snapshot: {         // Données au moment de l'ajout
    name: string;
    source: string;
    price: number;
    currency: string;
    imageUrl: string | null;
    availableQuantity: number | null;
    material: string | null;
    color: string | null;
  };
  note?: string;
}
```

---

### 6. AddToBoardButton avec Popover

**Décision:** Utiliser un Popover avec liste des boards plutôt qu'un modal ou une action directe.

**Alternatives considérées:**
- Modal de sélection
- Menu dropdown
- "Board actif" global
- Action directe vers dernier board

**Justification:**
- Feedback immédiat (liste visible)
- Création board à la volée si aucun
- Pas de changement de contexte (modal)
- Pattern familier (Pinterest, Figma)

**Implémentation:**
```tsx
<Popover>
  <PopoverTrigger><Button>+</Button></PopoverTrigger>
  <PopoverContent>
    {boards.map(board => (
      <button onClick={() => addToBoard(board.id)}>
        {board.name}
      </button>
    ))}
    <button onClick={createAndAdd}>Nouveau board</button>
  </PopoverContent>
</Popover>
```

---

## Conséquences

### Positives

1. **Flexibilité** - Nouveaux types d'éléments sans migration DB
2. **Performance** - Drag & drop fluide avec optimistic updates
3. **Maintenabilité** - Code organisé par domaine (boards/elements/zones)
4. **UX** - Interactions naturelles et feedback immédiat
5. **Évolutivité** - Base solide pour cristallisation et collaboration

### Négatives / Trade-offs

1. **Type safety partielle** - JSONB nécessite casts et type guards
2. **Données potentiellement obsolètes** - Snapshots vs données live
3. **Pas de rollback** - Optimistic updates sans undo
4. **Session-bound** - Perte données si cookie supprimé

---

## Métriques de Succès

- [x] Drag & drop < 16ms (60fps)
- [x] Création élément < 500ms
- [x] Chargement board < 1s
- [x] Zéro erreur TypeScript runtime

---

## Références

- `SPEC_BOARD_MODULE.md` - Spécifications complètes
- `ARCHITECTURE_UX_BOARD_REALISATION.md` - Vision UX
- Session 11 brainstorm - Décision pivot Journey → Boards
- ADR-005 - Light DDD Architecture (pattern repository)
- ADR-013 - Admin Service Role (pattern client Supabase)
