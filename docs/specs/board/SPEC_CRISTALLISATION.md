# Spécifications Cristallisation

**Version:** 1.0  
**Date:** 04/01/2026  
**Statut:** À implémenter

---

## 1. Vue d'ensemble

La cristallisation est le processus de transformation d'un **Board** (exploration) en **Projet** (réalisation). C'est un assistant guidé en 4 étapes qui aide l'utilisateur à structurer ses idées créatives en intention de réalisation concrète.

### Principes

1. **Guidé mais flexible** : 4 étapes claires, mais possibilité de revenir en arrière
2. **Mapping intelligent** : Association automatique des éléments du board aux données du projet
3. **Préservation du contexte** : Le board reste consultable après cristallisation
4. **Non destructif** : Les éléments non sélectionnés restent disponibles

---

## 2. Déclencheurs

### 2.1 Points d'entrée

| Déclencheur | Action |
|-------------|--------|
| Bouton "Créer un projet" sur le board | Ouvre le wizard avec tout le board |
| Menu contextuel sur une zone | Ouvre le wizard avec cette zone |
| Sélection multiple + "Créer projet" | Ouvre le wizard avec la sélection |

### 2.2 Pré-requis

Pour pouvoir cristalliser, le board doit contenir **au moins un élément** pertinent :
- Un tissu, OU
- Un calcul, OU
- Une note décrivant l'intention

Si le board est vide ou ne contient que des palettes/inspirations, afficher un message :
> "Ajoutez au moins un tissu ou un calcul pour créer un projet"

---

## 3. Flux détaillé

### 3.1 Étape 1/4 : Périmètre

**Objectif :** Définir ce qui sera inclus dans le projet

```
┌─────────────────────────────────────────────────────────────────┐
│  Créer un projet                                    Étape 1/4  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Que souhaitez-vous transformer en projet ?                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ● Tout le board "Robe été"                             │   │
│  │      6 éléments                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ○ Une zone spécifique                                  │   │
│  │      [Sélectionner une zone ▼]                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ○ Éléments spécifiques                                 │   │
│  │      [Sélectionner des éléments]                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Aperçu des éléments :                                         │
│                                                                 │
│  🧵 3 tissus • 📐 1 calcul • 🎨 1 palette • 📝 1 note         │
│                                                                 │
│                                                                 │
│                                    [Annuler]  [Suivant →]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Logique :**

```typescript
interface Step1State {
  scope: 'all' | 'zone' | 'selection';
  zoneId?: string;
  selectedElementIds?: string[];
}

function getIncludedElements(board: Board, step1: Step1State): BoardElement[] {
  switch (step1.scope) {
    case 'all':
      return board.elements;
    case 'zone':
      return board.elements.filter(el => el.zoneId === step1.zoneId);
    case 'selection':
      return board.elements.filter(el => step1.selectedElementIds?.includes(el.id));
  }
}
```

---

### 3.2 Étape 2/4 : Type de projet

**Objectif :** Définir la nature et les métadonnées du projet

```
┌─────────────────────────────────────────────────────────────────┐
│  Créer un projet                                    Étape 2/4  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Nom du projet *                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Robe Lin Été                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Ce projet est :                                               │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │      👗       │  │     👔👗      │  │    👗👗👗     │      │
│  │               │  │               │  │               │      │
│  │    PIÈCE      │  │   ENSEMBLE    │  │  COLLECTION   │      │
│  │    UNIQUE     │  │               │  │               │      │
│  │               │  │   2-3 pièces  │  │    Ligne      │      │
│  │  1 vêtement   │  │  coordonnées  │  │   complète    │      │
│  │               │  │               │  │               │      │
│  │      ●        │  │       ○       │  │       ○       │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Informations optionnelles                                     │
│                                                                 │
│  Client                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Deadline                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  __/__/____                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Budget estimé                                                 │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │  Min €             │  │  Max €             │               │
│  └────────────────────┘  └────────────────────┘               │
│                                                                 │
│                                  [← Retour]  [Suivant →]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Logique :**

