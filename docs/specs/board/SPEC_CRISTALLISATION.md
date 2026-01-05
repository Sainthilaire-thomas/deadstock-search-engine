
# Spécifications Cristallisation

**Version:** 2.0

**Date:** 05/01/2026

**Statut:** À implémenter

**ADR:** ADR_018_CRYSTALLIZATION_RULES.md

---

## 1. Vue d'ensemble

La cristallisation est le processus de transformation d'une **Zone** (exploration) en **Projet** (réalisation). C'est un assistant guidé en 4 étapes qui aide l'utilisateur à structurer ses idées créatives en intention de réalisation concrète.

### Principes fondamentaux

1. **Zone → Projet** : Le MVP implémente uniquement la cristallisation de zones
2. **Duplication** : Les éléments sont copiés (snapshot), pas référencés
3. **Non destructif** : La zone reste visible après cristallisation, marquée visuellement
4. **Guidé mais flexible** : 4 étapes claires, possibilité de revenir en arrière

### Ce que la cristallisation N'EST PAS

* ❌ Une suppression de la zone
* ❌ Un partage de références entre zone et projet
* ❌ Une synchronisation automatique des modifications

---

## 2. États d'une zone

### 2.1 Zone active (par défaut)

```
┌─────────────────────────────────────┐
│ ✚ Veste                             │  ← Header coloré, icône move
├─────────────────────────────────────┤
│                                     │
│   🎨 Palette    🧵 Tissu            │
│                                     │
│   📊 Calcul     📝 Note             │
│                                     │
│                  [⚡ Cristalliser]  │  ← Bouton d'action
└─────────────────────────────────────┘

Style:
- border: 2px dashed {color}
- background: {color}15 (15% opacité)
- Poignées resize visibles quand sélectionnée
```

### 2.2 Zone cristallisée

```
┌─────────────────────────────────────┐
│ ✚ Veste              🏷️ Projet     │  ← Badge "Projet"
├─────────────────────────────────────┤
│                                     │
│   🎨 Palette    🧵 Tissu            │  ← Éléments en lecture seule
│                                     │
│   📊 Calcul     📝 Note             │
│                                     │
│                  [Voir projet →]    │  ← Lien vers le projet
└─────────────────────────────────────┘

Style:
- border: 2px solid {color}
- background: {color}05 (5% opacité)
- Pas de poignées resize
- Opacité légèrement réduite
```

---

## 3. Déclencheur

### 3.1 Point d'entrée MVP

| Déclencheur                          | Action                                              |
| ------------------------------------- | --------------------------------------------------- |
| Bouton "Cristalliser" sur zone active | Ouvre le wizard avec cette zone pré-sélectionnée |

### 3.2 Points d'entrée Phase 2 (non implémentés)

| Déclencheur                           | Action                             |
| -------------------------------------- | ---------------------------------- |
| Bouton "Créer un projet" sur le board | Ouvre le wizard avec tout le board |
| Sélection multiple + "Créer projet"  | Ouvre le wizard avec la sélection |

### 3.3 Pré-requis

Pour pouvoir cristalliser une zone, elle doit contenir **au moins un élément** pertinent :

* Un tissu, OU
* Un calcul, OU
* Une note décrivant l'intention

Si la zone est vide ou ne contient que des palettes/inspirations :

> "Ajoutez au moins un tissu ou un calcul pour créer un projet"

---

## 4. Flux détaillé (Wizard 4 étapes)

### 4.1 Étape 1/4 : Périmètre

**Objectif :** Confirmer les éléments à inclure dans le projet

```
┌─────────────────────────────────────────────────────────────────┐
│  Créer un projet                                    Étape 1/4   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Zone sélectionnée : "Veste"                                   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Éléments à inclure :                                          │
│                                                                 │
│  ☑️ 🧵 Tissu Lin Naturel - My Little Coupon - 15€/m            │
│  ☑️ 🧵 Tissu Laine Mélangée - Recovo - 22€/m                   │
│  ☑️ 🎨 Palette "Tons naturels" (4 couleurs)                    │
│  ☑️ 📊 Calcul: Veste M × 1 = 2.5m                              │
│  ☑️ 📝 Note: "Prévoir doublure"                                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Résumé : 2 tissus • 1 palette • 1 calcul • 1 note             │
│                                                                 │
│                                    [Annuler]  [Suivant →]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Comportement :**

* Tous les éléments de la zone sont pré-cochés
* L'utilisateur peut décocher des éléments (exclusion)
* Au moins un élément doit rester coché

**Logique :**

```typescript
interface Step1State {
  zoneId: string;
  selectedElementIds: string[];  // IDs des éléments à inclure
}

