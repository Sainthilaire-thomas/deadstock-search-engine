// scripts/test-mlc.ts
// Test basique : fetch produits My Little Coupon

async function testMLCFetch() {
  console.log('🕷️  Testing My Little Coupon API...\n');
  
  try {
    // URL API Shopify de My Little Coupon
    const url = 'https://mylittlecoupon.fr/collections/all/products.json?limit=10';
    
    console.log(`📡 Fetching: ${url}\n`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Success! Found ${data.products.length} products\n`);
    console.log('─'.repeat(50));
    
    // Afficher les 3 premiers produits
    data.products.slice(0, 3).forEach((product: any, index: number) => {
      console.log(`\n📦 Product ${index + 1}:`);
      console.log(`   Title: ${product.title}`);
      console.log(`   Handle: ${product.handle}`);
      console.log(`   Price: ${product.variants[0]?.price} EUR`);
      console.log(`   Available: ${product.available ? '✅' : '❌'}`);
      console.log(`   URL: https://mylittlecoupon.fr/products/${product.handle}`);
      
      // Afficher composition si présente dans body_html
      if (product.body_html && product.body_html.includes('composition')) {
        const snippet = product.body_html.substring(0, 100).replace(/<[^>]*>/g, '');
        console.log(`   Description: ${snippet}...`);
      }
    });
    
    console.log('\n' + '─'.repeat(50));
    console.log(`\n🎉 Total products available: ${data.products.length}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Lancer le test
testMLCFetch();
