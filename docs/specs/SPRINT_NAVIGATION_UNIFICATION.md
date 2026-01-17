# Sprint Navigation Unification - Board/Journey

**Version** : 2.0  
**Date** : 17 Janvier 2026  
**Priorité** : P1 (UX fondamentale)  
**Effort estimé** : 4-5h

---

## Contexte

La navigation entre les vues Board et Journey présente plusieurs incohérences :

### Problème 1 : Position du switch
- **Vue Board** : Bouton "Journey" dans le header horizontal, à droite du titre
- **Vue Journey** : Lien "Retour au Board" dans la sidebar, en haut à gauche

### Problème 2 : Navigation Journey dans la Toolbar Board
La `BoardToolbar` (sidebar gauche du Board) contient 3 boutons de navigation vers Journey (Mood, Conception, Exécution) **mélangés avec les outils de création d'éléments**.

Ces boutons ont une fonction complètement différente :
- **Outils** : Créer des éléments (Note, Palette, Image...)
- **Navigation Journey** : Accéder aux vues par phase

Cette confusion nuit à la compréhension de l'interface.

---

## Objectif

Créer une expérience unifiée où :
1. Le **header est identique** dans les deux vues (titre, compteur, toggle)
2. Un **toggle visuel** permet de basculer entre Board et Journey
3. La **navigation par phase** (avec compteurs) est dans le header, pas dans la toolbar
4. La **toolbar Board** ne contient que des outils de création
5. L'utilisateur comprend qu'il navigue entre deux **vues complémentaires**

---

## Spécification UX

### Header Partagé (les deux vues)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← [Boards]    Board de demo                    [Board] [Journey ▾]  ⚙️ │
│                10 éléments                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

**Éléments du header :**
- Flèche retour → `/boards` (liste des boards)
- Titre du board (éditable au clic)
- Compteur d'éléments
- **Toggle Board/Journey** avec dropdown sur Journey
- Actions secondaires (Partager, etc.)

### Toggle Vue avec Dropdown Journey

```
┌─────────────────────────────┐
│ [■ Board] [Journey ▾]       │  ← Vue Board active
└─────────────────────────────┘
              │
              ▼ (au clic sur Journey)
        ┌─────────────────────┐
        │ ✨ Mood          3  │ → /journey?phase=mood
        │ ✏️ Conception    7  │ → /journey?phase=conception  
        │ 🚀 Exécution     0  │ → /journey?phase=execution
        └─────────────────────┘

┌─────────────────────────────┐
│ [Board] [■ Journey ▾]       │  ← Vue Journey active
└─────────────────────────────┘
```

**Comportement du toggle :**
- Clic sur "Board" → navigation directe vers `/boards/[id]`
- Clic sur "Journey" (partie gauche) → navigation vers `/boards/[id]/journey`
- Clic sur "▾" (chevron) → ouvre dropdown avec les 3 phases et compteurs
- Clic sur une phase → navigation vers `/boards/[id]/journey?phase=xxx`

### Vue Journey - Sidebar Simplifiée

La sidebar Journey **ne contient plus** le lien "Retour au Board" ni le nom du board (déjà dans le header partagé).

```
AVANT                          APRÈS
┌──────────────────────┐       ┌──────────────────────┐
│ ← Retour au Board    │       │ ✨ Mood              │
│ Board de demo        │       │   Inspirations    1  │
│ Vue Journey          │       │   Palettes        1  │
├──────────────────────┤       │   ...                │
│ ✨ Mood              │       │ ✏️ Conception        │
│   Inspirations    1  │       │   Patrons         1  │
│   ...                │       │   ...                │
└──────────────────────┘       └──────────────────────┘
```

### BoardToolbar - Simplifiée

La toolbar Board **ne contient plus** les boutons de navigation Journey. Elle ne garde que les outils de création.