```typescript
type ProjectType = 'single_piece' | 'ensemble' | 'collection';

interface Step2State {
  name: string;  // Required
  type: ProjectType;
  client?: string;
  deadline?: Date;
  budgetMin?: number;
  budgetMax?: number;
}

// Suggestion automatique du nom basée sur le board
function suggestProjectName(board: Board, elements: BoardElement[]): string {
  // 1. Si le board a un nom, l'utiliser
  if (board.name) return board.name;
  
  // 2. Sinon, chercher un calcul pour extraire le type de vêtement
  const calculation = elements.find(el => el.elementType === 'calculation');
  if (calculation) {
    return calculation.elementData.summary.split('=')[0].trim();
  }
  
  // 3. Sinon, utiliser le premier tissu
  const textile = elements.find(el => el.elementType === 'textile');
  if (textile) {
    return `Projet ${textile.elementData.snapshot.name}`;
  }
  
  return 'Nouveau projet';
}

// Suggestion automatique du type
function suggestProjectType(elements: BoardElement[]): ProjectType {
  const calculations = elements.filter(el => el.elementType === 'calculation');
  
  if (calculations.length === 0 || calculations.length === 1) {
    return 'single_piece';
  }
  if (calculations.length <= 3) {
    return 'ensemble';
  }
  return 'collection';
}
```

---

### 3.3 Étape 3/4 : Contenu du projet

**Objectif :** Mapper les éléments du board aux données structurées du projet

```
┌─────────────────────────────────────────────────────────────────┐
│  Créer un projet                                    Étape 3/4  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Associez les éléments à votre projet :                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  PIÈCES À RÉALISER                                             │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Détectées depuis vos calculs :                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ☑️ Robe midi M                                         │   │
│  │     Métrage : 2.8m                                       │   │
│  │     Source : Calcul sur le board                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Ajouter une pièce manuellement]                            │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  TISSUS                                                        │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Sélectionnez le tissu pour chaque pièce :                     │
│                                                                 │
│  Robe midi M :                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ● Lin bleu lavande                                     │   │
│  │    15€/m • 3m disponibles                               │   │
│  │    ✓ Quantité suffisante (besoin: 2.8m)                │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  ○ Lin beige                                            │   │
│  │    12€/m • 5m disponibles                               │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  ○ Coton blanc                                          │   │
│  │    8€/m • 10m disponibles                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  RÉFÉRENCES VISUELLES                                          │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ☑️ Palette été (4 couleurs)                                   │
│  ☑️ Inspiration robe fluide                                    │
│  ☑️ Style bohème                                               │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  NOTES & BRIEF                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ☑️ "Bretelles fines, esprit vacances"                         │
│                                                                 │
│  Notes additionnelles :                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                  [← Retour]  [Suivant →]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Logique :**

```typescript
interface Piece {
  id: string;
  garmentType: string;
  garmentLabel: string;
  size: string;
  variations?: Record<string, string>;
  yardageNeeded: number;
  assignedTextileId?: string;
  fromCalculationId?: string;  // Lien vers l'élément calcul source
}

interface Step3State {
  pieces: Piece[];
  selectedTextileIds: string[];  // Tissus à inclure
  selectedInspirationIds: string[];  // Inspirations à inclure
  selectedPaletteIds: string[];  // Palettes à inclure
  selectedNoteIds: string[];  // Notes à inclure
  additionalNotes: string;  // Notes ajoutées à la cristallisation
  
  // Mapping pièce → tissu
  pieceTextileAssignments: Record<string, string>;  // pieceId → textileElementId
}

// Extraction automatique des pièces depuis les calculs
function extractPiecesFromCalculations(elements: BoardElement[]): Piece[] {
  return elements
    .filter(el => el.elementType === 'calculation')
    .map(el => {
      const data = el.elementData as CalculationElementData;
      return {
        id: crypto.randomUUID(),
        garmentType: data.garmentType,
        garmentLabel: data.summary.split('=')[0].trim(),
        size: data.size,
        variations: data.variations,
        yardageNeeded: data.result.recommended,
        fromCalculationId: el.id,
      };
    });
}

