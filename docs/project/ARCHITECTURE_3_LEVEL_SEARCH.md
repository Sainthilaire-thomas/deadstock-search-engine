# 🔍 Architecture Technique : Recherche à 3 Niveaux

**Document** : Spécification technique système de recherche
**Date** : 1 Janvier 2026
**Version** : 1.0
**Statut** : Draft - Architecture Phase 2

---

## 🎯 Vue d'Ensemble

### Concept Fondamental

Notre système de recherche implémente une **cascade intelligente** à 3 niveaux pour maximiser les chances de trouver le textile parfait :

```
NIVEAU 1: Search Database (instantané, <500ms)
   ↓ Si insuffisant (<3 résultats)
NIVEAU 2: Smart Discovery Live (temps réel, 15-30s)
   ↓ Si toujours rien
NIVEAU 3: Marketplace Inversée (asynchrone, heures/jours)
```

**Objectif** : Garantir un taux de succès 95%+ vs 40% plateformes traditionnelles

---

## 📊 Niveau 1 : Database Search

### Description

Recherche classique dans le catalogue indexé (produits déjà scrappés et normalisés).

### Architecture

```typescript
// Service de recherche DB
class DatabaseSearchService {
  async search(query: SearchQuery): Promise<SearchResult> {
    const filters = this.buildFilters(query);
    
    const results = await supabase
      .from('textiles')
      .select('*')
      .or(this.buildTextSearch(query.keywords))
      .filter('material_type', 'in', query.materials || [])
      .filter('color', 'in', query.colors || [])
      .filter('pattern', 'in', query.patterns || [])
      .gte('quantity_value', query.minQuantity || 0)
      .gte('price_value', query.minPrice || 0)
      .lte('price_value', query.maxPrice || 999999)
      .order('search_rank', { ascending: false })
      .limit(50);
    
    return {
      level: 1,
      method: 'database',
      results: results.data || [],
      count: results.data?.length || 0,
      executionTime: performance.now() - start,
    };
  }
  
  private buildTextSearch(keywords: string): string {
    // Full-text search sur colonnes indexées
    return `search_vector.fts.${keywords.split(' ').join('&')}`;
  }
}
```

### Performance

**Cibles** :
- Latence : <500ms (p95)
- Throughput : 100+ req/s
- Cache hit rate : 40%+

**Optimisations** :
- Indexes GIN sur search_vector
- Materialized views pour filtres populaires
- Redis cache pour queries fréquentes
- CDN pour images

---

## 🚀 Niveau 2 : Smart Discovery Live

### Description

Scraping temps réel ciblé sur sites découverts quand résultats DB insuffisants.

### Flow Utilisateur

```
1. User cherche "soie bleue 5m"
2. DB search → 1 résultat (insuffisant)
3. UI affiche : "Chercher sur les sites sources ? (15-30s)"
4. User clique "Oui, chercher"
5. Loading indicator avec progress
6. Résultats live s'affichent progressivement
7. Option "Indexer ces produits pour autres designers"
```

### Architecture

