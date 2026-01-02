// src/features/admin/components/ScrapingConfigForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { updateSite, triggerPreviewScraping, triggerFullScraping } from '@/features/admin/application/actions';
import { toast } from 'sonner';
import { Loader2, Save, Play, Eye } from 'lucide-react';
import type { SiteProfile, ScrapingConfig } from '@/features/admin/domain/types';

// Type helper pour les collections
type Collection = {
  handle: string;
  title?: string;
  productCount?: number;
};

interface ScrapingConfigFormProps {
  siteId: string;
  profile: SiteProfile;
  currentConfig: ScrapingConfig | null;
}

export function ScrapingConfigForm({ siteId, profile, currentConfig }: ScrapingConfigFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // Collections disponibles depuis le profile
 const availableCollections = (profile.collections as Collection[]) || [];
  
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

  const handleCollectionToggle = (collectionHandle: string) => {
    setSelectedCollections(prev => {
      if (prev.includes(collectionHandle)) {
        return prev.filter(h => h !== collectionHandle);
      } else {
        return [...prev, collectionHandle];
      }
    });
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

  return (
    <div className="space-y-6">
      {/* Collections Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Collections to Scrape</CardTitle>
          <CardDescription>
            Choose which collections should be scraped
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableCollections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No collections found in profile</p>
          ) : (
            availableCollections.map((collection: any) => (
              <div
                key={collection.handle}
                className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <Checkbox
                  id={collection.handle}
                  checked={selectedCollections.includes(collection.handle)}
                  onCheckedChange={() => handleCollectionToggle(collection.handle)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={collection.handle}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {collection.title || collection.handle}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {collection.productCount || 0} products • Handle: {collection.handle}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {selectedCollections.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium">
                {selectedCollections.length} collection(s) selected
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scraping Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Scraping Parameters</CardTitle>
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
