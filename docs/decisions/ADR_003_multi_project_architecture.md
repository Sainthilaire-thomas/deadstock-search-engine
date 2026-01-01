# ADR 003: Architecture Multi-Projets (Blanche + Deadstock)

**Date** : 27 décembre 2025  
**Statut** : En Discussion  
**Décideurs** : Thomas (Product Owner & Dev)  
**Contexte Phase** : Phase 1 - MVP  

---

## Contexte

Nous avons maintenant **2 projets** :
1. **Blanche** : Site e-commerce + Admin existant
2. **Deadstock Search Engine** : Nouveau moteur de recherche textiles

**Question** : Comment gérer ces projets ensemble de manière rationnelle ?

**Éléments à Considérer** :
- Repository Git (mono vs multi)
- Déploiement Vercel (projet unique vs séparés)
- Supabase (instance partagée vs séparées)
- Code partagé (packages communs)
- Évolution indépendante vs couplée

---

## Options Évaluées

### Option 1 : SÉPARATION COMPLÈTE (Recommandé MVP)

**Description** : Projets totalement indépendants, ressources séparées

```
┌─────────────────────────────────────────────────────┐
│ BLANCHE E-COMMERCE                                  │
├─────────────────────────────────────────────────────┤
│ Repo: blanche-ecommerce                             │
│ Vercel: blanche-ecommerce.vercel.app                │
│ Supabase: Instance existante (schema: public)       │
│ Code: Autonome                                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ DEADSTOCK SEARCH ENGINE                             │
├─────────────────────────────────────────────────────┤
│ Repo: deadstock-search-engine                       │
│ Vercel: deadstock-search.vercel.app                 │
│ Supabase: Instance existante (schema: deadstock)    │
│ Code: Autonome                                      │
└─────────────────────────────────────────────────────┘
```

**Avantages** :
- ✅ **Simplicité maximale** : Chaque projet évolue à son rythme
- ✅ **Déploiements indépendants** : Bug dans l'un n'affecte pas l'autre
- ✅ **Équipes séparées** : Si tu embauches, facile de séparer responsabilités
- ✅ **Scale différent** : Deadstock peut exploser sans impact Blanche
- ✅ **Rollback facile** : Chaque projet géré séparément
- ✅ **Pas de complexité monorepo** : Pas besoin Turborepo/Nx

**Inconvénients** :
- ❌ Code potentiellement dupliqué (auth, components communs)
- ❌ Deux déploiements à gérer
- ❌ Si synergies futures, migration complexe

**Coût/Complexité** : **Faible** (idéal solo dev)

---

### Option 2 : MONOREPO PARTAGÉ

**Description** : Un seul repo, plusieurs apps, packages partagés

```
deadstock-monorepo/
├── apps/
│   ├── blanche-site/          # Site e-commerce
│   ├── blanche-admin/         # Admin Blanche
│   └── deadstock-search/      # Moteur recherche
│
├── packages/
│   ├── ui/                    # Components communs
│   ├── database/              # Types Supabase partagés
│   ├── auth/                  # Auth logic partagée
│   └── utils/                 # Fonctions utilitaires
│
├── package.json
├── turbo.json                 # Turborepo config
└── pnpm-workspace.yaml
```

**Avantages** :
- ✅ **Code partagé facile** : Components, utils réutilisables
- ✅ **Un seul repo à gérer** : Moins de complexité Git
- ✅ **Types partagés** : Supabase types générés une fois
- ✅ **Déploiements possibles séparément** : Turborepo + Vercel

**Inconvénients** :
- ❌ **Complexité setup** : Turborepo, pnpm workspaces, configuration
- ❌ **Couplage risqué** : Bug dans package partagé = tous projets cassés
- ❌ **Builds plus longs** : Cache à gérer
- ❌ **Overhead pour solo dev** : Over-engineering pour 1 personne

**Coût/Complexité** : **Élevé** (overkill pour MVP)

