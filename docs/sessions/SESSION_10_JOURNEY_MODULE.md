# Session 10 - Module Journey Designer

**Date:** 03/01/2026  
**Durée:** ~3h  
**Objectif:** Implémenter le module Journey (parcours designer en 9 étapes)

---

## 🎯 Objectifs de la session

1. ✅ Créer la table `projects` en base de données
2. ✅ Implémenter l'infrastructure backend (Repository, Actions, Context)
3. ✅ Créer les pages du parcours (Étapes 1, 3, 4)
4. ⏳ Tester le parcours complet (reporté à demain)

---

## 📊 Réalisations

### Base de données

**Migration 014 exécutée** - Table `deadstock.projects` :
- 30 colonnes pour toutes les étapes du parcours
- Ownership : `user_id` (auth) + `session_id` (anonymous)
- JSONB pour mood_board, garments, fabric_modifiers, yardage_details
- RLS policies permissives (même pattern que favorites)
- Indexes sur user_id, session_id, status, created_at

### Infrastructure TypeScript

| Fichier | Lignes | Description |
|---------|--------|-------------|
| `domain/types.ts` | ~450 | Types complets (Project, MoodBoard, Garment, Calculation) |
| `config/garments.ts` | ~420 | 20 types de vêtements avec formules de métrage |
| `infrastructure/projectsRepository.ts` | ~280 | CRUD Supabase avec mappers |
| `actions/projectActions.ts` | ~350 | 20+ Server Actions Next.js |
| `context/ProjectContext.tsx` | ~500 | React Context avec optimistic updates |
| `services/yardageCalculator.ts` | ~200 | Algorithme de calcul métrage |

### Pages créées

| Route | Description | Status |
|-------|-------------|--------|
| `/journey` | Liste des projets | ✅ |
| `/journey/new` | Création de projet | ✅ |
| `/journey/[projectId]/layout.tsx` | Layout avec ProjectProvider | ✅ |
| `/journey/[projectId]/idea` | Étape 1 : Définir l'idée | ✅ |
| `/journey/[projectId]/design` | Étape 3 : Sélection vêtements | ✅ |
| `/journey/[projectId]/calculate` | Étape 4 : Calcul métrage | ✅ |
| `/journey/[projectId]/inspiration` | Étape 2 : Mood board | 📁 Dossier créé |

### Fonctionnalités implémentées

**Étape 1 - Idée:**
- Nom du projet (requis)
- Type de projet (pièce unique, collection, prototype)
- Description optionnelle
- Informations client (nom, deadline, budget)
- Contraintes (deadstock only, bio, local, etc.)
- Suppression avec confirmation

**Étape 3 - Design:**
- Ajout de vêtements par catégorie (20 types)
- Configuration : taille, quantité, nom personnalisé
- Variations : longueur, manches, doublure
- Duplication et suppression
- Modal de sélection avec filtres par catégorie

**Étape 4 - Calcul:**
- Sélection largeur tissu (90-160cm)
- Marge de sécurité (5-20%)
- Caractéristiques tissu (+/- modificateurs)
- Résultat en temps réel avec breakdown
- Détail par vêtement
- Ajustements visibles (largeur, modifiers, marge)

---

## 🔧 Corrections TypeScript effectuées

1. **types.ts** : Ajout des types legacy (SidebarProps, SidebarStepProps, etc.)
2. **StepStatus** : Ajout de 'upcoming' et 'available'
3. **SidebarStep.tsx** : Ajout de 'available' dans STATUS_STYLES
4. **design/page.tsx** : Correction imports (GARMENT_TYPES vs GARMENT_CONFIGS)
5. **design/page.tsx** : Ajout GarmentCategory à l'import
6. **idea/page.tsx** : Conversion Date → string pour deadline
7. **calculate/page.tsx** : `totalForQuantity` au lieu de `yardage`

---

## 📁 Structure des fichiers créés

```
src/
├── app/journey/
│   ├── page.tsx                    # Liste des projets
│   ├── new/page.tsx                # Création projet
│   └── [projectId]/
│       ├── layout.tsx              # Provider wrapper
│       ├── idea/page.tsx           # Étape 1
│       ├── design/page.tsx         # Étape 3
│       ├── calculate/page.tsx      # Étape 4
│       └── inspiration/            # (dossier vide)
│
└── features/journey/
    ├── domain/types.ts             # Types complets
    ├── config/
    │   ├── steps.ts                # (existant)
    │   └── garments.ts             # Config vêtements
    ├── infrastructure/
    │   └── projectsRepository.ts   # CRUD Supabase
    ├── actions/
    │   └── projectActions.ts       # Server Actions
    ├── context/
    │   └── ProjectContext.tsx      # React Context
    ├── services/
    │   └── yardageCalculator.ts    # Calcul métrage
    └── components/
        ├── Sidebar.tsx             # (existant)
        ├── SidebarStep.tsx         # (existant)
        └── MobileJourneyNav.tsx    # (existant)
```

---

## 🧮 Algorithme de calcul métrage

```
1. Pour chaque vêtement:
   baseYardage[size] × quantity + variationModifiers × quantity

2. Sous-total = somme des vêtements

3. Ajustement largeur:
   - Si < 120cm: +15%
   - Si > 145cm: -5%

4. Modificateurs tissu:
   - Directionnel: +10%
   - Raccord motif: +20%
   - Velours: +10%
   - Stretch: -10%

5. Marge sécurité: +5% à +20%

6. Arrondi au 0.5m supérieur → recommandé
```

---

## ⏳ Non réalisé (reporté)

- Test complet du parcours utilisateur
- Page Inspiration (mood board avec drag & drop)
- Intégration avec la recherche textile (étape 5)
- Fichiers i18n (journey.json FR/EN)

---

## 🐛 Points d'attention

1. **Erreurs TypeScript préexistantes** dans scripts/ et autres modules (non bloquantes)
2. **Dark mode** : Quelques zones de formulaire non adaptées
3. **Pagination projets** : Non implémentée (OK pour MVP)
4. **Autosave** : Non implémenté (sauvegarde manuelle pour l'instant)

---

## 📈 Métriques

- **Lignes de code créées:** ~2500
- **Fichiers créés:** 12
- **Types TypeScript:** ~30 interfaces/types
- **Server Actions:** 20+
- **Pages Next.js:** 5

---

## 🔗 Liens utiles

- Screenshot final : Page création projet fonctionnelle
- Migration SQL : `014_create_projects_table.sql`
- Spec UI originale : `SPEC_JOURNEY_UI_AMBITIEUSE.md`

---

## 💡 Décisions techniques

1. **Pattern Repository** : Même architecture que favorites (séparation concerns)
2. **Optimistic updates** : Via React Context pour UX fluide
3. **Labels hardcodés** : Pour MVP (i18n préparé mais non branché)
4. **Session-based ownership** : Réutilisation du pattern favorites (httpOnly cookie)
5. **JSONB pour données complexes** : Garments, mood_board, modifiers

---

**Prochaine session:** Tester le parcours complet, corriger les bugs éventuels, implémenter l'étape Inspiration (mood board)