```typescript
class SmartDiscoveryService {
  async searchLive(query: SearchQuery, user: User): Promise<LiveSearchResult> {
    // 1. Vérifier permissions
    if (!this.canUseLiveSearch(user)) {
      throw new Error('Live search requires premium tier');
    }
    
    // 2. Sélectionner sites pertinents
    const targetSites = await this.selectRelevantSites(query);
    
    // 3. Scraping parallèle avec timeout
    const scrapingPromises = targetSites.map(site => 
      this.scrapeSiteLive(site, query)
        .catch(err => ({ site, error: err, results: [] }))
    );
    
    // 4. Race avec timeout global
    const results = await Promise.race([
      Promise.all(scrapingPromises),
      this.timeout(30000), // 30s max
    ]);
    
    // 5. Normaliser résultats
    const normalized = await this.normalizeResults(results);
    
    // 6. Optionally index
    if (user.preferences.autoIndex) {
      await this.indexResultsAsync(normalized);
    }
    
    // 7. Décrémenter quota
    await this.decrementLiveSearchQuota(user);
    
    return {
      level: 2,
      method: 'live_scraping',
      results: normalized,
      sitesSearched: targetSites.length,
      executionTime: performance.now() - start,
    };
  }
  
  private async selectRelevantSites(query: SearchQuery): Promise<Site[]> {
    const allSites = await this.getSitesFromCache();
    
    return allSites
      .filter(site => {
        // Sites actifs uniquement
        if (site.status !== 'active') return false;
        
        // Sites pas scrappés récemment (>7 jours)
        if (this.daysSinceLastScrape(site) < 7) return false;
        
        // Sites avec quality score suffisant
        if (site.quality_score < 70) return false;
        
        // Sites pertinents pour la query (keywords matching)
        const relevance = this.calculateRelevance(site, query);
        return relevance > 0.5;
      })
      .sort((a, b) => b.quality_score - a.quality_score)
      .slice(0, 5); // Max 5 sites en parallèle
  }
  
  private async scrapeSiteLive(
    site: Site, 
    query: SearchQuery
  ): Promise<ScrapingResult> {
    // Build query string pour Shopify API
    const shopifyQuery = this.buildShopifyQuery(query);
    
    // Fetch products via Shopify API
    const response = await fetch(
      `${site.url}/products.json?${shopifyQuery}&limit=50`,
      {
        headers: { 'User-Agent': 'DeadstockSearchBot/1.0' },
        signal: AbortSignal.timeout(15000), // 15s per site
      }
    );
    
    const data = await response.json();
    
    return {
      site: site.url,
      products: data.products || [],
      fetchedAt: new Date(),
    };
  }
  
  private buildShopifyQuery(query: SearchQuery): URLSearchParams {
    const params = new URLSearchParams();
    
    // Keywords
    if (query.keywords) {
      params.set('q', query.keywords);
    }
    
    // Material tag filter (si Shopify support)
    if (query.materials?.length) {
      const tagFilter = query.materials
        .map(m => `tag:${m}`)
        .join(' OR ');
      params.set('tag', tagFilter);
    }
    
    return params;
  }
  
  private async normalizeResults(
    results: ScrapingResult[]
  ): Promise<NormalizedProduct[]> {
    const allProducts = results.flatMap(r => r.products);
    
    // Utiliser le système de normalisation existant
    const normalized = await Promise.all(
      allProducts.map(async product => {
        const terms = extractTerms(product);
        const normalizedTerms = await normalizationService.normalize(terms);
        
        return {
          ...product,
          material_type: normalizedTerms.material,
          color: normalizedTerms.color,
          pattern: normalizedTerms.pattern,
          source_platform: product.vendor || 'unknown',
          scraped_at: new Date(),
          is_live_result: true, // Flag pour UI
        };
      })
    );
    
    return normalized;
  }
  
  private async indexResultsAsync(
    products: NormalizedProduct[]
  ): Promise<void> {
    // Background job pour indexer sans bloquer réponse
    await queue.add('index-live-results', {
      products,
      priority: 'low',
    });
  }
}
```

### Gestion Quotas

```typescript
interface UserQuotas {
  tier: 'free' | 'premium' | 'studio' | 'enterprise';
  liveSearchesPerDay: number;
  liveSearchesUsed: number;
  resetAt: Date;
}

const QUOTAS = {
  free: 0,        // Pas de live search
  premium: 3,     // 3 par jour
  studio: 999,    // Illimité
  enterprise: 999 // Illimité
};

class QuotaManager {
  async canUseLiveSearch(user: User): Promise<boolean> {
    const quota = await this.getQuota(user);
    
    if (quota.liveSearchesUsed >= QUOTAS[user.tier]) {
      return false;
    }
    
    return true;
  }
  
  async decrementQuota(user: User): Promise<void> {
    await supabase.rpc('decrement_live_search_quota', {
      user_id: user.id
    });
  }
  
  async resetQuotas(): Promise<void> {
    // Cron job quotidien
    await supabase
      .from('user_quotas')
      .update({ 
        liveSearchesUsed: 0,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      })
      .lt('resetAt', new Date());
  }
}
```

### UI/UX Niveau 2

