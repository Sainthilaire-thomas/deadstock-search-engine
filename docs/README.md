# 📚 Documentation - Deadstock Textile Search Engine

**Projet** : Moteur de recherche de textiles deadstock

**Objectif** : Centraliser les textiles deadstock de multiples fournisseurs pour aider les designers de mode à sourcer des matériaux durables

**Dernière MAJ** : 27 décembre 2025

---

## 🎯 Navigation Rapide

### Pour Démarrer une Session AI

1. Lire [`ai_context/CONTEXT_SUMMARY.md`](https://claude.ai/chat/ai_context/CONTEXT_SUMMARY.md) (contexte rapide)
2. Lire [`state/CURRENT_STATE.md`](https://claude.ai/chat/state/CURRENT_STATE.md) (état actuel détaillé)
3. Consulter [`ai_context/NEXT_STEPS.md`](https://claude.ai/chat/ai_context/NEXT_STEPS.md) (prochaines actions)

### Documentation Projet

* [`project/PROJECT_OVERVIEW.md`](https://claude.ai/chat/project/PROJECT_OVERVIEW.md) - Vue d'ensemble complète
* [`project/PHASES.md`](https://claude.ai/chat/project/PHASES.md) - Roadmap 12 phases (13 mois)
* [`state/TECH_STACK.md`](https://claude.ai/chat/state/TECH_STACK.md) - Architecture technique

### Décisions et Historique

* [`decisions/`](https://claude.ai/chat/decisions/) - Architecture Decision Records (ADR)
* [`sessions/`](https://claude.ai/chat/sessions/) - Notes de sessions AI

---

## 📊 État du Projet en Un Coup d'Œil

**Phase Actuelle** : Phase 0 - Conception & Planification

**Progression Globale** : 15% (spécifications terminées)

**Prochaine Milestone** : MVP avec agrégation basique Recovo + My Little Coupon

### Complété ✅

* ✅ Spécifications fonctionnelles complètes
* ✅ Architecture technique définie
* ✅ Roadmap 12 phases structurée
* ✅ Documentation projet initialisée

### En Cours 🚧

* 🚧 Design de la base de données (approche hybride MVP → normalisée)
* 🚧 Évaluation des approches de scraping

### À Venir 📝

* Phase 1 : MVP avec standardisation données
* Phase 2 : Monétisation (API + marketplace inversé)
* Phase 3 : Impact measurement & IA

---

## 🏗️ Structure du Projet

```
deadstock-search-engine/
├── docs/                           # Toute la documentation
│   ├── README.md                   # Ce fichier
│   ├── project/                    # Définition du projet
│   ├── state/                      # État actuel (CRITIQUE pour AI)
│   ├── decisions/                  # ADR (décisions architecturales)
│   ├── sessions/                   # Historique sessions AI
│   └── ai_context/                 # Contexte rapide pour AI
│
├── src/                            # Code source (à créer)
├── database/                       # Schémas et migrations
└── tests/                          # Tests

```

---

## 🤖 Prompts Utiles

### Démarrer une session

```





Bonjour Claude,
Je continue le projet Deadstock Textile Search Engine.
Peux-tu lire CONTEXT_SUMMARY.md et CURRENT_STATE.md et NEXT_STEPS me résumer où on en est ?
```

### Terminer une session

```
Claude, fin de session.
Peux-tu mettre à jour CURRENT_STATE.md, PROJECT_CONTEXT_COMPACT.md (en rajoutant ce qui est nouveau dans la session mais aussi ce que tu penses aurait du figurer en début de session et qui manquait), NEXT_STEPS.md 
et créer la note de session ?
```

### Documenter une décision importante

```
Claude, je viens de décider [DÉCISION].
Peux-tu créer un ADR dans /docs/decisions/ selon le format standard ?
```

---

## 📈 Métriques Projet

* **Durée Estimée** : 13 mois (12 phases)
* **Stack** : Next.js, Supabase, Vercel
* **Sources Données** : Recovo, My Little Coupon, + autres à venir
* **Utilisateurs Cibles** : Designers indépendants + professionnels de la mode

---

## 🎓 Méthodologie Utilisée

Ce projet utilise la **méthodologie AI Project Documentation** pour :

* ✅ Contextualisation rapide de l'IA en début de session
* ✅ Documentation automatique et cohérente
* ✅ Traçabilité des décisions (ADR)
* ✅ Reprise facile après pause

**Règles d'or** :

1. Toujours commencer par lire CONTEXT_SUMMARY + CURRENT_STATE
2. Toujours mettre à jour les docs en fin de session
3. Toujours documenter les décisions importantes

---

**Prochaine session** : Finaliser le design de la base de données