function initStep1(zone: BoardZone, elements: BoardElement[]): Step1State {
  const zoneElements = elements.filter(el => isElementInZone(el, zone));
  return {
    zoneId: zone.id,
    selectedElementIds: zoneElements.map(el => el.id),
  };
}
```

---

### 4.2 Étape 2/4 : Type de projet

**Objectif :** Définir la nature et les métadonnées du projet

```
┌─────────────────────────────────────────────────────────────────┐
│  Créer un projet                                    Étape 2/4   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Nom du projet *                                               │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Veste Lin                                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Ce projet est :                                               │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐                         │
│  │      👗       │  │     👔👗      │                         │
│  │               │  │               │                         │
│  │    PIÈCE      │  │   ENSEMBLE    │                         │
│  │    UNIQUE     │  │               │                         │
│  │               │  │   2-3 pièces  │                         │
│  │  1 vêtement   │  │  coordonnées  │                         │
│  │               │  │               │                         │
│  │      ●        │  │       ○       │                         │
│  └───────────────┘  └───────────────┘                         │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Informations optionnelles                         [Afficher ▼] │
│                                                                 │
│                                  [← Retour]  [Suivant →]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Informations optionnelles (accordéon) :**

* Client (nom)
* Deadline (date)
* Budget estimé (min/max €)

**Logique :**

```typescript
type ProjectType = 'single_piece' | 'ensemble';

interface Step2State {
  name: string;           // Required, pré-rempli avec nom de zone
  type: ProjectType;      // Default: 'single_piece'
  client?: string;
  deadline?: string;      // ISO date
  budgetMin?: number;
  budgetMax?: number;
}

function initStep2(zone: BoardZone): Step2State {
  return {
    name: zone.name,
    type: 'single_piece',
  };
}
```

---

### 4.3 Étape 3/4 : Contenu

**Objectif :** Valider les pièces et associations tissu/pièce

```
┌─────────────────────────────────────────────────────────────────┐
│  Créer un projet                                    Étape 3/4   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Pièces du projet                                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  👗 Veste                                                 │ │
│  │     Taille: M    Quantité: 1                              │ │
│  │     Métrage: 2.5m (depuis calcul)                         │ │
│  │                                                           │ │
│  │     Tissu assigné:                                        │ │
│  │     ┌─────────────────────────────────────────────────┐   │ │
│  │     │ 🧵 Tissu Lin Naturel - 15€/m          [Changer] │   │ │
│  │     └─────────────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Éléments additionnels inclus :                                │
│                                                                 │
│  🎨 Palette "Tons naturels"                                    │
│  📝 Note: "Prévoir doublure"                                   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Estimation totale : 2.5m × 15€ = ~37.50€                      │
│                                                                 │
│                                  [← Retour]  [Suivant →]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Comportement :**

* Détection automatique des pièces depuis les calculs
* Si pas de calcul, proposer "Ajouter une pièce manuellement"
* Association tissu/pièce (peut changer le tissu assigné)
* Calcul du coût estimé

**Logique :**

```typescript
interface PieceConfig {
  id: string;
  garmentType: GarmentType;
  name?: string;
  size: Size;
  quantity: number;
  yardage: number;
  assignedTextileId?: string;
}

interface Step3State {
  pieces: PieceConfig[];
  textileAssignments: Record<string, string>;  // pieceId -> textileId
}

function initStep3(elements: BoardElement[]): Step3State {
  const calculations = elements.filter(el => el.elementType === 'calculation');
  const textiles = elements.filter(el => el.elementType === 'textile');
  
  // Extraire les pièces des calculs
  const pieces = extractPiecesFromCalculations(calculations);
  
  // Assigner le premier tissu par défaut
  const defaultTextileId = textiles[0]?.id;
  const assignments: Record<string, string> = {};
  pieces.forEach(p => {
    if (defaultTextileId) assignments[p.id] = defaultTextileId;
  });
  
  return { pieces, textileAssignments: assignments };
}
```

---

### 4.4 Étape 4/4 : Confirmation

**Objectif :** Récapitulatif et création du projet

```
┌─────────────────────────────────────────────────────────────────┐
│  Créer un projet                                    Étape 4/4   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Récapitulatif                                                 │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  📁 Veste Lin                                             │ │
│  │     Type: Pièce unique                                    │ │
│  │                                                           │ │
│  │  ─────────────────────────────────────────────────────    │ │
│  │                                                           │ │
│  │  👗 1× Veste M                                            │ │
│  │     🧵 Tissu Lin Naturel                                  │ │
│  │     📏 2.5m nécessaires                                   │ │
│  │     💰 ~37.50€                                            │ │
│  │                                                           │ │
│  │  ─────────────────────────────────────────────────────    │ │
│  │                                                           │ │
│  │  📎 Inclus: 1 palette, 1 note                            │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ℹ️ La zone "Veste" sera marquée comme cristallisée.           │
│     Elle restera visible sur le board avec un lien vers        │
│     ce projet.                                                 │
│                                                                 │
│                                  [← Retour]  [Créer le projet]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Logique :**

