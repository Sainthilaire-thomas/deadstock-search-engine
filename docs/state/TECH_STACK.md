# 🔧 TECH STACK - Architecture Technique

**Dernière MAJ** : 27 décembre 2025

**Phase** : Phase 0 - Conception

**Statut** : Architecture définie et validée

---

## 🎯 Vue d'Ensemble

### Stack Principal

```
Frontend:  Next.js 14+ (React 18+, TypeScript)
Backend:   Next.js API Routes + Supabase Functions
Database:  PostgreSQL (via Supabase)
Auth:      Supabase Auth
Storage:   Supabase Storage
Hosting:   Vercel (frontend + API) + Supabase Cloud (backend)
```

### Diagramme Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     USERS                                │
│                (Designers, Pros)                         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              VERCEL (Edge Network)                       │
│  ┌───────────────────────────────────────────┐          │
│  │   Next.js 14 Application (SSR + SSG)      │          │
│  │   - React Components                       │          │
│  │   - TypeScript                             │          │
│  │   - Tailwind CSS                           │          │
│  │   - API Routes (Serverless Functions)     │          │
│  └───────────────────┬───────────────────────┘          │
└────────────────────│─────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               SUPABASE CLOUD                             │
│  ┌────────────────────────────────────────────┐         │
│  │   PostgreSQL Database                      │         │
│  │   - Textiles data                          │         │
│  │   - Users                                  │         │
│  │   - Full-text search indexes               │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │   Supabase Auth                            │         │
│  │   - User authentication                    │         │
│  │   - Session management                     │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │   Supabase Storage                         │         │
│  │   - Textile images (future)                │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │   Edge Functions (future)                  │         │
│  │   - Complex serverless operations          │         │
│  └────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
                     ▲
                     │
                     │
┌────────────────────┴─────────────────────────────────────┐
│           WEB SCRAPING LAYER (Cron Jobs)                 │
│  ┌────────────────────────────────────────────┐          │
│  │   Node.js Scrapers                         │          │
│  │   - Recovo scraper                         │          │
│  │   - My Little Coupon scraper               │          │
│  │   - Data normalization                     │          │
│  │   - Scheduled daily/weekly                 │          │
│  └────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────┘
                     │
                     ▼
              ┌─────────────┐
              │  EXTERNAL   │
              │  SOURCES    │
              │  (Recovo,   │
              │   MLC, etc) │
              └─────────────┘
```

---

## 🏗️ Technologies Détaillées

### Frontend

#### Next.js 14+

**Version** : 14.0+ (App Router)

**Justification** :

* SSR/SSG pour SEO et performance
* API Routes intégrées (pas besoin backend séparé)
* Image optimization native
* Edge functions pour latency faible
* Large écosystème React
* TypeScript first-class support

**Configuration Prévue** :

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: true, // Server Actions pour forms
  },
  images: {
    domains: ['supabase.co', 'recovo.co', ...], // Images externes
  },
}
```

**Utilisation Spécifique** :

* Pages : App Router (`app/` directory)
* Composants Server Components par défaut
* Client Components pour interactivité
* API Routes : `/app/api/`
* Middleware pour auth checks

---

#### React 18+

**Version** : 18.2+

**Justification** :

* Concurrent rendering pour UI fluide
* Server Components (Next.js 14)
* Suspense pour data fetching
* Standard industrie

**Patterns Prévus** :

* Composition components modulaires
* Custom hooks pour logique réutilisable
* Context API pour état global léger
* Zustand si état complexe (Phase 2+)

---

#### TypeScript

**Version** : 5.0+

**Justification** :

* Type safety pour codebase robuste
* Autocomplete améliore DX
* Détection erreurs avant runtime
* Documentation code via types

**Configuration** :

```json
// tsconfig.json (strict mode)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

#### Tailwind CSS

**Version** : 3.4+

**Justification** :

* Utility-first pour rapidité développement
* Purge CSS automatique (bundle size minimal)
* Design system cohérent
* Responsive facile
* Dark mode support

**Configuration Prévue** :

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#...',
        'brand-secondary': '#...',
      }
    }
  }
}
```

