// src/features/admin/components/SaleTypeCard.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, ShoppingCart, Scissors, Package, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import type { SaleTypeDetection } from '../domain/types';

interface SaleTypeCardProps {
  saleTypeDetection: SaleTypeDetection | null;
}

const SALE_TYPE_CONFIG = {
  hybrid: {
    label: 'Hybrid',
    description: 'Coupons fixes + coupe à la demande',
    icon: ShoppingCart,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    badgeColor: 'bg-purple-500',
  },
  fixed_length: {
    label: 'Coupons Fixes',
    description: 'Longueurs prédéfinies uniquement',
    icon: Package,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    badgeColor: 'bg-blue-500',
  },
  cut_to_order: {
    label: 'Coupe à la demande',
    description: 'Prix au mètre, longueur au choix',
    icon: Scissors,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    badgeColor: 'bg-green-500',
  },
  by_piece: {
    label: 'À la pièce',
    description: 'Vente par article individuel',
    icon: Tag,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    badgeColor: 'bg-orange-500',
  },
  unknown: {
    label: 'Inconnu',
    description: 'Type de vente non déterminé',
    icon: HelpCircle,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    badgeColor: 'bg-gray-500',
  },
};

export function SaleTypeCard({ saleTypeDetection }: SaleTypeCardProps) {
  if (!saleTypeDetection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Modèle de Vente
          </CardTitle>
          <CardDescription>Non analysé</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Relancez le Discovery pour détecter le modèle de vente.
          </p>
        </CardContent>
      </Card>
    );
  }

  const config = SALE_TYPE_CONFIG[saleTypeDetection.dominantType] || SALE_TYPE_CONFIG.unknown;
  const Icon = config.icon;
  const confidenceColor = saleTypeDetection.confidence >= 80 
    ? 'text-green-600' 
    : saleTypeDetection.confidence >= 50 
      ? 'text-yellow-600' 
      : 'text-red-600';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Modèle de Vente
          </CardTitle>
          <Badge variant="outline" className={confidenceColor}>
            {saleTypeDetection.confidence}% confiance
          </Badge>
        </div>
        <CardDescription>
          Détecté sur {saleTypeDetection.evidence.sampleSize} produits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type principal */}
        <div className={`p-4 rounded-lg ${config.color}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${config.badgeColor} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lg">{config.label}</p>
              <p className="text-sm opacity-80">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Description détaillée */}
        <p className="text-sm text-muted-foreground">
          {saleTypeDetection.description}
        </p>

        {/* Preuves détectées */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Preuves détectées :</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <EvidenceItem 
              label="Variants multiples" 
              value={saleTypeDetection.evidence.hasMultipleVariants} 
            />
            <EvidenceItem 
              label="Longueurs en options" 
              value={saleTypeDetection.evidence.hasLengthInOptions} 
            />
            <EvidenceItem 
              label="Option 'Cutting'" 
              value={saleTypeDetection.evidence.hasCuttingOption} 
            />
            <EvidenceItem 
              label="Prix au mètre" 
              value={saleTypeDetection.evidence.hasPricePerUnit} 
            />
            <EvidenceItem 
              label="Tags coupon fixe" 
              value={saleTypeDetection.evidence.hasFixedLengthTags} 
            />
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Structure:</span>
              <Badge variant="secondary" className="text-xs">
                {saleTypeDetection.evidence.variantStructure}
              </Badge>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        {saleTypeDetection.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recommandations :</p>
            <ul className="space-y-1">
              {saleTypeDetection.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Options détectées (collapsible) */}
        {saleTypeDetection.evidence.optionAnalysis && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
              Voir les options détectées
            </summary>
            <div className="mt-2 space-y-2 pl-4 border-l-2 border-muted">
              {saleTypeDetection.evidence.optionAnalysis.option1Values.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Option 1 (Couleurs): </span>
                  <span>{saleTypeDetection.evidence.optionAnalysis.option1Values.slice(0, 5).join(', ')}
                    {saleTypeDetection.evidence.optionAnalysis.option1Values.length > 5 && '...'}
                  </span>
                </div>
              )}
              {saleTypeDetection.evidence.optionAnalysis.option2Values.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Option 2 (Longueurs): </span>
                  <span>{saleTypeDetection.evidence.optionAnalysis.option2Values.slice(0, 5).join(', ')}
                    {saleTypeDetection.evidence.optionAnalysis.option2Values.length > 5 && '...'}
                  </span>
                </div>
              )}
              {saleTypeDetection.evidence.optionAnalysis.option3Values.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Option 3 (Lots): </span>
                  <span>{saleTypeDetection.evidence.optionAnalysis.option3Values.slice(0, 5).join(', ')}
                    {saleTypeDetection.evidence.optionAnalysis.option3Values.length > 5 && '...'}
                  </span>
                </div>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

function EvidenceItem({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {value ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-gray-300" />
      )}
      <span className={value ? '' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}
