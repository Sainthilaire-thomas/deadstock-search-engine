# ADR-007 : Architecture Authentification Multi-Schema Partagée

**Date** : 17 Janvier 2026  
**Statut** : Accepté  
**Version** : 2.0
**Décideurs** : Thomas Renaudin  
**Applications concernées** : blancherenaudin.com (site marchand), Deadstock Search Engine (SaaS B2B)

---

## Contexte

Les deux applications (blancherenaudin.com et Deadstock Search Engine) partagent le **même projet Supabase** pour des raisons de coût et de simplicité de gestion. Chaque application utilise un schema PostgreSQL distinct :

- **`public`** : Site marchand blancherenaudin.com
- **`deadstock`** : Application Deadstock Search Engine

Les utilisateurs s'authentifient via `auth.users` (géré par Supabase Auth), mais chaque application maintient sa propre table de profils avec des données métier spécifiques.

---

## Décision

### Architecture choisie : Deux triggers indépendants

Lors de la création d'un utilisateur dans `auth.users`, **deux triggers** s'exécutent pour créer les profils dans chaque schema :

```
┌─────────────────────────────────────────────────────────────────┐
│                        auth.users                               │
│                    (Supabase Auth)                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ AFTER INSERT
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────────┐     ┌───────────────────┐
│ on_auth_user_     │     │ on_auth_user_     │
│ created_public    │     │ created_deadstock │
│                   │     │                   │
│ → public.         │     │ → deadstock.      │
│   handle_new_user │     │   handle_new_user │
└─────────┬─────────┘     └─────────┬─────────┘
          │                         │
          ▼                         ▼
┌───────────────────┐     ┌───────────────────┐
│ public.profiles   │     │ deadstock.users   │
│                   │     │                   │
│ - id (FK)         │     │ - id (FK)         │
│ - first_name      │     │ - email           │
│ - last_name       │     │ - full_name       │
│ - phone           │     │ - role (free/     │
│ - role (admin/    │     │   premium/pro/    │
│   customer)       │     │   admin)          │
│ - avatar_url      │     │ - searches_today  │
│                   │     │ - avatar_url      │
└───────────────────┘     └───────────────────┘
```

### Triggers SQL

```sql
-- Trigger pour blancherenaudin (public schema)
CREATE TRIGGER on_auth_user_created_public
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour Deadstock (deadstock schema)
CREATE TRIGGER on_auth_user_created_deadstock
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION deadstock.handle_new_user();
```

### Fonctions trigger

**public.handle_new_user()** (blancherenaudin) :
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**deadstock.handle_new_user()** (Deadstock) :
```sql
CREATE OR REPLACE FUNCTION deadstock.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO deadstock.users (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free',
    NULLIF(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Configuration Supabase Auth

La configuration URL dans Supabase Auth est **partagée** entre les deux applications :

### Site URL
`https://blancherenaudin.com` (URL principale)

### Redirect URLs autorisées
```
# Production blancherenaudin
https://blancherenaudin.com
https://blancherenaudin.com/api/auth/callback

# Production Deadstock
https://deadstock-search-engine.vercel.app
https://deadstock-search-engine.vercel.app/api/auth/callback

# Développement
http://localhost:3000
http://localhost:3000/api/auth/callback
http://localhost:3001
http://localhost:3001/api/auth/callback
```

---

## Implémentation Côté Client (Deadstock Search Engine)

### Architecture des fichiers

```
src/
├── lib/
│   ├── supabase/
│   │   ├── browser.ts      # Client singleton pour le navigateur
│   │   ├── server.ts       # Client pour les Server Components
│   │   └── auth.ts         # Helpers signIn, signUp, signOut
│   └── auth/
│       └── getAuthUser.ts  # Récupération user côté serveur
│
├── features/auth/
│   ├── context/
│   │   └── AuthContext.tsx # Provider React pour l'état auth
│   └── components/
│       ├── UserMenu.tsx    # Menu utilisateur dans le header app
│       └── LandingHeader.tsx # Header landing page avec état auth
│
├── app/
│   ├── (auth)/             # Pages d'authentification
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (main)/             # Pages protégées de l'app
│   │   ├── layout.tsx      # Contient AuthProvider
│   │   ├── boards/
│   │   ├── settings/
│   │   └── ...
│   │
│   ├── api/auth/
│   │   └── callback/route.ts # OAuth callback
│   │
│   └── page.tsx            # Landing page (publique)
│
└── middleware.ts           # Protection des routes
```

### Client Supabase Browser (Singleton)

