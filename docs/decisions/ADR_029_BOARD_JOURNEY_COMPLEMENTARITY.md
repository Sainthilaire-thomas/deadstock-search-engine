# ADR-029 : Architecture Board + Journey - Deux Vues Complémentaires

**Date** : 15 Janvier 2026
**Statut** : Accepté (Révisé)
**Contexte** : Clarification de la relation entre Board et Journey suite à la Session 14
**Impact** : UX globale, architecture navigation, roadmap développement

---

## Résumé Exécutif

Cette ADR définit l'architecture où **Board** et **Journey** sont deux **vues complémentaires** du même projet :
- **Board** = Vue spatiale (canvas visuel, organisation libre)
- **Journey** = Vue par type/phase (navigation structurée, outils avancés)

Le designer peut basculer entre les deux selon son mode de travail du moment.

---

## 1. Contexte

### Historique

| Session | Événement |
|---------|-----------|
| Session 10 | Création du module Journey (9 étapes linéaires) |
| Session 11 | **Pivot UX** : Journey linéaire → Board flexible |
| Sessions 12-14 | Focus sur Board (Sprints 1-6, recherche contextuelle B1-B3) |
| Session 14 | **Nouvelle vision** : Journey = vue alternative par type/phase |

### Problème Initial

Après le pivot vers les Boards, le module Journey semblait abandonné. Or, la navigation par type/phase reste utile :
- "Ce matin je veux travailler mes patrons" → accès direct sans chercher sur le canvas
- "Je veux voir tous mes calculs" → liste structurée
- Outils avancés nécessitant un mode focus

---

## 2. Décision : Deux Vues du Même Projet

### Architecture Conceptuelle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   BOARD (Vue Spatiale)              JOURNEY (Vue par Phase/Type)        │
│   ════════════════════              ════════════════════════════        │
│                                                                         │
│   ┌─────────────────────┐           ┌─────────────────────────────┐    │
│   │  Zone "Veste"       │           │  📋 CONCEPTION               │    │
│   │  ┌───┐ ┌───┐ ┌───┐  │           │  ├── Idée (Board info)       │    │
│   │  │pat│ │cal│ │tis│  │  ←────→   │  ├── 🎨 Palettes (3)         │    │
│   │  └───┘ └───┘ └───┘  │           │  └── ✂️ Patrons (2)          │    │
│   └─────────────────────┘           │      ├── Robe Magnolia.pdf   │    │
│                                     │      └── Chemise.pdf         │    │
│   ┌─────────────────────┐           │                               │    │
│   │  Zone "Chemise"     │           │  📏 PRÉPARATION               │    │
│   │  ┌───┐ ┌───┐        │           │  ├── Calculs (2)              │    │
│   │  │pat│ │cal│        │           │  └── 🧵 Tissus (4)            │    │
│   │  └───┘ └───┘        │           │                               │    │
│   └─────────────────────┘           │  🛒 EXÉCUTION                  │    │
│                                     │  └── Zones cristallisées (0)  │    │
│   + éléments libres...              └─────────────────────────────┘    │
│                                                                         │
│   MÊME DONNÉES, DEUX FAÇONS DE LES VOIR ET LES TRAVAILLER              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Rôles Définis

| Aspect | Board | Journey |
|--------|-------|---------|
| **Métaphore** | Table de travail | Classeur organisé |
| **Vue** | Spatiale (canvas 2D) | Structurée (liste par type) |
| **Navigation** | Visuelle, libre | Par phase/catégorie |
| **Opérations** | Modals basiques | Outils avancés (mode focus) |
| **Cas d'usage** | Vue d'ensemble, organisation | Travail ciblé par type |

### Cas d'Usage Concrets

| Besoin | Board | Journey |
|--------|-------|---------|
| "Voir mon projet globalement" | ✅ Idéal | |
| "Organiser mes éléments" | ✅ Drag & drop | |
| "Travailler mes patrons ce matin" | | ✅ Liste directe |
| "Comparer tous mes calculs" | | ✅ Vue groupée |
| "Édition avancée d'un patron" | | ✅ Mode focus |

