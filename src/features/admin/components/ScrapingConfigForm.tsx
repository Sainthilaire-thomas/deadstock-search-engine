'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Play, 
  Save, 
  Eye, 
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Package,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { triggerPreviewScraping, triggerFullScraping, saveScrapingConfig } from '../application/actions';
import { SiteAnalysisCard } from './SiteAnalysisCard';
import { PreviewModal } from './PreviewModal';

// ============================================================================
// TYPES
// ============================================================================

interface SampledStats {
  total: number;
  available: number;
  availablePercent: number;
  withImages: number;
  withPrice: number;
  withWeight: number;
}

interface CollectionDataAnalysis {
  productTypes: { type: string; count: number; percent: number }[];
  topTags: { tag: string; count: number; percent: number }[];
  vendors: { vendor: string; count: number }[];
  priceStats: { min: number; max: number; avg: number; median: number; currency: string } | null;
  weightStats: { hasWeight: number; hasWeightPercent: number; minGrams: number; maxGrams: number; avgGrams: number } | null;
}

interface CollectionData {
  handle: string;
  title: string;
  productsCount: number;
  suggestedRelevant?: boolean;
  suggestedPriority?: 'high' | 'medium' | 'low';
  relevanceReason?: string;
  wasSampled?: boolean;
  sampledStats?: SampledStats;
  dataAnalysis?: CollectionDataAnalysis;
}

interface QualityMetrics {
  hasImages: number;
  hasPrice: number;
  hasTags: number;
  hasDescription: number;
  hasWeight: number;
  hasProductType: number;
  overallScore: number;
}

interface GlobalAnalysis {
  allProductTypes: { type: string; count: number; percent: number }[];
  allTags: { tag: string; count: number; percent: number }[];
  allVendors: { vendor: string; count: number; percent: number }[];
  priceDistribution: {
    under10: number;
    from10to30: number;
    from30to50: number;
    from50to100: number;
    over100: number;
  };
  priceStats: { min: number; max: number; avg: number; median: number; currency: string } | null;
  weightStats: { hasWeight: number; hasWeightPercent: number; minGrams: number; maxGrams: number; avgGrams: number } | null;
  availabilityRate: number;
  deadstockScore: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: {
      hasDeadstockKeywords: boolean;
      hasFabricTypes: boolean;
      priceRangeOk: boolean;
      availabilityGood: boolean;
      dataQualityGood: boolean;
      hasWeightData: boolean;
    };
    recommendations: string[];
  };
}

interface SiteProfile {
  collections: CollectionData[];
  qualityMetrics: QualityMetrics;
  globalAnalysis?: GlobalAnalysis;
  totalCollections: number;
  relevantCollections: number;
  estimatedProducts: number;
  estimatedAvailable?: number;
}

interface ScrapingConfigFormProps {
  siteId: string;
  siteName: string;
  siteUrl?: string;
  profile: SiteProfile;
  currentConfig?: {
    selectedCollections: string[];
    maxProductsPerCollection: number;
    filters: {
      minPrice?: number;
      maxPrice?: number;
      requireImages?: boolean;
      onlyAvailable?: boolean;
    };
  };
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const colors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <span className={`px-1.5 py-0.5 text-xs rounded ${colors[priority]}`}>
      {priority}
    </span>
  );
}

function AvailabilityIndicator({ stats }: { stats?: SampledStats }) {
  if (!stats) return null;

  const percent = stats.availablePercent;
  const color = percent >= 80 ? 'text-green-600' : percent >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <span className={`text-xs ${color} flex items-center gap-1`}>
      <CheckCircle2 className="w-3 h-3" />
      {stats.available}/{stats.total} sampled ({percent}%)
    </span>
  );
}

