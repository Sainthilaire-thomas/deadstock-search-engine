# Plan de Migration : Journey → Board

**Version:** 1.0  
**Date:** 04/01/2026  
**Statut:** À exécuter

---

## 1. Contexte

### Code existant (Session 10)

Le module `/journey` a été créé avec une vision de **parcours linéaire en 9 étapes**. Cette approche s'est révélée trop rigide pour le workflow créatif réel des designers.

```
ANCIENNE ARCHITECTURE (linéaire)
─────────────────────────────────────────────────────────
Étape 1 → Étape 2 → Étape 3 → ... → Étape 9
  Idée   Inspiration  Design    ...    Impact
```

### Nouvelle architecture (Board-centric)

La nouvelle vision place le **Board comme pivot central**, avec des outils modulaires et une cristallisation libre vers des projets.

```
NOUVELLE ARCHITECTURE (modulaire)
─────────────────────────────────────────────────────────

    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Recherche│ │Inspirat.│ │ Calcul  │ │ Favoris │
    └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
         │          │          │          │
         └──────────┴────┬─────┴──────────┘
                         │
                    ┌────▼────┐
                    │  BOARD  │
                    └────┬────┘
                         │
                    Cristallisation
                         │
                    ┌────▼────┐
                    │ PROJET  │
                    └─────────┘
```

---

## 2. Inventaire du code existant

### 2.1 Fichiers à migrer / adapter

| Fichier | Lignes | Action | Priorité |
|---------|--------|--------|----------|
| `src/features/journey/domain/types.ts` | ~450 | **Réutiliser partiellement** | Haute |
| `src/features/journey/config/garments.ts` | ~420 | **Conserver tel quel** | - |
| `src/features/journey/config/steps.ts` | ~150 | **Supprimer** | Basse |
| `src/features/journey/infrastructure/projectsRepository.ts` | ~280 | **Adapter** | Haute |
| `src/features/journey/actions/projectActions.ts` | ~350 | **Adapter** | Haute |
| `src/features/journey/context/ProjectContext.tsx` | ~500 | **Adapter** | Haute |
| `src/features/journey/services/yardageCalculator.ts` | ~200 | **Conserver tel quel** | - |
| `src/features/journey/components/Sidebar.tsx` | ~150 | **Refaire** | Moyenne |
| `src/features/journey/components/SidebarStep.tsx` | ~100 | **Supprimer** | Basse |

### 2.2 Pages à migrer

| Page | Action | Devient |
|------|--------|---------|
| `/journey` | **Remplacer** | `/boards` (liste des boards) |
| `/journey/new` | **Remplacer** | `/boards/new` ou modal |
| `/journey/[id]/idea` | **Supprimer** | Intégré au board (notes, infos projet) |
| `/journey/[id]/design` | **Transformer** | Outil panel "Ajouter pièce" |
| `/journey/[id]/calculate` | **Transformer** | `/calculator` (standalone) + panel |
| `/journey/[id]/inspiration` | **Transformer** | `/inspirations` + panel sur board |

### 2.3 Éléments à conserver

Ces éléments restent pertinents et seront réutilisés :

1. **Types de vêtements** (`garments.ts`) → Utilisé dans le calculateur et les projets
2. **Calculateur de métrage** (`yardageCalculator.ts`) → Module standalone
3. **Types Project** (`types.ts` partiel) → Pour la partie Réalisation
4. **Repository projects** → Adapté pour la nouvelle structure

---

## 3. Stratégie de migration

### Approche recommandée : **Migration progressive**

Plutôt que de tout réécrire d'un coup, on procède par étapes :

```
Phase 1: Créer le nouveau module /boards (sans supprimer journey)
Phase 2: Adapter les outils (calculateur, favoris)
Phase 3: Créer la cristallisation
Phase 4: Migrer les données existantes
Phase 5: Supprimer l'ancien code journey
```

### Avantages

- Pas de régression
- Testable à chaque étape
- Possibilité de rollback
- L'ancienne version reste fonctionnelle pendant la transition

---

## 4. Plan d'exécution détaillé

### Phase 1 : Module Board (2-3 sessions)

#### 1.1 Base de données

```sql
-- Nouvelles tables
CREATE TABLE deadstock.boards (...);
CREATE TABLE deadstock.board_zones (...);
CREATE TABLE deadstock.board_elements (...);

-- Modification table projects (ajouter lien vers board source)
ALTER TABLE deadstock.projects 
ADD COLUMN source_board_id UUID REFERENCES deadstock.boards(id);
```

**Fichier migration :** `015_create_boards_tables.sql`

#### 1.2 Structure des fichiers

```
src/features/boards/           # NOUVEAU MODULE
├── domain/
│   └── types.ts
├── infrastructure/
│   ├── boardsRepository.ts
│   ├── elementsRepository.ts
│   └── zonesRepository.ts
├── actions/
│   ├── boardActions.ts
│   ├── elementActions.ts
│   └── zoneActions.ts
├── context/
│   └── BoardContext.tsx
├── hooks/
│   ├── useBoard.ts
│   ├── useDragAndDrop.ts
│   └── useCanvasViewport.ts
└── components/
    ├── BoardList/
    ├── BoardCanvas/
    ├── BoardElement/
    ├── BoardZone/
    └── ToolPanel/
```

