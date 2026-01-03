# ADR-014 : Génération de Types TypeScript depuis Supabase

**Date** : 2 Janvier 2026

**Statut** : ✅ Accepté

**Contexte** : Session 8 - Module Admin Complet

---

## Contexte

Lors du développement du module admin (Session 8), nous avons rencontré plusieurs problèmes liés aux types TypeScript :

**Problèmes identifiés** :

1. **Drift entre DB et Code**

   - Types manuels dans `domain/types.ts` ne correspondent pas exactement à la DB
   - Champs nullable/required désynchronisés
   - Types `Json` de Supabase traités comme `any`
2. **Erreurs TypeScript en cascade**

   - 25+ erreurs après migration vers client serveur
   - Types incompatibles entre queries et composants
   - Erreurs découvertes uniquement au runtime
3. **Maintenance complexe**

   - Chaque migration DB nécessite mise à jour manuelle types
   - Risque d'oubli de champs
   - Pas de validation automatique

**Exemple de problème rencontré** :

```typescript
// Type manuel (domain/types.ts)
interface Site {
  id: string;
  name: string;
  url: string;
  created_at: string; // ❌ En réalité nullable dans DB
  // ...
}

// Utilisation
{new Date(site.created_at).toLocaleDateString()} // ❌ Runtime error si null
```

---

## Décision

**Nous générons les types TypeScript directement depuis le schéma Supabase et les utilisons comme source de vérité unique.**

### Architecture

**Hiérarchie des types** :

```
Database Schema (PostgreSQL)
    ↓ génération automatique
database.types.ts (Types générés)
    ↓ utilisés par
domain/types.ts (Types domaine)
    ↓ utilisés par
Application (queries, actions, components)
```

### Implémentation

**1. Génération des types** :

```bash
# Commande CLI Supabase
npx supabase gen types typescript \
  --project-id lnkxfyfkwnfvxvaxnbah \
  --schema deadstock \
  > src/types/database.types.ts
```

**Résultat** : Fichier `database.types.ts` (2,083 lignes)

```typescript
export type Database = {
  deadstock: {
    Tables: {
      sites: {
        Row: {
          id: string;
          name: string | null;
          url: string;
          created_at: string | null; // ✅ Nullable correctement typé
          // ... tous les champs avec types exacts
        }
        Insert: { /* ... */ }
        Update: { /* ... */ }
      }
      // ... toutes les tables
    }
  }
}
```

**2. Utilisation dans types domaine** :

```typescript
// src/features/admin/domain/types.ts
import { Database } from '@/types/database.types';

// Types de base depuis Supabase (source de vérité)
type SiteRow = Database['deadstock']['Tables']['sites']['Row'];
type ScrapingJobRow = Database['deadstock']['Tables']['scraping_jobs']['Row'];
type SiteProfileRow = Database['deadstock']['Tables']['site_profiles']['Row'];

// Export direct pour cohérence
export type Site = SiteRow;
export type ScrapingJob = ScrapingJobRow;
export type SiteProfile = SiteProfileRow;

// Types métier enrichis (si besoin)
export interface SiteWithProfile extends Site {
  profile?: SiteProfile;
  jobsCount?: number;
  textilesCount?: number;
}

export interface ScrapingConfig {
  collections?: string[];
  maxProductsPerCollection?: number;
  // ... config spécifique métier
}
```

**3. Utilisation dans clients Supabase** :

```typescript
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export function createAdminClient() {
  return createClient<Database>( // ✅ Type safety complet
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: 'deadstock' }
    }
  );
}
```

**4. Utilisation dans queries** :

