# SPRINT L&A - Landing Page & Authentification

**Version** : 3.0
**Date** : 17 Janvier 2026
**Priorité** : P0 (Bloquant pour Phase 2)
**Status** : L1-L4 TERMINÉS ✅ + Fix LandingHeader ✅

---

## 🎯 Objectifs

1. **Landing Page Commerciale** : Convertir les visiteurs en utilisateurs ✅
2. **Système d'Authentification** : Supabase Auth avec email/password + OAuth ✅
3. **Gestion des Rôles** : Utiliser la table `users.role` existante (free/premium/pro/admin) ✅
4. **Protection des Routes** : Middleware + guards ✅
5. **Header Landing Dynamique** : Afficher état auth sur landing page ✅

---

## ✅ SPRINTS TERMINÉS

### Sprint L1 : Landing Page Commerciale ✅

**Status** : TERMINÉ (14 Janvier 2026)

- [X] Layout responsive (mobile-first)
- [X] Navigation sticky avec CTA
- [X] Hero section avec mockup interface
- [X] Section Problème / Solution
- [X] Section Fonctionnalités (grille 2x3)
- [X] Section "Comment ça marche" (3 étapes)
- [X] CTA final avec gradient vert
- [X] Footer
- [X] Page Pricing avec comparatif et FAQ

**Fichiers créés/modifiés** :

- `src/app/page.tsx` - Landing redesignée
- `src/app/pricing/page.tsx` - Pricing redesignée

---

### Sprint L2 : Setup Supabase Auth ✅

**Status** : TERMINÉ (14 Janvier 2026)

- [X] Email/Password provider activé
- [X] Table `deadstock.users` avec colonnes role, searches_today, etc.
- [X] Trigger `handle_new_user()` pour création auto profil
- [X] Client Supabase Auth helpers

**Note technique importante** :

```typescript
// Le client browser DOIT utiliser @supabase/ssr (pas @supabase/supabase-js)
// pour que les sessions soient dans les cookies (lisibles par middleware)
import { createBrowserClient } from "@supabase/ssr";
```

**Fichiers créés** :

- `src/lib/supabase/browser.ts` - Client singleton avec @supabase/ssr
- `src/lib/supabase/auth.ts` - Helpers signIn, signUp, signOut
- `src/lib/supabase/server.ts` - Client serveur avec cookies

---

### Sprint L3 : Pages Authentification ✅

**Status** : TERMINÉ (14 Janvier 2026)

- [X] Layout auth centré minimal
- [X] Page inscription (`/signup`)
- [X] Page connexion (`/login`)
- [X] Page mot de passe oublié (`/forgot-password`)
- [X] Page reset password (`/reset-password`)
- [X] OAuth callback (`/api/auth/callback`)

**Note technique importante** :

```typescript
// Après login/signup, utiliser window.location.href (pas router.push)
// pour forcer le refresh des cookies
window.location.href = "/boards";
```

**Fichiers créés** :

- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/app/api/auth/callback/route.ts`

---

### Sprint L4 : Protection Routes ✅

**Status** : TERMINÉ (14 Janvier 2026)

- [X] Middleware avec protection routes
- [X] AuthContext + AuthProvider
- [X] Hook useAuth()
- [X] UserMenu (avatar, dropdown, déconnexion)
- [X] Page Settings (`/settings`)
- [X] Intégration dans layout (main)

**Routes configurées** :

```
PUBLIQUES : /, /pricing, /login, /signup, /forgot-password, /reset-password, /api/auth/*
PROTÉGÉES : /boards, /boards/*, /textiles/*, /settings, /tools
ADMIN     : /admin/* (vérifié côté page)
```

**Fichiers créés** :

- `middleware.ts`
- `src/features/auth/context/AuthContext.tsx`
- `src/features/auth/components/UserMenu.tsx`
- `src/app/(main)/settings/page.tsx`
- `src/lib/auth/getAuthUser.ts`

---

### Sprint L4.1 : Fix Landing Header Dynamique ✅

**Status** : TERMINÉ (17 Janvier 2026)

**Problème identifié** : La landing page (`/`) avait un header statique hardcodé qui affichait toujours "Connexion" même si l'utilisateur était connecté. Cela causait une confusion UX sur Vercel en production.

**Cause** : La landing page n'est pas dans le layout `(main)` qui contient l'`AuthProvider`, donc le `UserMenu` ne pouvait pas accéder au contexte d'auth.

**Solution** : Créer un composant `LandingHeader` autonome qui vérifie l'état auth indépendamment.

- [X] Créer `LandingHeader.tsx` dans `features/auth/components/`
- [X] Vérification auth via `createBrowserClient().auth.getUser()`
- [X] Affichage conditionnel : "Connexion" si non connecté, "Accéder à l'app" si connecté
- [X] Modifier `src/app/page.tsx` pour utiliser `LandingHeader`

**Fichiers créés/modifiés** :

- `src/features/auth/components/LandingHeader.tsx` - NOUVEAU
- `src/app/page.tsx` - Import et utilisation de LandingHeader

**Comportement** :

| État | Affichage Header |
|------|------------------|
| Non connecté | "Connexion" + "Commencer gratuitement" |
| Connecté | "Accéder à l'app" (→ /boards) |
| Loading | Skeleton animé |

---

## ⏳ Sprint L5 : Intégration Limites par Rôle (À FAIRE)

**Durée** : 2h
**Dépendances** : L4 ✅
**Status** : NON COMMENCÉ

#### L5.1 - Service Limites Utilisateur (45min)

```
Fichier : src/features/auth/services/limitsService.ts (NOUVEAU)

- [ ] Constantes limites par role :
    const ROLE_LIMITS = {
      free: { searchesPerDay: 10, resultsLimit: 50, projects: 1, liveSearches: 0 },
      premium: { searchesPerDay: Infinity, resultsLimit: Infinity, projects: Infinity, liveSearches: 3 },
      pro: { searchesPerDay: Infinity, resultsLimit: Infinity, projects: Infinity, liveSearches: Infinity },
      admin: { searchesPerDay: Infinity, resultsLimit: Infinity, projects: Infinity, liveSearches: Infinity },
    }
  
- [ ] Fonction checkSearchLimit(userId): { allowed: boolean, remaining: number }
- [ ] Fonction incrementSearchCount(userId)
- [ ] Fonction canUseLiveSearch(userId): boolean
```

#### L5.2 - Intégration API Search (45min)

```
Fichier : src/app/api/search/route.ts (MODIFIER)

- [ ] Récupérer user depuis session (optionnel si non auth)
- [ ] Si auth : vérifier limite recherches
- [ ] Si auth : incrémenter compteur
- [ ] Si free : limiter résultats à 50
- [ ] Header X-Searches-Remaining dans response
```

#### L5.3 - UI Feedback Limites (30min)

```
Fichier : src/components/search/SearchLimitBanner.tsx (NOUVEAU)

- [ ] Banner "X recherches restantes" (free users)
- [ ] CTA "Passer à Premium" quand < 3 restantes
- [ ] Toast quand limite atteinte
```

---

## ⏳ Sprint L6 : Optimisation SSG/SSR Pages Authentifiées (À FAIRE)

**Durée** : 1-2h
**Dépendances** : L4 ✅
**Status** : FIX TEMPORAIRE APPLIQUÉ (16 Janvier 2026)

### Contexte du Problème

Les pages Server Component qui appellent des actions nécessitant l'authentification (ex: `listBoardsAction`) échouent au build time Vercel car il n'y a pas d'utilisateur connecté pendant la génération statique.

**Erreur type** :
```
listBoardsAction error: Error: User not authenticated
```

### Fix Temporaire Appliqué ⚠️

```typescript
// src/app/(main)/boards/page.tsx
export const dynamic = 'force-dynamic';
```

Cela force le rendu SSR à chaque requête, ce qui fonctionne mais **dégrade les performances**.

### Solution Optimale à Implémenter

#### L6.1 - Pattern "Shell Statique + Données Client" (1h)

Convertir les pages authentifiées en :
1. **Shell statique** (layout, header, squelette) → généré au build
2. **Données dynamiques** → chargées côté client après authentification

```typescript
// Exemple pour /boards
// Page statique
export default function BoardsPage() {
  return (
    <div className="container...">
      <h1>Mes Boards</h1>
      <Suspense fallback={<BoardsSkeleton />}>
        <BoardsList /> {/* Client component */}
      </Suspense>
    </div>
  );
}