#### 1.3 Pages

```
src/app/boards/                # NOUVELLES PAGES
├── page.tsx                   # Liste des boards
└── [boardId]/
    ├── layout.tsx
    └── page.tsx               # Canvas
```

#### 1.4 Tâches

- [ ] Migration SQL 015
- [ ] Types TypeScript boards
- [ ] boardsRepository
- [ ] elementsRepository  
- [ ] zonesRepository
- [ ] Server Actions (board, element, zone)
- [ ] BoardContext
- [ ] Page liste boards
- [ ] Page canvas board (basique, sans drag & drop)
- [ ] Composants éléments (TextileCard, NoteCard, etc.)

---

### Phase 2 : Outils modulaires (1-2 sessions)

#### 2.1 Calculateur standalone

Transformer le calculateur en module indépendant accessible :
- En page dédiée `/calculator`
- En panel sur le board

```
src/features/calculator/       # NOUVEAU MODULE (extrait de journey)
├── domain/
│   └── types.ts              # Types calcul (depuis journey/types.ts)
├── config/
│   └── garments.ts           # Copié de journey/config
├── services/
│   └── yardageCalculator.ts  # Copié de journey/services
├── actions/
│   └── calculatorActions.ts
└── components/
    ├── Calculator.tsx
    ├── GarmentSelector.tsx
    ├── ResultCard.tsx
    └── AddToBoardButton.tsx
```

**Page :** `src/app/calculator/page.tsx`

#### 2.2 Module Inspirations

```
src/features/inspirations/     # NOUVEAU MODULE
├── domain/
│   └── types.ts
├── actions/
│   └── inspirationActions.ts
└── components/
    ├── PaletteCreator.tsx
    ├── ColorPicker.tsx
    ├── ImageUploader.tsx
    └── PaletteExtractor.tsx
```

**Page :** `src/app/inspirations/page.tsx`

#### 2.3 Adaptation Favoris

Ajouter le bouton "Envoyer au board" sur les favoris existants.

```typescript
// Modification dans src/features/favorites/components/FavoriteCard.tsx

<button onClick={() => handleAddToBoard(textile)}>
  + Ajouter au board
</button>
```

#### 2.4 Tâches

- [ ] Extraire calculator de journey
- [ ] Page /calculator standalone
- [ ] Panel calculator sur board
- [ ] Créer module inspirations
- [ ] Page /inspirations
- [ ] Panel inspirations sur board
- [ ] Bouton "Ajouter au board" sur favoris
- [ ] Bouton "Ajouter au board" sur résultats recherche

---

### Phase 3 : Cristallisation (1-2 sessions)

#### 3.1 Wizard de cristallisation

```
src/features/boards/components/Cristallisation/
├── CristallisationWizard.tsx
├── Step1Perimeter.tsx
├── Step2ProjectType.tsx
├── Step3Content.tsx
├── Step4Confirmation.tsx
├── SuccessScreen.tsx
└── hooks/
    └── useCristallisation.ts
```

#### 3.2 Adaptation du module Projects

Le module projects existant devient la destination de la cristallisation.

```typescript
// Modifications dans projectsRepository.ts

// Ajouter champ source_board_id
interface Project {
  // ... champs existants
  sourceBoardId?: string;
}

// Ajouter méthode de création depuis board
async function createFromBoard(
  boardData: BoardCristallisationData,
  sessionId: string
): Promise<Project>
```

#### 3.3 Tâches

- [ ] useCristallisation hook
- [ ] CristallisationWizard
- [ ] Step1Perimeter
- [ ] Step2ProjectType
- [ ] Step3Content
- [ ] Step4Confirmation
- [ ] SuccessScreen
- [ ] Action cristalliseToProjectAction
- [ ] Adapter projectsRepository
- [ ] Bouton "Créer projet" sur board

---

### Phase 4 : Migration des données (1 session)

#### 4.1 Script de migration

Si des utilisateurs ont déjà créé des projets via `/journey`, il faut les migrer.

```typescript
// scripts/migrate-journey-to-boards.ts

async function migrateJourneyProjects() {
  // 1. Récupérer tous les projets existants
  const projects = await getExistingProjects();
  
  for (const project of projects) {
    // 2. Créer un board "rétroactif" pour chaque projet
    const board = await createBoardFromProject(project);
    
    // 3. Lier le projet au board
    await linkProjectToBoard(project.id, board.id);
    
    // 4. Archiver le board (puisque le projet existe déjà)
    await archiveBoard(board.id);
  }
}
```

#### 4.2 Tâches

- [ ] Script de migration
- [ ] Test sur données de dev
- [ ] Exécution en production (si applicable)

---

### Phase 5 : Nettoyage (1 session)

#### 5.1 Suppression ancien code

```bash
# Fichiers à supprimer
rm -rf src/features/journey/config/steps.ts
rm -rf src/features/journey/components/Sidebar.tsx
rm -rf src/features/journey/components/SidebarStep.tsx
rm -rf src/features/journey/components/MobileJourneyNav.tsx
rm -rf src/app/journey/
```