// Vérification compatibilité tissu / pièce
function isTextileCompatible(
  textile: TextileElementData, 
  piece: Piece
): { compatible: boolean; reason?: string } {
  const available = textile.snapshot.availableQuantity ?? 0;
  
  if (available < piece.yardageNeeded) {
    return { 
      compatible: false, 
      reason: `Quantité insuffisante (${available}m disponibles, ${piece.yardageNeeded}m nécessaires)` 
    };
  }
  
  return { compatible: true };
}
```

---

### 3.4 Étape 4/4 : Confirmation

**Objectif :** Résumer et valider avant création

```
┌─────────────────────────────────────────────────────────────────┐
│  Créer un projet                                    Étape 4/4  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Vérifiez les informations de votre projet :                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  📁 ROBE LIN ÉTÉ                                       │   │
│  │                                                         │   │
│  │  Type        Pièce unique                              │   │
│  │  Client      —                                         │   │
│  │  Deadline    —                                         │   │
│  │                                                         │   │
│  │  ───────────────────────────────────────────────────   │   │
│  │                                                         │   │
│  │  👗 PIÈCE                                              │   │
│  │                                                         │   │
│  │  Robe midi M                                           │   │
│  │                                                         │   │
│  │  Tissu       Lin bleu lavande                          │   │
│  │              My Little Coupon                          │   │
│  │                                                         │   │
│  │  Métrage     2.8m nécessaires                          │   │
│  │              3m disponibles ✓                          │   │
│  │                                                         │   │
│  │  Prix        ~42€ (15€/m × 2.8m)                       │   │
│  │                                                         │   │
│  │  ───────────────────────────────────────────────────   │   │
│  │                                                         │   │
│  │  📎 RÉFÉRENCES                                         │   │
│  │                                                         │   │
│  │  • 1 palette (4 couleurs)                              │   │
│  │  • 2 inspirations                                      │   │
│  │  • 1 note                                              │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Après création du projet :                                    │
│                                                                 │
│    ● Archiver le board "Robe été"                              │
│      (reste consultable, lié au projet)                        │
│                                                                 │
│    ○ Garder le board actif                                     │
│      (continuer à explorer)                                    │
│                                                                 │
│    ○ Supprimer le board                                        │
│                                                                 │
│                                                                 │
│                               [← Retour]  [Créer le projet]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Logique :**

```typescript
type BoardFate = 'archive' | 'keep_active' | 'delete';

interface Step4State {
  boardFate: BoardFate;
}

interface ProjectSummary {
  name: string;
  type: ProjectType;
  client?: string;
  deadline?: Date;
  pieces: Array<{
    label: string;
    size: string;
    textile: {
      name: string;
      source: string;
      price: number;
      yardageNeeded: number;
      yardageAvailable: number;
      isAvailable: boolean;
    };
    estimatedCost: number;
  }>;
  references: {
    paletteCount: number;
    inspirationCount: number;
    noteCount: number;
  };
  totalEstimatedCost: number;
}

function buildProjectSummary(
  step2: Step2State,
  step3: Step3State,
  elements: BoardElement[]
): ProjectSummary {
  const pieces = step3.pieces.map(piece => {
    const textileElementId = step3.pieceTextileAssignments[piece.id];
    const textileElement = elements.find(el => el.id === textileElementId);
    const textile = textileElement?.elementData as TextileElementData;
    
    return {
      label: piece.garmentLabel,
      size: piece.size,
      textile: {
        name: textile?.snapshot.name ?? 'Non sélectionné',
        source: textile?.snapshot.source ?? '',
        price: textile?.snapshot.price ?? 0,
        yardageNeeded: piece.yardageNeeded,
        yardageAvailable: textile?.snapshot.availableQuantity ?? 0,
        isAvailable: (textile?.snapshot.availableQuantity ?? 0) >= piece.yardageNeeded,
      },
      estimatedCost: (textile?.snapshot.price ?? 0) * piece.yardageNeeded,
    };
  });

  return {
    name: step2.name,
    type: step2.type,
    client: step2.client,
    deadline: step2.deadline,
    pieces,
    references: {
      paletteCount: step3.selectedPaletteIds.length,
      inspirationCount: step3.selectedInspirationIds.length,
      noteCount: step3.selectedNoteIds.length,
    },
    totalEstimatedCost: pieces.reduce((sum, p) => sum + p.estimatedCost, 0),
  };
}
```

---

## 4. Création du projet

### 4.1 Transformation des données