---

### Option 3 : HYBRIDE - Repos Séparés + Supabase Partagée (RECOMMANDÉ)

**Description** : Chaque projet autonome, mais partagent Supabase avec schémas séparés

```
┌─────────────────────────────────────────────────────┐
│ REPOSITORY & DÉPLOIEMENTS                           │
├─────────────────────────────────────────────────────┤
│ Repo 1: blanche-ecommerce                           │
│ Vercel 1: blanche.vercel.app                        │
│                                                     │
│ Repo 2: deadstock-search-engine                     │
│ Vercel 2: deadstock-search.vercel.app               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ SUPABASE PARTAGÉE (Infrastructure Commune)          │
├─────────────────────────────────────────────────────┤
│ Schemas:                                            │
│   ├── public (Blanche e-commerce)                   │
│   ├── deadstock (Deadstock search)                  │
│   └── auth (Supabase Auth - partagé)                │
│                                                     │
│ Storage:                                            │
│   ├── blanche-products/                             │
│   └── deadstock-textiles/                           │
│                                                     │
│ Auth: Partagé (users peuvent avoir accès aux 2)    │
└─────────────────────────────────────────────────────┘
```

**Synergies Possibles (Futur)** :
```sql
-- Exemple: Vue cross-schema si besoin
CREATE VIEW deadstock.blanche_fabrics AS
SELECT 
  p.id,
  p.name,
  p.fabric_type
FROM public.products p
WHERE p.category = 'fabrics';
```

**Avantages** :
- ✅ **Simplicité repos** : Chaque projet indépendant
- ✅ **Coûts optimisés** : Une seule instance Supabase (~25€/mois au lieu de 50€)
- ✅ **Auth partageable** : Users Blanche peuvent se connecter à Deadstock si besoin
- ✅ **Storage partagé** : Un seul bucket Supabase, folders séparés
- ✅ **Synergies futures** : Vues cross-schema possibles
- ✅ **Migrations indépendantes** : Chaque schéma géré séparément
- ✅ **Rollback isolé** : DROP SCHEMA deadstock CASCADE si besoin

**Inconvénients** :
- ⚠️ Code dupliqué (mais packages npm internes possibles plus tard)
- ⚠️ Supabase instance unique = point de défaillance commun
- ⚠️ Limites partagées (RLS policies, storage)

**Coût/Complexité** : **Moyen-Faible** (sweet spot)

---

### Option 4 : PACKAGE NPM INTERNE RÉUTILISABLE

**Description** : Deadstock comme package installable dans Blanche

```
deadstock-search-engine/
├── src/
│   ├── components/            # React components
│   ├── lib/                   # Logic
│   └── index.ts               # Exports publics
├── package.json               # Name: @blanche/deadstock
└── README.md

blanche-ecommerce/
├── package.json               # Dependency: "@blanche/deadstock": "file:../deadstock"
└── src/
    └── pages/
        └── fabrics/
            └── page.tsx       # Import { TextileSearch } from '@blanche/deadstock'
```

**Avantages** :
- ✅ **Réutilisabilité** : Deadstock embeddable dans Blanche
- ✅ **Versioning** : Peut publier sur npm privé plus tard

**Inconvénients** :
- ❌ **Complexité build** : Besoin bundler (tsup, vite)
- ❌ **Maintenance double** : Package + app standalone
- ❌ **Overkill pour MVP** : Pas de besoin immédiat

**Coût/Complexité** : **Élevé** (Phase 4+)

---

## Décision Recommandée

### ✅ **OPTION 3 : HYBRIDE (Repos Séparés + Supabase Partagée)**

**Rationale** :
1. **Simplicité développement** : Chaque projet évolue librement
2. **Coûts optimisés** : Une Supabase au lieu de deux
3. **Synergies possibles** : Auth partagé, vues cross-schema si besoin
4. **Scalabilité** : Peut migrer vers monorepo ou package npm plus tard
5. **Adapté solo dev** : Pas de complexité inutile

