# ADR-013 : Admin Service Role Key pour Opérations Admin

**Date** : 2 Janvier 2026

**Statut** : ✅ Accepté

**Contexte** : Session 8 - Module Admin Complet

---

## Contexte

Lors de l'implémentation du module admin (Session 8), nous devons permettre aux administrateurs d'effectuer des opérations CRUD complètes sur toutes les tables du schéma `deadstock`, incluant :

- Gestion sites (CRUD complet)
- Lecture/modification profiles discovery
- Lancement jobs scraping
- Consultation métriques globales
- Accès données tous utilisateurs

**Problème** : Avec Row Level Security (RLS) activé sur plusieurs tables (`textiles`, `site_profiles`, `favorites`), les requêtes admin sont bloquées car le client Supabase standard utilise la clé `anon` qui respecte les policies RLS.

**Symptôme rencontré** :

```
Error fetching sites: {}
Error fetching site: {}
```

Les queries retournaient des erreurs vides car RLS refusait l'accès.

---

## Décision

**Nous créons un client Supabase dédié pour les opérations admin utilisant la `service_role_key` qui bypass Row Level Security.**

### Architecture

**3 clients Supabase distincts** :

1. **Client User** (`src/lib/supabase/client.ts`)

   - Utilise `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Pour composants client-side
   - Respecte RLS (sécurité utilisateur)
   - Contexte : Actions utilisateur frontend
2. **Client Server** (`src/lib/supabase/server.ts`)

   - Utilise `NEXT_PUBLIC_SUPABASE_ANON_KEY` + cookies
   - Pour Server Components avec authentification
   - Respecte RLS
   - Contexte : Pages server-side authentifiées
3. **Client Admin** (`src/lib/supabase/admin.ts`) ⭐ **NOUVEAU**

   - Utilise `SUPABASE_SERVICE_ROLE_KEY`
   - **Bypass RLS** pour opérations admin
   - **Jamais exposé au client**
   - Contexte : Opérations admin backend uniquement

### Implémentation

**Fichier** : `src/lib/supabase/admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Admin client with service role (bypasses RLS)
 * ⚠️ Use ONLY in server-side code for admin operations
 * ⚠️ NEVER expose to client-side code
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // 🔑 Service Role Key
    {
      db: {
        schema: 'deadstock', // Default schema
      },
    }
  );
}
```

**Configuration** : `.env.local`

```env
# Public keys (exposed to client)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Private keys (server-only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # 🔒 NEVER COMMIT
```

**Usage dans queries admin** :

```typescript
// src/features/admin/application/queries.ts
import { createAdminClient } from '@/lib/supabase/admin';