```typescript
interface CreateProjectFromBoardInput {
  // From Step 2
  name: string;
  type: ProjectType;
  client?: string;
  deadline?: Date;
  budgetMin?: number;
  budgetMax?: number;
  
  // From Step 3
  pieces: Array<{
    garmentType: string;
    size: string;
    variations?: Record<string, string>;
    yardageNeeded: number;
    textileId?: string;  // Reference to textiles table
    textileSnapshot?: TextileSnapshot;  // Snapshot at creation time
  }>;
  
  inspirations: Array<{
    imageUrl: string;
    caption?: string;
  }>;
  
  palette?: {
    colors: string[];
    name?: string;
  };
  
  notes: string;
  
  // Metadata
  sourceBoardId: string;
  sourceElementIds: string[];
  
  // From Step 4
  boardFate: BoardFate;
}

async function createProjectFromBoard(
  input: CreateProjectFromBoardInput,
  sessionId: string
): Promise<Project> {
  // 1. Créer le projet
  const project = await projectsRepository.create({
    name: input.name,
    projectType: input.type,
    clientName: input.client,
    deadline: input.deadline,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    garments: input.pieces.map(p => ({
      id: crypto.randomUUID(),
      type: p.garmentType,
      size: p.size,
      quantity: 1,
      variations: p.variations,
      textileId: p.textileId,
      textileSnapshot: p.textileSnapshot,
      yardageNeeded: p.yardageNeeded,
    })),
    moodBoard: {
      items: input.inspirations.map(i => ({
        id: crypto.randomUUID(),
        type: 'image',
        imageUrl: i.imageUrl,
        caption: i.caption,
      })),
      palette: input.palette,
    },
    notes: input.notes,
    sourceBoardId: input.sourceBoardId,
    currentStep: 'sourcing',  // Prochaine étape après création
    status: 'active',
  }, sessionId);

  // 2. Gérer le board source
  switch (input.boardFate) {
    case 'archive':
      await boardsRepository.update(input.sourceBoardId, {
        status: 'archived',
        linkedProjectId: project.id,
      }, sessionId);
      break;
    case 'delete':
      await boardsRepository.delete(input.sourceBoardId, sessionId);
      break;
    case 'keep_active':
      // Marquer les éléments utilisés
      await elementsRepository.markAsUsed(input.sourceElementIds, project.id);
      break;
  }

  return project;
}
```

### 4.2 Server Action

```typescript
// src/features/boards/actions/cristallisationActions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionId } from '@/lib/session';

export async function cristalliseToProjectAction(
  input: CreateProjectFromBoardInput
): Promise<{
  success: boolean;
  projectId?: string;
  error?: string;
}> {
  try {
    const sessionId = await getSessionId();
    
    const project = await createProjectFromBoard(input, sessionId);
    
    revalidatePath('/boards');
    revalidatePath('/projects');
    
    return { 
      success: true, 
      projectId: project.id 
    };
  } catch (error) {
    console.error('cristalliseToProjectAction error:', error);
    return { 
      success: false, 
      error: 'Failed to create project' 
    };
  }
}
```

---

## 5. Composant React

### 5.1 Structure

```
src/features/boards/components/Cristallisation/
├── CristallisationWizard.tsx      # Container principal
├── Step1Perimeter.tsx             # Étape 1
├── Step2ProjectType.tsx           # Étape 2
├── Step3Content.tsx               # Étape 3
├── Step4Confirmation.tsx          # Étape 4
├── SuccessScreen.tsx              # Écran de succès
├── PieceSelector.tsx              # Sélection des pièces
├── TextileAssignment.tsx          # Association tissu/pièce
└── hooks/
    └── useCristallisation.ts      # État du wizard
```

### 5.2 Hook useCristallisation

