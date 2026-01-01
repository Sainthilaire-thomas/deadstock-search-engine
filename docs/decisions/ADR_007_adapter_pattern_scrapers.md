# ADR 007 : Adapter Pattern for Multi-Source Scrapers

**Date** : 28 décembre 2024  
**Statut** : ✅ Accepté  
**Décideurs** : Thomas  
**Tags** : `architecture`, `scraping`, `adapter-pattern`, `scalability`

---

## Contexte

**Vision Projet** : Agréger textiles deadstock depuis multiples plateformes :
- My Little Coupon (MLC) - Shopify API
- The Fabric Sales (TFS) - E-commerce custom
- Recovo - Marketplace B2B
- Futurs : Etsy, Vestiaire Collective, etc.

**Problème** : Chaque source a :
- Format API différent (Shopify JSON, REST custom, GraphQL, etc.)
- Structure données différente (champs, nommage, types)
- Authentification différente (API key, OAuth, scraping HTML)

**Question** : Comment gérer multiples sources sans dupliquer code scraping ?

---

## Décision

**Adopter l'Adapter Pattern** pour isoler la logique spécifique à chaque source.

**Principe** :
```
Use Case (scrapeAndSaveTextiles)
        ↓
    Adapter Interface (ProductData standard)
        ↓
    ┌───────────────────────────────┐
    │ MyLittleCouponAdapter         │
    │ TheFabricSalesAdapter         │
    │ RecovoAdapter                 │
    └───────────────────────────────┘
        ↓
    Sources externes
```

**Contrat Standard** : Tous les adapters retournent `ProductData[]`

```typescript
interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  sourceUrl: string;
  available: boolean;
  rawData: any;
}
```

---

## Structure Adoptée

```
src/features/scraping/infrastructure/adapters/
├── MyLittleCouponAdapter.ts
├── TheFabricSalesAdapter.ts       // Future
├── RecovoAdapter.ts                // Future
└── IProductAdapter.ts              // Interface (optionnel TypeScript)
```

**Chaque Adapter** :
1. Fetch produits depuis source (API, scraping, etc.)
2. Transform en format standard `ProductData`
3. Gestion erreurs spécifique source

---

## Implémentation

### Interface Standard (Optionnelle)

```typescript
// src/features/scraping/infrastructure/adapters/IProductAdapter.ts
export interface IProductAdapter {
  fetchProducts(limit?: number): Promise<ProductData[]>;
}
```

### Exemple : MyLittleCouponAdapter

```typescript
export class MyLittleCouponAdapter implements IProductAdapter {
  
  private readonly baseUrl = 'https://mylittlecoupon.fr';
  
  async fetchProducts(limit: number = 10): Promise<ProductData[]> {
    // 1. Fetch depuis Shopify API
    const url = `${this.baseUrl}/collections/all/products.json?limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // 2. Transform vers format standard
    return data.products.map(p => this.transform(p));
  }
  
  private transform(raw: ShopifyProduct): ProductData {
    return {
      id: raw.id.toString(),
      name: raw.title,
      description: raw.body_html?.replace(/<[^>]*>/g, '') || '',
      price: parseFloat(raw.variants[0]?.price || '0'),
      imageUrl: raw.images[0]?.src || null,
      sourceUrl: `${this.baseUrl}/products/${raw.handle}`,
      available: raw.available,
      rawData: raw  // Backup données originales
    };
  }
}
```

### Use Case Agnostique Source

```typescript
export async function scrapeSource(
  adapter: IProductAdapter,
  sourceName: string,
  limit: number = 10
): Promise<ScrapeResult> {
  
  // Use case ne connaît PAS la source
  const products = await adapter.fetchProducts(limit);
  
  for (const product of products) {
    const normalized = await normalizeTextile({
      name: product.name,
      description: product.description,
      sourcePlatform: sourceName,
      productId: product.id,
      imageUrl: product.imageUrl,
      productUrl: product.sourceUrl
    });
    
    const textile = new Textile(...);
    await textileRepo.save(textile);
  }
}
```

### Utilisation Multi-Sources

```typescript
// Scraper MLC
const mlcAdapter = new MyLittleCouponAdapter();
await scrapeSource(mlcAdapter, 'my_little_coupon', 10);

// Scraper TFS (futur)
const tfsAdapter = new TheFabricSalesAdapter();
await scrapeSource(tfsAdapter, 'the_fabric_sales', 20);