```typescript
// Component React
function SearchResults({ query }: { query: SearchQuery }) {
  const [dbResults, setDbResults] = useState<Product[]>([]);
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [liveSearchProgress, setLiveSearchProgress] = useState(0);
  
  useEffect(() => {
    // Toujours chercher DB d'abord
    searchDatabase(query).then(setDbResults);
  }, [query]);
  
  const handleLiveSearch = async () => {
    setIsLiveSearching(true);
    
    try {
      const result = await searchLive(query, {
        onProgress: (progress) => setLiveSearchProgress(progress),
      });
      
      setLiveResults(result.results);
      
      // Analytics
      track('live_search_completed', {
        resultsFound: result.results.length,
        sitesSearched: result.sitesSearched,
        executionTime: result.executionTime,
      });
    } catch (error) {
      toast.error('Erreur lors de la recherche live');
    } finally {
      setIsLiveSearching(false);
    }
  };
  
  return (
    <div>
      {/* Résultats DB */}
      <SearchGrid results={dbResults} label="Catalogue indexé" />
      
      {/* Call-to-action Live Search si insuffisant */}
      {dbResults.length < 3 && !isLiveSearching && (
        <Card className="mt-4 p-6 bg-blue-50">
          <h3>Pas assez de résultats ?</h3>
          <p>Chercher sur les sites sources en temps réel (15-30s)</p>
          <Button onClick={handleLiveSearch} className="mt-4">
            🔍 Lancer recherche live
          </Button>
          <p className="text-xs mt-2 text-gray-600">
            {user.liveSearchesLeft} recherches restantes aujourd'hui
          </p>
        </Card>
      )}
      
      {/* Progress live search */}
      {isLiveSearching && (
        <Card className="mt-4 p-6">
          <div className="flex items-center gap-4">
            <Spinner />
            <div className="flex-1">
              <p className="font-medium">Recherche en cours...</p>
              <Progress value={liveSearchProgress} className="mt-2" />
              <p className="text-xs text-gray-600 mt-1">
                {liveSearchProgress}% - Analyse des sites sources
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Résultats live */}
      {liveResults.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Résultats live ({liveResults.length})
            </h2>
            <Badge variant="secondary">🔥 Ajoutés récemment</Badge>
          </div>
          <SearchGrid results={liveResults} label="Trouvés en live" />
        </div>
      )}
    </div>
  );
}
```

### Performance & Coûts

**Cibles** :
- Latence : 15-30s (dépend nb sites)
- Success rate : 80%+ (trouve au moins 1 résultat)
- Timeout per site : 15s max
- Timeout global : 30s max

**Coûts** :
- Requests API Shopify : ~5 par site = 25 requests max
- Compute : ~0.01€ per search
- Quota premium : 3/jour = ~0.03€/user/jour
- Acceptable pour tier €19/mois

---

## 🔄 Niveau 3 : Marketplace Inversée

### Description

Système asynchrone où designers postent demandes et fournisseurs répondent avec propositions.

### Architecture

```typescript
// Domain model
interface TextileRequest {
  id: string;
  user_id: string;
  status: 'draft' | 'published' | 'closed';
  
  // Critères recherche
  material_types: string[];
  colors: string[];
  patterns?: string[];
  min_quantity: number;
  max_price_per_meter?: number;
  
  // Contexte
  description: string;
  deadline?: Date;
  location_preference?: string;
  certifications_required?: string[];
  
  // Tracking
  created_at: Date;
  published_at?: Date;
  expires_at?: Date;
  
  // Stats
  views_count: number;
  proposals_count: number;
}

interface SupplierProposal {
  id: string;
  request_id: string;
  supplier_id: string;
  
  // Offre
  product_name: string;
  product_url?: string;
  material_type: string;
  color: string;
  quantity_available: number;
  price_per_meter: number;
  
  // Détails
  description: string;
  images: string[];
  certifications?: string[];
  delivery_time_days: number;
  minimum_order?: number;
  
  // Statut
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
}

// Service
class MarketplaceService {
  async createRequest(
    userId: string, 
    data: CreateRequestInput
  ): Promise<TextileRequest> {
    // 1. Créer demande
    const request = await supabase
      .from('textile_requests')
      .insert({
        user_id: userId,
        status: 'draft',
        ...data,
      })
      .select()
      .single();
    
    return request.data;
  }
  
  async publishRequest(requestId: string): Promise<void> {
    // 1. Publier demande
    await supabase
      .from('textile_requests')
      .update({
        status: 'published',
        published_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      })
      .eq('id', requestId);
    
    // 2. Notifier fournisseurs pertinents
    const relevantSuppliers = await this.findRelevantSuppliers(requestId);
    
    await Promise.all(
      relevantSuppliers.map(supplier =>
        this.notifySupplier(supplier, requestId)
      )
    );
  }
  
  private async findRelevantSuppliers(
    requestId: string
  ): Promise<Supplier[]> {
    const request = await this.getRequest(requestId);
    
    // Matching intelligent basé sur :
    // - Materials disponibles (tags produits indexés)
    // - Location proximity
    // - Quality score fournisseur
    // - Historique réponses (response rate)
    
    return supabase
      .from('suppliers')
      .select('*')
      .contains('materials_available', request.material_types)
      .gte('quality_score', 70)
      .gte('response_rate', 0.5)
      .order('quality_score', { ascending: false })
      .limit(20);
  }
  
  private async notifySupplier(
    supplier: Supplier,
    requestId: string
  ): Promise<void> {
    // Email notification
    await sendEmail({
      to: supplier.email,
      template: 'new-textile-request',
      data: { requestId },
    });
    
    // In-app notification
    await supabase
      .from('notifications')
      .insert({
        user_id: supplier.user_id,
        type: 'new_request',
        content: `Nouvelle demande textile matching votre inventaire`,
        link: `/supplier/requests/${requestId}`,
      });
  }
  
  async createProposal(
    supplierId: string,
    requestId: string,
    data: CreateProposalInput
  ): Promise<SupplierProposal> {
    const proposal = await supabase
      .from('supplier_proposals')
      .insert({
        request_id: requestId,
        supplier_id: supplierId,
        status: 'pending',
        ...data,
      })
      .select()
      .single();
    
    // Notifier designer
    await this.notifyDesignerNewProposal(requestId, proposal.data);
    
    return proposal.data;
  }
}
```