```typescript
interface Step4State {
  confirmed: boolean;
}

interface ProjectSummary {
  name: string;
  type: ProjectType;
  pieces: PieceConfig[];
  totalYardage: number;
  estimatedCost: number;
  includedElements: {
    textiles: number;
    palettes: number;
    notes: number;
    inspirations: number;
  };
  client?: string;
  deadline?: string;
}
```

---

## 5. Écran de succès

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                           ✅                                    │
│                                                                 │
│              Projet créé avec succès !                         │
│                                                                 │
│              "Veste Lin"                                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│         [Voir le projet]      [Retour au board]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Logique métier

### 6.1 Service de cristallisation

```typescript
// src/features/boards/services/crystallizationService.ts

interface CrystallizeZoneInput {
  zoneId: string;
  boardId: string;
  selectedElementIds: string[];
  projectData: {
    name: string;
    type: ProjectType;
    client?: string;
    deadline?: string;
    budgetMin?: number;
    budgetMax?: number;
  };
  pieces: PieceConfig[];
  textileAssignments: Record<string, string>;
}

interface CrystallizeZoneResult {
  project: Project;
  updatedZone: BoardZone;
}

async function crystallizeZone(
  input: CrystallizeZoneInput,
  sessionId: string
): Promise<CrystallizeZoneResult> {
  
  // 1. Récupérer les éléments sélectionnés
  const elements = await elementsRepository.getByIds(input.selectedElementIds);
  
  // 2. Créer les snapshots des éléments
  const snapshots = elements.map(el => createElementSnapshot(el));
  
  // 3. Créer le projet avec les données
  const project = await projectsRepository.create({
    name: input.projectData.name,
    projectType: input.projectData.type === 'single_piece' ? 'single_piece' : 'ensemble',
    sessionId,
    sourceBoardId: input.boardId,
    sourceZoneId: input.zoneId,
    garments: input.pieces.map(p => ({
      id: p.id,
      type: p.garmentType,
      name: p.name,
      size: p.size,
      quantity: p.quantity,
      calculatedYardage: p.yardage,
    })),
    selectedTextiles: extractTextileSnapshots(elements, input.textileAssignments),
    colorPalette: extractPaletteSnapshot(elements),
    // ... autres champs
  });
  
  // 4. Marquer la zone comme cristallisée
  const updatedZone = await zonesRepository.crystallize(input.zoneId, project.id);
  
  return { project, updatedZone };
}
```

### 6.2 Server Action

```typescript
// src/features/boards/actions/crystallizationActions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { getOrCreateSessionId } from '@/features/favorites/utils/sessionManager';

export async function crystallizeZoneAction(
  input: CrystallizeZoneInput
): Promise<{
  success: boolean;
  projectId?: string;
  error?: string;
}> {
  try {
    const sessionId = await getOrCreateSessionId();
  
    const result = await crystallizeZone(input, sessionId);
  
    revalidatePath(`/boards/${input.boardId}`);
    revalidatePath('/projects');
  
    return { 
      success: true, 
      projectId: result.project.id 
    };
  } catch (error) {
    console.error('crystallizeZoneAction error:', error);
    return { 
      success: false, 
      error: 'Impossible de créer le projet' 
    };
  }
}
```

---

## 7. Modifications base de données

### 7.1 Table board_zones

```sql
-- Ajout colonnes cristallisation
ALTER TABLE deadstock.board_zones 
ADD COLUMN crystallized_at TIMESTAMPTZ,
ADD COLUMN linked_project_id UUID REFERENCES deadstock.projects(id);

-- Index pour filtrage
CREATE INDEX idx_board_zones_crystallized 
ON deadstock.board_zones(board_id, crystallized_at);
```

### 7.2 Table projects

```sql
-- Ajout colonnes source
ALTER TABLE deadstock.projects
ADD COLUMN source_board_id UUID REFERENCES deadstock.boards(id),
ADD COLUMN source_zone_id UUID REFERENCES deadstock.board_zones(id);

-- Index
CREATE INDEX idx_projects_source_board 
ON deadstock.projects(source_board_id);
```

---

## 8. Types TypeScript mis à jour

```typescript
// src/features/boards/domain/types.ts

interface BoardZone {
  id: string;
  boardId: string;
  name: string;
  color: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  // Nouveaux champs
  crystallizedAt?: string;
  linkedProjectId?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper
function isZoneCrystallized(zone: BoardZone): boolean {
  return zone.crystallizedAt !== null && zone.crystallizedAt !== undefined;
}
```