```typescript
// src/features/admin/application/queries.ts
import { createAdminClient } from '@/lib/supabase/admin';
import type { Site } from '../domain/types';

export async function getAllSites(): Promise<Site[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('sites') // ✅ Autocomplétion
    .select('*') // ✅ Type inféré automatiquement
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch sites: ${error.message}`);
  return data || []; // ✅ Type Site[] garanti
}
```

---

## Conséquences

### ✅ Positives

1. **Source de Vérité Unique**

   - Schema DB = source absolue
   - Pas de désynchronisation possible
   - Types toujours à jour avec DB
2. **Type Safety Complet**

   - Erreurs détectées à la compilation
   - Pas de surprises runtime
   - Autocomplétion IDE parfaite
3. **Maintenance Simplifiée**

   - Migration DB → Régénération types → Erreurs compile si breaking change
   - Process automatisable (npm script)
   - Moins de risques d'erreurs manuelles
4. **Developer Experience**

   - Autocomplétion des champs de tables
   - Inference de types automatique
   - Erreurs claires et précises
5. **Documentation Vivante**

   - Types = documentation de la DB
   - Toujours synchronisée
   - Pas besoin docs séparées

### ⚠️ Négatives / Contraintes

1. **Régénération Nécessaire**

   - Après chaque migration DB
   - Process manuel à ne pas oublier
   - Fichier 2,000+ lignes à commiter
2. **Types Génériques Supabase**

   - Type `Json` très large (string | number | boolean | null | object | array)
   - Cast nécessaire pour utilisation spécifique
   - Exemple : `profile.collections as Collection[]`
3. **Breaking Changes Subtils**

   - Changement nullable → non-nullable casse code
   - Renommage colonne = erreur compilation
   - Nécessite review attentive après régénération
4. **Taille Fichier**

   - `database.types.ts` = 2,083 lignes
   - Peut ralentir IDE sur machines faibles
   - Pollution diffs Git si régénération fréquente
5. **Dépendance CLI Supabase**

   - Nécessite accès projet Supabase
   - Authentification CLI requise
   - CI/CD doit avoir accès

---

## Alternatives Considérées

### Alternative 1 : Types Manuels (Status Quo Avant)

**Approche** : Définir types manuellement dans `domain/types.ts`

```typescript
// Types écrits à la main
export interface Site {
  id: string;
  name: string;
  url: string;
  created_at: string; // ❌ Pas de garantie cohérence DB
  // ...
}
```

**Rejetée car** :

- ❌ Drift DB ↔ Code inévitable
- ❌ Maintenance manuelle après chaque migration
- ❌ Erreurs runtime non détectées
- ❌ Pas de garantie types corrects

**Quand utiliser** :

- Jamais (sauf prototypage très rapide)

---

### Alternative 2 : Prisma ORM

**Approche** : Utiliser Prisma comme ORM avec génération types

```prisma
// schema.prisma
model Site {
  id        String   @id @default(uuid())
  name      String?
  url       String
  createdAt DateTime? @map("created_at")
  // ...
}
```

**Génération** : `npx prisma generate`

**Rejetée car** :

- ❌ Surcouche complexe sur Supabase
- ❌ Perd features Supabase (Auth, Storage, Realtime)
- ❌ Migration schema complexe (Prisma + Supabase migrations)
- ❌ Overhead performance (requêtes Prisma → Supabase)
- ❌ Overkill pour besoins actuels

**Quand reconsidérer** :

- Si besoin ORM avancé (relations complexes, transactions)
- Si migration hors Supabase
- Si équipe familière Prisma

---

### Alternative 3 : Kysely Query Builder

**Approche** : Utiliser Kysely avec types générés depuis DB

```typescript
import { Kysely, PostgresDialect } from 'kysely';
import type { DB } from './database.types'; // Types générés Kysely

const db = new Kysely<DB>({
  dialect: new PostgresDialect({ /* ... */ })
});

const sites = await db
  .selectFrom('sites')
  .selectAll()
  .execute();
```

**Rejetée car** :

- ❌ Perd abstractions Supabase (RLS, Auth helpers)
- ❌ Configuration réseau complexe (pooler)
- ❌ Changement majeur architecture
- ❌ Types générés similaires (même CLI Supabase fonctionne)

**Quand reconsidérer** :

- Si besoin queries SQL très complexes
- Si performance critique (moins d'overhead)
- Si migration progressive hors Supabase

---

### Alternative 4 : GraphQL Code Generator

**Approche** : Utiliser Supabase GraphQL + Code Generator

```bash
npx graphql-codegen --config codegen.yml
```

**Rejetée car** :

- ❌ Supabase GraphQL en beta
- ❌ Complexité setup (GraphQL schema, config)
- ❌ Overhead performance (GraphQL layer)
- ❌ Overkill pour REST simple

**Quand reconsidérer** :

- Si migration vers GraphQL
- Si besoin fragments réutilisables
- Si équipe experte GraphQL

---

## Implémentation

### Étapes Réalisées

1. ✅ **Authentification Supabase CLI**

```bash
   npx supabase login
   # Ouvre navigateur pour auth
   # Code vérification: 8a54c2ee
