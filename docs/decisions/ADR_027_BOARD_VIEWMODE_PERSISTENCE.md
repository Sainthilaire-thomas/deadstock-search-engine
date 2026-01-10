# ADR-027 : Board View Mode (Toggle Zones)

**Date** : 10 Janvier 2026  
**Statut** : Accepté  
**Contexte** : Sprint 2 - Toggle Mode Inspiration/Projet  
**Impact** : BoardContext, UX

---

## Résumé

Le `viewMode` est un **simple toggle d'affichage** qui masque ou affiche les zones sur le board. Ce n'est pas une catégorisation du board.

---

## 1. Clarification Conceptuelle

### Ce que viewMode N'EST PAS ❌

- Un type de board (tous les boards sont identiques)
- Une catégorie (inspiration vs projet)
- Une propriété persistante essentielle

### Ce que viewMode EST ✅

- Un **toggle d'affichage** temporaire
- Masque/affiche les zones pour faciliter le travail
- Mode Inspiration = vue "moodboard fluide" (zones cachées)
- Mode Projet = vue "organisation" (zones visibles)

```
┌─────────────────────────────────────────────────────────────────┐
│                        UN SEUL BOARD                            │
│                                                                 │
│  Contient TOUS les types d'éléments :                          │
│  📷 Images, 🧵 Tissus, 🎨 Palettes, 📐 Calculs, 📝 Notes...    │
│                                                                 │
│  + Des ZONES pour organiser                                     │
│  + CRISTALLISATION zone → projet de fabrication                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TOGGLE AFFICHAGE (viewMode)                                    │
│                                                                 │
│  [👁 Inspiration]              [📋 Projet]                      │
│  Zones masquées                Zones visibles                   │
│  Focus ambiance                Focus organisation               │
│                                                                 │
│  → Même board, même données, juste l'affichage change          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Décision : Pas de Persistence MVP

### Comportement Actuel (Validé)

```typescript
// À chaque ouverture du board
const [viewMode, setViewMode] = useState<'inspiration' | 'project'>('inspiration');

// L'utilisateur toggle librement
// Au refresh ou changement de page → reset à 'inspiration'
```

### Justification

| Argument | Explication |
|----------|-------------|
| **Simplicité** | Pas de localStorage, pas de Supabase |
| **UX claire** | Toujours le même état initial |
| **Toggle rapide** | Un clic pour changer, pas de friction |
| **Non essentiel** | La persistence n'apporte pas de valeur significative |

---

## 3. Options Futures (Backlog)

Si des utilisateurs demandent la persistence :

### Option A : localStorage global (simple)
```typescript
// Préférence utilisateur globale
localStorage.setItem('deadstock-preferred-viewmode', 'project');
```

### Option B : localStorage par board
```typescript
// Chaque board garde son dernier mode
localStorage.setItem(`deadstock-board-${boardId}-viewmode`, 'project');
```

### Option C : Supabase (si auth)
```sql
-- Préférence utilisateur
ALTER TABLE users ADD COLUMN preferred_view_mode TEXT DEFAULT 'inspiration';

-- Ou par board
ALTER TABLE boards ADD COLUMN last_view_mode TEXT DEFAULT 'inspiration';
```

**Statut** : Backlog - À implémenter seulement si demande utilisateur.

---

## 4. Implémentation Actuelle

### BoardContext.tsx

```typescript
// State simple, pas de persistence
const [viewMode, setViewMode] = useState<'inspiration' | 'project'>('inspiration');

const toggleViewMode = useCallback(() => {
  setViewMode(prev => prev === 'inspiration' ? 'project' : 'inspiration');
}, []);
```

### Comportement Zones

```typescript
// ZoneCard.tsx ou BoardCanvas.tsx
const showZones = viewMode === 'project';

// Rendu conditionnel
{showZones && zones.map(zone => <ZoneCard key={zone.id} ... />)}
```

---

## 5. Tâche Sprint 2 Restante

| Tâche | Statut | Notes |
|-------|--------|-------|
| Toggle viewMode | ✅ Done | Fonctionne |
| Zones masquées/visibles | ✅ Done | Conditional render |
| Persistence | ⏭️ Skip | Non nécessaire MVP |
| Animation transition | 🔲 TODO | Fade in/out zones |

---

## 6. Nettoyage Code

Si le code actuel contient de la persistence localStorage pour viewMode, elle peut être **supprimée** pour simplifier :

```typescript
// À SUPPRIMER si présent
const VIEW_MODE_STORAGE_KEY = 'deadstock-board-view-mode';
localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
localStorage.getItem(VIEW_MODE_STORAGE_KEY);
```

---

## 7. Conclusion

**Décision** : Pas de persistence pour le viewMode.  
**Défaut** : Mode Inspiration à chaque ouverture.  
**Toggle** : Disponible dans la toolbar, effet immédiat.  
**Futur** : Ajouter persistence seulement si demande utilisateur.

---

**Status** : Accepté  
**Auteur** : Thomas + Claude  
**Date** : 10/01/2026
