/**
 * Script: Scrape The Fabric Sales to Database
 * 
 * Scrape produits depuis The Fabric Sales et les sauvegarde dans Supabase
 */
import './load-env';
import { TheFabricSalesAdapter } from '../src/features/scraping/infrastructure/adapters/TheFabricSalesAdapter';
import { normalizeTextile } from '../src/features/normalization/application/normalizeTextile';
import { Textile } from '../src/features/scraping/domain/Textile';
import { textileRepo } from '../src/features/scraping/infrastructure/textileRepo';
import { parseComposition } from '../src/lib/scraping/common/normalize';

interface ScrapeResult {
  source: string;
  totalFetched: number;
  totalSaved: number;
  totalErrors: number;
  errors: string[];
}

/**
 * Scrape The Fabric Sales et sauvegarde les textiles
 */
async function scrapeTheFabricSales(limit: number = 10): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    source: 'the_fabric_sales',
    totalFetched: 0,
    totalSaved: 0,
    totalErrors: 0,
    errors: []
  };

  try {
    console.log(`🕷️  Scraping The Fabric Sales → Supabase`);
    console.log('──────────────────────────────────────────────────');

    // 1. Fetch produits via adapter (avec smart parsing)
    const adapter = new TheFabricSalesAdapter();
    const products = await adapter.fetchProducts(limit);
    result.totalFetched = products.length;

    // 2. Process chaque produit
    for (const product of products) {
      try {
        // 2a. Normaliser avec termes extraits
        const normalized = await normalizeTextile({
          name: product.name,
          description: product.description,
          extractedTerms: product.extracted,
          sourcePlatform: 'the_fabric_sales',
          productId: product.id,
          imageUrl: product.imageUrl || undefined,
          productUrl: product.sourceUrl
        });

        // DEBUG LOG
console.log('\n=== PRODUCT DEBUG ===');
console.log('Name:', product.name);
console.log('Extracted:', product.extracted);
console.log('Normalized:', normalized);
console.log('=====================\n');

        // 2b. Parser composition
        const composition = parseComposition(product.name + ' ' + product.description);

        // 2c. Créer entity Textile
        const textile = new Textile(
          crypto.randomUUID(),
          product.name,
          product.description,
          normalized.material?.value || null,
          normalized.color?.value || null,
          Object.keys(composition).length > 0 ? composition : null,
          1, // TFS ne spécifie pas toujours le métrage
          'm',
          product.price,
          'GBP', // The Fabric Sales = UK = GBP
          'the_fabric_sales',
          product.sourceUrl,
          product.id,
          'The Fabric Sales',
          product.available,
          product.imageUrl,
          product.rawData
        );

        // 2d. Sauvegarder via repository
        await textileRepo.save(textile);
        result.totalSaved++;
        
        console.log(`   ✅ Saved: ${product.name.substring(0, 50)}...`);
      } catch (error: any) {
        result.totalErrors++;
        result.errors.push(`Product ${product.id}: ${error.message}`);
        console.error(`   ❌ Error: ${product.id} - ${error.message}`);
      }
    }
  } catch (error: any) {
    result.totalErrors++;
    result.errors.push(`Fatal error: ${error.message}`);
    console.error(`❌ Fatal error: ${error.message}`);
  }

  return result;
}

/**
 * Main execution
 */
async function main() {
  const limit = parseInt(process.argv[2]) || 10;
  
  const result = await scrapeTheFabricSales(limit);
  
  console.log('──────────────────────────────────────────────────');
  console.log('🎉 Scraping Complete!');
  console.log(`   📡 Source: ${result.source}`);
  console.log(`   ✅ Successfully saved: ${result.totalSaved}`);
  console.log(`   ❌ Errors: ${result.totalErrors}`);
  console.log(`   📊 Total fetched: ${result.totalFetched}`);
  
  if (result.errors.length > 0) {
    console.log('❌ Error details:');
    result.errors.forEach(err => console.log(`   - ${err}`));
  }
  
  process.exit(result.totalErrors > 0 ? 1 : 0);
}

main();