```
AVANT                          APRÈS
┌────┐                         ┌────┐
│ 📝 │ Note                    │ 📝 │ Note
│ 🎨 │ Palette                 │ 🎨 │ Palette
│ 👕 │ Tissu                   │ 👕 │ Tissu
│ 📐 │ Calcul                  │ 📐 │ Calcul
│────│                         │────│
│ 🖼️ │ Image                   │ 🖼️ │ Image
│ 🎬 │ Vidéo                   │ 🎬 │ Vidéo
│ 🔗 │ Lien                    │ 🔗 │ Lien
│────│                         │────│
│ 📄 │ PDF                     │ 📄 │ PDF
│ ✂️ │ Patron                  │ ✂️ │ Patron
│ 👤 │ Silhouette              │ 👤 │ Silhouette
│    │                         │────│
│────│ ← RETIRER               │ 🔍 │ Recherche
│ 💡 │ Conception (3)          │ ⛶  │ Mode immersif
│ 📐 │ Préparation (4)         │ 👁️ │ Mode vue
│ 🛒 │ Exécution (3)           │ ▢  │ Zone
│────│ ← RETIRER               └────┘
│ 🔍 │ Recherche
│ ...│
└────┘
```

---

## Tâches Techniques

### N1 - Créer le composant ViewToggle avec Dropdown (1h15)

**Fichier** : `src/features/boards/components/ViewToggle.tsx`

```typescript
interface ViewToggleProps {
  currentView: 'board' | 'journey';
  boardId: string;
  phaseCounts: {
    mood: number;
    conception: number;
    execution: number;
  };
}
```

**Comportement :**
- Affiche deux options : Board (LayoutGrid) et Journey (LayoutList + chevron)
- Clic sur Board → navigation directe
- Clic sur partie gauche de Journey → navigation vers `/journey`
- Clic sur chevron → ouvre dropdown avec les 3 phases
- Chaque phase affiche son compteur et navigue vers `?phase=xxx`

**Implémentation suggérée :**
```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LayoutGrid, LayoutList, ChevronDown, Sparkles, PenTool, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  currentView: 'board' | 'journey';
  boardId: string;
  phaseCounts: {
    mood: number;
    conception: number;
    execution: number;
  };
}

const PHASES = [
  { id: 'mood', label: 'Mood', emoji: '✨', icon: Sparkles },
  { id: 'conception', label: 'Conception', emoji: '✏️', icon: PenTool },
  { id: 'execution', label: 'Exécution', emoji: '🚀', icon: Rocket },
] as const;

export function ViewToggle({ currentView, boardId, phaseCounts }: ViewToggleProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalJourneyCount = phaseCounts.mood + phaseCounts.conception + phaseCounts.execution;

  return (
    <div className="flex items-center rounded-lg border bg-muted p-1">
      {/* Board button */}
      <Link
        href={`/boards/${boardId}`}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          currentView === 'board'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span>Board</span>
      </Link>

      {/* Journey button with dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div
          className={cn(
            'flex items-center rounded-md text-sm font-medium transition-colors',
            currentView === 'journey'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {/* Main Journey link */}
          <Link
            href={`/boards/${boardId}/journey`}
            className="flex items-center gap-2 px-3 py-1.5"
          >
            <LayoutList className="h-4 w-4" />
            <span>Journey</span>
            {totalJourneyCount > 0 && (
              <span className="text-xs text-muted-foreground">({totalJourneyCount})</span>
            )}
          </Link>
          
          {/* Dropdown trigger */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-1.5 py-1.5 hover:bg-accent rounded-r-md transition-colors"
          >
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isDropdownOpen && "rotate-180"
            )} />
          </button>
        </div>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 w-48 rounded-lg border bg-popover shadow-lg z-50">
            <div className="py-1">
              {PHASES.map((phase) => {
                const count = phaseCounts[phase.id];
                return (
                  <Link
                    key={phase.id}
                    href={`/boards/${boardId}/journey?phase=${phase.id}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>{phase.emoji}</span>
                      <span>{phase.label}</span>
                    </div>
                    <span className={cn(
                      "text-xs tabular-nums",
                      count === 0 ? "text-muted-foreground" : "text-foreground font-medium"
                    )}>
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### N2 - Créer le composant SharedBoardHeader (1h)

**Fichier** : `src/features/boards/components/SharedBoardHeader.tsx`

Extraire la logique commune de `BoardHeader.tsx` dans un composant réutilisable.
Calcule les compteurs par phase à partir des éléments du board.

```typescript
interface SharedBoardHeaderProps {
  currentView: 'board' | 'journey';
}
```