**Alternatives Considérées et Rejetées** :

* ❌ CSS Modules : Moins rapide, plus verbeux
* ❌ Styled Components : Runtime overhead
* ❌ Bootstrap : Trop opinionated, plus lourd

---

### Backend

#### Next.js API Routes

**Version** : Next.js 14+

**Justification** :

* Serverless automatique (scaling, cost)
* Colocation avec frontend
* TypeScript end-to-end
* Edge runtime disponible

**Utilisation** :

```typescript
// app/api/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  // Query Supabase
  const { data } = await supabase
    .from('textiles')
    .select('*')
    .textSearch('name', query);
  
  return Response.json(data);
}
```

---

#### Supabase Functions

**Version** : Latest

**Justification** :

* Backend-as-a-Service (BaaS)
* PostgreSQL robuste et performant
* Auth intégrée
* Real-time subscriptions (future)
* Storage intégré
* Functions serverless (Deno runtime)

**Services Utilisés** :

1. **Database** : PostgreSQL avec extensions
2. **Auth** : JWT, OAuth providers (future)
3. **Storage** : Images textiles
4. **Functions** : Tâches complexes (future)

**Configuration** :

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

### Database

#### PostgreSQL (Supabase)

**Version** : 15+

**Justification** :

* SQL robuste et standard
* Full-text search performant (tsvector)
* JSONB pour flexibilité
* Extensions puissantes (pg_trgm pour fuzzy search)
* Mature et fiable

**Extensions Prévues** :

* `pg_trgm` : Trigram matching (recherche floue)
* `unaccent` : Recherche insensible accents
* Possiblement `pgvector` : Similarity search (Phase 8+)

**Schema Preview (Simplifié)** :

```sql
-- Table principale textiles
CREATE TABLE textiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL, -- coton, laine, soie, etc.
  composition JSONB, -- {cotton: 80, polyester: 20}
  color TEXT,
  quantity_value NUMERIC,
  quantity_unit TEXT, -- m, m², kg, etc.
  price_value NUMERIC,
  price_currency TEXT, -- EUR, USD, GBP
  supplier_name TEXT,
  source_platform TEXT, -- recovo, my_little_coupon
  source_url TEXT,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index full-text search
CREATE INDEX textiles_search_idx ON textiles 
  USING GIN (to_tsvector('french', name || ' ' || description));

-- Index filtres communs
CREATE INDEX textiles_type_idx ON textiles(material_type);
CREATE INDEX textiles_color_idx ON textiles(color);
CREATE INDEX textiles_available_idx ON textiles(available);
```

**Stratégie Évolution** :

* Phase 1 : Schema simplifié (table textiles unique)
* Phase 2+ : Migration vers normalisé si besoin (tables materials, stock_lots, suppliers séparées)

---

### Hosting & Déploiement

#### Vercel

**Plan** : Hobby (gratuit) → Pro (~$20/mois) si scaling

**Justification** :

* Intégration parfaite Next.js
* Edge Network global
* Preview deployments automatiques
* Analytics incluses
* CI/CD intégré (push Git = deploy)

**Configuration** :

```json
// vercel.json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "regions": ["cdg1"] // Paris primary region
}
```

---

#### Supabase Cloud

**Plan** : Free → Pro ($25/mois) si scaling

**Justification** :

* Database managée (backups, scaling)
* Auth managée
* Storage managé
* Uptime 99.9%+
* Support européen (GDPR)

**Sizing Prévu** :

* Free : MVP jusqu'à ~500 users
* Pro : Growth phase (500-5000 users)

---

### Scraping & Data Aggregation

#### Node.js + Libraries

**Technologies** :

* **axios** ou **node-fetch** : HTTP requests
* **cheerio** : HTML parsing (si pas JavaScript rendering)
* **puppeteer** ou **playwright** : Si JavaScript rendering requis
* **zod** : Validation données scrapées

