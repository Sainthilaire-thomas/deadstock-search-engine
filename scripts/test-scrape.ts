#!/usr/bin/env tsx

/**
 * Test Scrape CLI - WITH NORMALIZATION
 *
 * Purpose: Test scraping with normalization on a small sample (20 products)
 * Usage: npm run test:scrape <site-url>
 *
 * Example:
 *   npm run test:scrape thefabricsales.com
 */

import './load-env';
import { discoveryRepo } from '../src/features/admin/infrastructure/discoveryRepo';
import { scrapingService } from '../src/features/admin/services/scrapingService';
import { scrapingRepo } from '../src/features/admin/infrastructure/scrapingRepo';
import type { ScrapingConfig } from '../src/features/admin/services/scrapingService';

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('═'.repeat(60));
  console.log('  🧪 TEST SCRAPING WITH NORMALIZATION (20 products)');
  console.log('═'.repeat(60));
  console.log('');

  // Get site URL from args
  const siteUrl = process.argv[2];

  if (!siteUrl) {
    console.error('❌ Error: Site URL is required');
    console.log('\nUsage: npm run test:scrape <site-url>');
    console.log('\nExample:');
    console.log('  npm run test:scrape thefabricsales.com');
    process.exit(1);
  }

  // Test config: limit to 20 products
  const config: ScrapingConfig = {
    collections: [],
    maxProductsPerCollection: 20, // ← TEST LIMIT
    delayBetweenRequests: 2000,
  };

  console.log(`🔍 Target: ${siteUrl}`);
  console.log(`🧪 Mode: TEST (max 20 products)`);
  console.log(`⚙️  Max products/collection: ${config.maxProductsPerCollection}`);
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
    console.log('📝 Creating scraping job...');
    jobId = await scrapingRepo.createJob({
      siteUrl,
      profileId: undefined,
      config,
    });

    await scrapingRepo.startJob(jobId);
    console.log('');

    // Step 3: Scrape site (with 20 products limit)
    const result = await scrapingService.scrapeSite(profile, config);

    // Step 4: Save products to DB WITH NORMALIZATION
    let saveResult = { saved: 0, updated: 0, skipped: 0 };

    if (result.products.length > 0) {
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
    console.log('  TEST RESULTS');
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

    console.log('💾 Database');
    console.log('─'.repeat(60));
    console.log(`   New Products:         ${saveResult.saved}`);
    console.log(`   Updated Products:     ${saveResult.updated}`);
    console.log(`   Failed to Save:       ${saveResult.skipped}`);
    console.log(`   Job ID:               ${jobId}`);
    console.log('');

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

    console.log('🎯 Next Steps');
    console.log('─'.repeat(60));
    console.log(`   1. Check Supabase deadstock.textiles table`);
    console.log(`   2. Verify normalized columns (material_type, color, pattern)`);
    console.log(`   3. Check deadstock.unknown_terms for unmapped terms`);
    console.log(`   4. If results look good, run full scraping:`);
    console.log(`      npm run scrape ${siteUrl}`);
    console.log('');

    console.log('═'.repeat(60));
    console.log('  ✅ TEST COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(60));
    console.log('');

  } catch (error: any) {
    console.log('');
    console.log('═'.repeat(60));
    console.log('  ❌ TEST FAILED');
    console.log('═'.repeat(60));
    console.log('');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    // Mark job as failed
    if (jobId) {
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
    console.log('   - Check TypeScript compilation errors');
    console.log('   - Verify extractTerms.ts and scrapingRepo.ts are correct');
    console.log('   - Check Supabase connection');
    console.log('   - Review error stack trace above');
    console.log('');
    process.exit(1);
  }
}

main();