---

## Architecture Détaillée Option 3

### 🗂️ Repositories Git

**Repository 1 : blanche-ecommerce**
```
blanche-ecommerce/
├── .git/
├── src/
├── public/
├── package.json
├── vercel.json
└── README.md
```

**Repository 2 : deadstock-search-engine**
```
deadstock-search-engine/
├── .git/
├── src/
├── scripts/
├── docs/
├── package.json
├── vercel.json
└── README.md
```

**Liens** : Aucun lien Git entre les repos

---

### 🚀 Déploiements Vercel

**Projet Vercel 1 : blanche-ecommerce**
- URL Production : `blanche.vercel.app` (ou domaine custom)
- Repo : `github.com/thomas/blanche-ecommerce`
- Variables Env : `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Framework : Next.js

**Projet Vercel 2 : deadstock-search-engine**
- URL Production : `deadstock-search.vercel.app` (ou domaine custom)
- Repo : `github.com/thomas/deadstock-search-engine`
- Variables Env : Mêmes clés Supabase (instance partagée)
- Framework : Next.js
- Cron Jobs : Scraping MLC/TFS

**Coûts Vercel** :
- Hobby (gratuit) : OK pour les deux si <100GB bandwidth total
- Pro ($20/mois) : Si besoin plus ou features pro

---

### 💾 Supabase Partagée

**Instance Unique** : `lnkxfyfkwnfvxaxnbah.supabase.co`

**Organisation Schémas** :
```sql
-- Schéma Blanche (existant)
CREATE SCHEMA IF NOT EXISTS public;
-- Tables: products, orders, users, profiles, etc.

-- Schéma Deadstock (nouveau)
CREATE SCHEMA IF NOT EXISTS deadstock;
-- Tables: textiles, scraping_logs, users, user_favorites

-- Schéma Auth (Supabase, partagé)
CREATE SCHEMA IF NOT EXISTS auth;
-- Tables: users, sessions, etc. (géré par Supabase)
```

**Permissions RLS** :
```sql
-- public.* : Blanche policies
-- deadstock.* : Deadstock policies
-- Pas d'interférence entre schémas
```

**Storage Buckets** :
```
supabase-storage/
├── blanche-products/          # Images produits Blanche
├── blanche-uploads/           # Uploads utilisateurs Blanche
└── deadstock-textiles/        # Images textiles Deadstock (si re-host)
```

**Auth Partagé** :
- Users table : `auth.users` (partagée)
- Si user Blanche veut accéder Deadstock → Même compte
- Possible d'avoir roles différents par app

---

### 🔗 Synergies Futures Possibles

#### Scénario 1 : Afficher Deadstock Textiles dans Blanche

**Approche 1** : API Call
```typescript
// Dans blanche-ecommerce
async function getDeadstockTextiles() {
  const response = await fetch('https://deadstock-search.vercel.app/api/textiles');
  return response.json();
}
```

**Approche 2** : Vue Cross-Schema
```sql
-- Dans Supabase
CREATE VIEW public.available_deadstock AS
SELECT 
  id,
  name,
  material_type,
  color,
  price_value
FROM deadstock.textiles
WHERE available = true;

-- Accès depuis Blanche
SELECT * FROM available_deadstock;
```

#### Scénario 2 : User Blanche Devient Pro Deadstock

```sql
-- Table dans deadstock schema
CREATE TABLE deadstock.user_subscriptions (
  user_id UUID REFERENCES auth.users(id),
  plan TEXT, -- 'free', 'premium', 'pro'
  -- ...
);

-- User auth.users peut être:
-- - Client Blanche (achète tissus)
-- - Pro Deadstock (API access)
-- - Les deux !
```

#### Scénario 3 : Blanche Vend Ses Propres Deadstock

```sql
-- Blanche peut insérer dans deadstock.textiles
INSERT INTO deadstock.textiles (
  name,
  supplier_name,
  source_platform
) VALUES (
  'Chute soie blanche',
  'Blanche',
  'blanche_internal'
);