export async function getAllSites() {
  const supabase = createAdminClient(); // 🔑 Bypass RLS
  
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch sites: ${error.message}`);
  return data || [];
}
```

---

## Conséquences

### ✅ Positives

1. **Admin Operations Débloqueés**

   - Accès complet toutes tables
   - Pas de restrictions RLS
   - CRUD complet fonctionnel
2. **Séparation Claire des Rôles**

   - User client : RLS activé (sécurité)
   - Admin client : RLS bypass (permissions complètes)
   - Intentions explicites dans le code
3. **Simplicité**

   - Pas besoin créer policies RLS complexes pour admin
   - Pas besoin rôles/permissions custom
   - Solution native Supabase
4. **Performance**

   - Queries admin plus rapides (pas de RLS check)
   - Moins de complexité DB

### ⚠️ Négatives / Risques

1. **Sécurité Critique**

   - Service role key = accès root complet
   - **MUST** rester côté serveur uniquement
   - Jamais exposer dans variables `NEXT_PUBLIC_*`
   - Ne jamais envoyer au client
2. **Responsabilité Développeur**

   - Développeur doit utiliser bon client
   - Erreur = fuite sécurité potentielle
   - Documentation claire nécessaire
3. **Pas de Granularité**

   - Service role = tous pouvoirs
   - Pas de permissions granulaires par admin
   - Migration future vers RBAC si besoin multi-admins
4. **Gestion Clés**

   - Clé service role ne doit jamais être commitée
   - Rotation clés difficile (impact tous admins)
   - Besoin process sécurisé pour partager clés équipe

---

## Alternatives Considérées

### Alternative 1 : Policies RLS pour Admin

**Approche** : Créer policies RLS permettant accès si `auth.uid()` est admin

```sql
CREATE POLICY "Allow admin read sites" 
ON deadstock.sites FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM deadstock.users WHERE role = 'admin'
  )
);
```

**Rejetée car** :

- ❌ Nécessite authentification admin (complexifie MVP)
- ❌ Policies à créer pour chaque table (maintenance)
- ❌ Performance dégradée (subquery à chaque requête)
- ❌ Overkill pour MVP (1 seul admin)

**Quand reconsidérer** :

- Phase 2+ avec multiple admins
- Besoin permissions granulaires (super-admin vs moderator)
- Authentification admin implémentée

---

### Alternative 2 : Désactiver RLS Complètement

**Approche** : `ALTER TABLE deadstock.sites DISABLE ROW LEVEL SECURITY;`

**Rejetée car** :

- ❌ Perd sécurité pour utilisateurs normaux
- ❌ Tables sensibles (`favorites`) accessibles à tous
- ❌ Mauvaise pratique sécurité
- ❌ Difficile réactiver plus tard (policies à recréer)

**Quand utiliser** :

- Jamais en production
- Temporairement en dev pour debug uniquement

---

### Alternative 3 : Postgres Direct Connection

**Approche** : Utiliser driver PostgreSQL direct (`pg`) au lieu de Supabase

**Rejetée car** :

- ❌ Perd abstractions Supabase (auth, storage, realtime)
- ❌ Configuration réseau complexe (Supabase Pooler)
- ❌ Sécurité : credentials DB dans code
- ❌ Overkill pour besoins actuels

**Quand reconsidérer** :

- Besoins très spécifiques (transactions complexes)
- Performance critique (bulk operations)
- Features non supportées par Supabase client

---

## Implémentation

### Étapes Réalisées

1. ✅ **Créer client admin** (`src/lib/supabase/admin.ts`)
2. ✅ **Ajouter service_role_key** dans `.env.local`
3. ✅ **Remplacer queries admin** : `createClient()` → `createAdminClient()`
4. ✅ **Documenter usage** avec commentaires warning
5. ✅ **Tester accès** : Queries admin fonctionnent
6. ✅ **Vérifier sécurité** : Clé non exposée au client

### Fichiers Modifiés

**Créés** :

- `src/lib/supabase/admin.ts`

**Modifiés** :

- `src/features/admin/application/queries.ts`
- `.env.local` (ajout `SUPABASE_SERVICE_ROLE_KEY`)
- `.gitignore` (vérifier `.env.local` ignoré)

---

## Sécurité - Best Practices

### ✅ À Faire

1. **Utiliser UNIQUEMENT côté serveur**

```typescript
   // ✅ CORRECT - Server Component
   export default async function AdminPage() {
     const supabase = createAdminClient();
     // ...
   }
   
   // ✅ CORRECT - Server Action
   'use server'
   export async function updateSite() {
     const supabase = createAdminClient();
     // ...
   }
   
   // ✅ CORRECT - API Route
   export async function GET() {
     const supabase = createAdminClient();
     // ...
   }
```

2. **Garder clé dans .env.local**

   - Jamais hardcoder dans code
   - Jamais committer
   - Utiliser secrets manager en production (Vercel Env Vars)
3. **Documenter usage**

   - Commentaires clairs dans code
   - Warning dans JSDoc
   - ADR référencé

### ❌ À NE JAMAIS Faire

1. **Exposer au client**

```typescript
   // ❌ DANGER - Client Component
   'use client'
   export default function AdminPanel() {
     const supabase = createAdminClient(); // ❌ SECURITY BREACH
     // ...
   }
```

2. **Utiliser dans variables publiques**

```env
   # ❌ DANGER
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # ❌ EXPOSED TO CLIENT
```

3. **Logger la clé**

```typescript
   // ❌ DANGER
   console.log('Admin key:', process.env.SUPABASE_SERVICE_ROLE_KEY);
```

---

## Monitoring

### Vérifications Régulières

1. **Audit code** : Rechercher usages `createAdminClient()` dans composants client

```bash
   # Chercher usages dangereux
   grep -r "createAdminClient" src/app/**/page.tsx
   grep -r "'use client'" src/**/*admin*.tsx
```

2. **Review env vars** : Vérifier `.env.local` non commité

```bash
   git status --ignored
```

3. **Logs Supabase** : Surveiller activité service_role_key
   - Dashboard Supabase → Logs
   - Filtrer par "service_role"
   - Détecter usage anormal

---

## Migration Future (Phase 2+)

### Quand Migrer vers RBAC

**Triggers** :

- Multiple admins avec permissions différentes
- Besoin audit trail par admin
- Compliance/réglementation
- Authentification admin implémentée

**Plan Migration** :

1. **Setup Auth Admin**

```typescript
   // Login admin avec Supabase Auth
   await supabase.auth.signInWithPassword({ email, password })
```

2. **Créer Policies RLS**

```sql
   CREATE POLICY "Admins can manage sites"
   ON deadstock.sites
   USING (
     EXISTS (
       SELECT 1 FROM deadstock.users
       WHERE id = auth.uid() AND role = 'admin'
     )
   );
```

3. **Remplacer Admin Client**

```typescript
   // Utiliser client server avec auth
   const supabase = await createClient(); // Cookies avec session admin
```

4. **Déprécier Service Role Client**
   - Garder pour migrations/scripts uniquement
   - Retirer des queries admin

---

## Références

**Supabase Documentation** :

- [Service Role Key](https://supabase.com/docs/guides/api/api-keys#the-servicerole-key)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Authorization](https://supabase.com/docs/guides/auth/authorization)

**Next.js Patterns** :

- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

**Projet** :

- ADR-001 : Database Architecture
- ADR-005 : Light DDD Architecture
- ADR-014 : TypeScript Types Generation

---

## Décision Validée Par

**Auteur** : Thomas (Founder & Developer)

**Date** : 2 Janvier 2026

**Session** : 8 - Module Admin Complet

**Status** : ✅ Implémenté et fonctionnel