### UI Flow Designer

```typescript
// 1. Créer demande
function CreateRequestPage() {
  return (
    <Form onSubmit={handleSubmit}>
      <h1>Poster une demande textile</h1>
      
      <FormField label="Type de matière">
        <MultiSelect options={MATERIALS} />
      </FormField>
      
      <FormField label="Couleur souhaitée">
        <ColorPicker />
      </FormField>
      
      <FormField label="Quantité minimale">
        <Input type="number" suffix="m" />
      </FormField>
      
      <FormField label="Budget maximum">
        <Input type="number" suffix="€/m" />
      </FormField>
      
      <FormField label="Description détaillée">
        <Textarea 
          placeholder="Ex: Je cherche un lin bio écru pour une collection de robes été..."
        />
      </FormField>
      
      <FormField label="Deadline">
        <DatePicker />
      </FormField>
      
      <Button type="submit">Publier demande</Button>
    </Form>
  );
}

// 2. Suivre demande
function RequestDetailPage({ requestId }: { requestId: string }) {
  const { request, proposals } = useRequest(requestId);
  
  return (
    <div>
      <RequestSummary request={request} />
      
      <ProposalsList>
        {proposals.map(proposal => (
          <ProposalCard 
            key={proposal.id}
            proposal={proposal}
            onAccept={() => handleAcceptProposal(proposal.id)}
            onReject={() => handleRejectProposal(proposal.id)}
          />
        ))}
      </ProposalsList>
      
      {proposals.length === 0 && (
        <EmptyState>
          <p>Aucune proposition pour le moment</p>
          <p className="text-sm text-gray-600">
            Les fournisseurs ont été notifiés. 
            Vous recevrez un email dès qu'une proposition arrive.
          </p>
        </EmptyState>
      )}
    </div>
  );
}
```

### UI Flow Fournisseur

```typescript
function SupplierRequestsPage() {
  const { requests } = useMatchingRequests();
  
  return (
    <div>
      <h1>Demandes de textiles</h1>
      
      <RequestsList>
        {requests.map(request => (
          <RequestCard 
            key={request.id}
            request={request}
            matchScore={calculateMatchScore(request)}
            onViewDetails={() => navigate(`/requests/${request.id}`)}
          />
        ))}
      </RequestsList>
    </div>
  );
}

function CreateProposalPage({ requestId }: { requestId: string }) {
  return (
    <Form onSubmit={handleSubmit}>
      <h1>Proposer un textile</h1>
      
      <FormField label="Produit">
        <Input placeholder="Nom du produit" />
      </FormField>
      
      <FormField label="Prix">
        <Input type="number" suffix="€/m" />
      </FormField>
      
      <FormField label="Quantité disponible">
        <Input type="number" suffix="m" />
      </FormField>
      
      <FormField label="Délai de livraison">
        <Input type="number" suffix="jours" />
      </FormField>
      
      <FormField label="Photos">
        <ImageUpload multiple max={5} />
      </FormField>
      
      <FormField label="Description">
        <Textarea />
      </FormField>
      
      <Button type="submit">Envoyer proposition</Button>
    </Form>
  );
}
```

---

## 🎯 Orchestration : Cascade Intelligente

### Service Principal

