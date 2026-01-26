# Audit de Performance - Deadstock Search Engine

**Date** : 26 Janvier 2026  
**Version** : 2.3  
**Statut** : Mis à jour - Nouvelle cause racine identifiée

---

## 📊 Résumé Exécutif

### Mise à jour V2.3 (26 Janvier 2026)

> ⚠️ **DÉCOUVERTE MAJEURE** : Le problème principal de performance n'est pas React/Next.js mais le **stockage d'images en base64** dans la base de données.

| Découverte | Impact |
|------------|--------|
| Images stockées en base64 dans `element_data` | 13 MB transférés à chaque navigation `/boards` |
| Cause des 5-6 secondes | Transfert réseau, pas la requête SQL |
| Solution | Migration vers Supabase Storage |

### Core Web Vitals

| Métrique | Valeur Actuelle | Objectif | Statut |
|----------|-----------------|----------|--------|
| LCP (Largest Contentful Paint) | 1.09-1.19s | <2.5s | ✅ Bon |
| CLS (Cumulative Layout Shift) | 0 | <0.1 | ✅ Excellent |
| INP (Interaction to Next Paint) | 8-48ms | <200ms | ✅ Excellent |

### Temps de Navigation (Mesurés 26 Janvier 2026)

| Navigation | Temps | Objectif | Statut | Cause |
|------------|-------|----------|--------|-------|
| → /boards (liste) | **5-6s** | <500ms | 🔴 CRITIQUE | 13 MB base64 |
| → /search | **1.2s** | <800ms | 🟡 Lent | N+1 requêtes |
| → /boards/[id]/journey | **1.9s** | <400ms | 🟡 Lent | Charge 268 textiles |
| Journey → Board | **184ms** | <200ms | ✅ Bon | Layout partagé |

---

## 🔴 Problème Principal Identifié (V2.3)

### P0 - CRITIQUE : Images stockées en base64

**Découvert le** : 26 Janvier 2026  
**Impact** : 5-6 secondes de chargement pour `/boards`

#### Analyse des données

```sql
-- Requête de diagnostic
SELECT b.name, COUNT(e.id), SUM(LENGTH(e.element_data::text)) as size
FROM deadstock.boards b
LEFT JOIN deadstock.board_elements e ON e.board_id = b.id
GROUP BY b.id, b.name ORDER BY size DESC;
```

| Board | Éléments | Taille element_data |
|-------|----------|---------------------|
| Chemise automne | 14 | **5.10 MB** |
| Collection automne | 15 | **5.10 MB** |
| Robe été | 11 | **2.55 MB** |
| Chemise | 5 | 1.7 KB |
| Pantalon | 4 | 1.4 KB |
| **TOTAL** | **49** | **~13 MB** |

#### Preuve que le problème est le transfert

```
-- Timing côté Supabase (SQL Editor)
Execution Time: 240.422 ms  ← Requête rapide !

-- Timing côté application
listBoardsWithPreview:query: 5.484s  ← Transfert lent !
```

La requête SQL s'exécute en 240ms, mais le **transfert de 13 MB** prend 5+ secondes.

#### Solution

Voir **SPRINT_IMAGES_STORAGE.md** :
1. Créer bucket Supabase Storage
2. Migrer les uploads pour stocker des URLs (pas base64)
3. Optimiser la requête listing (ne pas charger `element_data`)

**Gain attendu** : `/boards` passe de 5-6s à **< 500ms** (-95%)

---

## 🟡 Problèmes Secondaires (inchangés)

### P8 - Journey charge searchTextiles() inutilement

**Fichier** : `src/app/(main)/boards/[boardId]/journey/page.tsx`

```typescript
const initialSearchData = await searchTextiles();  // 268 textiles chargés !
```

**Impact** : 1.9 secondes  
**Solution** : Lazy load quand l'utilisateur clique sur l'onglet textile  
**Priorité** : Après migration images

---

### P11 - getAvailableFilters() fait N+1 requêtes

**Fichier** : `src/features/search/infrastructure/textileRepository.ts`

```typescript
for (const cat of categoriesData || []) {
  const { data } = await supabase
    .from('textile_attributes')
    .select('value')
    .eq('category_slug', cat.slug);  // N requêtes !
}
```

