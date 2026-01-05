# ADR 017 - Unification des Repositories (Client/Server)

**Statut:** Accepté
**Date:** 04/01/2026
**Auteur:** Thomas (Session 13)

---

## Contexte

Lors de l'implémentation du `FavoritesSelector` (Session 13), nous avons découvert l'existence de deux fichiers de repository pour les favoris :

1. `favoritesRepository.ts` - Utilisé historiquement côté client
2. `favoritesRepositoryServer.ts` - Créé ultérieurement pour les Server Components

Ces deux fichiers avaient des requêtes SQL différentes, avec des noms de colonnes désynchronisés :

```typescript
// favoritesRepository.ts (obsolète)
.select('..., textile:textiles(slug, price, currency, material_en, color_en, ...)')

// favoritesRepositoryServer.ts (correct)
.select('..., textile:textiles(price_value, price_currency, material_type, color, ...)')
```

Cette duplication causait :
- Des erreurs SQL (`column textiles_1.slug does not exist`)
- De la confusion sur quel fichier utiliser
- Un risque de désynchronisation continue

---

## Décision

**Unifier tous les repositories en un seul fichier par entité.**

Règles adoptées :
1. Un seul fichier `{entity}Repository.ts` par entité
2. Pas de suffixe `Server` ou `Client`
3. Les Server Actions importent le même repository que les composants
4. Le repository gère les transformations de données nécessaires (ex: array → object)

---

## Conséquences

### Positives

- **Source unique de vérité** : Une seule définition des requêtes SQL
- **Maintenance simplifiée** : Modifier un seul fichier pour changer une requête
- **Moins de bugs** : Pas de risque de colonnes désynchronisées
- **Clarté** : On sait toujours quel fichier utiliser

### Négatives

- **Migration nécessaire** : Mise à jour de tous les imports existants
- **Attention au contexte** : S'assurer que le repository fonctionne dans les deux contextes (client/server)

---

## Implémentation

### Structure adoptée

```
src/features/{feature}/
├── infrastructure/
│   └── {entity}Repository.ts    # Unique, utilisé partout
├── actions/
│   └── {entity}Actions.ts       # Server Actions, importe le repository
└── components/
    └── {Component}.tsx          # N'importe PAS directement le repository
                                 # Utilise les Server Actions
```

### Bonnes pratiques

```typescript
// ✅ Correct : Server Action qui utilise le repository
// src/features/favorites/actions/favoriteActions.ts
'use server';
import { getFavoritesBySession } from '../infrastructure/favoritesRepository';

export async function getFavoritesAction() {
  const sessionId = await getOrCreateSessionId();
  return getFavoritesBySession(sessionId);
}

// ✅ Correct : Composant client qui utilise la Server Action
// src/features/boards/components/FavoritesSelector.tsx
'use client';
import { getFavoritesAction } from '@/features/favorites/actions/favoriteActions';

const loadFavorites = async () => {
  const result = await getFavoritesAction();
  // ...
};

// ❌ Incorrect : Composant client qui importe directement le repository
// Peut causer des erreurs avec next/headers ou d'autres APIs serveur
'use client';
import { getFavoritesBySession } from '../infrastructure/favoritesRepository';
```

### Gestion des transformations

Si Supabase retourne des données dans un format inattendu (ex: relation comme array), le repository gère la transformation :

```typescript
export async function getFavoritesBySession(sessionId: string) {
  const { data } = await supabase
    .from('favorites')
    .select(`..., textile:textiles(...)`)
    .eq('session_id', sessionId);

  // Transformer : textile peut être array ou object selon Supabase
  return (data || []).map(item => ({
    ...item,
    textile: Array.isArray(item.textile) ? item.textile[0] : item.textile,
  }));
}
```

---

## Fichiers impactés (Session 13)

### Supprimés
- `src/features/favorites/infrastructure/favoritesRepositoryServer.ts`

### Modifiés
- `src/features/favorites/infrastructure/favoritesRepository.ts` (unifié)
- `src/app/layout.tsx`
- `src/app/favorites/page.tsx`
- `src/app/favorites/[id]/page.tsx`
- `src/app/search/page.tsx`

---

## Alternatives considérées

### 1. Garder deux repositories séparés
**Rejeté** : Trop de risques de désynchronisation, confusion permanente.

### 2. Créer un fichier de types partagé
**Insuffisant** : Ne résout pas la duplication des requêtes SQL.

### 3. Utiliser des hooks côté client
**Non applicable** : Besoin de Server Components pour le SSR.

---

## Références

- Session 13 : `SESSION_13_FAVORITES_SELECTOR.md`
- Pattern existant : `boardsRepository.ts` (déjà unifié)
- Next.js Server Actions : https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions

---

## Checklist pour nouveaux repositories

- [ ] Un seul fichier `{entity}Repository.ts`
- [ ] Colonnes SQL alignées avec le schéma actuel
- [ ] Transformations de données gérées dans le repository
- [ ] Server Actions comme interface pour les composants clients
- [ ] Pas d'import de `next/headers` directement dans les composants clients