-- Visible dans moteur recherche Deadstock !
```

---

## Implémentation Pratique

### Étape 1 : Organisation Actuelle (Ne Rien Changer)

**Status Quo** :
- ✅ Deadstock déjà dans repo séparé : `deadstock-search-engine/`
- ✅ Supabase déjà partagée avec schéma `deadstock` séparé
- ✅ Déploiement Vercel pas encore fait (à venir)

**Action** : Continuer comme ça ! 👍

---

### Étape 2 : Setup Vercel Séparé (Phase 1 - Déploiement)

**Actions** :
1. Créer nouveau projet Vercel : "deadstock-search-engine"
2. Connecter au repo GitHub
3. Configurer variables env (mêmes clés Supabase)
4. Deploy

**Résultat** :
- Blanche : `blanche.vercel.app`
- Deadstock : `deadstock-search.vercel.app`

---

### Étape 3 : Code Partagé (Optionnel - Phase 4+)

**Si besoin de partager code plus tard** :

**Option A** : npm package privé
```bash
# Créer package
cd deadstock-search-engine
npm init --scope=@blanche

# Publier sur npm privé (GitHub Packages)
npm publish

# Installer dans Blanche
cd blanche-ecommerce
npm install @blanche/deadstock-search
```

**Option B** : Git submodules
```bash
# Dans blanche-ecommerce
git submodule add https://github.com/thomas/deadstock-search-engine packages/deadstock
```

**Option C** : Migrer vers monorepo (Turborepo)
```bash
npx create-turbo@latest
# Migration complète vers monorepo
```

---

## Gestion Variables Environnement

### Variables Partagées (Supabase)

**`.env.local` dans les DEUX projets** :
```env
# Identiques dans Blanche et Deadstock
NEXT_PUBLIC_SUPABASE_URL=https://lnkxfyfkwnfvxaxnbah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Vercel (Production)** :
- Ajouter dans CHAQUE projet Vercel
- Valeurs identiques

---

### Variables Spécifiques

**Deadstock uniquement** :
```env
CRON_SECRET=random_secret_123
SCRAPING_ENABLED=true
```

**Blanche uniquement** :
```env
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG.xxx
```

---

## Workflows Développement

### Workflow 1 : Feature Deadstock Isolée

```bash
# Travailler uniquement sur Deadstock
cd deadstock-search-engine
git checkout -b feature/tuning-workflow
# ... développer ...
git commit -m "feat: workflow tuning dictionnaire"
git push origin feature/tuning-workflow

# Deploy preview sur Vercel
# https://deadstock-search-git-feature-tuning-workflow.vercel.app
```

**Impact Blanche** : Zéro ✅

---

### Workflow 2 : Feature Blanche + Deadstock

**Exemple** : Afficher textiles Deadstock dans Blanche

```bash
# 1. Développer API dans Deadstock
cd deadstock-search-engine
# Créer app/api/public/textiles/route.ts
git commit -m "feat: public API textiles"
git push

# 2. Utiliser API dans Blanche
cd blanche-ecommerce
# Créer page qui fetch API Deadstock
git commit -m "feat: integrate deadstock textiles"
git push
```

**Déploiements** : Deux déploiements séparés, mais coordonnés

---

## Coûts Infrastructure

### Avec Option 3 (Hybride)

**Supabase** :
- Free tier : 500MB DB, 1GB storage (OK pour MVP)
- Pro ($25/mois) : 8GB DB, 100GB storage
- **Total** : $25/mois (une instance)

**Vercel** :
- Hobby (gratuit) : 100GB bandwidth, projets illimités
- Pro ($20/mois) : Si besoin plus
- **Total** : $0-20/mois