// Client component
'use client';
function BoardsList() {
  const { data, isLoading } = useSWR('/api/boards', fetcher);
  // ...
}
```

#### L6.2 - Pages à Convertir

| Page | Fichier | Action appelée |
|------|---------|----------------|
| Boards | `src/app/(main)/boards/page.tsx` | `listBoardsAction` |
| Favorites | `src/app/(main)/favorites/page.tsx` | À vérifier |
| Journey | `src/app/(main)/boards/[boardId]/journey/page.tsx` | À vérifier |

#### L6.3 - Créer API Routes si Nécessaire

Si les actions ne sont pas déjà exposées en API routes, les créer :

```typescript
// src/app/api/boards/route.ts
export async function GET() {
  const userId = await requireUserId();
  const boards = await boardsRepository.listBoards(userId);
  return Response.json(boards);
}
```

### Critères de Validation L6

- [ ] Supprimer `export const dynamic = 'force-dynamic'` des pages
- [ ] Build Vercel réussit sans erreur d'authentification
- [ ] Pages se chargent rapidement (shell statique)
- [ ] Données apparaissent après avec loading state

---

## 📊 Résumé Effort

| Sprint                  | Durée            | Status         |
| ----------------------- | ---------------- | -------------- |
| L1: Landing Page        | 5-6h             | ✅ TERMINÉ    |
| L2: Setup Supabase Auth | 2-3h             | ✅ TERMINÉ    |
| L3: Pages Auth          | 3-4h             | ✅ TERMINÉ    |
| L4: Protection Routes   | 2-3h             | ✅ TERMINÉ    |
| L4.1: Fix LandingHeader | 30min            | ✅ TERMINÉ    |
| L5: Limites Rôles       | 2h               | ⏳ À FAIRE    |
| L6: Optim SSG/SSR       | 1-2h             | ⏳ À FAIRE    |
| **TOTAL**               | **16-21h**       | **~85%**       |

---

## 🔧 Notes Techniques Importantes

### 1. Client Supabase Browser

**TOUJOURS utiliser `@supabase/ssr`** pour le client browser, pas `@supabase/supabase-js`.

```typescript
// ✅ CORRECT - src/lib/supabase/browser.ts
import { createBrowserClient } from "@supabase/ssr";

// ❌ INCORRECT - ne fonctionne pas avec middleware
import { createClient } from "@supabase/supabase-js";
```

**Raison** : `@supabase/ssr` stocke les sessions dans les cookies, lisibles par le middleware côté serveur. `@supabase/supabase-js` stocke dans localStorage, invisible côté serveur.

### 2. Redirections Post-Auth

**TOUJOURS utiliser `window.location.href`** après login/signup/logout, pas `router.push()`.

```typescript
// ✅ CORRECT
window.location.href = "/boards";

// ❌ INCORRECT - cookies pas synchronisés
router.push("/boards");
```

**Raison** : `router.push()` est une navigation client-side qui ne refresh pas la page. Les cookies ne sont pas relus par le middleware.

### 3. Singleton Client Browser

Le client browser doit être un singleton pour éviter les warnings "Multiple GoTrueClient instances".

```typescript
let browserClient: ... | null = null;