function CollectionStatsTooltip({ analysis }: { analysis?: CollectionDataAnalysis }) {
  if (!analysis) return null;

  return (
    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
      {analysis.priceStats && (
        <div>💰 {analysis.priceStats.min}€ - {analysis.priceStats.max}€ (avg: {analysis.priceStats.avg}€)</div>
      )}
      {analysis.weightStats && analysis.weightStats.hasWeightPercent > 0 && (
        <div>⚖️ {analysis.weightStats.avgGrams}g avg ({analysis.weightStats.hasWeightPercent}% have weight)</div>
      )}
      {analysis.topTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {analysis.topTags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-1 py-0.5 bg-muted rounded text-xs">{tag.tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ScrapingConfigForm({ 
  siteId, 
  siteName,
  siteUrl,
  profile,
  currentConfig 
}: ScrapingConfigFormProps) {
  // State
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    currentConfig?.selectedCollections || []
  );
  const [maxProducts, setMaxProducts] = useState(
    currentConfig?.maxProductsPerCollection || 100
  );
  const [filters, setFilters] = useState({
    minPrice: currentConfig?.filters?.minPrice,
    maxPrice: currentConfig?.filters?.maxPrice,
    requireImages: currentConfig?.filters?.requireImages ?? true,
    onlyAvailable: currentConfig?.filters?.onlyAvailable ?? true,
  });

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [previewCollection, setPreviewCollection] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalData, setPreviewModalData] = useState<any>(null);
  const [previewModalCollection, setPreviewModalCollection] = useState<{ handle: string; title: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'suggested' | 'not-suggested' | 'sampled'>('all');
  const [sortMode, setSortMode] = useState<'suggested' | 'products' | 'available' | 'alpha'>('suggested');
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Collections data
  const collections = profile.collections || [];

  // Filter and sort collections
  const filteredCollections = useMemo(() => {
    let result = [...collections];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.handle.toLowerCase().includes(query)
      );
    }

    // Category filter
    switch (filterMode) {
      case 'suggested':
        result = result.filter(c => c.suggestedRelevant);
        break;
      case 'not-suggested':
        result = result.filter(c => !c.suggestedRelevant);
        break;
      case 'sampled':
        result = result.filter(c => c.wasSampled);
        break;
    }

    // Sort
    switch (sortMode) {
      case 'suggested':
        result.sort((a, b) => {
          if (a.suggestedRelevant && !b.suggestedRelevant) return -1;
          if (!a.suggestedRelevant && b.suggestedRelevant) return 1;
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const aPriority = priorityOrder[a.suggestedPriority || 'low'];
          const bPriority = priorityOrder[b.suggestedPriority || 'low'];
          if (aPriority !== bPriority) return aPriority - bPriority;
          return b.productsCount - a.productsCount;
        });
        break;
      case 'products':
        result.sort((a, b) => b.productsCount - a.productsCount);
        break;
      case 'available':
        result.sort((a, b) => {
          const aAvail = a.sampledStats?.availablePercent || 0;
          const bAvail = b.sampledStats?.availablePercent || 0;
          return bAvail - aAvail;
        });
        break;
      case 'alpha':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [collections, searchQuery, filterMode, sortMode]);

  // Stats
  const suggestedCount = collections.filter(c => c.suggestedRelevant).length;
  const sampledCount = collections.filter(c => c.wasSampled).length;
  const selectedCount = selectedCollections.length;
  const estimatedSelectedProducts = collections
    .filter(c => selectedCollections.includes(c.handle))
    .reduce((sum, c) => sum + c.productsCount, 0);

  // Handlers
  const toggleCollection = (handle: string) => {
    setSelectedCollections(prev =>
      prev.includes(handle)
        ? prev.filter(h => h !== handle)
        : [...prev, handle]
    );
  };

  const selectAllSuggested = () => {
    const suggestedHandles = collections
      .filter(c => c.suggestedRelevant)
      .map(c => c.handle);
    setSelectedCollections(suggestedHandles);
  };

  const selectAll = () => {
    setSelectedCollections(filteredCollections.map(c => c.handle));
  };

  const deselectAll = () => {
    setSelectedCollections([]);
  };

  const handlePreview = async (handle: string) => {
    // Find collection title
    const collection = collections.find(c => c.handle === handle);
    if (!collection) return;

    // Open modal and start loading
    setPreviewModalCollection({ handle, title: collection.title });
    setPreviewModalOpen(true);
    setPreviewLoading(true);
    setPreviewModalData(null);

    try {
      const result = await triggerPreviewScraping(siteId, handle);
      if (result.success && result.results) {
        setPreviewModalData(result.results);
      } else {
        setMessage({ type: 'error', text: result.error || 'Preview failed' });
        setPreviewModalOpen(false);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setPreviewModalOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePreviewStartScraping = async (handle: string) => {
    setPreviewModalOpen(false);
    
    // Add collection to selection if not already selected
    if (!selectedCollections.includes(handle)) {
      setSelectedCollections(prev => [...prev, handle]);
    }

    // Start scraping for this single collection
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await triggerFullScraping(siteId, {
        collections: [handle],
        maxProductsPerCollection: maxProducts,
      });
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Scraping completed!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Scraping failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await saveScrapingConfig(siteId, {
        selectedCollections,
        maxProductsPerCollection: maxProducts,
        filters,
      });
      if (result.success) {
        setMessage({ type: 'success', text: 'Configuration saved!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Save failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartScraping = async () => {
    if (selectedCollections.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one collection' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await triggerFullScraping(siteId, {
        collections: selectedCollections,
        maxProductsPerCollection: maxProducts,
      });
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Scraping completed!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Scraping failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Site Analysis Card */}
      {showAnalysis && (
        <SiteAnalysisCard
          siteName={siteName}
          totalCollections={profile.totalCollections}
          relevantCollections={profile.relevantCollections}
          estimatedProducts={profile.estimatedProducts}
          estimatedAvailable={profile.estimatedAvailable || 0}
          qualityMetrics={profile.qualityMetrics}
          globalAnalysis={profile.globalAnalysis || null}
        />
      )}

      {/* Toggle Analysis Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAnalysis(!showAnalysis)}
        className="text-muted-foreground"
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        {showAnalysis ? 'Hide' : 'Show'} Site Analysis
      </Button>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Collections Section */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Collections
            <span className="text-sm font-normal text-muted-foreground">
              ({collections.length} total, {suggestedCount} suggested, {sampledCount} sampled)
            </span>
          </h3>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b space-y-3">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter */}
            <Select value={filterMode} onValueChange={(v: any) => setFilterMode(v)}>
              <SelectTrigger className="w-45">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({collections.length})</SelectItem>
                <SelectItem value="suggested">Suggested ({suggestedCount})</SelectItem>
                <SelectItem value="not-suggested">Not Suggested ({collections.length - suggestedCount})</SelectItem>
                <SelectItem value="sampled">Sampled ({sampledCount})</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortMode} onValueChange={(v: any) => setSortMode(v)}>
              <SelectTrigger className="w-45">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suggested">Suggested First</SelectItem>
                <SelectItem value="products">Most Products</SelectItem>
                <SelectItem value="available">Best Availability</SelectItem>
                <SelectItem value="alpha">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={selectAllSuggested}>
              <Sparkles className="w-4 h-4 mr-1" />
              Select Suggested ({suggestedCount})
            </Button>
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All Visible ({filteredCollections.length})
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
          </div>

          {/* Selection Summary */}
          <div className="text-sm text-muted-foreground">
            <strong>{selectedCount}</strong> collections selected
            {selectedCount > 0 && (
              <span> • ~<strong>{estimatedSelectedProducts.toLocaleString()}</strong> estimated products</span>
            )}
          </div>
        </div>

        {/* Collections List */}
        <div className="max-h-125 overflow-y-auto">
          {filteredCollections.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No collections match your filters
            </div>
          ) : (
            <div className="divide-y">
              {filteredCollections.map((collection) => {
                const isSelected = selectedCollections.includes(collection.handle);
                const isPreviewing = previewCollection === collection.handle;

                return (
                  <div
                    key={collection.handle}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                    onClick={() => toggleCollection(collection.handle)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleCollection(collection.handle)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{collection.title}</span>
                          
                          {collection.suggestedRelevant && (
                            <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Suggested
                            </span>
                          )}
                          
                          {collection.suggestedPriority && collection.suggestedRelevant && (
                            <PriorityBadge priority={collection.suggestedPriority} />
                          )}

                          {collection.wasSampled && (
                            <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              Sampled
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{collection.productsCount.toLocaleString()} products</span>
                          
                          {collection.sampledStats && (
                            <AvailabilityIndicator stats={collection.sampledStats} />
                          )}
                        </div>

                        {collection.relevanceReason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {collection.relevanceReason}
                          </p>
                        )}

                        {/* Show detailed stats for sampled collections */}
                        {collection.wasSampled && collection.dataAnalysis && (
                          <CollectionStatsTooltip analysis={collection.dataAnalysis} />
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(collection.handle);
                        }}
                        disabled={isLoading}
                      >
                        {isPreviewing ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Scraping Options */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="font-semibold">Scraping Options</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxProducts">Max products per collection</Label>
            <Input
              id="maxProducts"
              type="number"
              value={maxProducts}
              onChange={(e) => setMaxProducts(parseInt(e.target.value) || 100)}
              min={1}
              max={10000}
            />
          </div>

          <div className="space-y-2">
            <Label>Price Range (€)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters(f => ({ ...f, minPrice: parseFloat(e.target.value) || undefined }))}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters(f => ({ ...f, maxPrice: parseFloat(e.target.value) || undefined }))}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.requireImages}
              onCheckedChange={(checked) => setFilters(f => ({ ...f, requireImages: !!checked }))}
            />
            <span className="text-sm">Require images</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={filters.onlyAvailable}
              onCheckedChange={(checked) => setFilters(f => ({ ...f, onlyAvailable: !!checked }))}
            />
            <span className="text-sm">Only available (in stock)</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleSaveConfig} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          Save Config
        </Button>

        <Button 
          onClick={handleStartScraping} 
          disabled={isLoading || selectedCollections.length === 0}
          className="flex-1"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Scraping ({selectedCount} collections)
        </Button>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        collectionTitle={previewModalCollection?.title || ''}
        collectionHandle={previewModalCollection?.handle || ''}
        previewData={previewModalData}
        isLoading={previewLoading}
        onStartScraping={handlePreviewStartScraping}
        siteUrl={siteUrl}
      />
    </div>
  );
}
