import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Package, Scissors, Ruler, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton';
import { AddToBoardButton } from '@/features/boards/components/AddToBoardButton';

interface TextileDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TextileDetailPage({ params }: TextileDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: textile, error } = await supabase
  .schema('deadstock')
    .from('textiles_search')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !textile) {
    notFound();
  }

  // Calcul du prix au mètre pour les coupons
  const couponPricePerMeter = textile.price && textile.quantity_value && textile.quantity_value > 0
    ? textile.price / textile.quantity_value
    : null;

  // Calcul économie pour hybrid
  const savings = textile.sale_type === 'hybrid' && couponPricePerMeter && textile.price_per_meter
    ? Math.round((textile.price_per_meter - couponPricePerMeter) / textile.price_per_meter * 100)
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Navigation retour */}
      <Link 
        href="/search" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la recherche
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="aspect-square relative bg-muted">
              {textile.image_url ? (
                <Image
                  src={textile.image_url}
                  alt={textile.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Pas d'image
                </div>
              )}
            </div>
          </Card>

          {/* Images additionnelles si disponibles */}
          {textile.additional_images && textile.additional_images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {textile.additional_images.slice(0, 4).map((img: string, idx: number) => (
                <div key={idx} className="aspect-square relative rounded-md overflow-hidden bg-muted">
                  <Image
                    src={img}
                    alt={`${textile.name} - ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="space-y-6">
          {/* Titre et source */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {textile.sale_type === 'hybrid' && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  2 options d'achat
                </Badge>
              )}
              {!textile.available && (
                <Badge variant="destructive">Indisponible</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
  {textile.name}
</h1>
<div className="flex items-center justify-between">
  <p className="text-muted-foreground">
    Source : {textile.site_name || textile.source_platform}
  </p>
  <div className="flex gap-2">
   <AddToBoardButton
  textile={{
    id: textile.id,
    name: textile.name,
    imageUrl: textile.image_url,
    price: textile.price,
    source: textile.source_url,
    availableQuantity: textile.quantity_value,
    material: textile.fiber,
    color: textile.color,
  }}
  variant="outline"
  size="sm"
/>
    <FavoriteButton textileId={textile.id} />
  </div>
</div>
          </div>

          {/* Prix selon sale_type */}
          <Card>
            <CardContent className="p-6">
              {textile.sale_type === 'hybrid' ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Options d'achat</h3>
                  
                  {/* Option Coupon */}
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Coupon {textile.quantity_value}m</div>
                        <div className="text-sm text-muted-foreground">
                          {couponPricePerMeter?.toFixed(2)}€/m
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {textile.price?.toFixed(2)}€
                      </div>
                      {savings && savings > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          -{savings}% vs coupe
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option Coupe */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Scissors className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">À la coupe</div>
                        <div className="text-sm text-muted-foreground">
                          Quantité au choix
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">
                      {textile.price_per_meter?.toFixed(2)}€/m
                    </div>
                  </div>
                </div>
              ) : textile.sale_type === 'cut_to_order' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Scissors className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Vente au mètre</div>
                      <div className="text-sm text-muted-foreground">
                        Coupe à la demande
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold">
                    {(textile.price_per_meter || textile.price)?.toFixed(2)}€/m
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5" />
                    <div>
                      <div className="font-medium">
                        Coupon {textile.quantity_value}{textile.quantity_unit || 'm'}
                      </div>
                      {couponPricePerMeter && (
                        <div className="text-sm text-muted-foreground">
                          {couponPricePerMeter.toFixed(2)}€/m
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-3xl font-bold">
                    {textile.price?.toFixed(2)}€
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Caractéristiques */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Caractéristiques</h3>
              <div className="grid grid-cols-2 gap-4">
                {textile.fiber && (
                  <div>
                    <div className="text-sm text-muted-foreground">Matière</div>
                    <div className="font-medium capitalize">{textile.fiber}</div>
                  </div>
                )}
                {textile.color && (
                  <div>
                    <div className="text-sm text-muted-foreground">Couleur</div>
                    <div className="font-medium capitalize">{textile.color}</div>
                  </div>
                )}
                {textile.pattern && (
                  <div>
                    <div className="text-sm text-muted-foreground">Motif</div>
                    <div className="font-medium capitalize">{textile.pattern}</div>
                  </div>
                )}
                {textile.weave && (
                  <div>
                    <div className="text-sm text-muted-foreground">Tissage</div>
                    <div className="font-medium capitalize">{textile.weave}</div>
                  </div>
                )}
                {textile.width_value && (
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Largeur</div>
                      <div className="font-medium">{textile.width_value} cm</div>
                    </div>
                  </div>
                )}
                {textile.weight_value && (
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Grammage</div>
                      <div className="font-medium">{textile.weight_value} g/m²</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {textile.description && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Description</h3>
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: textile.description }}
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button asChild className="flex-1">
              <a 
                href={textile.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Voir sur {textile.site_name || 'le site source'}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
