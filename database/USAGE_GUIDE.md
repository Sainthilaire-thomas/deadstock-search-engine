# 🚀 Guide d'Utilisation - Schéma Deadstock dans Blanche

**Date** : 27 décembre 2025  
**Pour** : Intégration du moteur de recherche deadstock dans le projet Blanche

---

## 📋 Vue d'Ensemble

Le moteur de recherche deadstock utilise un **schéma PostgreSQL séparé** (`deadstock`) dans la même base Supabase que Blanche.

**Organisation** :
```
Supabase Database
├── Schema: public (Blanche)
│   ├── products
│   ├── orders
│   ├── profiles
│   └── ... (toutes les tables Blanche)
│
├── Schema: deadstock (Moteur Recherche)
│   ├── textiles
│   ├── scraping_logs
│   ├── users
│   └── user_favorites
│
└── Schema: auth (Supabase Auth - partagé)
    └── users
```

---

## ⚡ Quick Start

### 1. Installation du Schéma

**Via Supabase Dashboard** :
1. Ouvre Supabase Dashboard
2. Va dans **SQL Editor**
3. Copie-colle le contenu de `database/migrations/001_initial_schema.sql`
4. Exécute ▶️

**Via Supabase CLI** (si configuré) :
```bash
supabase db push database/migrations/001_initial_schema.sql
```

### 2. Vérification

```sql
-- Vérifier que le schéma existe
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'deadstock';

-- Lister les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'deadstock';

-- Devrait retourner: textiles, scraping_logs, users, user_favorites
```

### 3. Test Rapide

```sql
-- Insérer un textile test
INSERT INTO deadstock.textiles (
  name, 
  material_type, 
  quantity_value, 
  quantity_unit, 
  source_platform, 
  source_url
) VALUES (
  'Coton Bio Blanc',
  'coton',
  50,
  'm',
  'test',
  'https://example.com/test'
);

-- Vérifier l'insertion
SELECT * FROM deadstock.textiles;

-- Nettoyer le test
DELETE FROM deadstock.textiles WHERE source_platform = 'test';
```

---

## 🔧 Utilisation dans le Code

### Configuration Supabase Client

**Fichier** : `lib/supabase.ts` (ou équivalent)

```typescript
import { createClient } from '@supabase/supabase-js';

// Client existant Blanche (schéma public)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Même client pour deadstock, juste préfixer les requêtes
// Pas besoin de client séparé !
```

### Requêtes Textiles

**Recherche Simple** :
```typescript
// Récupérer tous les textiles disponibles
const { data: textiles, error } = await supabase
  .from('deadstock.textiles')  // ⚠️ Préfixe "deadstock."
  .select('*')
  .eq('available', true)
  .order('scraped_at', { ascending: false })
  .limit(20);
```

**Recherche avec Filtres** :
```typescript
// Recherche par type de matériau
const { data, error } = await supabase
  .from('deadstock.textiles')
  .select('id, name, material_type, color, price_value, image_url')
  .eq('material_type', 'coton')
  .eq('available', true);
```

**Recherche Full-Text** :
```typescript
// Utiliser la fonction de recherche PostgreSQL
const { data, error } = await supabase
  .rpc('deadstock.search_textiles', {  // ⚠️ Préfixe "deadstock."
    search_query: 'coton bio',
    material_filter: null,
    color_filter: null,
    limit_count: 20,
    offset_count: 0
  });
```

### API Routes Next.js

**Fichier** : `app/api/deadstock/search/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .rpc('deadstock.search_textiles', {
      search_query: query,
      limit_count: 20
    });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ textiles: data });
}
```

---

## 🎨 Interface Utilisateur

### Composant Recherche Textile

**Fichier** : `components/deadstock/TextileSearch.tsx`

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Textile {
  id: string;
  name: string;
  material_type: string;
  price_value: number;
  image_url: string | null;
}