// Scraper Recovo (futur)
const recovoAdapter = new RecovoAdapter();
await scrapeSource(recovoAdapter, 'recovo', 50);
```

---

## Rationale

### Pourquoi Adapter Pattern ?

**Avantages** :

1. **Isolation Logique Source**
   - Chaque adapter = 1 fichier
   - Changement API source → modifier 1 adapter seulement
   - Use case inchangé

2. **Ajout Sources Facile**
   ```
   Temps ajout nouvelle source :
   - Sans adapter : 4-6h (modifier use case, gérer formats, tester)
   - Avec adapter : 1-2h (créer adapter, implémenter transform)
   ```

3. **Testabilité**
   ```typescript
   // Mock adapter pour tests
   class MockAdapter implements IProductAdapter {
     async fetchProducts() {
       return [{ id: '1', name: 'Test', ... }];
     }
   }
   
   // Test use case sans appeler vraie API
   await scrapeSource(new MockAdapter(), 'test');
   ```

4. **Maintenance**
   - Bug API MLC → fixer `MyLittleCouponAdapter.ts` seulement
   - TFS change structure → fixer `TheFabricSalesAdapter.ts`
   - Use case jamais touché

5. **Évolutivité**
   - 10 sources futures = 10 adapters
   - Use case identique
   - Complexité linéaire (O(n)) vs quadratique sans pattern

### Exemple Concret Bénéfice

**Sans Adapter (Procédural)** :
```typescript
// Logique spécifique MLC mélangée avec use case
async function scrapeMLC() {
  const response = await fetch('https://mylittlecoupon.fr/...');
  const data = await response.json();
  
  for (const product of data.products) {
    // Parsing spécifique Shopify
    const price = parseFloat(product.variants[0].price);
    const image = product.images[0].src;
    // ... 50 lignes logique MLC ...
  }
}

// Ajout TFS = dupliquer + adapter tout le code
async function scrapeTFS() {
  const response = await fetch('https://thefabricsales.com/...');
  // ... re-écrire 50 lignes similaires mais différentes ...
}

// ❌ Duplication
// ❌ Use case mélangé avec parsing
// ❌ Bugs = fixer dans N fonctions
```

**Avec Adapter** :
```typescript
// Adapter MLC
class MyLittleCouponAdapter {
  async fetchProducts() { /* logique MLC */ }
  private transform() { /* parsing Shopify */ }
}

// Adapter TFS
class TheFabricSalesAdapter {
  async fetchProducts() { /* logique TFS */ }
  private transform() { /* parsing TFS */ }
}

// Use case unique
await scrapeSource(mlcAdapter, 'mlc');
await scrapeSource(tfsAdapter, 'tfs');

// ✅ Zero duplication
// ✅ Logique isolée
// ✅ Bug = fixer 1 adapter
```

---

## Alternatives Considérées

### Option A : Fonctions Procédurales (Rejetée)

```typescript
async function scrapeMLC() { ... }
async function scrapeTFS() { ... }
async function scrapeRecovo() { ... }
```

**Rejet** : Duplication code, maintenance nightmare

---

### Option B : Factory Pattern (Rejetée)

```typescript
class ScraperFactory {
  create(source: string): Scraper {
    switch(source) {
      case 'mlc': return new MLCScraper();
      case 'tfs': return new TFSScraper();
    }
  }
}
```

**Rejet** : Over-engineering, Adapter suffit

---

### Option C : Strategy Pattern (Considérée)

Similaire à Adapter, nommage différent.

**Accepté Adapter** car :
- Nom plus clair ("adapter une source externe")
- Convention industrie pour intégrations
- Strategy = algorithmes interchangeables (use case différent)

---

## Conséquences

### Positives ✅

1. **Scalabilité**
   - Ajout source : ~2h (créer adapter)
   - 10 sources futures = architecture inchangée

2. **Maintenabilité**
   - Bug source → fixer 1 fichier
   - Change API → 1 adapter
   - Use case stable

3. **Testabilité**
   - Mock adapters pour tests
   - Tests unitaires use case (sans API calls)
   - Tests E2E par adapter

4. **Découplage**
   - Use case ignore format source
   - Adapter ignore business logic
   - Clean separation of concerns

### Négatives ❌

1. **Overhead Initial**
   - Créer adapter même pour 1 source
   - +15 min vs fetch direct

2. **Abstraction Layer**
   - 1 niveau indirection
   - Peut masquer spécificités source (si abstraction trop large)

3. **Interface Rigide**
   - `ProductData` doit couvrir tous les cas
   - Risque "lowest common denominator"

### Mitigations

**Overhead** : Accepté, ROI après source #2  
**Abstraction** : `rawData` conserve tout  
**Interface** : Évolutive, ajout champs si besoin

---

## Métriques Succès

### Court Terme
- ✅ MLC adapter créé et fonctionnel
- ✅ Use case agnostique source

### Moyen Terme
- 🎯 Ajout TFS adapter : <2h
- 🎯 Ajout Recovo adapter : <2h
- 🎯 Zero régression use case

### Long Terme
- 🎯 10 sources supportées
- 🎯 Maintenance : <1h/mois par source
- 🎯 Tests : >90% coverage adapters

---

## Roadmap Sources

### Phase 1 (✅ Actuel)
- My Little Coupon (Shopify API)

### Phase 2 (1-2 semaines)
- The Fabric Sales (REST API custom)

### Phase 3 (1 mois)
- Recovo (Scraping HTML + GraphQL)

### Phase 4+ (3+ mois)
- Etsy API
- Vestiaire Collective
- Custom suppliers

**Impact Adapter Pattern** :
- Sans : 6h × 10 sources = 60h
- Avec : 2h × 10 sources = 20h
- **Saving : 40h (67%)**

---

## Exemples Future Adapters

### The Fabric Sales Adapter

```typescript
export class TheFabricSalesAdapter implements IProductAdapter {
  