```typescript
// src/features/boards/components/Cristallisation/hooks/useCristallisation.ts

import { useState, useCallback, useMemo } from 'react';
import type { Board, BoardElement } from '../../../domain/types';

interface CristallisationState {
  currentStep: 1 | 2 | 3 | 4;
  step1: Step1State;
  step2: Step2State;
  step3: Step3State;
  step4: Step4State;
  isSubmitting: boolean;
  error: string | null;
}

export function useCristallisation(board: Board) {
  const [state, setState] = useState<CristallisationState>(() => {
    const elements = board.elements ?? [];
    
    return {
      currentStep: 1,
      step1: {
        scope: 'all',
      },
      step2: {
        name: suggestProjectName(board, elements),
        type: suggestProjectType(elements),
      },
      step3: {
        pieces: extractPiecesFromCalculations(elements),
        selectedTextileIds: elements
          .filter(el => el.elementType === 'textile')
          .map(el => el.id),
        selectedInspirationIds: elements
          .filter(el => el.elementType === 'inspiration')
          .map(el => el.id),
        selectedPaletteIds: elements
          .filter(el => el.elementType === 'palette')
          .map(el => el.id),
        selectedNoteIds: elements
          .filter(el => el.elementType === 'note')
          .map(el => el.id),
        additionalNotes: '',
        pieceTextileAssignments: {},
      },
      step4: {
        boardFate: 'archive',
      },
      isSubmitting: false,
      error: null,
    };
  });

  // Éléments inclus selon le périmètre
  const includedElements = useMemo(() => {
    return getIncludedElements(board, state.step1);
  }, [board, state.step1]);

  // Résumé du projet
  const projectSummary = useMemo(() => {
    return buildProjectSummary(state.step2, state.step3, includedElements);
  }, [state.step2, state.step3, includedElements]);

  // Navigation
  const goToStep = useCallback((step: 1 | 2 | 3 | 4) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4) as 1 | 2 | 3 | 4,
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1) as 1 | 2 | 3 | 4,
    }));
  }, []);

  // Mise à jour des étapes
  const updateStep1 = useCallback((updates: Partial<Step1State>) => {
    setState(prev => ({
      ...prev,
      step1: { ...prev.step1, ...updates },
    }));
  }, []);

  const updateStep2 = useCallback((updates: Partial<Step2State>) => {
    setState(prev => ({
      ...prev,
      step2: { ...prev.step2, ...updates },
    }));
  }, []);

  const updateStep3 = useCallback((updates: Partial<Step3State>) => {
    setState(prev => ({
      ...prev,
      step3: { ...prev.step3, ...updates },
    }));
  }, []);

  const updateStep4 = useCallback((updates: Partial<Step4State>) => {
    setState(prev => ({
      ...prev,
      step4: { ...prev.step4, ...updates },
    }));
  }, []);

  // Validation par étape
  const canProceed = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        return includedElements.length > 0;
      case 2:
        return state.step2.name.trim().length > 0;
      case 3:
        // Au moins une pièce avec un tissu assigné, ou au moins une note
        return (
          state.step3.pieces.some(p => state.step3.pieceTextileAssignments[p.id]) ||
          state.step3.selectedNoteIds.length > 0
        );
      case 4:
        return true;
      default:
        return false;
    }
  }, [state, includedElements]);

  // Soumission
  const submit = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const input = buildCreateProjectInput(state, board, includedElements);
      const result = await cristalliseToProjectAction(input);

      if (result.success) {
        return result.projectId;
      } else {
        setState(prev => ({ ...prev, error: result.error ?? 'Unknown error' }));
        return null;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Une erreur est survenue' 
      }));
      return null;
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state, board, includedElements]);

  return {
    state,
    includedElements,
    projectSummary,
    canProceed,
    goToStep,
    nextStep,
    prevStep,
    updateStep1,
    updateStep2,
    updateStep3,
    updateStep4,
    submit,
  };
}
```

### 5.3 Composant principal