export default function TextileSearch() {
  const [query, setQuery] = useState('');
  const [textiles, setTextiles] = useState<Textile[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .rpc('deadstock.search_textiles', {
        search_query: query,
        limit_count: 20
      });
    
    if (!error && data) {
      setTextiles(data);
    }
    
    setLoading(false);
  };
  
  return (
    <div>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher des textiles..."
      />
      <button onClick={handleSearch}>
        {loading ? 'Recherche...' : 'Rechercher'}
      </button>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        {textiles.map(textile => (
          <div key={textile.id} className="border p-4">
            {textile.image_url && (
              <img src={textile.image_url} alt={textile.name} />
            )}
            <h3>{textile.name}</h3>
            <p>{textile.material_type}</p>
            <p>{textile.price_value}€</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔐 Sécurité & Permissions

### Row Level Security (RLS)

Le schéma deadstock a RLS activé avec ces policies :

**Textiles** :
- ✅ **Lecture** : Public (tout le monde)
- ❌ **Écriture** : Service role uniquement (scrapers)

**User Favorites** :
- ✅ **Lecture/Écriture** : User authentifié (ses propres favoris)

### Variables d'Environnement

**Pour scrapers** (écriture textiles) :

```bash
# .env.local
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # ⚠️ Service role (pas anon key)
```

**Pour app frontend** (lecture textiles) :

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...  # ✅ Anon key (safe pour client)
```

---

## 🕷️ Scraping & Insertion Données

### Script Scraper Exemple

**Fichier** : `scripts/scrapers/recovo.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// Service role client pour insertion
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ⚠️ Service role
);

async function scrapeRecovo() {
  const startLog = await supabase
    .from('deadstock.scraping_logs')
    .insert({
      source_platform: 'recovo',
      status: 'running'
    })
    .select()
    .single();
  
  try {
    // 1. Scrape les données
    const scrapedTextiles = await fetchRecovoTextiles();
    
    // 2. Normaliser les données
    const normalized = scrapedTextiles.map(normalizeTextile);
    
    // 3. Insérer dans deadstock.textiles
    const { data, error } = await supabase
      .from('deadstock.textiles')
      .upsert(normalized, { 
        onConflict: 'source_url'  // Évite doublons
      });
    
    // 4. Mettre à jour le log
    await supabase
      .from('deadstock.scraping_logs')
      .update({
        status: 'completed',
        items_found: scrapedTextiles.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', startLog.data.id);
      
  } catch (error) {
    // Log l'erreur
    await supabase
      .from('deadstock.scraping_logs')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', startLog.data.id);
  }
}
```

---

## 📊 Monitoring & Analytics

### Statistiques Plateformes

```typescript
// Récupérer stats par plateforme
const { data: stats } = await supabase
  .from('deadstock.platform_stats')  // Vue créée dans schema
  .select('*');

console.log(stats);
// [
//   {
//     source_platform: 'recovo',
//     total_textiles: 450,
//     available_textiles: 420,
//     unique_materials: 35,
//     avg_price_eur: 12.50
//   },
//   ...
// ]
```

### Logs de Scraping

```typescript
// Récupérer derniers logs
const { data: logs } = await supabase
  .from('deadstock.scraping_logs')
  .select('*')
  .order('started_at', { ascending: false })
  .limit(10);
```

---

## 🔗 Synergies Blanche ↔ Deadstock

### Exemple : Lier Produit Blanche avec Textile Deadstock

**Future possibilité** (Phase 6+) :

```sql
-- Vue combinant les deux schémas
CREATE VIEW blanche_products_with_textiles AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  t.id as textile_id,
  t.name as textile_name,
  t.supplier_name
FROM public.products p
LEFT JOIN deadstock.textiles t ON p.metadata->>'textile_id' = t.id::text;
```

---

## ⚠️ Points d'Attention

### 1. Préfixe Schema Obligatoire

```typescript
// ❌ INCORRECT
.from('textiles')  // Cherche dans public.textiles (n'existe pas)

// ✅ CORRECT
.from('deadstock.textiles')
```

### 2. Service Role vs Anon Key

```typescript
// Frontend (lecture seule)
const supabase = createClient(url, ANON_KEY);

// Scrapers (écriture)
const supabase = createClient(url, SERVICE_ROLE_KEY);
```

### 3. RLS Policies

Les users normaux **ne peuvent pas écrire** dans `deadstock.textiles`.  
Seuls les scripts avec service_role key le peuvent.

---

## 🧪 Tests

### Test Connexion Schema

```typescript
// test/deadstock-schema.test.ts
import { supabase } from '@/lib/supabase';

test('Can read from deadstock schema', async () => {
  const { data, error } = await supabase
    .from('deadstock.textiles')
    .select('id')
    .limit(1);
  
  expect(error).toBeNull();
  expect(data).toBeDefined();
});
```

---

## 📚 Ressources

- **Schéma complet** : `database/schema.sql`
- **Migration** : `database/migrations/001_initial_schema.sql`
- **ADR Architecture** : `docs/decisions/ADR_001_database_architecture.md`
- **Supabase Docs** : https://supabase.com/docs/guides/database/schemas

---

## 🆘 Troubleshooting

### Erreur : "relation deadstock.textiles does not exist"

**Cause** : Schema pas encore créé  
**Solution** : Exécuter la migration `001_initial_schema.sql`

### Erreur : "permission denied for schema deadstock"

**Cause** : User n'a pas accès au schema  
**Solution** : Vérifier que `GRANT USAGE ON SCHEMA deadstock` est exécuté

### Erreur : "new row violates row-level security policy"

**Cause** : Tentative d'insert avec anon key  
**Solution** : Utiliser service_role key pour scrapers

---

**Questions ?** Consulte l'ADR 001 ou ouvre une issue ! 🚀