**Code suggéré :**
```tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Share, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBoard } from '../context/BoardContext';
import { ViewToggle } from './ViewToggle';
import { JOURNEY_PHASES } from '@/features/journey/config/steps';

interface SharedBoardHeaderProps {
  currentView: 'board' | 'journey';
}

export function SharedBoardHeader({ currentView }: SharedBoardHeaderProps) {
  const params = useParams();
  const boardId = params.boardId as string;
  const { board, elements, updateBoardName } = useBoard();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(board?.name || '');

  const displayName = board?.name || 'Sans titre';

  // Calculer les compteurs par phase
  const phaseCounts = useMemo(() => {
    const counts = { mood: 0, conception: 0, execution: 0 };
    
    JOURNEY_PHASES.forEach((phase) => {
      const phaseTypes = phase.elementTypes.map(et => et.type);
      counts[phase.id] = elements.filter(el => 
        phaseTypes.includes(el.elementType)
      ).length;
    });
    
    return counts;
  }, [elements]);

  const handleSaveName = async () => {
    if (editName.trim()) {
      await updateBoardName(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(board?.name || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    else if (e.key === 'Escape') handleCancel();
  };

  return (
    <header className="border-b bg-background px-4 py-3 flex items-center justify-between shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Link href="/boards">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>

        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 w-64"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleSaveName}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <h1
              className="font-medium cursor-pointer hover:text-muted-foreground transition-colors"
              onClick={() => {
                setEditName(board?.name || '');
                setIsEditing(true);
              }}
              title="Cliquer pour modifier"
            >
              {displayName}
            </h1>
          )}
          <p className="text-sm text-muted-foreground">
            {elements.length} élément{elements.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <ViewToggle 
          currentView={currentView} 
          boardId={boardId} 
          phaseCounts={phaseCounts}
        />
        <Button variant="outline" size="sm" disabled>
          <Share className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </div>
    </header>
  );
}
```

---

### N3 - Modifier le layout partagé (30min)

**Fichier** : `src/app/(main)/boards/[boardId]/layout.tsx`

Ajouter un wrapper client pour détecter la vue courante et afficher le header.

**Problème** : Le layout est un Server Component, mais nous avons besoin de savoir si on est sur `/journey` ou non.

**Solution** : Créer un Client Component wrapper.

**Nouveau fichier** : `src/features/boards/components/BoardLayoutClient.tsx`

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { SharedBoardHeader } from './SharedBoardHeader';

interface BoardLayoutClientProps {
  children: React.ReactNode;
}

