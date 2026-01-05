'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Play,
  ImageIcon,
  DollarSign,
  Scale,
  Tag,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  compare_at_price?: string | null;
  available: boolean;
  inventory_quantity?: number;
  sku?: string;
  weight?: number;
  weight_unit?: string;
  grams?: number;
}

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string | string[];
  variants: ShopifyVariant[];
  images: Array<{
    id: number;
    src: string;
    alt?: string;
  }>;
}

interface PreviewResult {
  siteUrl: string;
  collectionHandle: string;
  collectionTitle: string;
  productsFetched: number;
  products: ShopifyProduct[];
  qualityScore: number;
  estimatedTotal: number;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionTitle: string;
  collectionHandle: string;
  previewData: PreviewResult | null;
  isLoading: boolean;
  onStartScraping: (collectionHandle: string) => void;
  siteUrl?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags.map(t => t.trim()).filter(t => t.length > 0);
  }
  if (typeof tags === 'string' && tags.trim()) {
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }
  return [];
}

function getWeightInGrams(variant: ShopifyVariant): number | null {
  if (variant.grams && variant.grams > 0) {
    return variant.grams;
  }
  if (variant.weight && variant.weight > 0) {
    const unit = (variant.weight_unit || 'g').toLowerCase();
    switch (unit) {
      case 'kg': return variant.weight * 1000;
      case 'lb': return variant.weight * 453.592;
      case 'oz': return variant.weight * 28.3495;
      default: return variant.weight;
    }
  }
  return null;
}

function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return `${num.toFixed(2)}€`;
}

function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)}kg`;
  }
  return `${Math.round(grams)}g`;
}

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================

function ProductCard({ product, siteUrl }: { product: ShopifyProduct; siteUrl?: string }) {
  const variant = product.variants?.[0];
  const image = product.images?.[0];
  const price = variant ? parseFloat(variant.price) : 0;
  const comparePrice = variant?.compare_at_price ? parseFloat(variant.compare_at_price) : null;
  const isAvailable = variant?.available ?? false;
  const weight = variant ? getWeightInGrams(variant) : null;
  const tags = parseTags(product.tags).slice(0, 3);
  
  const productUrl = siteUrl ? `${siteUrl}/products/${product.handle}` : null;

  return (
    <div className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="aspect-square relative bg-muted">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-2 right-2">
          {isAvailable ? (
            <Badge className="bg-green-500 text-white text-xs">In Stock</Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
          )}
        </div>

        {/* Discount Badge */}
        {comparePrice && comparePrice > price && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 text-white text-xs">
              -{Math.round((1 - price / comparePrice) * 100)}%
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h4 className="font-medium text-sm line-clamp-2 leading-tight" title={product.title}>
          {product.title}
        </h4>

        {/* Product Type & Vendor */}
        {(product.product_type || product.vendor) && (
          <p className="text-xs text-muted-foreground truncate">
            {product.product_type}
            {product.product_type && product.vendor && ' • '}
            {product.vendor}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">{formatPrice(price)}</span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>

        {/* Weight */}
        {weight && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Scale className="w-3 h-3" />
            <span>{formatWeight(weight)}</span>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground truncate max-w-20"
                title={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Link */}
        {productUrl && (
          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View on site
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// QUALITY STATS COMPONENT
// ============================================================================

function QualityStats({ products }: { products: ShopifyProduct[] }) {
  if (products.length === 0) return null;

  const total = products.length;
  const withImages = products.filter(p => p.images && p.images.length > 0).length;
  const withPrice = products.filter(p => {
    const price = parseFloat(p.variants?.[0]?.price || '0');
    return price > 0;
  }).length;
  const available = products.filter(p => p.variants?.some(v => v.available)).length;
  const withWeight = products.filter(p => {
    const variant = p.variants?.[0];
    return variant && getWeightInGrams(variant) !== null;
  }).length;
  const withTags = products.filter(p => parseTags(p.tags).length > 0).length;

  const stats = [
    { label: 'Images', value: withImages, icon: ImageIcon },
    { label: 'Price', value: withPrice, icon: DollarSign },
    { label: 'Available', value: available, icon: CheckCircle2 },
    { label: 'Weight', value: withWeight, icon: Scale },
    { label: 'Tags', value: withTags, icon: Tag },
  ];

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
      {stats.map((stat) => {
        const percent = Math.round((stat.value / total) * 100);
        const isGood = percent >= 80;
        
        return (
          <div key={stat.label} className="flex items-center gap-2">
            <stat.icon className={`w-4 h-4 ${isGood ? 'text-green-500' : 'text-yellow-500'}`} />
            <span className="text-sm">
              {stat.label}: {stat.value}/{total}
              <span className={`ml-1 ${isGood ? 'text-green-600' : 'text-yellow-600'}`}>
                ({percent}%)
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PreviewModal({
  isOpen,
  onClose,
  collectionTitle,
  collectionHandle,
  previewData,
  isLoading,
  onStartScraping,
  siteUrl,
}: PreviewModalProps) {
  const products = previewData?.products || [];
  const hasProducts = products.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                👁️ Preview: {collectionTitle}
              </DialogTitle>
              <DialogDescription>
                {isLoading
                  ? 'Loading products...'
                  : hasProducts
                    ? `${products.length} products fetched (estimated ${previewData?.estimatedTotal || '?'} total)`
                    : 'No products found'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Fetching products...</p>
            </div>
          ) : hasProducts ? (
            <div className="space-y-4">
              {/* Quality Stats */}
              <QualityStats products={products} />

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    siteUrl={siteUrl}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <XCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products found in this collection</p>
              <p className="text-sm text-muted-foreground mt-2">
                The collection may be empty or all products are out of stock.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {hasProducts && (
              <span>
                Quality Score: <strong>{previewData?.qualityScore || 0}%</strong>
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => onStartScraping(collectionHandle)}
              disabled={!hasProducts || isLoading}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Full Scraping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
