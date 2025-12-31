import './load-env';
import { createScraperClient } from '../src/lib/supabase/client';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🔍 Analyzing Unknown Terms...\n');
  
  const supabase = createScraperClient();
  
  // Fetch unknowns
  const { data: unknowns, error } = await supabase
    .from('unknown_terms')
    .select('*')
    .eq('status', 'pending')
    .order('occurrences', { ascending: false });
  
  if (error) {
    console.error('Error fetching unknowns:', error);
    return;
  }
  
  if (!unknowns || unknowns.length === 0) {
    console.log('✅ No unknown terms! Quality is perfect.\n');
    return;
  }
  
  console.log(`Found ${unknowns.length} unknown terms:\n`);
  console.log('─'.repeat(60));
  
// Group by category
interface UnknownTerm {
  id: string;
  term: string;
  category: string;
  occurrences: number;
  contexts: string[];
  status: string;
}

const byCategory = unknowns.reduce((acc, u) => {
  if (!acc[u.category]) acc[u.category] = [];
  acc[u.category].push(u);
  return acc;
}, {} as Record<string, UnknownTerm[]>);

// Show summary
for (const [category, terms] of Object.entries(byCategory) as [string, UnknownTerm[]][]) {
  console.log(`\n${category.toUpperCase()} (${terms.length} unknowns):`);
  terms.forEach((t: UnknownTerm) => {
    console.log(`  • "${t.term}" (${t.occurrences}× occurrences)`);
    if (t.contexts && t.contexts.length > 0) {
      console.log(`    Context: ${t.contexts[0].substring(0, 60)}...`);
    }
  });
}
  
  console.log('\n' + '─'.repeat(60));
  console.log('\n📋 Next Steps:\n');
  console.log('1. Review these terms');
  console.log('2. Add mappings to dictionaries:');
  console.log('   - src/lib/scraping/common/dictionaries/materials.ts');
  console.log('   - src/lib/scraping/common/dictionaries/colors.ts');
  console.log('   - src/lib/scraping/common/dictionaries/patterns.ts');
  console.log('3. Re-run scraper to test improvements');
  console.log('\nExample mapping:');
  console.log('  "lilas": {');
  console.log('    value: "lilac",');
  console.log('    source: "manual",');
  console.log('    confidence: 1.0,');
  console.log('    validated_at: "2025-12-27",');
  console.log('    validated_by: "thomas"');
  console.log('  }');
  
  rl.close();
}

main();