---

## 9. Composants UI

### 9.1 Structure des fichiers

```
src/features/boards/components/Crystallization/
├── CrystallizationWizard.tsx      # Container principal (Dialog)
├── Step1Perimeter.tsx             # Étape 1 - Sélection éléments
├── Step2ProjectType.tsx           # Étape 2 - Nom et type
├── Step3Content.tsx               # Étape 3 - Pièces et associations
├── Step4Confirmation.tsx          # Étape 4 - Récapitulatif
├── SuccessScreen.tsx              # Écran de succès
├── CrystallizedZoneBadge.tsx      # Badge "Projet" sur zone
└── hooks/
    └── useCrystallization.ts      # État du wizard
```

### 9.2 Intégration dans ZoneCard

```tsx
// Dans BoardCanvas.tsx - ZoneCard

function ZoneCard({ zone, ... }: ZoneCardProps) {
  const isCrystallized = isZoneCrystallized(zone);
  
  return (
    <div
      className={cn(
        "absolute rounded-lg transition-shadow",
        isCrystallized 
          ? "border-2 border-solid opacity-80" 
          : "border-2 border-dashed"
      )}
      style={{
        borderColor: zone.color,
        backgroundColor: isCrystallized 
          ? `${zone.color}08`  // 3% opacité
          : `${zone.color}15`, // 8% opacité
      }}
    >
      {/* Header */}
      <div className="...">
        <span>{zone.name}</span>
        {isCrystallized && (
          <CrystallizedZoneBadge projectId={zone.linkedProjectId} />
        )}
      </div>
    
      {/* Actions */}
      {!isCrystallized ? (
        <button onClick={onCrystallize}>
          ⚡ Cristalliser
        </button>
      ) : (
        <Link href={`/projects/${zone.linkedProjectId}`}>
          Voir projet →
        </Link>
      )}
    </div>
  );
}
```

---

## 10. Filtre zones

### 10.1 Dans BoardToolPanel

```tsx
// Nouveau filtre dans le panneau latéral

type ZoneFilter = 'all' | 'active' | 'crystallized';

function ZonesSection() {
  const [filter, setFilter] = useState<ZoneFilter>('all');
  const { zones } = useBoard();
  
  const filteredZones = useMemo(() => {
    switch (filter) {
      case 'active':
        return zones.filter(z => !isZoneCrystallized(z));
      case 'crystallized':
        return zones.filter(z => isZoneCrystallized(z));
      default:
        return zones;
    }
  }, [zones, filter]);
  
  return (
    <div>
      <div className="flex gap-1 mb-4">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          Toutes ({zones.length})
        </FilterButton>
        <FilterButton active={filter === 'active'} onClick={() => setFilter('active')}>
          Actives ({zones.filter(z => !isZoneCrystallized(z)).length})
        </FilterButton>
        <FilterButton active={filter === 'crystallized'} onClick={() => setFilter('crystallized')}>
          Projets ({zones.filter(z => isZoneCrystallized(z)).length})
        </FilterButton>
      </div>
    
      {filteredZones.map(zone => (
        <ZoneListItem key={zone.id} zone={zone} />
      ))}
    </div>
  );
}
```

---

## 11. Checklist d'implémentation

### Base de données

* [ ] Migration 016: Colonnes cristallisation sur board_zones
* [ ] Migration 016: Colonnes source sur projects

### Types & Services

* [ ] Mettre à jour BoardZone type
* [ ] Mettre à jour Project type
* [ ] Helper isZoneCrystallized
* [ ] Service crystallizeZone
* [ ] Server Action crystallizeZoneAction

### Composants

* [ ] CrystallizationWizard (Dialog)
* [ ] Step1Perimeter
* [ ] Step2ProjectType
* [ ] Step3Content
* [ ] Step4Confirmation
* [ ] SuccessScreen
* [ ] CrystallizedZoneBadge
* [ ] Hook useCrystallization

### Intégration

* [ ] Bouton "Cristalliser" sur ZoneCard (zones actives)
* [ ] Style différent pour zones cristallisées
* [ ] Lien "Voir projet" sur zones cristallisées
* [ ] Filtre zones dans BoardToolPanel

### Tests

* [ ] Cristallisation zone avec tous types d'éléments
* [ ] Cristallisation zone sans calcul
* [ ] Affichage zone cristallisée
* [ ] Navigation vers projet depuis zone
* [ ] Filtre zones actives/cristallisées

---

**Document maintenu par :** Équipe Développement

**Dernière mise à jour :** 05/01/2026