```

2. ✅ **Création dossier types**

```bash
   mkdir -p src/types
```

3. ✅ **Génération types**

```bash
   npx supabase gen types typescript \
     --project-id lnkxfyfkwnfvxvaxnbah \
     --schema deadstock \
     > src/types/database.types.ts
```

4. ✅ **Migration types domaine**

   - Remplacer interfaces manuelles par types générés
   - Ajouter `extends` pour types enrichis
   - Importer `Database` type
5. ✅ **Mise à jour clients Supabase**

   - Typer `createClient<Database>`
   - Spécifier schema : `db: { schema: 'deadstock' }`
6. ✅ **Correction erreurs TypeScript**

   - Gérer dates nullables : `created_at ? new Date(...) : 'N/A'`
   - Caster Json types : `as Collection[]`
   - Async params : `await params`
7. ✅ **Commit fichier généré**

```bash
   git add src/types/database.types.ts
   git commit -m "feat(types): Generate TypeScript types from Supabase schema"
```

### Fichiers Créés/Modifiés

**Créés** :

- `src/types/database.types.ts` (2,083 lignes)

**Modifiés** :

- `src/features/admin/domain/types.ts` (utilise types générés)
- `src/lib/supabase/admin.ts` (type client)
- `src/lib/supabase/server.ts` (type client)
- `src/lib/supabase/client.ts` (type client)
- `src/features/admin/application/queries.ts` (types retour)
- Toutes pages admin (corrections nullable)

---

## Workflow Régénération Types

### Quand Régénérer

**Triggers** :

- ✅ Après migration DB (ajout/suppression colonne)
- ✅ Après modification type colonne (nullable, type)
- ✅ Après création/suppression table
- ⚠️ Pas nécessaire après insertion données

### Process Recommandé

**1. Avant Migration** :

```bash
# Sauvegarder types actuels (optionnel)
cp src/types/database.types.ts src/types/database.types.backup.ts
```

**2. Appliquer Migration DB** :

```sql
-- Via Supabase Dashboard ou migration SQL
ALTER TABLE deadstock.sites ADD COLUMN last_checked_at TIMESTAMPTZ;
```

**3. Régénérer Types** :

```bash
npx supabase gen types typescript \
  --project-id lnkxfyfkwnfvxvaxnbah \
  --schema deadstock \
  > src/types/database.types.ts
```

**4. Vérifier Compilation** :

```bash
npm run build
# ou
npx tsc --noEmit
```

**5. Corriger Erreurs** :

- Review erreurs TypeScript
- Adapter code si breaking change
- Tester build passe

**6. Commit** :

```bash
git add src/types/database.types.ts
git commit -m "chore(types): Regenerate types after DB migration"
```

### Script NPM (Recommandé)

**Ajouter dans `package.json`** :

```json
{
  "scripts": {
    "generate:types": "supabase gen types typescript --project-id lnkxfyfkwnfvxvaxnbah --schema deadstock > src/types/database.types.ts",
    "generate:types:check": "npm run generate:types && tsc --noEmit"
  }
}
```

**Usage** :

```bash
npm run generate:types        # Régénérer types
npm run generate:types:check  # Régénérer + vérifier compilation
```

---

## Gestion Types Json

### Problème Types Json Génériques

**Type généré Supabase** :

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
```

**Utilisation dans tables** :

```typescript
site_profiles: {
  Row: {
    collections: Json | null; // ❌ Trop générique
    quality_metrics: Json | null;
    // ...
  }
}
```

### Solution : Type Helpers Locaux

**Définir types spécifiques** :