---

## 3. Mapping Éléments → Phases Journey

### Les 3 Phases et leurs Éléments

| Phase | Éléments Board | Fonctions Journey |
|-------|----------------|-------------------|
| **CONCEPTION** | | |
| └── Idée | Infos Board (nom, description) | Édition projet |
| └── Inspiration | `inspiration` (images) | Extraction couleurs multiples |
| └── Palettes | `palette` | Harmonies, variantes, export |
| └── Patrons | `pattern` (PDF patron) | **Extraction dimensions, calcul auto** |
| └── Silhouettes | `silhouette` | Bibliothèque, annotation |
| └── Design | `pdf` (documents) | Visualisation |
| **PRÉPARATION** | | |
| └── Calculs | `calculation` | **Multi-vêtements, breakdown** |
| └── Sourcing | `textile` | **Comparateur, specs techniques** |
| └── Notes | `note` | Édition enrichie |
| **EXÉCUTION** | | |
| └── Projets | Zones cristallisées | Suivi, commandes |
| └── Liens | `link`, `video` | Ressources externes |

### Distinction PDF vs Pattern

Deux types d'éléments PDF existent :

| Type | Usage | Mode Focus Journey |
|------|-------|-------------------|
| `pdf` | Document générique | Visualisation simple |
| `pattern` | PDF de patron couture | **Extraction pièces, dimensions, calcul métrage** |

---

## 4. Navigation et URLs

### Structure des Routes

```
/boards                                    # Liste des boards
/boards/[boardId]                          # Board (vue spatiale)
/boards/[boardId]/journey                  # Journey (vue par phase)
/boards/[boardId]/journey/conception       # Phase Conception
/boards/[boardId]/journey/preparation      # Phase Préparation
/boards/[boardId]/journey/execution        # Phase Exécution

# Mode Focus (outils avancés)
/boards/[boardId]/journey/pattern/[elementId]     # Éditeur patron
/boards/[boardId]/journey/calculation/[elementId] # Calculateur détaillé
/boards/[boardId]/journey/textile/[elementId]     # Comparateur tissus
/boards/[boardId]/journey/palette/[elementId]     # Éditeur palette
```

### Navigation Fluide

```
Board ←──────────────────────────→ Journey
  │                                    │
  │  [Bouton Journey dans header]      │  [Bouton Board dans header]
  │                                    │
  ▼                                    ▼
Canvas                              Liste par phase
  │                                    │
  │  [Double-clic élément]             │  [Clic sur élément]
  │                                    │
  ▼                                    ▼
Modal basique ──────────────────→ Mode Focus
                [Approfondir]        (outils avancés)
```

---

## 5. Mode Focus : Outils Avancés par Type

### Pattern (PDF Patron)

| Fonction | Description |
|----------|-------------|
| Visualisation PDF | Viewer intégré |
| Définition pièces | Nommer, dimensionner chaque pièce |
| Extraction dimensions | Depuis PDF ou saisie manuelle |
| Calcul automatique | Métrage basé sur pièces définies |
| Disposition laize | Optimisation placement |
| Export | Vers élément `calculation` |

### Calculation (Calcul Métrage)

| Fonction | Description |
|----------|-------------|
| Multi-vêtements | N vêtements dans un calcul |
| Toutes variations | Longueur, manches, doublure... |
| Tous modificateurs | Directionnel, raccord, velours... |
| Breakdown détaillé | Par vêtement, par largeur |
| Liaison patron | Importer depuis élément `pattern` |

### Textile (Tissus)

| Fonction | Description |
|----------|-------------|
| Comparateur | Plusieurs tissus côte à côte |
| Specs techniques | Tous attributs détaillés |
| Score matching | Avec contraintes du projet |
| Historique prix | Si disponible |

### Palette (Couleurs)

