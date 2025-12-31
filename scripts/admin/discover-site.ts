#!/usr/bin/env tsx
/**
 * Discover Site CLI
 * 
 * Usage: npm run discover https://mylittlecoupon.fr
 * 
 * This script discovers a Shopify site structure:
 * - Tests if site is Shopify
 * - Fetches collections
 * - Samples products
 * - Analyzes quality
 * - Saves profile to database (valid 6 months)
 */

import '../load-env';
import { discoveryService } from '../../src/features/admin/services/discoveryService';
import { discoveryRepo } from '../../src/features/admin/infrastructure/discoveryRepo';

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const siteUrl = process.argv[2];
  
  // Validation
  if (!siteUrl) {
    console.error('\n❌ Error: Site URL required\n');
    console.log('Usage: npm run discover <site-url>');
    console.log('\nExamples:');
    console.log('  npm run discover https://mylittlecoupon.fr');
    console.log('  npm run discover mylittlecoupon.fr');
    console.log('  npm run discover thefabricsales.com\n');
    process.exit(1);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('  DEADSTOCK SEARCH ENGINE - Site Discovery');
  console.log('═'.repeat(60) + '\n');
  
  try {
    // Step 1: Discover site
    console.log(`🔍 Target: ${siteUrl}\n`);
    const profile = await discoveryService.discoverSite(siteUrl);
    
    // Step 2: Save to database
    console.log('💾 Saving profile to database...\n');
    await discoveryRepo.saveProfile(profile);
    
    // Step 3: Display results
    displayResults(profile);
    
    console.log('\n' + '═'.repeat(60));
    console.log('  ✅ DISCOVERY COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(60) + '\n');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('\n' + '═'.repeat(60));
    console.error('  ❌ DISCOVERY FAILED');
    console.error('═'.repeat(60));
    console.error(`\nError: ${error.message}\n`);
    
    if (error.message.includes('Not a Shopify')) {
      console.log('💡 Tip: Make sure the site is a Shopify store');
      console.log('   Try accessing: ' + siteUrl + '/products.json\n');
    }
    
    process.exit(1);
  }
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

function displayResults(profile: any) {
  console.log('═'.repeat(60));
  console.log('  DISCOVERY RESULTS');
  console.log('═'.repeat(60) + '\n');
  
  // Site info
  console.log('📍 Site Information');
  console.log('─'.repeat(60));
  console.log(`   URL:              ${profile.siteUrl}`);
  console.log(`   Platform:         Shopify`);
  console.log(`   Discovered:       ${profile.discoveredAt.toLocaleString('fr-FR')}`);
  console.log(`   Valid Until:      ${profile.validUntil.toLocaleDateString('fr-FR')} (6 months)`);
  console.log('');
  
  // Statistics
  console.log('📊 Statistics');
  console.log('─'.repeat(60));
  console.log(`   Total Collections:     ${profile.totalCollections}`);
  console.log(`   Relevant Collections:  ${profile.relevantCollections}`);
  console.log(`   Estimated Products:    ~${profile.estimatedProducts}`);
  console.log('');
  
  // Quality metrics
  console.log('⭐ Quality Metrics');
  console.log('─'.repeat(60));
  const q = profile.qualityMetrics;
  console.log(`   Overall Score:    ${formatPercent(q.overallScore)} ${getScoreEmoji(q.overallScore)}`);
  console.log(`   - Has Images:     ${formatPercent(q.hasImages)}`);
  console.log(`   - Has Price:      ${formatPercent(q.hasPrice)}`);
  console.log(`   - Has Tags:       ${formatPercent(q.hasTags)}`);
  console.log(`   - Has Description: ${formatPercent(q.hasDescription)}`);
  console.log('');
  
  // Collections
  if (profile.collections.length > 0) {
    console.log('📦 Relevant Collections');
    console.log('─'.repeat(60));
    profile.collections.forEach((col: any, index: number) => {
      const priorityIcon = col.priority === 'high' ? '🔥' : col.priority === 'medium' ? '⚡' : '📌';
      console.log(`   ${index + 1}. ${priorityIcon} ${col.title}`);
      console.log(`      - Handle: ${col.handle}`);
      console.log(`      - Products: ${col.productsCount}`);
      console.log(`      - Priority: ${col.priority.toUpperCase()}`);
      if (col.sampleProducts) {
        console.log(`      - Sampled: ${col.sampleProducts} products`);
      }
      console.log('');
    });
  }
  
  // Data structure
  console.log('🔧 Data Structure');
  console.log('─'.repeat(60));
  const ds = profile.dataStructure;
  console.log(`   Tags Format:       ${ds.tagsFormat}`);
  console.log(`   Avg Tags/Product:  ${ds.averageTagsCount.toFixed(1)}`);
  console.log(`   Has Vendor:        ${ds.hasVendor ? '✅' : '❌'}`);
  console.log(`   Has Product Type:  ${ds.hasProductType ? '✅' : '❌'}`);
  console.log(`   Fields Available:  ${ds.fieldsAvailable.join(', ')}`);
  console.log('');
  
  // Recommendations
  if (profile.recommendations.length > 0) {
    console.log('💡 Recommendations');
    console.log('─'.repeat(60));
    profile.recommendations.forEach((rec: any) => {
      const icon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      const typeLabel = rec.type === 'warning' ? '⚠️  ' : rec.type === 'quality' ? '⭐ ' : rec.type === 'collection' ? '📦 ' : '💡 ';
      console.log(`   ${icon} ${typeLabel}${rec.message}`);
    });
    console.log('');
  }
  
  // Next steps
  console.log('🚀 Next Steps');
  console.log('─'.repeat(60));
  if (profile.qualityMetrics.overallScore >= 0.7) {
    console.log('   ✅ Good quality! Ready for scraping configuration');
    console.log(`   📝 Profile cached for 6 months (until ${profile.validUntil.toLocaleDateString('fr-FR')})`);
    console.log('   🔄 Configure scraping filters and schedule');
  } else {
    console.log('   ⚠️  Low quality detected. Consider:');
    console.log('   - Reviewing collection filters');
    console.log('   - Adding quality requirements');
    console.log('   - Testing with different collections');
  }
  console.log('');
}

// ============================================================================
// HELPERS
// ============================================================================

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function getScoreEmoji(score: number): string {
  if (score >= 0.9) return '🌟 Excellent';
  if (score >= 0.8) return '✅ Very Good';
  if (score >= 0.7) return '👍 Good';
  if (score >= 0.6) return '⚠️  Fair';
  return '❌ Poor';
}

// ============================================================================
// RUN
// ============================================================================

main();