```tsx
// src/features/boards/components/Cristallisation/CristallisationWizard.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useCristallisation } from './hooks/useCristallisation';
import { Step1Perimeter } from './Step1Perimeter';
import { Step2ProjectType } from './Step2ProjectType';
import { Step3Content } from './Step3Content';
import { Step4Confirmation } from './Step4Confirmation';
import { SuccessScreen } from './SuccessScreen';
import type { Board } from '../../domain/types';
import { cn } from '@/lib/utils';

interface CristallisationWizardProps {
  board: Board;
  onClose: () => void;
}

export function CristallisationWizard({ board, onClose }: CristallisationWizardProps) {
  const router = useRouter();
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  
  const {
    state,
    includedElements,
    projectSummary,
    canProceed,
    nextStep,
    prevStep,
    updateStep1,
    updateStep2,
    updateStep3,
    updateStep4,
    submit,
  } = useCristallisation(board);

  const handleSubmit = async () => {
    const projectId = await submit();
    if (projectId) {
      setCreatedProjectId(projectId);
    }
  };

  const handleGoToProject = () => {
    if (createdProjectId) {
      router.push(`/projects/${createdProjectId}`);
    }
  };

  // Écran de succès
  if (createdProjectId) {
    return (
      <WizardModal onClose={onClose}>
        <SuccessScreen
          projectName={state.step2.name}
          projectId={createdProjectId}
          onGoToProject={handleGoToProject}
          onBackToBoard={onClose}
        />
      </WizardModal>
    );
  }

  return (
    <WizardModal onClose={onClose}>
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              step === state.currentStep
                ? "bg-primary"
                : step < state.currentStep
                ? "bg-primary/50"
                : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Contenu de l'étape */}
      {state.currentStep === 1 && (
        <Step1Perimeter
          board={board}
          state={state.step1}
          includedElements={includedElements}
          onChange={updateStep1}
        />
      )}
      {state.currentStep === 2 && (
        <Step2ProjectType
          state={state.step2}
          onChange={updateStep2}
        />
      )}
      {state.currentStep === 3 && (
        <Step3Content
          elements={includedElements}
          state={state.step3}
          onChange={updateStep3}
        />
      )}
      {state.currentStep === 4 && (
        <Step4Confirmation
          summary={projectSummary}
          boardName={board.name ?? 'Sans titre'}
          state={state.step4}
          onChange={updateStep4}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
        <button
          onClick={state.currentStep === 1 ? onClose : prevStep}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {state.currentStep === 1 ? 'Annuler' : '← Retour'}
        </button>

        <button
          onClick={state.currentStep === 4 ? handleSubmit : nextStep}
          disabled={!canProceed || state.isSubmitting}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {state.isSubmitting
            ? 'Création...'
            : state.currentStep === 4
            ? 'Créer le projet'
            : 'Suivant →'}
        </button>
      </div>

      {/* Erreur */}
      {state.error && (
        <p className="mt-4 text-sm text-destructive text-center">
          {state.error}
        </p>
      )}
    </WizardModal>
  );
}

// Modal wrapper
function WizardModal({ 
  children, 
  onClose 
}: { 
  children: React.ReactNode; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Cas particuliers

### 6.1 Ensemble (multi-pièces)

Quand l'utilisateur sélectionne "Ensemble" à l'étape 2, l'étape 3 affiche :
- Liste de toutes les pièces détectées
- Option d'ajouter des pièces manuellement
- Association tissu par pièce (peut être le même tissu pour plusieurs pièces)
- Calcul du métrage total

### 6.2 Collection

Quand l'utilisateur sélectionne "Collection" :
- Chaque zone du board peut devenir un projet séparé
- Ou chaque calcul devient un projet
- Une collection parent est créée pour lier les projets
- Palette commune partagée entre tous les projets

### 6.3 Board sans calcul

Si le board ne contient aucun calcul :
- L'étape 3 propose "Ajouter une pièce manuellement"
- Ou l'utilisateur peut créer un projet "Note" sans pièce définie
- Utile pour les projets exploratoires

### 6.4 Tissus insuffisants

Si la quantité disponible d'un tissu est inférieure au métrage nécessaire :
- Afficher un avertissement (pas bloquant)
- Proposer : "Commander quand même" ou "Choisir un autre tissu"
- Le projet est créé avec une note indiquant le risque

---

## 7. Checklist d'implémentation

### Types & Actions
- [ ] Types CristallisationState, Step1-4State
- [ ] Helper functions (suggestProjectName, extractPieces, etc.)
- [ ] cristalliseToProjectAction

### Composants
- [ ] CristallisationWizard (container)
- [ ] WizardModal (wrapper)
- [ ] Step1Perimeter
- [ ] Step2ProjectType
- [ ] Step3Content
- [ ] Step4Confirmation
- [ ] SuccessScreen
- [ ] PieceSelector
- [ ] TextileAssignment

### Hook
- [ ] useCristallisation

### Intégration
- [ ] Bouton "Créer un projet" sur BoardCanvas
- [ ] Menu contextuel zone → "Créer projet depuis cette zone"
- [ ] Sélection multiple + action

---

**Document maintenu par :** Équipe Développement  
**Dernière mise à jour :** 04/01/2026
