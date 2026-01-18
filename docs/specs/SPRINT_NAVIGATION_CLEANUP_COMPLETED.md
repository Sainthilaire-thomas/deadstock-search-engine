# Sprint Plan - Nettoyage & Navigation

**Date** : 18 Janvier 2026  
**Status** : ✅ COMPLÉTÉ  
**Objectif** : Nettoyer les branches mortes puis implémenter la nouvelle navigation

---

## RÉSUMÉ EXÉCUTIF

✅ **Sprint terminé avec succès !**

| Sprint | Status | Durée réelle |
|--------|--------|--------------|
| N1: Nettoyage | ✅ Complété | ~45min |
| NAV1: Page Hub | ✅ Complété | ~1h30 |
| NAV2: Page Search | ✅ Complété | ~30min |
| NAV3: Page Favorites | ✅ Complété | ~30min |
| NAV4: Header Global | ✅ Complété | ~1h30 |
| NAV5: Redirections | ✅ Complété | ~30min |
| **TOTAL** | ✅ | **~5h** |

---

## PARTIE 1 : AUDIT DES BRANCHES MORTES ✅

### Code Supprimé

| Chemin | Action |
|--------|--------|
| `src/_backup/` | ✅ Supprimé |
| `src/components/textile/` | ✅ Supprimé (dossier vide) |
| `src/domains/` | ✅ Supprimé (structure abandonnée) |
| `supabase_audit_*.txt` | ✅ Supprimé |

### Documentation Archivée

Déplacé vers `docs/_archive/` :
- PROJECT_CONTEXT_COMPACT.md (et V2, V3)
- PROJECT_CONTEXT_V4.md, V4.1.md
- NEXT_STEPS.md, NEXT_STEPS_MVP_DEMO.md
- CONTEXT_SUMMARY.md
- PHASES.md
- PRODUCT_VISION.md

---

## PARTIE 2 : NAVIGATION IMPLÉMENTÉE ✅

### Architecture Finale

```
ROUTES PRINCIPALES
├── / ........................ Landing (public)
├── /home .................... Hub de choix (après login) ✅
├── /search .................. Recherche globale ✅
├── /favorites ............... Page favoris ✅
├── /boards .................. Liste des projets
├── /boards/[boardId] ........ Board canvas
├── /boards/[boardId]/journey  Vue Journey
├── /textiles/[id] ........... Détail textile
├── /settings ................ Paramètres
└── /admin/* ................. Administration (caché)
```

### Header Global

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]  [← Retour projet]  [Chercher]  [Projets]  [♡7]    [👤] │
└─────────────────────────────────────────────────────────────────┘
```

**Comportement contextuel** :
- Logo → /home (toujours)
- "← Retour à [Projet]" → visible si activeBoard et hors board
- "Chercher des tissus" → caché si sur /search
- "Mes Projets" → caché si sur /boards ou dans un board
- Badge favoris → toujours visible avec compteur
- Avatar → menu avec Admin (si admin)

### Fichiers Créés

```
src/
├── app/(main)/
│   ├── home/page.tsx              ✅ Page hub
│   ├── search/page.tsx            ✅ Page recherche
│   └── favorites/page.tsx         ✅ Page favoris
│
└── features/navigation/
    ├── components/
    │   └── MainHeader.tsx         ✅ Header global
    └── context/
        └── NavigationContext.tsx  ✅ Contexte board actif
```

### Fichiers Modifiés

```
src/
├── app/(main)/layout.tsx          ✅ Utilise MainHeader + providers
├── app/(auth)/login/page.tsx      ✅ Redirect vers /home
├── features/boards/components/
│   └── BoardLayoutClient.tsx      ✅ Enregistre board actif
├── features/favorites/context/
│   └── FavoritesContext.tsx       ✅ Auto-load count au montage
└── middleware.ts                  ✅ Routes protégées + redirect
```

---

## COMMITS RÉALISÉS

1. `chore: save state before navigation cleanup sprint`
2. `chore: cleanup dead code and archive obsolete docs`
3. `feat(nav): add /home hub page and /search page`
4. `feat(nav): add /favorites page`
5. `feat(nav): complete MainHeader with global navigation`
6. `feat(nav): add NavigationContext for board return navigation`
7. `feat(nav): redirect to /home after login`

---

## CRITÈRES DE VALIDATION ✅

### Sprint N1 ✅
- [x] `npx tsc --noEmit` passe sans erreur
- [x] `npm run dev` démarre correctement
- [x] Pas de dossier `_backup` dans src/

### Sprint NAV1 ✅
- [x] `/home` affiche 2 cartes égales
- [x] Clic sur carte → navigation correcte
- [x] Badge "3 projets" affiché

### Sprint NAV2 ✅
- [x] `/search` affiche SearchInterface
- [x] Recherche fonctionne (filtres, résultats)
- [x] Favoris cliquables depuis résultats

### Sprint NAV3 ✅
- [x] `/favorites` affiche la liste des favoris
- [x] État vide avec CTA vers search (testé OK)
- [x] 7 favoris affichés correctement

### Sprint NAV4 ✅
- [x] Header visible sur toutes les pages (main)
- [x] Logo → /home
- [x] Bouton retour projet apparaît quand pertinent
- [x] Admin visible dans menu si admin
- [x] Liens contextuels (cachés quand sur la page)

### Sprint NAV5 ✅
- [x] Login → redirige vers /home (testé en navigation privée)
- [x] Routes /home, /search, /favorites protégées

---

## NOTES TECHNIQUES

### NavigationContext

```typescript
// Stockage du board actif
interface ActiveBoard {
  id: string;
  name: string;
  returnPath: string;
}

// Persistance en sessionStorage
// Auto-restore au montage du provider
```

### FavoritesContext

```typescript
// Ajout d'un useEffect pour charger le count au montage
useEffect(() => {
  refreshCount();
}, [refreshCount]);
```

### Problème Connu

La déconnexion ne fonctionne pas toujours correctement (cookies persistent). 
Workaround : tester en navigation privée.

---

## PROCHAINES ÉTAPES

Maintenant que la navigation est en place, les prochaines priorités sont :

1. **Sprints B4-B6** (SPRINT_PLAN.md) :
   - B4: Potentiel Discovery
   - B5: Scraping guidé
   - B6: Fusion contraintes

2. **Sprints Admin A1-A6** :
   - Coverage par source
   - Filtres unknowns
   - Edit dictionary
   - Stock coverage dashboard

3. **Améliorations UX** :
   - Mobile navigation (bottom tabs ?)
   - Quick search (Cmd+K) dans header
   - Améliorer la déconnexion