#### 5.2 Réorganisation

```
src/features/
├── boards/           # Module Board (nouveau)
├── calculator/       # Calculateur (extrait)
├── inspirations/     # Inspirations (nouveau)
├── projects/         # Projets (adapté, renommé depuis journey partiel)
├── favorites/        # Inchangé
├── search/           # Inchangé
├── admin/            # Inchangé
└── scraping/         # Inchangé
```

#### 5.3 Mise à jour Sidebar principale

```tsx
// src/components/layout/Sidebar.tsx

<nav>
  {/* Boards */}
  <section>
    <h3>Mes Boards</h3>
    <BoardList />
    <NewBoardButton />
  </section>

  {/* Outils */}
  <section>
    <h3>Outils</h3>
    <NavLink href="/search">Recherche</NavLink>
    <NavLink href="/inspirations">Inspirations</NavLink>
    <NavLink href="/favorites">Favoris</NavLink>
    <NavLink href="/calculator">Calculateur</NavLink>
  </section>

  {/* Réalisation */}
  <section>
    <h3>Réalisation</h3>
    <NavLink href="/projects">Projets</NavLink>
    <NavLink href="/collections">Collections</NavLink>
  </section>
</nav>
```

#### 5.4 Tâches

- [ ] Supprimer fichiers obsolètes
- [ ] Renommer/réorganiser modules
- [ ] Mettre à jour imports
- [ ] Mettre à jour sidebar
- [ ] Mettre à jour navigation
- [ ] Tests de non-régression
- [ ] Mise à jour documentation

---

## 5. Mapping des fonctionnalités

### Ce qui disparaît

| Ancienne feature | Raison |
|------------------|--------|
| Parcours linéaire 9 étapes | Remplacé par workflow libre |
| Sidebar avec étapes numérotées | Remplacé par liste de boards |
| Page /journey/[id]/idea | Intégré aux notes du board |
| Page /journey/[id]/inspiration | Module séparé + panel |

### Ce qui est transformé

| Ancien | Nouveau | Notes |
|--------|---------|-------|
| `/journey` | `/boards` | Liste des boards au lieu de projets |
| `/journey/[id]/design` | Panel "Ajouter pièce" | Outil contextuel sur board |
| `/journey/[id]/calculate` | `/calculator` + panel | Module standalone |
| `ProjectContext` | `BoardContext` | Logique similaire, structure différente |

### Ce qui est conservé

| Élément | Fichier | Usage |
|---------|---------|-------|
| Types vêtements | `garments.ts` | Calculateur, projets |
| Calculateur métrage | `yardageCalculator.ts` | Module calculator |
| Repository projects | `projectsRepository.ts` | Module projects (adapté) |
| Actions projects | `projectActions.ts` | Module projects (adapté) |

---

## 6. Risques et mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Perte de données utilisateur | Faible | Élevé | Script de migration, backup avant |
| Régression fonctionnelle | Moyenne | Moyen | Tests à chaque phase, rollback possible |
| Complexité accrue | Moyenne | Moyen | Documentation claire, revue de code |
| Temps sous-estimé | Moyenne | Faible | Buffer de 20% sur estimations |

---

## 7. Estimations

| Phase | Sessions estimées | Dépendances |
|-------|-------------------|-------------|
| Phase 1 : Module Board | 2-3 | Aucune |
| Phase 2 : Outils modulaires | 1-2 | Phase 1 |
| Phase 3 : Cristallisation | 1-2 | Phase 1, 2 |
| Phase 4 : Migration données | 0.5-1 | Phase 3 |
| Phase 5 : Nettoyage | 0.5-1 | Phase 4 |
| **Total** | **5-9 sessions** | |

---

## 8. Checklist de validation finale

Avant de considérer la migration terminée :

- [ ] Un utilisateur peut créer un board
- [ ] Un utilisateur peut ajouter des éléments depuis recherche
- [ ] Un utilisateur peut ajouter des éléments depuis favoris
- [ ] Un utilisateur peut ajouter des calculs de métrage
- [ ] Un utilisateur peut créer des palettes
- [ ] Un utilisateur peut organiser son board en zones
- [ ] Un utilisateur peut cristalliser un board en projet
- [ ] Les anciens projets sont accessibles
- [ ] La sidebar reflète la nouvelle architecture
- [ ] Aucune page 404 sur les anciennes URLs (redirections)
- [ ] Documentation à jour

---

## 9. Redirections (SEO / bookmarks)

Pour ne pas casser les liens existants :

```typescript
// src/middleware.ts ou redirects dans next.config.js

const redirects = [
  { source: '/journey', destination: '/boards', permanent: true },
  { source: '/journey/new', destination: '/boards/new', permanent: true },
  { source: '/journey/:id/idea', destination: '/boards/:id', permanent: true },
  { source: '/journey/:id/design', destination: '/boards/:id', permanent: true },
  { source: '/journey/:id/calculate', destination: '/calculator', permanent: true },
];
```

---

**Document maintenu par :** Équipe Développement  
**Dernière mise à jour :** 04/01/2026
