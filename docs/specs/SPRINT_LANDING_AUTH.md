
# SPRINT L&A - Landing Page & Authentification

**Version** : 2.1 (Post-Session 14 Janvier 2026)
**Date** : 14 Janvier 2026
**Priorité** : P0 (Bloquant pour Phase 2)
**Durée estimée** : 12-15h
**Status** : L1-L4 TERMINÉS ✅

---

## 🎯 Objectifs

1. **Landing Page Commerciale** : Convertir les visiteurs en utilisateurs ✅
2. **Système d'Authentification** : Supabase Auth avec email/password + OAuth ✅
3. **Gestion des Rôles** : Utiliser la table `users.role` existante (free/premium/pro/admin) ✅
4. **Protection des Routes** : Middleware + guards ✅

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
window.location.href = "/search";
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
PROTÉGÉES : /search, /favorites, /boards/*, /journey, /textiles/*
ADMIN     : /admin/* (vérifié côté page)
```

**Fichiers créés** :

- `middleware.ts`
- `src/features/auth/context/AuthContext.tsx`
- `src/features/auth/components/UserMenu.tsx`
- `src/app/(main)/settings/page.tsx`
- `src/lib/auth/requireUser.ts`

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

## 📊 Résumé Effort

| Sprint                  | Durée           | Status         |
| ----------------------- | ---------------- | -------------- |
| L1: Landing Page        | 5-6h             | ✅ TERMINÉ    |
| L2: Setup Supabase Auth | 2-3h             | ✅ TERMINÉ    |
| L3: Pages Auth          | 3-4h             | ✅ TERMINÉ    |
| L4: Protection Routes   | 2-3h             | ✅ TERMINÉ    |
| L5: Limites Rôles      | 2h               | ⏳ À FAIRE    |
| **TOTAL**         | **14-18h** | **~85%** |

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
window.location.href = "/search";

// ❌ INCORRECT - cookies pas synchronisés
router.push("/search");
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

---

## ✅ Critères de Validation

### Sprint L1 ✅

- [X] Landing accessible à `/` (racine)
- [X] `/search` toujours accessible via `/(main)/search`
- [X] Responsive mobile/desktop
- [X] CTA mènent vers `/signup`
- [X] Page `/pricing` avec tiers alignés sur `users.role`

### Sprint L2 ✅

- [X] Signup email fonctionne
- [X] User créé dans `deadstock.users` automatiquement (trigger)
- [ ] Email confirmation reçu (non testé - config SMTP)
- [ ] OAuth Google fonctionne (non configuré - manque Client ID)

### Sprint L3 ✅

- [X] Login → redirect vers `/search`
- [X] Erreurs affichées clairement
- [ ] Reset password flow complet (non testé)

### Sprint L4 ✅

- [X] `/search` redirige vers login si non connecté
- [X] `/login` redirige vers `/search` si déjà connecté
- [X] UserMenu affiche avatar et role
- [X] Déconnexion fonctionne
- [ ] `/admin` redirige si `role !== 'admin'` (vérifié côté page)

### Sprint L5 ⏳

- [ ] Free user voit "10 recherches restantes"
- [ ] Après 10 recherches → message upgrade
- [ ] Résultats limités à 50 (free)
- [ ] Premium/Pro/Admin → pas de limites

---

## 🚀 Prochaines Étapes

1. **Sprint L5** : Implémenter les limites par rôle (2h)
2. **Config Google OAuth** : Ajouter Client ID/Secret dans Supabase
3. **Config SMTP** : Pour emails de confirmation
4. **Sprint B/A** : Continuer Boards ou Admin

---

**Dernière mise à jour** : 14 Janvier 2026
**Session** : Sprint L4 terminé avec succès
**Commit** : `Sprint L4 complete: Auth + Landing/Pricing redesign`
