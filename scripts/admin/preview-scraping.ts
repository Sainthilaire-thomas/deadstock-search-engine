#!/usr/bin/env tsx

/**
 * Preview Scraping CLI
 * 
 * Usage: npm run preview <site-url> [collection-handle]
 * Examples:
 *   npm run preview thefabricsales.com
 *   npm run preview thefabricsales.com all-fabrics
 */

import '../load-env';
import { discoveryRepo } from '../../src/features/admin/infrastructure/discoveryRepo';
import { scrapingService } from '../../src/features/admin/services/scrapingService';

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('═'.repeat(60));
  console.log('  DEADSTOCK SEARCH ENGINE - Preview Scraping');
  console.log('═'.repeat(60));
  console.log('');
  
  // Parse arguments
  const siteUrl = process.argv[2];
  const collectionHandle = process.argv[3];
  
  if (!siteUrl) {
    console.error('❌ Error: Site URL is required');
    console.log('\nUsage: npm run preview <site-url> [collection-handle]');
    console.log('\nExamples:');
    console.log('  npm run preview thefabricsales.com');
    console.log('  npm run preview thefabricsales.com all-fabrics');
    process.exit(1);
  }
  
  console.log(`🔍 Target: ${siteUrl}`);
  if (collectionHandle) {
    console.log(`📦 Collection: ${collectionHandle}`);
  }
  console.log('');
  
  try {
    // Step 1: Load profile from cache
    console.log('📂 Loading discovery profile from cache...');
    const profile = await discoveryRepo.getProfile(siteUrl);
    
    if (!profile) {
      console.error(`\n❌ No discovery profile found for ${siteUrl}`);
      console.log('\n💡 Tip: Run discovery first:');
      console.log(`   npm run discover ${siteUrl}`);
      process.exit(1);
    }
    
    console.log(`✅ Profile loaded (valid until ${profile.validUntil.toLocaleDateString()})`);
    console.log('');
    
    // Step 2: Preview scraping
    const result = await scrapingService.previewScraping(profile, collectionHandle);
    
    // Step 3: Display results
    console.log('═'.repeat(60));
    console.log('  PREVIEW RESULTS');
    console.log('═'.repeat(60));
    console.log('');
    
    console.log('📍 Collection Information');
    console.log('─'.repeat(60));
    console.log(`   Collection:       ${result.collectionTitle}`);
    console.log(`   Handle:           ${result.collectionHandle}`);
    console.log(`   Products Fetched: ${result.productsFetched}`);
    console.log(`   Estimated Total:  ${result.estimatedTotal}`);
    console.log('');
    
    console.log('⭐ Quality Metrics');
    console.log('─'.repeat(60));
    const qualityPercent = Math.round(result.qualityScore * 100);
    const qualityEmoji = qualityPercent >= 90 ? '🌟' : qualityPercent >= 80 ? '✅' : qualityPercent >= 70 ? '👍' : qualityPercent >= 60 ? '⚠️' : '❌';
    console.log(`   Overall Score:    ${qualityPercent}% ${qualityEmoji}`);
    console.log('');
    
    console.log('📦 Sample Products');
    console.log('─'.repeat(60));
    result.products.slice(0, 5).forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.title}`);
      console.log(`      Price: ${product.variants[0]?.price || 'N/A'}`);
      console.log(`      Images: ${product.images?.length || 0}`);
      console.log(`      Tags: ${Array.isArray(product.tags) ? product.tags.length : (product.tags ? 'yes' : 'no')}`);
      console.log('');
    });
    
    if (result.products.length > 5) {
      console.log(`   ... and ${result.products.length - 5} more products`);
      console.log('');
    }
    
    console.log('💡 Next Steps');
    console.log('─'.repeat(60));
    if (qualityPercent >= 70) {
      console.log('   ✅ Good quality! Ready for full scraping');
      console.log(`   🚀 Run: npm run scrape ${siteUrl}`);
    } else {
      console.log('   ⚠️  Quality is low. Consider checking:');
      console.log('      - Product images availability');
      console.log('      - Product descriptions');
      console.log('      - Price data completeness');
    }
    console.log('');
    
    console.log('═'.repeat(60));
    console.log('  ✅ PREVIEW COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(60));
    console.log('');
    
  } catch (error: any) {
    console.log('');
    console.log('═'.repeat(60));
    console.log('  ❌ PREVIEW FAILED');
    console.log('═'.repeat(60));
    console.log('');
    console.error('Error:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   - Check your internet connection');
    console.log('   - Verify the site URL is correct');
    console.log('   - Ensure discovery profile exists');
    console.log(`   - Try: npm run discover ${siteUrl}`);
    console.log('');
    process.exit(1);
  }
}

main();
