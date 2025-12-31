/**
 * Use Case: Scrape and Save Textiles
 *
 * Orchestre le scraping d'une source et la sauvegarde en DB
 */
import { MyLittleCouponAdapter } from '../infrastructure/adapters/MyLittleCouponAdapter';
import { normalizeTextile } from '@/features/normalization/application/normalizeTextile';
import { Textile } from '../domain/Textile';
import { textileRepo } from '../infrastructure/textileRepo';
import { parseComposition } from '@/lib/scraping/common/normalize';

export interface ScrapeResult {
  source: string;
  totalFetched: number;
  totalSaved: number;
  totalErrors: number;
  errors: string[];
}

/**
 * Scrape My Little Coupon et sauvegarde les textiles
 */
export async function scrapeMyLittleCoupon(limit: number = 10): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    source: 'my_little_coupon',
    totalFetched: 0,
    totalSaved: 0,
    totalErrors: 0,
    errors: []
  };

  try {
    // 1. Fetch produits via adapter (avec smart parsing)
    const adapter = new MyLittleCouponAdapter();
    const products = await adapter.fetchProducts(limit);
    result.totalFetched = products.length;

    // 2. Process chaque produit
    for (const product of products) {
      try {
        // 2a. Normaliser avec termes extraits
        const normalized = await normalizeTextile({
          name: product.name,
          description: product.description,
          extractedTerms: product.extracted,  // ← NOUVEAU : Passer les termes extraits
          sourcePlatform: 'my_little_coupon',
          productId: product.id,
          imageUrl: product.imageUrl || undefined,
          productUrl: product.sourceUrl
        });

        // 2b. Parser composition
        const composition = parseComposition(product.name + ' ' + product.description);

        // 2c. Créer entity Textile (business rules validées)
        const textile = new Textile(
          crypto.randomUUID(), // ID généré
          product.name,
          product.description,
          normalized.material?.value || null,
          normalized.color?.value || null,
          Object.keys(composition).length > 0 ? composition : null,
          3, // MLC = coupons de 3m par défaut
          'm',
          product.price,
          'EUR',
          'my_little_coupon',
          product.sourceUrl,
          product.id,
          'Maison de couture française',
          product.available,
          product.imageUrl,
          product.rawData
        );

        // 2d. Sauvegarder via repository
        await textileRepo.save(textile);
        result.totalSaved++;
      } catch (error: any) {
        result.totalErrors++;
        result.errors.push(`Product ${product.id}: ${error.message}`);
      }
    }
  } catch (error: any) {
    result.totalErrors++;
    result.errors.push(`Fatal error: ${error.message}`);
  }

  return result;
}
