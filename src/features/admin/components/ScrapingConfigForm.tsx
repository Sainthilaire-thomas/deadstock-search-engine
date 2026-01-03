// src/features/admin/components/ScrapingConfigForm.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { updateSite, triggerPreviewScraping, triggerFullScraping } from '@/features/admin/application/actions';
import { toast } from 'sonner';
import { Loader2, Save, Play, Eye, Sparkles, Package, Filter } from 'lucide-react';
import type { SiteProfile, ScrapingConfig } from '@/features/admin/domain/types';

// Type pour les collections du nouveau discoveryService
type CollectionData = {
  handle: string;
  title: string;
  productsCount: number;
  suggestedRelevant: boolean;
  suggestedPriority: 'high' | 'medium' | 'low';
  relevanceReason?: string;
  wasSampled: boolean;
  sampleProductsCount?: number;
};

interface ScrapingConfigFormProps {
  siteId: string;
  profile: SiteProfile;
  currentConfig: ScrapingConfig | null;
}

type SortOption = 'suggested' | 'products' | 'alpha';
type FilterOption = 'all' | 'suggested' | 'not-suggested';

export function ScrapingConfigForm({ siteId, profile, currentConfig }: ScrapingConfigFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // Collections disponibles depuis le profile
  const rawCollections = (profile.collections as CollectionData[]) || [];

  // Tri et filtrage
  const [sortBy, setSortBy] = useState<SortOption>('suggested');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Collections filtrées et triées
  const availableCollections = useMemo(() => {
    let filtered = [...rawCollections];

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.handle.toLowerCase().includes(query)
      );
    }

    // Filtre par suggestion
    if (filterBy === 'suggested') {
      filtered = filtered.filter(c => c.suggestedRelevant);
    } else if (filterBy === 'not-suggested') {
      filtered = filtered.filter(c => !c.suggestedRelevant);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'suggested':
          // Suggested first, then by priority, then by products count
          if (a.suggestedRelevant !== b.suggestedRelevant) {
            return a.suggestedRelevant ? -1 : 1;
          }
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          if (a.suggestedPriority !== b.suggestedPriority) {
            return priorityOrder[a.suggestedPriority] - priorityOrder[b.suggestedPriority];
          }
          return b.productsCount - a.productsCount;
        case 'products':
          return b.productsCount - a.productsCount;
        case 'alpha':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [rawCollections, sortBy, filterBy, searchQuery]);

  // État du formulaire
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    currentConfig?.collections || []
  );
  const [config, setConfig] = useState<ScrapingConfig>({
    collections: currentConfig?.collections || [],
    maxProductsPerCollection: currentConfig?.maxProductsPerCollection || 100,
    filters: {
      onlyAvailable: currentConfig?.filters?.onlyAvailable ?? true,
      requireImages: currentConfig?.filters?.requireImages ?? true,
      requirePrice: currentConfig?.filters?.requirePrice ?? true,
      priceRange: currentConfig?.filters?.priceRange || { min: 5, max: 100 },
    },
  });

  // Calcul du total estimé
  const estimatedTotal = useMemo(() => {
    return selectedCollections.reduce((sum, handle) => {
      const collection = rawCollections.find(c => c.handle === handle);
      return sum + (collection?.productsCount || 0);
    }, 0);
  }, [selectedCollections, rawCollections]);

  const handleCollectionToggle = (collectionHandle: string) => {
    setSelectedCollections(prev => {
      if (prev.includes(collectionHandle)) {
        return prev.filter(h => h !== collectionHandle);
      } else {
        return [...prev, collectionHandle];
      }
    });
  };

  const handleSelectAllSuggested = () => {
    const suggestedHandles = rawCollections
      .filter(c => c.suggestedRelevant)
      .map(c => c.handle);
    setSelectedCollections(suggestedHandles);
  };

  const handleClearSelection = () => {
    setSelectedCollections([]);
  };

  const handleSaveConfig = async () => {
    if (selectedCollections.length === 0) {
      toast.error('Please select at least one collection');
      return;
    }

    setIsSaving(true);
    try {
      const updatedConfig = {
        ...config,
        collections: selectedCollections,
      };

      const result = await updateSite(siteId, {
        scraping_config: updatedConfig,
      });

      if (result.success) {
        toast.success('Configuration saved successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to save configuration');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    if (selectedCollections.length === 0) {
      toast.error('Please select at least one collection');
      return;
    }

    setIsPreviewing(true);
    try {
      const result = await triggerPreviewScraping(siteId, selectedCollections[0]);

      if (result.success) {
        toast.success(result.message || 'Preview completed!');
      } else {
        toast.error(result.error || 'Preview failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleStartScraping = async () => {
    if (selectedCollections.length === 0) {
      toast.error('Please select at least one collection');
      return;
    }

    setIsScraping(true);
    try {
      const scrapingConfig = {
        collections: selectedCollections,
        maxProductsPerCollection: config.maxProductsPerCollection,
      };

      const result = await triggerFullScraping(siteId, scrapingConfig);

      if (result.success) {
        toast.success(result.message || 'Scraping started!');
        router.push(`/admin/sites/${siteId}`);
        router.refresh();
      } else {
        toast.error(result.error || 'Scraping failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsScraping(false);
    }
  };

  // Priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Collections Selection */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Select Collections to Scrape</CardTitle>
              <CardDescription>
                {rawCollections.length} collections available • {rawCollections.filter(c => c.suggestedRelevant).length} suggested as relevant
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAllSuggested}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Select Suggested
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleClearSelection}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">All ({rawCollections.length})</option>
                <option value="suggested">Suggested ({rawCollections.filter(c => c.suggestedRelevant).length})</option>
                <option value="not-suggested">Not Suggested ({rawCollections.filter(c => !c.suggestedRelevant).length})</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="suggested">Sort: Suggested First</option>
                <option value="products">Sort: Most Products</option>
                <option value="alpha">Sort: A-Z</option>
              </select>
            </div>
          </div>

          {/* Collections List */}
          <div className="space-y-2 max-h-125 overflow-y-auto">
            {availableCollections.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {searchQuery ? 'No collections match your search' : 'No collections found in profile'}
              </p>
            ) : (
              availableCollections.map((collection) => (
                <div
                  key={collection.handle}
                  className={`flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                    selectedCollections.includes(collection.handle) 
                      ? 'border-primary bg-primary/5' 
                      : ''
                  }`}
                  onClick={() => handleCollectionToggle(collection.handle)}
                >
                  <Checkbox
                    id={collection.handle}
                    checked={selectedCollections.includes(collection.handle)}
                    onCheckedChange={() => handleCollectionToggle(collection.handle)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Label
                        htmlFor={collection.handle}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {collection.title}
                      </Label>
                      {collection.suggestedRelevant && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Suggested
                        </Badge>
                      )}
                      <Badge className={`text-xs ${getPriorityColor(collection.suggestedPriority)}`}>
                        {collection.suggestedPriority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {collection.productsCount.toLocaleString()} products
                      </span>
                      <span className="text-xs">
                        {collection.handle}
                      </span>
                    </div>
                    {collection.relevanceReason && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {collection.relevanceReason}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selection Summary */}
          {selectedCollections.length > 0 && (
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {selectedCollections.length} collection(s) selected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ~{estimatedTotal.toLocaleString()} estimated products
                  </p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {estimatedTotal.toLocaleString()}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scraping Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Scraping Parameters
          </CardTitle>
          <CardDescription>
            Configure limits and filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Max Products */}
          <div className="space-y-2">
            <Label htmlFor="maxProducts">Max Products per Collection</Label>
            <Input
              id="maxProducts"
              type="number"
              min="1"
              max="1000"
              value={config.maxProductsPerCollection}
              onChange={(e) => setConfig({
                ...config,
                maxProductsPerCollection: parseInt(e.target.value) || 100,
              })}
            />
            <p className="text-xs text-muted-foreground">
              Limit the number of products scraped per collection
            </p>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range (€)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  placeholder="Min"
                  value={config.filters?.priceRange?.min || 0}
                  onChange={(e) => setConfig({
                    ...config,
                    filters: {
                      ...config.filters,
                      priceRange: {
                        ...config.filters?.priceRange,
                        min: parseInt(e.target.value) || 0,
                        max: config.filters?.priceRange?.max || 100,
                      },
                    },
                  })}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max"
                  value={config.filters?.priceRange?.max || 100}
                  onChange={(e) => setConfig({
                    ...config,
                    filters: {
                      ...config.filters,
                      priceRange: {
                        min: config.filters?.priceRange?.min || 0,
                        max: parseInt(e.target.value) || 100,
                      },
                    },
                  })}
                />
              </div>
            </div>
          </div>

          {/* Filters Checkboxes */}
          <div className="space-y-3">
            <Label>Filters</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="onlyAvailable"
                checked={config.filters?.onlyAvailable ?? true}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  filters: {
                    ...config.filters,
                    onlyAvailable: checked === true,
                  },
                })}
              />
              <Label htmlFor="onlyAvailable" className="text-sm font-normal cursor-pointer">
                Only available products (in stock)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requireImages"
                checked={config.filters?.requireImages ?? true}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  filters: {
                    ...config.filters,
                    requireImages: checked === true,
                  },
                })}
              />
              <Label htmlFor="requireImages" className="text-sm font-normal cursor-pointer">
                Require product images
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requirePrice"
                checked={config.filters?.requirePrice ?? true}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  filters: {
                    ...config.filters,
                    requirePrice: checked === true,
                  },
                })}
              />
              <Label htmlFor="requirePrice" className="text-sm font-normal cursor-pointer">
                Require price information
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSaveConfig}
              disabled={isSaving || selectedCollections.length === 0}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Configuration
            </Button>

            <Button
              variant="secondary"
              onClick={handlePreview}
              disabled={isPreviewing || selectedCollections.length === 0}
            >
              {isPreviewing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              Preview (10 products)
            </Button>

            <Button
              variant="default"
              onClick={handleStartScraping}
              disabled={isScraping || selectedCollections.length === 0}
            >
              {isScraping ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Start Full Scraping
            </Button>
          </div>

          {selectedCollections.length === 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              Please select at least one collection to continue
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