**Impact** : ~500ms sur `/search`  
**Solution** : Une seule requête avec agrégation côté client  
**Priorité** : Après migration images

---

## ✅ Corrections Appliquées (26 Janvier 2026)

### P9 - BoardCard async avec getTranslations() ✅ CORRIGÉ

**Fichier** : `src/app/(main)/boards/page.tsx`

**Avant** :
```typescript
async function BoardCard({ board, locale }) {
  const t = await getTranslations();  // Appelé N fois !
}
```

**Après** :
```typescript
function BoardCard({ board, locale, t }) {
  // t passé en props depuis le parent
}
```

**Gain** : Élimine N-1 appels `getTranslations()` (mineur vs le problème base64)

---

### P2 - Middleware getUser() → getSession() ✅ CORRIGÉ

**Fichier** : `src/lib/auth/getAuthUser.ts`

**Avant** :
```typescript
const { data } = await supabase.auth.getUser();  // Appel réseau
```

**Après** :
```typescript
const { data: { session } } = await supabase.auth.getSession();  // JWT local
```

**Note** : Warning Supabase "insecure" est attendu et acceptable car le middleware vérifie déjà l'auth.

---

## 📋 Nouvelle Stratégie de Priorités

### Phase 0 - Migration Images (PRIORITÉ ABSOLUE)

| Sprint | Description | Effort | Gain |
|--------|-------------|--------|------|
| **IMG-1** | Infrastructure Storage | 1h30 | Prérequis |
| **IMG-2** | Migration composants upload | 3h | Prérequis |
| **IMG-3** | Nettoyage + optimisation listing | 1h30 | **-95% temps /boards** |

**Total** : ~6h pour passer de 5-6s à < 500ms

### Phase 1 - Optimisations Secondaires (après Phase 0)

| Sprint | Description | Effort | Gain |
|--------|-------------|--------|------|
| **PERF-1** | Journey lazy load | 45min | -1.5s sur /journey |
| **PERF-2** | getAvailableFilters | 30min | -500ms sur /search |

### Phase 2 - Optimisations React (optionnel)

| Sprint | Description | Effort | Gain |
|--------|-------------|--------|------|
| **REACT-1** | Lazy mount modals | 30min | -100ms |
| **REACT-2** | Props stables React.memo | 1h30 | Moins de re-renders |

---

## 📊 Objectifs Post-Migration

| Métrique | Avant | Objectif | Amélioration |
|----------|-------|----------|--------------|
| Navigation `/boards` | 5-6s | **< 500ms** | -90% |
| Navigation `/search` | 1.2s | < 800ms | -33% |
| Navigation `/journey` | 1.9s | < 500ms | -74% |
| Taille requête boards | 13 MB | < 10 KB | -99.9% |

---

## 🔧 Script de Mesure (inchangé)

```javascript
// Coller dans la console DevTools pour monitorer les navigations
const originalPushState = history.pushState;
let navStart = 0;

history.pushState = function() {
  navStart = performance.now();
  console.log('🚀 Navigation started');
  originalPushState.apply(this, arguments);
};

new MutationObserver((mutations, obs) => {
  if (navStart > 0) {
    const duration = Math.round(performance.now() - navStart);
    console.log(`✅ Navigation: ${duration}ms`);
    navStart = 0;
  }
}).observe(document.body, { childList: true, subtree: true });

console.log('📊 Navigation monitoring active');
```

---

## 📚 Documents Liés

- **SPRINT_IMAGES_STORAGE.md** : Plan détaillé de la migration images
- **SPRINT_PLAN.md** : Sprints Boards & Admin (à reprendre après Phase 0)
- **PROJECT_CONTEXT_V4_3.md** : Contexte technique du projet

---

## 📝 Historique des Versions

| Version | Date | Changements |
|---------|------|-------------|
| 2.3 | 26 Jan 2026 | Découverte cause racine (base64), nouvelle stratégie |
| 2.2 | 18 Jan 2026 | Audit initial, focus React/Next.js |

---

**Prochaine étape** : Exécuter SPRINT_IMAGES_STORAGE.md Phase IMG-1
