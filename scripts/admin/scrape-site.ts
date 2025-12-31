#!/usr/bin/env tsx

/**
 * Scrape Site CLI
 * 
 * Usage: npm run scrape <site-url> [options]
 * Options:
 *   --collection <handle>  Scrape only this collection
 *   --limit <number>       Max products per collection (default: 1000)
 *   --no-save             Preview mode, don't save to DB
 * 
 * Examples:
 *   npm run scrape thefabricsales.com
 *   npm run scrape thefabricsales.com --collection all-fabrics
 *   npm run scrape thefabricsales.com --limit 500
 *   npm run scrape thefabricsales.com --no-save
 */

import '../load-env';
import { discoveryRepo } from '../../src/features/admin/infrastructure/discoveryRepo';
import { scrapingService } from '../../src/features/admin/services/scrapingService';
import { scrapingRepo } from '../../src/features/admin/infrastructure/scrapingRepo';
import type { ScrapingConfig } from '../../src/features/admin/services/scrapingService';

// ============================================================================
// HELPERS
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  
  // First non-flag argument is the site URL
  const siteUrl = args.find(arg => !arg.startsWith('--'));
  
  const config: ScrapingConfig = {
    collections: [],
    maxProductsPerCollection: 1000,
    delayBetweenRequests: 2000,
  };
  
  let noSave = false;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--collection' && args[i + 1]) {
      config.collections = [args[i + 1]];
      i++;
    } else if (arg === '--limit' && args[i + 1]) {
      config.maxProductsPerCollection = parseInt(args[i + 1]);
      i++;
    } else if (arg === '--no-save') {
      noSave = true;
    }
  }
  
  return { siteUrl, config, noSave };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('═'.repeat(60));
  console.log('  DEADSTOCK SEARCH ENGINE - Site Scraping');
  console.log('═'.repeat(60));
  console.log('');
  
  // Parse arguments
  const { siteUrl, config, noSave } = parseArgs();
  
  if (!siteUrl) {
    console.error('❌ Error: Site URL is required');
    console.log('\nUsage: npm run scrape <site-url> [options]');
    console.log('\nOptions:');
    console.log('  --collection <handle>  Scrape only this collection');
    console.log('  --limit <number>       Max products per collection');
    console.log('  --no-save             Preview mode, don\'t save to DB');
    console.log('\nExamples:');
    console.log('  npm run scrape thefabricsales.com');
    console.log('  npm run scrape thefabricsales.com --collection all-fabrics');
    console.log('  npm run scrape thefabricsales.com --limit 500');
    console.log('  npm run scrape thefabricsales.com --no-save');
    process.exit(1);
  }
  
  console.log(`🔍 Target: ${siteUrl}`);
  if (config.collections && config.collections.length > 0) {
    console.log(`📦 Collections: ${config.collections.join(', ')}`);
  }
  console.log(`⚙️  Max products/collection: ${config.maxProductsPerCollection}`);
  console.log(`💾 Save to DB: ${noSave ? 'NO (preview mode)' : 'YES'}`);
  console.log('');
  
  let jobId: string | null = null;
  
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
    
    // Step 2: Create scraping job
    if (!noSave) {
      console.log('📝 Creating scraping job...');
      jobId = await scrapingRepo.createJob({
        siteUrl,
        profileId: undefined, // Will be null in DB
        config,
      });
      
      await scrapingRepo.startJob(jobId);
      console.log('');
    }
    
    // Step 3: Scrape site
    const result = await scrapingService.scrapeSite(profile, config);
    
    // Step 4: Save products to DB
    let saveResult = { saved: 0, updated: 0, skipped: 0 };
    
    if (!noSave && result.products.length > 0) {
      saveResult = await scrapingRepo.saveProducts(
        result.products,
        siteUrl,
        jobId!
      );
      
      // Update job with final stats
      await scrapingRepo.completeJob({
        jobId: jobId!,
        status: result.errorsCount > 0 ? 'partial' : 'completed',
        result: {
          ...result,
          productsValid: saveResult.saved + saveResult.updated,
          productsSkipped: saveResult.skipped,
        },
      });
    }
    
    // Step 5: Display results
    console.log('═'.repeat(60));
    console.log('  SCRAPING RESULTS');
    console.log('═'.repeat(60));
    console.log('');
    
    console.log('📊 Statistics');
    console.log('─'.repeat(60));
    console.log(`   Duration:             ${Math.round(result.duration / 1000)}s`);
    console.log(`   Collections Scraped:  ${result.collectionsScraped}`);
    console.log(`   Products Fetched:     ${result.productsFetched}`);
    console.log(`   Products Valid:       ${result.productsValid}`);
    console.log(`   Products Skipped:     ${result.productsSkipped}`);
    console.log(`   Errors:               ${result.errorsCount}`);
    console.log('');
    
    if (!noSave) {
      console.log('💾 Database');
      console.log('─'.repeat(60));
      console.log(`   New Products:         ${saveResult.saved}`);
      console.log(`   Updated Products:     ${saveResult.updated}`);
      console.log(`   Failed to Save:       ${saveResult.skipped}`);
      console.log(`   Job ID:               ${jobId}`);
      console.log('');
    }
    
    console.log('⭐ Quality');
    console.log('─'.repeat(60));
    const qualityPercent = Math.round(result.qualityScore * 100);
    const qualityEmoji = qualityPercent >= 90 ? '🌟' : qualityPercent >= 80 ? '✅' : qualityPercent >= 70 ? '👍' : qualityPercent >= 60 ? '⚠️' : '❌';
    console.log(`   Overall Score:        ${qualityPercent}% ${qualityEmoji}`);
    console.log('');
    
    if (result.errors.length > 0) {
      console.log('⚠️  Errors');
      console.log('─'.repeat(60));
      result.errors.forEach(error => {
        console.log(`   • ${error.collection}: ${error.error}`);
      });
      console.log('');
    }
    
    console.log('💡 Next Steps');
    console.log('─'.repeat(60));
    if (noSave) {
      console.log(`   ✅ Preview successful! Run without --no-save to save to DB`);
      console.log(`   🚀 Run: npm run scrape ${siteUrl}`);
    } else {
      console.log(`   ✅ Products saved to database!`);
      console.log(`   📊 View in admin UI or check Supabase`);
    }
    console.log('');
    
    console.log('═'.repeat(60));
    console.log('  ✅ SCRAPING COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(60));
    console.log('');
    
  } catch (error: any) {
    console.log('');
    console.log('═'.repeat(60));
    console.log('  ❌ SCRAPING FAILED');
    console.log('═'.repeat(60));
    console.log('');
    console.error('Error:', error.message);
    
    // Mark job as failed
    if (jobId && !noSave) {
      try {
        await scrapingRepo.completeJob({
          jobId,
          status: 'failed',
          result: {
            siteUrl,
            startedAt: new Date(),
            endedAt: new Date(),
            duration: 0,
            collectionsScraped: 0,
            productsFetched: 0,
            productsValid: 0,
            productsSkipped: 0,
            errorsCount: 1,
            products: [],
            errors: [{ collection: 'general', error: error.message }],
            qualityScore: 0,
          },
        });
      } catch (e) {
        console.error('Failed to update job status:', e);
      }
    }
    
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('   - Check your internet connection');
    console.log('   - Verify the site URL is correct');
    console.log('   - Check Supabase credentials in .env.local');
    console.log('   - Try preview mode first: --no-save');
    console.log('');
    process.exit(1);
  }
}

main();
