# ADR 031: Déconnexion côté serveur via API Route

**Date** : 2026-01-18

**Statut** : Accepté

**Décideurs** : Thomas

**Contexte Phase** : MVP Phase 1 - Navigation

---

## Contexte

La déconnexion utilisateur ne fonctionnait pas correctement. Après avoir cliqué sur "Déconnexion" :

- L'utilisateur était redirigé vers la landing `/`
- Mais en retournant sur une page protégée (ex: `/home`), il était toujours connecté
- Les cookies de session Supabase persistaient malgré l'appel à `supabase.auth.signOut()` côté client

Le problème venait du fait que la déconnexion côté client (browser) ne supprimait pas les cookies HTTP-only utilisés par le middleware côté serveur pour vérifier l'authentification.

---

## Décision

Créer une API Route `/api/auth/signout` qui effectue la déconnexion côté serveur, garantissant la suppression des cookies de session.

Le flux de déconnexion devient :

1. Appel POST à `/api/auth/signout` (côté serveur)
2. Appel `signOut()` du contexte Auth (côté client, pour nettoyer l'état React)
3. Redirection vers `/`

---

## Options Considérées

### Option 1 : Déconnexion client uniquement

**Description** : Garder uniquement `supabase.auth.signOut()` côté client

**Avantages** :

- Simple, pas de nouvelle route API

**Inconvénients** :

- Ne fonctionne pas - les cookies HTTP-only persistent
- Le middleware continue de voir l'utilisateur comme connecté

**Coût/Complexité** : Faible mais inefficace

---

### Option 2 : API Route serveur (CHOISI)

**Description** : Créer `/api/auth/signout` qui appelle `supabase.auth.signOut()` côté serveur

**Avantages** :

- Supprime correctement les cookies HTTP-only
- Cohérent avec l'architecture SSR de Next.js
- Le middleware voit immédiatement l'utilisateur comme déconnecté

**Inconvénients** :

- Une route API supplémentaire à maintenir

**Coût/Complexité** : Faible

---

### Option 3 : Middleware de déconnexion

**Description** : Gérer la déconnexion directement dans le middleware sur une route spéciale

**Avantages** :

- Centralisé dans le middleware

**Inconvénients** :

- Complexifie le middleware
- Moins explicite qu'une route API dédiée

**Coût/Complexité** : Moyen

---

## Rationale (Justification)

L'Option 2 a été choisie car :

1. **Efficacité** : C'est la seule approche qui fonctionne correctement avec les cookies HTTP-only
2. **Simplicité** : Une route API de 30 lignes, facile à comprendre et maintenir
3. **Pattern standard** : Suit les bonnes pratiques Next.js + Supabase SSR
4. **Séparation des responsabilités** : La route API gère les cookies serveur, le contexte React gère l'état client

---

## Conséquences

### Positives

- La déconnexion fonctionne correctement
- L'utilisateur est vraiment déconnecté après clic
- Les routes protégées redirigent bien vers `/login`

### Négatives

- Double appel (API + client) lors de la déconnexion (mitigé : négligeable en termes de performance)

### Neutres

- Aucun impact sur le reste de l'architecture auth

---

## Implémentation

**Actions Concrètes** :

- [X] Créer `src/app/api/auth/signout/route.ts`
- [X] Modifier `handleSignOut` dans `UserMenu.tsx`
- [X] Tester le flux complet de déconnexion

**Fichiers Affectés** :

- `src/app/api/auth/signout/route.ts` (nouveau)
- `src/features/auth/components/UserMenu.tsx` (modifié)

---

## Validation

**Critères de Succès** :

- [X] Clic sur "Déconnexion" redirige vers `/`
- [X] Accès à `/home` après déconnexion redirige vers `/login`
- [X] Reconnexion fonctionne normalement

**Conditions de Révision** :

- Si Supabase change son approche de gestion des cookies SSR

---

## Références

### Documents Liés

- `docs/decisions/ADR_030_AUTH_MULTI_SCHEMA_V2.md`
- `docs/ai_context/PROJECT_CONTEXT_V4_3.md`

### Ressources Externes

- [Supabase SSR Auth Guide](https://supabase.com/docs/guides/auth/server-side)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## Historique des Révisions

| Date       | Changement         | Auteur |
| ---------- | ------------------ | ------ |
| 2026-01-18 | Création initiale | Thomas |
