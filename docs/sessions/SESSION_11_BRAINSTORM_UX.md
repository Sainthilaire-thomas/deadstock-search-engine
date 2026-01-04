# Session 11 - Brainstorm UX & Architecture Board

**Date:** 04/01/2026  
**Durée:** ~2h  
**Objectif:** Repenser l'architecture UX du parcours designer

---

## 🎯 Contexte

La session 10 avait créé un module `/journey` avec un parcours linéaire en 9 étapes. En testant et en réfléchissant au workflow réel des designers, cette approche s'est révélée trop rigide.

---

## 💡 Insight principal

> **Le processus créatif n'est pas linéaire.**

Les designers :
- Commencent parfois par l'inspiration (un tissu vu → idée)
- Parfois par le besoin (commande client → recherche tissu)
- Parfois par l'opportunité (promo → achat impulsif)
- Construisent leurs collections itérativement

---

## 🔄 Pivot : Journey → Board

### Avant (linéaire)
```
Étape 1 → Étape 2 → Étape 3 → ... → Étape 9
  Idée   Inspiration  Design    ...    Impact
```

### Après (modulaire)
```
    Recherche    Inspirations    Calcul    Favoris
         │            │           │          │
         └────────────┴─────┬─────┴──────────┘
                            │
                       ┌────▼────┐
                       │  BOARD  │  ← Pivot central
                       └────┬────┘
                            │
                      Cristallisation
                            │
                       ┌────▼────┐
                       │ PROJET  │
                       └─────────┘
```

---

## 📚 Documents créés

| Document | Lignes | Description |
|----------|--------|-------------|
| `GLOSSAIRE.md` | ~300 | Nomenclature complète des concepts |
| `ARCHITECTURE_UX_BOARD_REALISATION.md` | ~600 | Vision UX, interfaces, flux |
| `SPEC_BOARD_MODULE.md` | ~900 | Spécifications techniques complètes |
| `SPEC_CRISTALLISATION.md` | ~700 | Wizard de cristallisation 4 étapes |
| `MIGRATION_JOURNEY_TO_BOARD.md` | ~400 | Plan de migration en 5 phases |

**Total :** ~3000 lignes de documentation

---

## 🏗️ Concepts définis

### Niveau EXPLORATION

| Concept | Définition |
|---------|------------|
| **Tissu** | Produit textile sur une source |
| **Favori** | Tissu sauvegardé (bibliothèque long terme) |
| **Palette** | Ensemble de couleurs cohérentes |
| **Inspiration** | Image de référence visuelle |
| **Calcul** | Estimation de métrage |
| **Note** | Texte libre, annotation |

### Niveau BOARD

| Concept | Définition |
|---------|------------|
| **Board** | Espace de réflexion visuel (granularité libre) |
| **Élément** | Unité sur le board (5 types) |
| **Zone** | Regroupement spatial optionnel |

### Niveau RÉALISATION

| Concept | Définition |
|---------|------------|
| **Projet** | Intention de réalisation concrète |
| **Pièce** | Vêtement au sein d'un projet |
| **Collection** | Regroupement de projets liés |
| **Cristallisation** | Transformation board → projet |

---

## 🔧 Décisions techniques

### Base de données
- 3 nouvelles tables : `boards`, `board_zones`, `board_elements`
- Élément polymorphe via `element_type` + `element_data` JSONB
- Même pattern ownership que favorites (user_id + session_id)

### Architecture frontend
- `BoardContext` similaire à `ProjectContext`
- Canvas 2D avec drag & drop (`@dnd-kit/core`)
- Pan & zoom via CSS transform
- Outils en panel latéral (split view)

### Cristallisation
- Wizard guidé en 4 étapes
- Mapping automatique éléments → données projet
- Board archivé par défaut après cristallisation

---

## 📊 Plan de migration

| Phase | Description | Sessions |
|-------|-------------|----------|
| 1 | Module Board (tables, types, CRUD, pages) | 2-3 |
| 2 | Outils modulaires (calculator, inspirations) | 1-2 |
| 3 | Cristallisation (wizard 4 étapes) | 1-2 |
| 4 | Migration données existantes | 0.5-1 |
| 5 | Nettoyage ancien code | 0.5-1 |
| **Total** | | **5-9** |

---

## ✅ Réalisations de la session

1. ✅ Analyse du workflow créatif réel
2. ✅ Identification des limites du parcours linéaire
3. ✅ Conception de l'architecture Board-centric
4. ✅ Définition de la nomenclature (Glossaire)
5. ✅ Spécifications techniques complètes (Board, Cristallisation)
6. ✅ Plan de migration détaillé
7. ✅ Mise à jour documentation (CONTEXT_SUMMARY, NEXT_STEPS)

---

## 🚫 Non réalisé (code)

Aucun code n'a été écrit cette session. C'était une session de **conception** pure.

Le code existant `/journey` reste fonctionnel mais sera progressivement remplacé.

---

## 💭 Réflexions sur le parcours client

Discussion sur la différence entre :
- **Site marketing** : Landing pages, personas, pricing (acquisition)
- **Application** : L'outil lui-même (utilisation)

Les personas (Luna créatrice, Marc artisan, Sophie marque, Thomas débutant) seront utilisés pour :
- Pages marketing SEO (`/pour/createurs-independants`, etc.)
- Onboarding personnalisé
- Parcours guidés optionnels

---

## 🔗 Liens avec sessions précédentes

- **Session 10** : Création `/journey` → Base de code à migrer
- **Session 7** : Système favoris → Pattern ownership réutilisé
- **Session 8** : Module admin → Architecture feature-based confirmée

---

## 📝 Notes pour la suite

### Session 12 (prochaine)
Commencer Phase 1 de la migration :
1. Migration SQL 015 (tables boards)
2. Types TypeScript
3. Repository + Actions
4. Page `/boards` basique

### Points d'attention
- Ne pas supprimer `/journey` tant que `/boards` n'est pas complet
- Garder le calculateur métrage (à extraire)
- Garder la config garments.ts (à réutiliser)

---

**Prochaine session :** Implémentation Phase 1 - Module Board
