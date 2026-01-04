
# État Actuel du Projet - Deadstock Search Engine

**Dernière mise à jour:** 04/01/2026 - Fin Session 12
**Version:** MVP Phase 1 - Module Boards Complet

---

## 🎯 Statut Global

| Composant               | Statut        | Progression          |
| ----------------------- | ------------- | -------------------- |
| Infrastructure DB       | ✅ Complet    | 100%                 |
| Module Admin            | ✅ Complet    | 100%                 |
| Module Scraping         | ✅ Complet    | 100%                 |
| Module Recherche        | ✅ Complet    | 100%                 |
| Module Favoris          | ✅ Complet    | 100%                 |
| **Module Boards** | ✅ Complet    | 100%                 |
| Module Normalisation    | 🔄 En cours   | 60%                  |
| Module Journey (legacy) | ⏸️ Suspendu | Remplacé par Boards |

---

## 📊 Base de Données

### Tables Actives (Schema `deadstock`)

| Table              | Lignes | Description                    |
| ------------------ | ------ | ------------------------------ |
| `sites`          | 3      | Sources de scraping            |
| `site_profiles`  | 3      | Profils découverte            |
| `textiles`       | ~160   | Produits scrapés              |
| `favorites`      | ~4     | Favoris utilisateur            |
| `scraping_jobs`  | ~15    | Historique jobs                |
| `discovery_jobs` | ~5     | Jobs découverte               |
| `boards`         | 1+     | Boards utilisateur             |
| `board_elements` | 7+     | Éléments sur boards          |
| `board_zones`    | 2+     | Zones de regroupement          |
| `projects`       | 0      | Projets (pour cristallisation) |

### Migrations Appliquées

```
001 → 015_create_boards_tables.sql
```

---

## 🏗️ Architecture Technique

### Stack

* **Frontend:** Next.js 16.1.1 (App Router, Turbopack)
* **Backend:** Server Actions + Supabase
* **Database:** PostgreSQL (Supabase)
* **Styling:** Tailwind CSS + shadcn/ui
* **State:** React Context (FavoritesContext, BoardContext)
* **Icons:** Lucide React (outline style)

### Structure des Features

```
src/features/
├── admin/           # Gestion sites, scraping, discovery
├── boards/          # ⭐ NOUVEAU - Module Boards complet
│   ├── domain/types.ts
│   ├── infrastructure/
│   │   ├── boardsRepository.ts
│   │   ├── elementsRepository.ts
│   │   └── zonesRepository.ts
│   ├── actions/
│   │   ├── boardActions.ts
│   │   ├── elementActions.ts
│   │   └── zoneActions.ts
│   ├── context/BoardContext.tsx
│   └── components/
│       ├── BoardCanvas.tsx
│       ├── BoardHeader.tsx
│       ├── BoardToolPanel.tsx
│       ├── NoteEditor.tsx
│       └── AddToBoardButton.tsx
├── favorites/       # Système favoris avec session
├── journey/         # Legacy - parcours 9 étapes
├── search/          # Recherche unifiée textiles
└── scraping/        # Services extraction données
```

---

## ✅ Fonctionnalités Opérationnelles

### Module Boards (Session 12)

* **Liste boards** (`/boards`) : Affichage, création, navigation
* **Canvas board** (`/boards/[id]`) :
  * Drag & drop éléments
  * Zones draggables avec couleurs
  * Édition titre board (clic)
  * Sélection simple/multiple
  * Suppression éléments/zones
* **Éléments supportés** :
  * Notes (création + édition double-clic)
  * Palettes de couleurs
  * Tissus (snapshot depuis favoris/recherche)
* **Intégrations** :
  * Bouton "+" sur cartes favoris
  * Bouton "+" sur cartes recherche
  * Toast de confirmation avec lien vers board
  * Lien "Boards" dans sidebar parcours

### Module Admin

* Dashboard avec statistiques
* Gestion sites sources
* Discovery automatique (collections, qualité)
* Configuration scraping (collections, filtres)
* Preview scraping (10 produits)
* Jobs monitoring avec logs

### Module Recherche

* Recherche full-text
* Filtres dynamiques (matière, couleur, prix, source)
* Grille responsive avec images
* Boutons favoris + board sur chaque carte

### Module Favoris

* Ajout/retrait instantané (optimistic updates)
* Session-based (cookie 90 jours)
* Grille avec détails
* Page détail avec navigation prev/next
* Bouton "Ajouter au board"

---

## 🔧 Configuration Requise

### Variables d'Environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Admin only
ANTHROPIC_API_KEY=sk-ant-...           # Pour LLM extraction
```

### Commandes Utiles

```bash
npm run dev              # Serveur développement
npm run build            # Build production
npm run generate:types   # Régénérer types Supabase
```

---

## 📈 Métriques Actuelles

* **Textiles indexés:** ~160
* **Sources actives:** 2 (MyLittleCoupon, TheFabricSales)
* **Précision matière:** ~80%
* **Précision couleur:** ~40%
* **Temps scraping:** ~30s pour 50 produits

---

## 🚧 Travaux en Cours

### Priorité Haute

1. Bouton "Tissu depuis favoris" fonctionnel dans board
2. Cristallisation board → projet

### Priorité Moyenne

3. Redimensionnement zones
4. Amélioration normalisation (nouveaux patterns)

### Priorité Basse

5. Nettoyage code journey legacy
6. Tests automatisés

---

## 🐛 Problèmes Connus

1. **Anti-bot TheFabricSales** : Certaines pages bloquées
2. **Images manquantes** : Quelques textiles sans image
3. **Normalisation incomplète** : ~20% matières non détectées

---

## 📚 Documentation Associée

* `CONTEXT_SUMMARY.md` - Résumé pour IA
* `NEXT_STEPS.md` - Prochaines étapes détaillées
* `SESSION_12_BOARD_MODULE.md` - Note de session
* `docs/specs/board/` - Spécifications module boards