**Architecture Scraping** :

```typescript
// scrapers/recovo.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { supabase } from '../lib/supabase';

export async function scrapeRecovo() {
  const response = await axios.get('https://recovo.co/listings');
  const $ = cheerio.load(response.data);
  
  const textiles = [];
  $('.listing-item').each((i, elem) => {
    textiles.push({
      name: $(elem).find('.name').text(),
      price: parsePrice($(elem).find('.price').text()),
      // ... autres champs
    });
  });
  
  // Normalisation
  const normalized = textiles.map(normalizeTextile);
  
  // Insert dans Supabase
  await supabase.from('textiles').upsert(normalized);
}
```

**Scheduling** :

* **Vercel Cron Jobs** : Déclenchement quotidien/hebdomadaire
* Ou **GitHub Actions** : Alternative si Vercel Cron limité

```typescript
// app/api/cron/scrape/route.ts
export async function GET(request: Request) {
  // Vérifier token sécurité
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  await scrapeRecovo();
  await scrapeMyLittleCoupon();
  
  return Response.json({ success: true });
}
```

---

## 🧪 Testing

### Framework de Tests

#### Vitest

**Version** : Latest

**Justification** :

* Rapide (utilise Vite)
* Compatible Jest (easy migration)
* TypeScript native
* Modern

**Utilisation** :

```typescript
// __tests__/scrapers/normalize.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeQuantity } from '@/lib/normalize';

describe('normalizeQuantity', () => {
  it('converts yards to meters', () => {
    expect(normalizeQuantity(10, 'yards')).toEqual({
      value: 9.14,
      unit: 'm'
    });
  });
});
```

---

#### Playwright (E2E)

**Version** : Latest

**Justification** :

* Tests end-to-end fiables
* Multi-browser (Chrome, Firefox, Safari)
* Screenshots et videos automatiques
* Headless pour CI

**Utilisation** :

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test('search for cotton textiles', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[name="search"]', 'cotton');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.result-item')).toHaveCount({ min: 1 });
});
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics

**Inclus** : Plan Vercel

**Métrique** :

* Page views
* Performance (Core Web Vitals)
* Traffic sources

### Sentry (Phase 2+)

**Plan** : Free → Team

**Utilisation** :

* Error tracking
* Performance monitoring
* User feedback

### Custom Logging

**Outils** :

* Console pour dev
* Structured logs pour production
* Possiblement Better Stack ou Logtail (Phase 2+)

---

## 🔐 Sécurité

### Authentication

* **Supabase Auth** : JWT tokens, secure sessions
* **RLS (Row Level Security)** : PostgreSQL policies pour data isolation

### API Security

* **Rate Limiting** : Vercel Edge middleware
* **CORS** : Configuration stricte
* **Environment Variables** : Secrets Vercel/Supabase

### HTTPS

* Vercel : HTTPS automatique
* Supabase : Connexions chiffrées

---

## 📦 Dépendances Principales

### Frontend

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.x",
    "@supabase/auth-helpers-nextjs": "^0.8.x",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "eslint": "^8.x",
    "prettier": "^3.x"
  }
}
```

### Scraping

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "puppeteer": "^21.0.0", // Si JavaScript rendering nécessaire
    "zod": "^3.22.0" // Validation schémas
  }
}
```

---

## 🚀 Environnements

### Development

* **URL** : `http://localhost:3000`
* **Database** : Supabase Dev Project
* **Hot Reload** : Next.js Fast Refresh
* **Logs** : Console

### Staging

* **URL** : `https://deadstock-search-staging.vercel.app`
* **Database** : Supabase Staging Project
* **Deploy** : Auto sur push branch `staging`

### Production

* **URL** : `https://deadstock-search.com` (à définir)
* **Database** : Supabase Production Project
* **Deploy** : Auto sur push branch `main`
* **Monitoring** : Vercel Analytics + Sentry

---

## 🔄 CI/CD Pipeline

### Vercel Intégré

