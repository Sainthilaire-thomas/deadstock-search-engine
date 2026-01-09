// src/components/search/PriceDisplay.tsx

'use client';

import { Package, Scissors } from 'lucide-react';

interface PriceDisplayProps {
  saleType: 'fixed_length' | 'hybrid' | 'cut_to_order' | 'by_piece' | null;
  price: number | null;           // Prix du coupon (pour fixed_length/hybrid)
  pricePerMeter: number | null;   // Prix au mètre (pour cut_to_order/hybrid)
  quantity: number | null;        // Longueur disponible
  currency?: string;
}

export function PriceDisplay({ 
  saleType, 
  price, 
  pricePerMeter, 
  quantity,
  currency = '€' 
}: PriceDisplayProps) {
  
  // Hybrid : Afficher les 2 options
  if (saleType === 'hybrid' && price && pricePerMeter && quantity) {
    const couponPricePerMeter = price / quantity;
    const savings = ((pricePerMeter - couponPricePerMeter) / pricePerMeter * 100).toFixed(0);
    
    return (
      <div className="space-y-2">
        <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <span>2 options d'achat</span>
        </div>
        
        {/* Option 1: Coupon fixe */}
        <div className="flex items-center justify-between text-sm bg-green-50 dark:bg-green-950/30 rounded px-2 py-1">
          <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
            <Package className="w-3 h-3" />
            Coupon {quantity}m
          </span>
          <div className="text-right">
            <span className="font-semibold text-green-700 dark:text-green-400">
              {price.toFixed(0)}{currency}
            </span>
            <span className="text-xs text-green-600 dark:text-green-500 ml-1">
              ({couponPricePerMeter.toFixed(2)}{currency}/m)
            </span>
          </div>
        </div>
        
        {/* Option 2: À la coupe */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Scissors className="w-3 h-3" />
            À la coupe
          </span>
          <span className="font-medium">
            {pricePerMeter.toFixed(2)}{currency}/m
          </span>
        </div>
        
        {/* Économie */}
        {Number(savings) > 0 && (
          <div className="text-xs text-green-600 dark:text-green-400 text-right">
            💰 -{savings}% en coupon
          </div>
        )}
      </div>
    );
  }
  
  // Fixed length : Prix total + prix/m calculé
  if (saleType === 'fixed_length' && price) {
    const calculatedPricePerMeter = quantity && quantity > 0 ? price / quantity : null;
    
    return (
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Prix</span>
          <span className="font-medium">
            {price.toFixed(2)}{currency}
          </span>
        </div>
        {calculatedPricePerMeter && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Coupon {quantity}m</span>
            <span>({calculatedPricePerMeter.toFixed(2)}{currency}/m)</span>
          </div>
        )}
      </div>
    );
  }
  
  // Cut to order : Prix au mètre
  if (saleType === 'cut_to_order') {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Scissors className="h-3 w-3" />
          Prix
        </span>
        <span className="font-semibold text-foreground">
          {pricePerMeter?.toFixed(2) || price?.toFixed(2)}{currency}/m
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        Vente au mètre • Coupe à la demande
      </div>
    </div>
  );
}
  
  // Fallback : Afficher ce qu'on a
  if (pricePerMeter) {
    return (
      <div className="flex justify-between">
        <span className="text-muted-foreground">Prix</span>
        <span className="font-medium">
          {pricePerMeter.toFixed(2)}{currency}/m
        </span>
      </div>
    );
  }
  
  if (price) {
    return (
      <div className="flex justify-between">
        <span className="text-muted-foreground">Prix</span>
        <span className="font-medium">
          {price.toFixed(2)}{currency}
        </span>
      </div>
    );
  }
  
  return null;
}