```typescript
// src/lib/supabase/browser.ts
import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

let browserClient: ReturnType<typeof createSSRBrowserClient<Database>> | null = null;

export function createBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  browserClient = createSSRBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    db: { schema: "deadstock" },
  });

  return browserClient;
}
```

> **IMPORTANT** : Utiliser `@supabase/ssr` (pas `@supabase/supabase-js`) pour que les sessions soient stockées dans les cookies, lisibles par le middleware.

### Auth Helpers (Client-side)

```typescript
// src/lib/supabase/auth.ts
import type { Provider } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase/browser";

export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = createBrowserClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
    },
  });
}

export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithOAuth(provider: Provider) {
  const supabase = createBrowserClient();
  const redirectTo = `${window.location.origin}/api/auth/callback`;
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
}

export async function signOut() {
  const supabase = createBrowserClient();
  return supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const supabase = createBrowserClient();
  const redirectTo = `${window.location.origin}/reset-password`;
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function getUser() {
  const supabase = createBrowserClient();
  return supabase.auth.getUser();
}
```

### Auth Helpers (Server-side)

```typescript
// src/lib/auth/getAuthUser.ts
import { createClient } from '@/lib/supabase/server';

export async function getAuthUser(): Promise<{ id: string; email: string } | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
    };
  } catch {
    return null;
  }
}

export async function requireUserId(): Promise<string> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.id;
}
```

### AuthContext (Provider React)

```typescript
// src/features/auth/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

export type UserRole = "free" | "premium" | "pro" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  searches_today: number;
  searches_reset_at: string;
  live_searches_today: number;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createBrowserClient(), []);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, searches_today, searches_reset_at, live_searches_today, avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as UserProfile;
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const newProfile = await fetchProfile(user.id);
    if (newProfile) {
      setProfile(newProfile);
    }
  }, [user, fetchProfile]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);
        const userProfile = await fetchProfile(currentUser.id);
        setProfile(userProfile);
      }
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const value: AuthContextValue = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signOut: handleSignOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

### UserMenu (Header App)

```typescript
// src/features/auth/components/UserMenu.tsx
"use client";

import { LogOut, Settings, User, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function UserMenu() {
  const { profile, isLoading, isAuthenticated, signOut } = useAuth();

  if (isLoading) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />;
  }

  if (!isAuthenticated || !profile) {
    return (
      <Button variant="outline" size="sm" onClick={() => window.location.href = "/login"}>
        Connexion
      </Button>
    );
  }

  const initials = profile.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : profile.email[0].toUpperCase();

  const handleSignOut = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SignOut timeout")), 3000)
      );
      await Promise.race([signOut(), timeoutPromise]);
    } catch (error) {
      console.error("SignOut error:", error);
    }
    window.location.href = "/";
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="relative h-9 w-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name || "Avatar"} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {initials}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.full_name || "Utilisateur"}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
            <div className="pt-1">
              <Badge variant={profile.role === "free" ? "outline" : "default"}>
                {(profile.role === "pro" || profile.role === "premium") && <Crown className="mr-1 h-3 w-3" />}
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleNavigation("/settings"); }} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </DropdownMenuItem>
        {profile.role === "admin" && (
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleNavigation("/admin"); }} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Administration
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSignOut(); }} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### LandingHeader (Landing Page)

```typescript
// src/features/auth/components/LandingHeader.tsx
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

export function LandingHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();
    
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    
    checkUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <span className="text-sm font-bold">DS</span>
          </div>
          <span className="hidden text-sm font-semibold sm:inline">Deadstock Search Engine</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <a href="#solution" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">Solution</a>
          <a href="#features" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">Fonctionnalités</a>
          <a href="#how" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">Comment ça marche</a>
          <Link href="/pricing" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">Tarifs</Link>
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
          ) : user ? (
            <Link href="/boards">
              <Button className="gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                Accéder à l'app <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link href="/signup">
                <Button className="gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
                  Commencer gratuitement <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
```