| Fonction | Description |
|----------|-------------|
| Harmonies | Complémentaires, analogues... |
| Variantes | Tons plus clairs/foncés |
| Export | PNG, CSS, JSON |
| Recherche tissus | Par couleurs de la palette |

---

## 6. Implémentation Technique

### Menu Journey (Sidebar)

Modifier `Sidebar.tsx` pour :
```typescript
// Afficher le compte d'éléments par type
interface JourneyPhaseProps {
  boardId: string;
  elements: BoardElement[];
}

// Grouper par phase
const conceptionElements = elements.filter(e => 
  ['palette', 'pattern', 'silhouette', 'inspiration'].includes(e.elementType)
);
const preparationElements = elements.filter(e => 
  ['calculation', 'textile', 'note'].includes(e.elementType)
);
```

### Compteurs Dynamiques

```typescript
// Dans la sidebar Journey
<PhaseSection title="Conception">
  <ElementTypeRow icon="🎨" label="Palettes" count={palettes.length} />
  <ElementTypeRow icon="✂️" label="Patrons" count={patterns.length} />
  <ElementTypeRow icon="👤" label="Silhouettes" count={silhouettes.length} />
</PhaseSection>
```

### Mode Focus

```typescript
// Route dynamique
/boards/[boardId]/journey/[elementType]/[elementId]/page.tsx

// Charger l'élément et afficher l'outil approprié
const element = await getElementById(elementId);
switch (element.elementType) {
  case 'pattern': return <PatternEditor element={element} />;
  case 'calculation': return <CalculationEditor element={element} />;
  case 'textile': return <TextileComparator element={element} />;
  // ...
}
```

---

## 7. Code Existant à Réutiliser

### Module Journey Actuel

| Fichier | Réutilisation |
|---------|---------------|
| `config/steps.ts` | Adapter phases (Conception/Préparation/Exécution) |
| `config/garments.ts` | ✅ Tel quel pour calculs |
| `services/yardageCalculator.ts` | ✅ Tel quel |
| `components/Sidebar.tsx` | Adapter pour afficher éléments Board |
| `domain/types.ts` | Réutiliser GarmentConfig, etc. |

### Module Pattern Actuel

| Fichier | État |
|---------|------|
| `PatternImportModal.tsx` | ✅ Modal basique OK |
| `ManualPatternForm.tsx` | ✅ Complet |
| `calculateYardage.ts` | ✅ Complet |
| `YardageResult.tsx` | ✅ Complet |

---

## 8. Risques et Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Confusion Board/Journey | Moyenne | Moyen | Boutons clairs, onboarding |
| Synchronisation données | Faible | Élevé | Même source de données |
| Complexité navigation | Moyenne | Moyen | URLs logiques, breadcrumbs |
| Surcharge fonctionnalités | Moyenne | Moyen | Déploiement progressif |

---

## 9. Métriques de Succès

| Métrique | Cible |
|----------|-------|
| Utilisation vue Journey | > 40% des sessions |
| Bascule Board ↔ Journey | > 2× par session |
| Mode Focus utilisé | > 30% des éléments |
| Temps en mode focus | 3-10 min (travail réel) |

---

## 10. Prochaines Actions

1. ✅ Mettre à jour ADR-029 (ce document)
2. ✅ Mettre à jour BOARD_JOURNEY_SPRINTS.md
3. ⏳ Sprint J0 : Menu Journey avec compteurs
4. ⏳ Sprint J1 : Navigation Board ↔ Journey
5. ⏳ Sprint J2 : Mode Focus Calcul (multi-vêtements)
6. ⏳ Sprint J3 : Mode Focus Patron (extraction dimensions)

---

## 11. Références

- `GLOSSAIRE_V2.md` - Définitions mises à jour
- `ADR-016` - Architecture Module Boards (pivot initial)
- `config/steps.ts` - Configuration 9 étapes originales
- `BOARD_JOURNEY_SPRINTS.md` - Plan de développement

---

**Auteur** : Thomas
**Validé par** : Thomas
**Date de validation** : 15 Janvier 2026