```typescript
class SmartTextileSearchOrchestrator {
  async search(
    query: SearchQuery,
    user: User,
    options: SearchOptions = {}
  ): Promise<CascadeSearchResult> {
    const startTime = Date.now();
    
    // NIVEAU 1: Database (toujours)
    const dbResults = await this.databaseSearch.search(query);
    
    // Décision : continuer cascade ?
    const needsLevel2 = this.shouldTriggerLevel2(dbResults, user, options);
    
    if (!needsLevel2) {
      return {
        level: 1,
        results: dbResults.results,
        suggestions: this.generateSuggestions(dbResults, query),
        executionTime: Date.now() - startTime,
      };
    }
    
    // NIVEAU 2: Live Discovery
    if (this.canUseLiveSearch(user)) {
      const liveResults = await this.smartDiscovery.searchLive(query, user);
      
      const combinedResults = this.mergeResults(
        dbResults.results,
        liveResults.results
      );
      
      const needsLevel3 = this.shouldTriggerLevel3(combinedResults, query);
      
      if (!needsLevel3) {
        return {
          level: 2,
          results: combinedResults,
          sitesSearched: liveResults.sitesSearched,
          executionTime: Date.now() - startTime,
        };
      }
    }
    
    // NIVEAU 3: Marketplace (suggestion)
    return {
      level: 3,
      results: dbResults.results, // Afficher ce qu'on a trouvé
      suggestion: {
        type: 'create_request',
        message: 'Aucun résultat correspondant. Poster une demande aux fournisseurs ?',
        action: 'create_textile_request',
      },
      executionTime: Date.now() - startTime,
    };
  }
  
  private shouldTriggerLevel2(
    dbResults: SearchResult,
    user: User,
    options: SearchOptions
  ): boolean {
    // Critères déclenchement Level 2
    return (
      // Résultats insuffisants
      dbResults.count < 3 &&
      // User a le droit
      this.canUseLiveSearch(user) &&
      // Pas de force DB only
      !options.dbOnly &&
      // User a activé auto-live (ou manuel)
      (user.preferences.autoLiveSearch || options.enableLive)
    );
  }
  
  private shouldTriggerLevel3(
    results: Product[],
    query: SearchQuery
  ): boolean {
    // Déclencher marketplace si vraiment rien
    return results.length === 0;
  }
  
  private mergeResults(
    dbResults: Product[],
    liveResults: Product[]
  ): Product[] {
    // Merge + déduplicate + rank
    const allResults = [...dbResults, ...liveResults];
    
    // Déduplication par source_url
    const unique = Array.from(
      new Map(
        allResults.map(p => [p.source_url, p])
      ).values()
    );
    
    // Ranking : DB results en premier (plus fiables)
    return unique.sort((a, b) => {
      if (a.is_live_result && !b.is_live_result) return 1;
      if (!a.is_live_result && b.is_live_result) return -1;
      return b.search_rank - a.search_rank;
    });
  }
}
```

---

## 📊 Métriques & Monitoring

### KPIs à Tracker

```typescript
interface SearchMetrics {
  // Distribution niveaux
  level1_searches: number;      // DB only
  level2_searches: number;      // + Live
  level3_suggestions: number;   // Marketplace suggested
  level3_conversions: number;   // Actually posted request
  
  // Success rates
  level1_success_rate: number;  // Found >=1 result
  level2_success_rate: number;  // Found >=1 result in live
  level3_response_rate: number; // % requests with proposals
  
  // Performance
  level1_latency_p95: number;   // ms
  level2_latency_p95: number;   // ms
  level2_timeout_rate: number;  // %
  
  // Business
  live_searches_quota_usage: number;  // Premium feature usage
  marketplace_gmv: number;            // Transaction value
}

// Analytics event
track('search_completed', {
  level: result.level,
  resultsFound: result.results.length,
  executionTime: result.executionTime,
  query: sanitize(query),
  userId: user.id,
  tier: user.tier,
});
```

---

## 🚀 Roadmap Implémentation

### Phase 1 (Actuel) : DB Only
- ✅ Search database
- ✅ Filtres
- ✅ Normalisation
- ❌ Pas de Level 2/3

### Phase 2 (M4-M6) : + Smart Discovery
- 🎯 Implémenter scraping on-demand
- 🎯 Quota system
- 🎯 UI/UX live search
- 🎯 Analytics Level 2
- ❌ Pas encore marketplace

### Phase 3 (M6-M9) : + Marketplace
- 🎯 Request/Proposal models
- 🎯 Notification system
- 🎯 Supplier matching
- 🎯 UI Designer + Supplier
- 🎯 Analytics Level 3

---

**Document** : Architecture 3 Niveaux Recherche  
**Statut** : Draft  
**Prochaine révision** : Début Phase 2 (M4)