export function createBrowserClient() {
  if (browserClient) return browserClient;
  browserClient = createSSRBrowserClient(...);
  return browserClient;
}
```

### 4. Pages Authentifiées et Build Statique ⚠️

**Problème** : Les Server Components qui appellent des actions auth échouent au build.

**Fix temporaire** : `export const dynamic = 'force-dynamic'`

**Solution optimale** : Pattern "Shell Statique + Données Client" (voir Sprint L6)

### 5. Landing Page vs App Layout

La landing page (`/`) n'est **pas** dans le layout `(main)` qui contient l'`AuthProvider`. Pour avoir l'état auth sur la landing :

- ❌ Ne pas utiliser `useAuth()` (pas de provider)
- ✅ Utiliser `createBrowserClient().auth.getUser()` directement

C'est pourquoi on a créé `LandingHeader.tsx` qui vérifie l'auth de manière autonome.

---

## ✅ Critères de Validation

### Sprint L1 ✅

- [X] Landing accessible à `/` (racine)
- [X] `/boards` accessible via `/(main)/boards`
- [X] Responsive mobile/desktop
- [X] CTA mènent vers `/signup`
- [X] Page `/pricing` avec tiers alignés sur `users.role`

### Sprint L2 ✅

- [X] Signup email fonctionne
- [X] User créé dans `deadstock.users` automatiquement (trigger)
- [ ] Email confirmation reçu (non testé - config SMTP)
- [ ] OAuth Google fonctionne (non configuré - manque Client ID)

### Sprint L3 ✅

- [X] Login → redirect vers `/boards`
- [X] Erreurs affichées clairement
- [ ] Reset password flow complet (non testé)

### Sprint L4 ✅

- [X] `/boards` redirige vers login si non connecté
- [X] `/login` redirige vers `/boards` si déjà connecté
- [X] UserMenu affiche avatar et role
- [X] Déconnexion fonctionne
- [X] `/admin` accessible si `role === 'admin'`

### Sprint L4.1 ✅

- [X] Landing affiche "Accéder à l'app" si connecté
- [X] Landing affiche "Connexion" + "Commencer gratuitement" si non connecté
- [X] Skeleton pendant le chargement de l'état auth

### Sprint L5 ⏳

- [ ] Free user voit "10 recherches restantes"
- [ ] Après 10 recherches → message upgrade
- [ ] Résultats limités à 50 (free)
- [ ] Premium/Pro/Admin → pas de limites

### Sprint L6 ⏳

- [ ] Build Vercel sans erreur auth
- [ ] Pages avec shell statique + données dynamiques
- [ ] Performances améliorées

---

## 📁 Architecture Fichiers Auth (État Actuel)

```
src/
├── lib/
│   ├── supabase/
│   │   ├── browser.ts      # Client singleton navigateur
│   │   ├── server.ts       # Client Server Components
│   │   └── auth.ts         # Helpers: signIn, signUp, signOut, etc.
│   └── auth/
│       └── getAuthUser.ts  # getAuthUser(), requireUserId()
│
├── features/auth/
│   ├── context/
│   │   └── AuthContext.tsx # AuthProvider, useAuth()
│   └── components/
│       ├── UserMenu.tsx    # Menu dropdown dans header app
│       └── LandingHeader.tsx # Header landing avec état auth
│
├── app/
│   ├── page.tsx            # Landing (utilise LandingHeader)
│   ├── pricing/page.tsx    # Pricing
│   │
│   ├── (auth)/             # Pages auth (layout centré)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (main)/             # App protégée (AuthProvider)
│   │   ├── layout.tsx      # Contient AuthProvider + UserMenu
│   │   ├── boards/
│   │   ├── settings/
│   │   └── ...
│   │
│   └── api/auth/
│       └── callback/route.ts
│
└── middleware.ts           # Protection routes
```

---

## 🚀 Prochaines Étapes

1. **Tester le fix LandingHeader** sur Vercel
2. **Sprint L5** : Implémenter les limites par rôle (2h)
3. **Sprint L6** : Optimiser SSG/SSR pour pages auth (1-2h)
4. **Config Google OAuth** : Ajouter Client ID/Secret dans Supabase
5. **Config SMTP** : Pour emails de confirmation
6. **Sprint B/A** : Continuer Boards ou Admin

---

## 📚 Documentation Associée

- **ADR-007** : Architecture Authentification Multi-Schema (V2)
- **PROJECT_CONTEXT_V4.1** : Contexte technique général

---

**Dernière mise à jour** : 17 Janvier 2026
**Session** : Fix LandingHeader pour affichage état auth sur landing