  async fetchProducts(limit: number = 20): Promise<ProductData[]> {
    // REST API custom
    const response = await fetch(`https://api.thefabricsales.com/v1/products`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    
    const data = await response.json();
    return data.items.map(item => this.transform(item));
  }
  
  private transform(raw: TFSProduct): ProductData {
    return {
      id: raw.sku,
      name: raw.product_name,
      description: raw.description_long,
      price: raw.price_eur,
      imageUrl: raw.main_image_url,
      sourceUrl: raw.permalink,
      available: raw.stock_quantity > 0,
      rawData: raw
    };
  }
}
```

### Recovo Adapter (Scraping)

```typescript
export class RecovoAdapter implements IProductAdapter {
  
  async fetchProducts(limit: number = 50): Promise<ProductData[]> {
    // Scraping HTML + GraphQL
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://recovo.co/marketplace');
    
    // Extract GraphQL endpoint
    const products = await page.evaluate(() => {
      return window.__APOLLO_STATE__;
    });
    
    return products.map(p => this.transform(p));
  }
  
  private transform(raw: RecovoProduct): ProductData {
    return {
      id: raw.id,
      name: raw.title,
      description: raw.longDescription,
      price: raw.priceData.amount,
      imageUrl: raw.media[0]?.url,
      sourceUrl: `https://recovo.co/products/${raw.slug}`,
      available: raw.status === 'AVAILABLE',
      rawData: raw
    };
  }
}
```

---

## Extensions Futures

### Adapter avec Rate Limiting

```typescript
export class RateLimitedAdapter implements IProductAdapter {
  
  constructor(
    private adapter: IProductAdapter,
    private maxRequests: number = 10,
    private perSeconds: number = 60
  ) {}
  
  async fetchProducts(limit: number): Promise<ProductData[]> {
    await this.waitIfNeeded();
    return this.adapter.fetchProducts(limit);
  }
}
```

### Adapter avec Retry Logic

```typescript
export class RetryAdapter implements IProductAdapter {
  
  constructor(
    private adapter: IProductAdapter,
    private maxRetries: number = 3
  ) {}
  
  async fetchProducts(limit: number): Promise<ProductData[]> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await this.adapter.fetchProducts(limit);
      } catch (error) {
        if (i === this.maxRetries - 1) throw error;
        await sleep(1000 * (i + 1));
      }
    }
  }
}
```

---

## Références

- **Adapter Pattern** : Gang of Four "Design Patterns"
- **Hexagonal Architecture** : Alistair Cockburn
- **Clean Architecture** : Robert C. Martin
- **API Integration Best Practices** : Martin Fowler

---

## Historique

- **2024-12-28** : Décision initiale, MyLittleCouponAdapter créé
- **Status** : ✅ Accepté et implémenté (source #1)
