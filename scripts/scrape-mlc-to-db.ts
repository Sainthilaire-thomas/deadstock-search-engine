// scripts/scrape-mlc-to-db.ts
// Script CLI qui utilise le use case
import './load-env';
import { scrapeMyLittleCoupon } from '../src/features/scraping/application/scrapeAndSaveTextiles';

async function main() {
  console.log('🕷️  Scraping My Little Coupon → Supabase\n');
  
  // DEBUG: Test fetch direct AVANT d'appeler le use case
  console.log('🔍 Testing MLC API connection...');
  console.log('─'.repeat(50));
  
  const testUrls = [
    'https://mylittlecoupon.fr/products.json?limit=1',
    'https://mylittlecoupon.fr/collections/all/products.json?limit=1'
  ];
  
  for (const testUrl of testUrls) {
    console.log(`\nTesting: ${testUrl}`);
    try {
      const testResponse = await fetch(testUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log(`  ✅ Status: ${testResponse.status} ${testResponse.statusText}`);
      console.log(`  ✅ OK: ${testResponse.ok}`);
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log(`  ✅ Products found: ${data.products?.length || 0}`);
      }
    } catch (err: any) {
      console.log(`  ❌ Fetch error: ${err.message}`);
      console.log(`  ❌ Error code: ${err.code || 'N/A'}`);
      console.log(`  ❌ Error cause: ${err.cause?.message || 'N/A'}`);
      console.log(`  ❌ Error type: ${err.constructor.name}`);
    }
  }
  
  console.log('\n' + '─'.repeat(50));
  console.log('Starting actual scraping...\n');
  
  try {
    // Appeler le use case
    const result = await scrapeMyLittleCoupon(10);
    
    // Afficher résumé
    console.log('─'.repeat(50));
    console.log(`\n🎉 Scraping Complete!`);
    console.log(`   📡 Source: ${result.source}`);
    console.log(`   ✅ Successfully saved: ${result.totalSaved}`);
    console.log(`   ❌ Errors: ${result.totalErrors}`);
    console.log(`   📊 Total fetched: ${result.totalFetched}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Error details:');
      result.errors.forEach(err => console.log(`   - ${err}`));
    }
    
  } catch (error: any) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();
