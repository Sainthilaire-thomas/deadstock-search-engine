// src/components/search/PriceDisplay.tsx
// Format unifié : Prix/m en premier pour comparaison facile

'use client';

import { Package, Scissors } from 'lucide-react';

interface PriceDisplayProps {
  saleType: 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece' | null;
  price: number | null;           // Prix du coupon (pour fixed_length/hybrid)
  pricePerMeter: number | null;   // Prix au mètre (pour cut_to_order/hybrid)
  quantity: number | null;        // Longueur disponible
  currency?: string;
  /** Mode compact pour les cartes de recherche contextuelle */
  compact?: boolean;
}

export function PriceDisplay({
  saleType,
  price,
  pricePerMeter,
  quantity,
  currency = '€',
  compact = false,
}: PriceDisplayProps) {
  
  // Calculer le prix au mètre si non fourni
  const effectivePricePerMeter = 
    pricePerMeter ?? 
    (price && quantity && quantity > 0 ? price / quantity : null);

  // Si pas de prix du tout
  if (!effectivePricePerMeter && !price) {
    return <span className="text-muted-foreground text-sm">Prix non disponible</span>;
  }

  // ============================================================================
  // Format compact (pour recherche contextuelle)
  // ============================================================================
  if (compact) {
    return (
      <div className="space-y-0.5">
        {/* Prix au mètre - toujours en premier et en gras */}
        <div className="font-semibold text-foreground">
          {effectivePricePerMeter?.toFixed(2)}{currency}/m
        </div>
        
        {/* Info contextuelle */}
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          {saleType === 'cut_to_order' ? (
            <>
              <Scissors className="w-3 h-3" />
              <span>Coupe à la demande</span>
            </>
          ) : saleType === 'fixed_length' && price && quantity ? (
            <>
              <Package className="w-3 h-3" />
              <span>Coupon {quantity}m • {price.toFixed(0)}{currency}</span>
            </>
          ) : saleType === 'hybrid' && price && quantity ? (
            <>
              <Package className="w-3 h-3" />
              <span>Coupon {quantity}m ou coupe</span>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  // ============================================================================
  // Format standard (pour grille de recherche principale)
  // ============================================================================

  // Hybrid : Afficher les 2 options
  if (saleType === 'hybrid' && price && pricePerMeter && quantity) {
    const couponPricePerMeter = price / quantity;
    const savings = ((pricePerMeter - couponPricePerMeter) / pricePerMeter * 100).toFixed(0);

    return (
      <div className="space-y-2">
        {/* Prix au mètre principal */}
        <div className="flex justify-between items-baseline">
          <span className="text-muted-foreground">Prix</span>
          <span className="font-bold text-lg text-foreground">
            {couponPricePerMeter.toFixed(2)}{currency}/m
          </span>
        </div>

        {/* Options */}
        <div className="text-xs space-y-1">
          <div className="flex items-center justify-between text-green-600 dark:text-green-400">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              Coupon {quantity}m
            </span>
            <span>{price.toFixed(0)}{currency}</span>
          </div>
          
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <Scissors className="w-3 h-3" />
              À la coupe
            </span>
            <span>{pricePerMeter.toFixed(2)}{currency}/m</span>
          </div>
        </div>

        {/* Économie */}
        {Number(savings) > 0 && (
          <div className="text-xs text-green-600 dark:text-green-400">
            💰 -{savings}% en prenant le coupon
          </div>
        )}
      </div>
    );
  }

  // Fixed length : Coupon
  if (saleType === 'fixed_length' && price && quantity) {
    return (
      <div className="space-y-1">
        {/* Prix au mètre en premier */}
        <div className="flex justify-between items-baseline">
          <span className="text-muted-foreground">Prix</span>
          <span className="font-bold text-lg text-foreground">
            {effectivePricePerMeter?.toFixed(2)}{currency}/m
          </span>
        </div>
        
        {/* Détail coupon */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            Coupon {quantity}m
          </span>
          <span>{price.toFixed(0)}{currency}</span>
        </div>
      </div>
    );
  }

  // Cut to order : Prix au mètre
  if (saleType === 'cut_to_order') {
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-baseline">
          <span className="text-muted-foreground">Prix</span>
          <span className="font-bold text-lg text-foreground">
            {effectivePricePerMeter?.toFixed(2)}{currency}/m
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Scissors className="w-3 h-3" />
          <span>Coupe à la demande</span>
        </div>
      </div>
    );
  }

  // Fallback : Afficher ce qu'on a
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-muted-foreground">Prix</span>
      <span className="font-bold text-foreground">
        {effectivePricePerMeter 
          ? `${effectivePricePerMeter.toFixed(2)}${currency}/m`
          : `${price?.toFixed(2)}${currency}`
        }
      </span>
    </div>
  );
}