**Total Infrastructure** : **$25-45/mois**

---

### Avec Option 1 (Séparation Complète)

**Supabase** :
- Instance 1 (Blanche) : $25/mois
- Instance 2 (Deadstock) : $25/mois
- **Total** : $50/mois

**Vercel** : Même ($0-20/mois)

**Total Infrastructure** : **$50-70/mois**

**Économie Option 3** : **$25/mois** 💰

---

## Migrations & Évolution

### Si Migration Monorepo Plus Tard

**Étapes** :
1. Créer nouveau repo `thomas-apps-monorepo`
2. Migrer Blanche dans `apps/blanche/`
3. Migrer Deadstock dans `apps/deadstock/`
4. Extraire code commun dans `packages/`
5. Setup Turborepo
6. Reconfigurer Vercel (pointe vers monorepo)

**Effort** : 1-2 jours
**Quand** : Si équipe grandit OU code dupliqué > 30%

---

### Si Package NPM Plus Tard

**Étapes** :
1. Refactorer Deadstock pour exports publics
2. Ajouter bundler (tsup)
3. Publier sur npm privé
4. Installer dans Blanche

**Effort** : 1 jour
**Quand** : Si Blanche veut embedder UI Deadstock

---

## Recommandations Finales

### Pour MVP (Phase 1-3)

✅ **OPTION 3 : Hybride**
- Repos séparés
- Vercel projets séparés
- Supabase partagée (schémas séparés)
- Code autonome (duplication acceptable)

**Actions Immédiates** :
1. ✅ Continuer développement Deadstock dans son repo
2. ✅ Utiliser Supabase partagée (déjà fait)
3. ⏳ Créer projet Vercel séparé quand prêt à déployer
4. ⏳ Documenter variables env communes

---

### Pour Scale (Phase 4+)

**Si synergies fortes** :
- Migrer vers monorepo (Turborepo)
- Packages partagés (`@blanche/ui`, `@blanche/database`)
- Déploiements coordonnés

**Si projets divergent** :
- Garder séparation
- Optionnellement : Instances Supabase séparées si scaling différent

---

## Décision & Next Steps

### Décision Proposée

**Adopter OPTION 3 (Hybride)** pour les raisons suivantes :
1. ✅ Simplicité actuelle (solo dev)
2. ✅ Coûts optimisés ($25/mois économisé)
3. ✅ Flexibilité future (migration possible)
4. ✅ Synergies possibles (auth, vues cross-schema)
5. ✅ Pas de complexité inutile

### Actions Immédiates

**Rien à changer !** 🎉
- Deadstock continue dans son repo
- Supabase partagée avec schéma séparé (déjà fait)
- Variables env partagées (déjà fait)

**Prochaines Actions** (Quand Phase 1 complète) :
1. Push Deadstock sur GitHub
2. Créer projet Vercel séparé
3. Configurer variables env Vercel
4. Premier déploiement

---

## Questions à Clarifier

### Question 1 : Domaines

**Option A** : Sous-domaines
- `blanche.com` (site e-commerce)
- `search.blanche.com` (deadstock search)

**Option B** : Domaines séparés
- `blanche.com`
- `deadstock-fabrics.com`

**Recommandation** : Option A (cohérence marque)

---

### Question 2 : Branding

**Deadstock Search = Produit Blanche ?**
- Si oui → Sous-domaine Blanche
- Si non → Marque indépendante

**À décider** : Phase 2 (quand MVP validé)

---

## Références

- [Turborepo Docs](https://turbo.build/repo)
- [Vercel Monorepos](https://vercel.com/docs/monorepos)
- [Supabase Multi-Schema](https://supabase.com/docs/guides/database/schemas)

---

**Statut** : ✅ **RECOMMANDATION OPTION 3**  
**Prochaine Action** : Valider avec Thomas et continuer développement  
**Révision** : Quand Phase 4+ si besoin monorepo
