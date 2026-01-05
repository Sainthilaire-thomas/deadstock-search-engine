# ADR 018 - Règles de Cristallisation Zone → Projet

**Date:** 05/01/2026  
**Statut:** Accepté  
**Session:** 14

---

## Contexte

La cristallisation est le processus de transformation d'un **Board** (exploration) en **Projet** (réalisation). Lors de la session 14, nous avons clarifié les règles exactes de ce processus suite à une discussion sur le workflow réel des designers.

### Question centrale

Comment transformer une partie d'un board en projet tout en préservant le contexte d'exploration ?

---

## Décisions

### 1. Périmètre MVP : Zone → Projet

**Décision :** Le MVP implémente uniquement la cristallisation **Zone → Projet**.

**Justification :**
- C'est le cas d'usage le plus naturel : une zone représente une intention créative cohérente (ex: "Veste", "Chemise")
- L'utilisateur organise intuitivement ses éléments par zone avant de cristalliser
- Les autres modes (board entier, sélection libre) peuvent être ajoutés ultérieurement

**Modes de cristallisation :**

| Mode | MVP | Description |
|------|-----|-------------|
| Zone → Projet | ✅ | Une zone devient un projet |
| Board entier → Projet | ❌ Phase 2 | Tout le board devient un projet |
| Sélection → Projet | ❌ Phase 2 | Éléments sélectionnés deviennent un projet |

---

### 2. Duplication des éléments (pas de référence partagée)

**Décision :** Les éléments sont **dupliqués** dans le projet, pas référencés.

**Justification :**
- Un même tissu peut être utilisé dans plusieurs projets (veste ET chemise)
- L'utilisateur duplique explicitement les éléments dans chaque zone concernée
- Évite les problèmes de modification en cascade
- Simplifie la logique de suppression (pas de dépendances croisées)

**Conséquences :**
- Le projet contient une **copie snapshot** des données au moment de la cristallisation
- Les modifications ultérieures du tissu source n'affectent pas le projet
- L'utilisateur doit dupliquer manuellement les éléments partagés entre zones

```
BOARD "Collection Printemps"
├── Zone "Veste"
│   ├── 🧵 Tissu Lin (copie 1)
│   └── 🎨 Palette Bleu (copie 1)
│
├── Zone "Chemise"  
│   ├── 🧵 Tissu Lin (copie 2)  ← Dupliqué explicitement
│   └── 🎨 Palette Blanc
│
└── Après cristallisation "Veste" :
    └── PROJET "Veste" contient snapshot de :
        ├── Tissu Lin (données figées)
        └── Palette Bleu (données figées)
```

---

### 3. Zone cristallisée reste visible (marquée)

**Décision :** Après cristallisation, la zone reste sur le board mais est **marquée visuellement** comme cristallisée.