```typescript
// src/features/admin/domain/types.ts

// Type helper pour collections
export type Collection = {
  handle: string;
  title?: string;
  productCount?: number;
};

// Type helper pour quality metrics
export type QualityMetrics = {
  hasImages?: number;
  hasPrice?: number;
  hasDescription?: number;
  overallScore?: number;
};

// Type helper pour scraping config
export type ScrapingConfig = {
  collections?: string[];
  maxProductsPerCollection?: number;
  filters?: {
    onlyAvailable?: boolean;
    requireImages?: boolean;
    priceRange?: { min: number; max: number };
  };
};
```

**Cast lors de l'utilisation** :

```typescript
// Cast inline
const collections = (profile.collections as Collection[]) || [];

// Ou fonction helper
function parseCollections(json: Json | null): Collection[] {
  if (!json || !Array.isArray(json)) return [];
  return json as Collection[];
}

const collections = parseCollections(profile.collections);
```

---

## CI/CD Considérations

### Option A : Committer Types Générés (Recommandé MVP)

**Approche** :

- Types générés committés dans Git
- Régénération manuelle après migrations
- Simple, pas de config CI/CD

**Avantages** :

- ✅ Pas de dépendance CI/CD
- ✅ Build déterministe
- ✅ Review diffs types dans PRs

**Inconvénients** :

- ⚠️ Risque oubli régénération
- ⚠️ Fichier 2,000+ lignes dans diffs

---

### Option B : Générer dans CI/CD (Phase 2+)

**Approche** :

- Types générés automatiquement dans CI
- Pas committés dans Git (`.gitignore`)
- Script pre-build génère types

**Configuration** :

```yaml
# .github/workflows/build.yml
- name: Generate Supabase Types
  run: |
    npx supabase login --token ${{ secrets.SUPABASE_ACCESS_TOKEN }}
    npm run generate:types
```

**.gitignore** :

```
src/types/database.types.ts
```

**Avantages** :

- ✅ Toujours à jour automatiquement
- ✅ Pas de fichiers générés dans Git

**Inconvénients** :

- ❌ Setup CI/CD nécessaire
- ❌ Secret SUPABASE_ACCESS_TOKEN requis
- ❌ Build non déterministe (dépend DB externe)

**Recommandation** : Attendre Phase 2

---

## Type Safety Exemples

### Avant (Types Manuels)

```typescript
// ❌ Risques
interface Site {
  created_at: string; // Assumé non-null
}

// Runtime error si null
{new Date(site.created_at).toLocaleDateString()}
```

### Après (Types Générés)

```typescript
// ✅ Type safety
type Site = {
  created_at: string | null; // Correctement typé
}

// Erreur compilation si pas géré
{new Date(site.created_at).toLocaleDateString()} // ❌ TS Error

// Solution
{site.created_at ? new Date(site.created_at).toLocaleDateString() : 'N/A'} // ✅ OK
```

---

## Monitoring & Maintenance

### Checklist Après Migration DB

- [ ] Appliquer migration DB (SQL)
- [ ] Régénérer types (`npm run generate:types`)
- [ ] Vérifier compilation (`npm run build`)
- [ ] Corriger erreurs TypeScript découvertes
- [ ] Tester application localement
- [ ] Commit types générés
- [ ] Deploy

### Alerts Potentielles

**Breaking Changes Communs** :

1. Colonne non-null → nullable (ou inverse)
2. Renommage colonne
3. Suppression colonne
4. Changement type (string → number)

**Détection** :

- Erreurs compilation TypeScript
- Tests unitaires échouent
- Runtime errors en dev

---

## Références

**Supabase Documentation** :

- [Generate Types](https://supabase.com/docs/guides/api/generating-types)
- [TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)

**TypeScript** :

- [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

**Projet** :

- ADR-001 : Database Architecture
- ADR-013 : Admin Service Role Key
- ADR-015 : Configure Scraping UX

---

## Décision Validée Par

**Auteur** : Thomas (Founder & Developer)

**Date** : 2 Janvier 2026

**Session** : 8 - Module Admin Complet

**Status** : ✅ Implémenté et fonctionnel

**Fichier Généré** : `src/types/database.types.ts` (2,083 lignes)