### Middleware (Protection des routes)

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Routes publiques
  const publicRoutes = ["/", "/pricing", "/login", "/signup", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.some(route => pathname === route) || 
                        pathname.startsWith("/api/auth");

  // Routes protégées
  const isProtectedRoute = pathname.startsWith("/boards") ||
                           pathname.startsWith("/textiles") ||
                           pathname.startsWith("/settings") ||
                           pathname.startsWith("/tools") ||
                           pathname.startsWith("/admin");

  // Redirection si déjà connecté sur pages auth
  if (isPublicRoute) {
    if (user && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/boards", request.url));
    }
    return response;
  }

  // Redirection vers login si non connecté
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## Routes et Navigation

### Routes publiques (sans authentification)
| Route | Description |
|-------|-------------|
| `/` | Landing page commerciale |
| `/pricing` | Page tarifs |
| `/login` | Connexion |
| `/signup` | Inscription |
| `/forgot-password` | Mot de passe oublié |
| `/reset-password` | Réinitialisation mot de passe |
| `/api/auth/*` | Callbacks OAuth |

### Routes protégées (authentification requise)
| Route | Description |
|-------|-------------|
| `/boards` | Liste des boards (page d'accueil app) |
| `/boards/[boardId]` | Board individuel (canvas) |
| `/boards/[boardId]/journey` | Vue journey du board |
| `/textiles/[id]` | Détail textile |
| `/settings` | Paramètres utilisateur |
| `/tools` | Outils |

### Routes admin (rôle admin requis)
| Route | Description |
|-------|-------------|
| `/admin` | Dashboard admin |
| `/admin/*` | Interface d'administration |

### Flux de navigation

```
Non connecté:
  /boards → redirect → /login?next=/boards → login → /boards

Déjà connecté:
  /login → redirect → /boards

Landing (connecté):
  / → affiche "Accéder à l'app" → clic → /boards

SignOut:
  UserMenu → signOut() → redirect → /
```

---

## Notes Techniques Importantes

### 1. Toujours utiliser `@supabase/ssr`

```typescript
// ✅ CORRECT
import { createBrowserClient } from "@supabase/ssr";

// ❌ INCORRECT - ne fonctionne pas avec middleware
import { createClient } from "@supabase/supabase-js";
```

**Raison** : `@supabase/ssr` stocke les sessions dans les cookies, lisibles par le middleware côté serveur. `@supabase/supabase-js` stocke dans localStorage, invisible côté serveur.

### 2. Redirections post-auth avec `window.location.href`

```typescript
// ✅ CORRECT - force le refresh des cookies
window.location.href = "/boards";

// ❌ INCORRECT - cookies pas synchronisés
router.push("/boards");
```

**Raison** : `router.push()` est une navigation client-side qui ne refresh pas la page. Les cookies ne sont pas relus par le middleware.

### 3. Schema deadstock obligatoire côté serveur

```typescript
const { data } = await supabase
  .schema('deadstock')  // ← Obligatoire côté serveur !
  .from('users')
```

### 4. Singleton client browser

Le client browser doit être un singleton pour éviter les warnings "Multiple GoTrueClient instances".

### 5. Timeout sur SignOut

Le signOut inclut un timeout de sécurité de 3 secondes pour éviter les blocages :

```typescript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("SignOut timeout")), 3000)
);
await Promise.race([signOut(), timeoutPromise]);
// Toujours rediriger, même en cas d'erreur
window.location.href = "/";
```

---

## Conséquences

### Avantages
1. **Isolation des données** : Chaque application a ses propres données métier
2. **Flexibilité des rôles** : Un utilisateur peut avoir des rôles différents dans chaque application
3. **Indépendance** : Les modifications d'un schema n'impactent pas l'autre
4. **Coût optimisé** : Un seul projet Supabase pour deux applications

### Inconvénients
1. **Configuration URL partagée** : Les Redirect URLs doivent inclure les deux applications
2. **Triggers multiples** : Chaque nouvel utilisateur crée deux profils (même s'il n'utilise qu'une app)
3. **Maintenance** : Toute modification des triggers doit considérer les deux applications

### Risques identifiés
1. **Conflit de noms de fonctions** : Évité en préfixant avec le schema
2. **Oubli d'un trigger** : Documenté dans cet ADR pour référence future

---

## Utilisateurs existants (17 Janvier 2026)

| Email | public.profiles | deadstock.users |
|-------|-----------------|-----------------|
| sonearthomas@gmail.com | ✅ admin | ✅ admin |
| renaudinblanche@gmail.com | ✅ admin | ✅ admin |
| toto@deadstock.fr | ❌ (test) | ✅ free |

---

## Références

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- Projet Supabase : `site blancherenaudin` (ID: lnkxfyfkwnfvxvaxnbah)

---

## Historique

| Date | Modification |
|------|--------------|
| 17/01/2026 | Création de l'ADR suite à l'audit et la correction des bugs d'auth Deadstock |
| 17/01/2026 | Mise en place des deux triggers indépendants |
| 17/01/2026 | V2 - Documentation complète : implémentation client, LandingHeader, middleware, code source complet |