```yaml
# Workflow automatique Vercel
on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  - Lint (ESLint)
  - Type Check (TypeScript)
  - Unit Tests (Vitest)
  - Build (Next.js)
  - Deploy (Vercel)
```

### GitHub Actions (Optionnel)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
```

---

## 🎯 Alternatives Considérées

### Frontend Framework

| Option            | Pros                         | Cons                    | Décision          |
| ----------------- | ---------------------------- | ----------------------- | ------------------ |
| **Next.js** | SSR, SEO, integrated backend | Learning curve          | ✅**Choisi** |
| React + Vite      | Rapide, simple               | Pas de SSR natif        | ❌ Rejeté         |
| Remix             | Modern, nested routes        | Moins mature            | ❌ Rejeté         |
| SvelteKit         | Performant, DX               | Écosystème plus petit | ❌ Rejeté         |

### Backend

| Option                           | Pros                               | Cons                         | Décision          |
| -------------------------------- | ---------------------------------- | ---------------------------- | ------------------ |
| **Next.js API + Supabase** | Serverless, simple, cost-effective | Vendor lock-in léger        | ✅**Choisi** |
| Express + PostgreSQL             | Control total                      | Infra à gérer, coût       | ❌ Rejeté         |
| Firebase                         | Facile, managed                    | NoSQL, pricing unpredictable | ❌ Rejeté         |

### Database

| Option                | Pros                           | Cons                       | Décision          |
| --------------------- | ------------------------------ | -------------------------- | ------------------ |
| **PostgreSQL**  | Robuste, SQL, full-text search | Moins flexible que NoSQL   | ✅**Choisi** |
| MongoDB               | Flexibilité schéma           | Full-text search moins bon | ❌ Rejeté         |
| Prisma + Planet Scale | Modern DX                      | Coût, complexity          | ❌ Rejeté         |

---

## 📚 Ressources & Documentation

### Documentation Officielle

* [Next.js Docs](https://nextjs.org/docs)
* [Supabase Docs](https://supabase.com/docs)
* [Vercel Docs](https://vercel.com/docs)
* [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Guides Techniques

* Architecture Next.js : [Patterns](https://nextjs.org/docs/app/building-your-application)
* PostgreSQL Full-Text Search : [Guide](https://www.postgresql.org/docs/current/textsearch.html)
* Web Scraping Best Practices : [Guide](https://github.com/lorien/awesome-web-scraping)

---

## 🔄 Évolutions Futures Possibles

### Phase 5-6 : API Publique

* **OpenAPI spec** : Documentation API auto-générée
* **Rate limiting** : Upstash Redis pour limits avancés
* **API Gateway** : Possiblement Kong ou Tyk si complexité

### Phase 8+ : Features IA

* **Claude API** : Suggestions design basées sur textiles
* **Embeddings** : pgvector pour similarity search
* **ML Models** : TensorFlow.js pour color matching

### Scale (M12+)

* **Redis** : Caching avancé (Upstash)
* **CDN** : Cloudflare pour assets
* **Queue System** : BullMQ pour jobs asynchrones lourds
* **Microservices** : Si vraiment nécessaire (peu probable)

---

## 📝 Notes Importantes

### Philosophie Technique

* **Pragmatisme avant perfection** : MVP rapide, itération
* **Managed services** : Focus produit, pas infra
* **TypeScript strict** : Robustesse long terme
* **Tests critiques d'abord** : Scrapers et normalisation prioritaires

### Décisions Non Négociables

* ✅ TypeScript (pas JavaScript vanilla)
* ✅ Next.js 14+ avec App Router (pas Pages Router)
* ✅ PostgreSQL (pas NoSQL pour ce use case)
* ✅ Serverless (pas server traditionnel)

### Points de Flexibilité

* Styling : Tailwind recommandé mais alternatives OK
* Testing : Vitest recommandé mais Jest acceptable
* Scraping libs : Cheerio/Puppeteer selon besoins réels

---

**Version** : 1.0

**Prochaine Révision** : Après Phase 1 (ajout détails implémentation réelle)