export function BoardLayoutClient({ children }: BoardLayoutClientProps) {
  const pathname = usePathname();
  const currentView = pathname.includes('/journey') ? 'journey' : 'board';

  return (
    <div className="flex flex-col h-screen">
      <SharedBoardHeader currentView={currentView} />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
```

**Modifier** `layout.tsx` :

```tsx
import { notFound } from 'next/navigation';
import { getBoardAction } from '@/features/boards/actions/boardActions';
import { BoardProvider } from '@/features/boards/context/BoardContext';
import { BoardLayoutClient } from '@/features/boards/components/BoardLayoutClient';

interface BoardLayoutProps {
  params: Promise<{ boardId: string }>;
  children: React.ReactNode;
}

export default async function BoardLayout({ params, children }: BoardLayoutProps) {
  const { boardId } = await params;
  const result = await getBoardAction(boardId);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <BoardProvider initialBoard={result.data}>
      <BoardLayoutClient>
        {children}
      </BoardLayoutClient>
    </BoardProvider>
  );
}
```

---

### N4 - Simplifier la page Board (15min)

**Fichier** : `src/app/(main)/boards/[boardId]/page.tsx`

Retirer le `BoardHeader` (maintenant dans le layout).

```tsx
// src/app/(main)/boards/[boardId]/page.tsx
import { BoardCanvas } from '@/features/boards/components/BoardCanvas';
import { ContextualSearchProvider } from '@/features/boards/context/ContextualSearchContext';

export default function BoardPage() {
  return (
    <ContextualSearchProvider>
      <BoardCanvas />
    </ContextualSearchProvider>
  );
}
```

---

### N5 - Simplifier JourneyNavigation (30min)

**Fichier** : `src/features/journey/components/JourneyNavigation.tsx`

Retirer la section header (lien retour, nom du board) qui est maintenant dans le header partagé.

**Avant :**
```tsx
{/* Header */}
<div className="border-b border-border p-4">
  <Link href={`/boards/${boardId}`} ...>
    <LayoutGrid className="h-4 w-4" />
    <span>Retour au Board</span>
  </Link>
  <h2 className="mt-3 text-lg font-semibold">{board?.name || "Board"}</h2>
  <p className="text-xs text-muted-foreground mt-1">Vue Journey</p>
</div>
```

**Après :**
```tsx
{/* Plus de header ici - géré par SharedBoardHeader */}
```

La sidebar commence directement avec les phases.

---

### N6 - Ajuster JourneyClientWrapper (15min)

**Fichier** : `src/features/journey/components/JourneyClientWrapper.tsx`

Retirer le `h-screen` du container principal (la hauteur est gérée par le layout).

**Avant :**
```tsx
<div className="flex h-screen bg-background">
```

**Après :**
```tsx
<div className="flex h-full bg-background">
```

---

### N7 - Supprimer BoardHeader.tsx (5min)

**Fichier** : `src/features/boards/components/BoardHeader.tsx`

Ce fichier peut être supprimé car remplacé par `SharedBoardHeader.tsx`.

Vérifier qu'aucun autre fichier ne l'importe :
```powershell
Select-String -Path "src/**/*.tsx" -Pattern "BoardHeader" -Recurse
```

---

### N8 - Nettoyer BoardToolbar.tsx (30min)

**Fichier** : `src/features/boards/components/BoardToolbar.tsx`

Retirer les 3 `JourneyButton` (Mood, Conception, Exécution) qui sont maintenant dans le header.

**Supprimer :**
1. L'import de `NextLink` (si plus utilisé ailleurs)
2. Le composant `JourneyButton` entier
3. Les 3 appels à `<JourneyButton ... />` dans le JSX
4. La prop `elementCounts` de `BoardToolbarProps` (plus nécessaire)

**Garder :** Tous les `ToolButton` de création d'éléments et les contrôles de vue.

**Avant (lignes ~170-210) :**
```tsx
{/* Section: Journey - Accès rapide aux phases */}
<Divider />

<JourneyButton
  icon={<Lightbulb className="w-5 h-5" strokeWidth={1.5} />}
  tooltip="Conception"
  href={`/boards/${boardId}/journey`}
  count={elementCounts?.conception ?? 0}
  phaseTypes={[...]}
/>
// ... 2 autres JourneyButton
```

**Après :**
```tsx
{/* Section Journey retirée - navigation dans le header */}
```

**Mettre à jour l'interface :**
```tsx
// AVANT
interface BoardToolbarProps {
  onAddElement: (type: ToolType) => void;
  onToggleViewMode?: () => void;
  viewMode?: 'inspiration' | 'project';
  elementCounts?: {
    conception: number;
    preparation: number;
    execution: number;
  };
}

// APRÈS
interface BoardToolbarProps {
  onAddElement: (type: ToolType) => void;
  onToggleViewMode?: () => void;
  viewMode?: 'inspiration' | 'project';
  // elementCounts retiré - géré dans SharedBoardHeader
}
```

---

### N9 - Mettre à jour BoardCanvas.tsx (15min)

**Fichier** : `src/features/boards/components/BoardCanvas.tsx`

Retirer le calcul et passage de `elementCounts` à `BoardToolbar`.

```powershell
Get-Content -LiteralPath "src/features/boards/components/BoardCanvas.tsx" | Select-String -Pattern "elementCounts" -Context 2,2
```

Si `elementCounts` est calculé dans BoardCanvas, cette logique peut être supprimée car elle est maintenant dans `SharedBoardHeader`.

---

## Ordre d'Implémentation

```
1. N1 - ViewToggle.tsx (nouveau) - avec dropdown phases
2. N2 - SharedBoardHeader.tsx (nouveau) - avec calcul phaseCounts
3. N3 - BoardLayoutClient.tsx (nouveau) + modifier layout.tsx
4. N4 - Simplifier page.tsx (Board)
5. N5 - Simplifier JourneyNavigation.tsx
6. N6 - Ajuster JourneyClientWrapper.tsx
7. N7 - Supprimer BoardHeader.tsx
8. N8 - Nettoyer BoardToolbar.tsx (retirer JourneyButtons)
9. N9 - Mettre à jour BoardCanvas.tsx (retirer elementCounts)
10. Test complet navigation
```

---

## Critères de Validation

- [ ] Le header est **identique** dans les deux vues
- [ ] Le toggle **Board/Journey** est visible au même endroit
- [ ] Cliquer sur "Board" navigue vers `/boards/[id]`
- [ ] Cliquer sur "Journey" navigue vers `/boards/[id]/journey`
- [ ] Le **dropdown** affiche les 3 phases avec compteurs corrects
- [ ] Cliquer sur une phase navigue vers `/boards/[id]/journey?phase=xxx`
- [ ] Le titre du board est éditable depuis les deux vues
- [ ] Le compteur d'éléments s'affiche correctement
- [ ] La sidebar Journey ne contient plus "Retour au Board"
- [ ] La **BoardToolbar ne contient plus** les boutons Journey
- [ ] Pas de régression visuelle sur le canvas Board
- [ ] Pas de régression sur la navigation par type dans Journey

---

## Fichiers Impactés

| Fichier | Action |
|---------|--------|
| `src/features/boards/components/ViewToggle.tsx` | **CRÉER** |
| `src/features/boards/components/SharedBoardHeader.tsx` | **CRÉER** |
| `src/features/boards/components/BoardLayoutClient.tsx` | **CRÉER** |
| `src/app/(main)/boards/[boardId]/layout.tsx` | MODIFIER |
| `src/app/(main)/boards/[boardId]/page.tsx` | MODIFIER |
| `src/features/journey/components/JourneyNavigation.tsx` | MODIFIER |
| `src/features/journey/components/JourneyClientWrapper.tsx` | MODIFIER |
| `src/features/boards/components/BoardHeader.tsx` | **SUPPRIMER** |
| `src/features/boards/components/BoardToolbar.tsx` | MODIFIER (retirer JourneyButtons) |
| `src/features/boards/components/BoardCanvas.tsx` | MODIFIER (retirer elementCounts) |

---

## Résultat Attendu

### Vue Board
```
┌─────────────────────────────────────────────────────────────┐
│  ←   Board de demo          [■ Board] [Journey]    Partager │
│      10 éléments                                            │
├─────────────────────────────────────────────────────────────┤
│ [Toolbar]                                                   │
│                      [Canvas avec zones]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Vue Journey
```
┌─────────────────────────────────────────────────────────────┐
│  ←   Board de demo          [Board] [■ Journey]    Partager │
│      10 éléments                                            │
├──────────────┬──────────────────────────────────────────────┤
│ 🎨 Mood    3 │                                              │
│   Inspir.  1 │         [Contenu selon type sélectionné]    │
│   Palettes 1 │                                              │
│ ✏️ Concept 7 │                                              │
│   ...        │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

Les deux vues partagent le même header, l'utilisateur comprend immédiatement qu'il s'agit de deux façons de voir les mêmes données.

---

## Résumé des Améliorations

| Avant | Après |
|-------|-------|
| Toggle à des positions différentes | Header partagé identique |
| "Retour au Board" (unidirectionnel) | Toggle bidirectionnel Board/Journey |
| Navigation Journey dans la toolbar | Navigation Journey dans le header avec dropdown |
| Toolbar mélange création + navigation | Toolbar uniquement pour création |

## Effort Total Estimé

| Tâche | Durée |
|-------|-------|
| N1 - ViewToggle avec dropdown | 1h15 |
| N2 - SharedBoardHeader | 1h |
| N3 - BoardLayoutClient + layout | 30min |
| N4 - Simplifier page Board | 15min |
| N5 - Simplifier JourneyNavigation | 30min |
| N6 - Ajuster JourneyClientWrapper | 15min |
| N7 - Supprimer BoardHeader | 5min |
| N8 - Nettoyer BoardToolbar | 30min |
| N9 - Mettre à jour BoardCanvas | 15min |
| **Total** | **4h35** |