**Justification :**
- Préserve le contexte de travail (l'utilisateur voit son historique)
- Permet de référencer le projet créé
- Évite la perte de données accidentelle
- Facilite la gestion de collections (plusieurs zones → plusieurs projets)

**États d'une zone :**

| État | Description | Visuel |
|------|-------------|--------|
| `active` | Zone de travail normale | Border dashed, bg color/15% |
| `crystallized` | Zone transformée en projet | Border solid, bg color/5%, badge "Projet" |

**Comportement zone cristallisée :**
- ✅ Visible sur le board
- ✅ Lien vers le projet créé
- ❓ Modifiable ? → À définir (Phase 2)
- ✅ Supprimable (ne supprime pas le projet)

---

### 4. Filtre zones cristallisées / actives

**Décision :** Le panneau latéral permet de filtrer les zones par état.

**Options de filtre :**
- Toutes les zones
- Zones actives uniquement
- Zones cristallisées uniquement

**Justification :**
- Sur un board avec beaucoup de zones, l'utilisateur veut se concentrer sur le travail restant
- Permet de voir rapidement ce qui a été transformé en projet

---

### 5. Gestion des modifications post-cristallisation (À définir)

**Décision :** Reporté à Phase 2.

**Questions ouvertes :**
- Si on modifie une zone cristallisée, le projet est-il impacté ?
- Faut-il un système de versioning ?
- Faut-il "décristalliser" une zone ?

**Option envisagée pour Phase 2 :**
- Zone cristallisée = lecture seule par défaut
- Bouton "Modifier" qui crée une nouvelle version
- Historique des versions du projet

---

## Modèle de données

### Modifications table `board_zones`

```sql
ALTER TABLE deadstock.board_zones 
ADD COLUMN crystallized_at TIMESTAMPTZ,
ADD COLUMN linked_project_id UUID REFERENCES deadstock.projects(id);
```

### Modifications table `projects`

```sql
ALTER TABLE deadstock.projects
ADD COLUMN source_board_id UUID REFERENCES deadstock.boards(id),
ADD COLUMN source_zone_id UUID REFERENCES deadstock.board_zones(id);
```

### Type TypeScript mis à jour

```typescript
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
  crystallizedAt?: string;      // null = zone active
  linkedProjectId?: string;     // Référence vers le projet créé
  createdAt: string;
  updatedAt: string;
}

interface Project {
  // ... champs existants ...
  sourceBoardId?: string;       // Board d'origine
  sourceZoneId?: string;        // Zone d'origine
}
```

---

## Flux utilisateur

```
┌─────────────────────────────────────────────────────────────────┐
│  BOARD "Collection Printemps 2026"                              │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │ ZONE "Veste"        │    │ ZONE "Chemise"      │            │
│  │ [ACTIVE]            │    │ [ACTIVE]            │            │
│  │                     │    │                     │            │
│  │  🎨 Palette bleu    │    │  🎨 Palette blanc   │            │
│  │  🧵 Tissu lin       │    │  🧵 Tissu coton     │            │
│  │  📊 Calcul 2.5m     │    │  📊 Calcul 1.8m     │            │
│  │                     │    │                     │            │
│  │  [⚡ Cristalliser]  │    │  [⚡ Cristalliser]  │            │
│  └─────────────────────┘    └─────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ Clic "Cristalliser" sur zone "Veste"
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  WIZARD CRISTALLISATION (4 étapes)                              │
│                                                                 │
│  Étape 1: Périmètre → Zone "Veste" pré-sélectionnée            │
│  Étape 2: Nom & Type → "Projet Veste Lin", Pièce unique        │
│  Étape 3: Contenu → Valider tissu, calcul                      │
│  Étape 4: Confirmation → Créer                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ Création réussie
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  BOARD "Collection Printemps 2026"                              │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │ ZONE "Veste"        │    │ ZONE "Chemise"      │            │
│  │ [CRISTALLISÉE] ────────────> PROJET "Veste"    │            │
│  │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │    │ [ACTIVE]            │            │
│  │  🎨 Palette bleu    │    │                     │            │
│  │  🧵 Tissu lin       │    │  🎨 Palette blanc   │            │
│  │  📊 Calcul 2.5m     │    │  🧵 Tissu coton     │            │
│  │                     │    │  📊 Calcul 1.8m     │            │
│  │  [Voir projet →]    │    │                     │            │
│  └─────────────────────┘    │  [⚡ Cristalliser]  │            │
│                             └─────────────────────┘            │
│                                                                 │
│  Filtre: [Toutes ▼] [Actives] [Cristallisées]                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Alternatives considérées

### A1 : Référence partagée (rejetée)

Les éléments seraient référencés (pas dupliqués) entre zones et projets.

**Avantages :**
- Pas de duplication de données
- Modification synchronisée

**Inconvénients :**
- Complexité de gestion des dépendances
- Risque de modifications non désirées
- Que faire si l'élément source est supprimé ?

### A2 : Suppression de la zone après cristallisation (rejetée)

La zone disparaît du board après cristallisation.

**Avantages :**
- Board plus "propre"

**Inconvénients :**
- Perte du contexte de travail
- Impossible de voir l'historique
- Risque d'erreur (suppression accidentelle)

### A3 : Cristallisation board entier en MVP (reportée)

Implémenter tous les modes de cristallisation dès le MVP.

**Avantages :**
- Plus de flexibilité

**Inconvénients :**
- Complexité accrue
- Cas d'usage moins clair
- Risque de confusion utilisateur

---

## Conséquences

### Positives
- Workflow clair et intuitif
- Données isolées (pas d'effets de bord)
- Préservation du contexte de travail
- Extensible pour Phase 2

### Négatives
- Duplication de données (stockage)
- L'utilisateur doit gérer les doublons manuellement
- Questions ouvertes sur les modifications post-cristallisation

### Neutres
- Migration DB requise (ajout colonnes)
- Mise à jour des types TypeScript
- Nouveau filtre dans l'UI

---

## Plan d'implémentation

1. **Migration DB** : `016_add_crystallization_columns.sql`
2. **Types TypeScript** : Mettre à jour `BoardZone` et `Project`
3. **UI Zone cristallisée** : Affichage différent, badge, lien
4. **Bouton "Cristalliser"** : Sur header de zone ou menu contextuel
5. **Wizard 4 étapes** : Simplifier étape 1 (zone pré-sélectionnée)
6. **Filtre zones** : Toggle dans panneau latéral
7. **Tests** : Scénarios de cristallisation

---

## Références

- `SPEC_CRISTALLISATION.md` - Spécifications détaillées du wizard
- `GLOSSAIRE.md` - Définition des concepts
- Session 11 - Brainstorm UX Board
- Session 14 - Clarification des règles

---

**Décision prise par :** Thomas  
**Date de validation :** 05/01/2026
