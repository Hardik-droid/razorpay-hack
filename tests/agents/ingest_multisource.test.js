import { ingestAgent } from '../../server/agents/ingestAgent.js';

export async function runMultiSourceIngestTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING: Multi-Source Production Ingest Tests');
  console.log('========================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  };

  // Test 1: Option 1 - Connect Website (Real Website Crawl)
  console.log('\n--- Test M1.1: Option 1 - Connect Website Crawler ---');
  const webResult = await ingestAgent.connectWebsite({
    url: 'https://subko.coffee',
    industry: 'Food & Coffee Roasters',
  });

  assert(webResult.success === true, 'Website crawl succeeded');
  assert(webResult.products_extracted >= 3, `Extracted ${webResult.products_extracted} products from website`);
  assert(webResult.products[0].variants.length >= 1, 'Extracted product variants with SKUs');
  assert(webResult.connection.type === 'WEBSITE', 'Connection recorded with type WEBSITE');
  assert(webResult.connection.lastSyncedAt !== undefined, 'Recorded lastSyncedAt timestamp');

  // Test 2: Option 2 - Connect Store (Shopify OAuth / API Sync)
  console.log('\n--- Test M1.2: Option 2 - Connect Shopify Store ---');
  const shopifyResult = await ingestAgent.connectEcommerceStore({
    platform: 'shopify',
    storeUrl: 'atelier-fashion.myshopify.com',
    accessToken: 'shpat_live_test_token_882',
  });

  assert(shopifyResult.success === true, 'Shopify store sync succeeded');
  assert(shopifyResult.products_synced >= 2, `Synchronized ${shopifyResult.products_synced} products from Shopify`);
  assert(shopifyResult.connection.type === 'SHOPIFY', 'Connection recorded with type SHOPIFY');
  assert(shopifyResult.products[0].stock > 0, 'Synchronized live inventory count');

  // Test 3: Option 3 - Upload Business Documents (PDF Catalogue)
  console.log('\n--- Test M1.3: Option 3 - PDF Catalogue / Brochure Ingestion ---');
  const pdfResult = await ingestAgent.ingestBusinessDocument({
    filename: 'apex_court_flooring_catalog_2026.pdf',
    docType: 'PDF_CATALOG',
  });

  assert(pdfResult.success === true, 'PDF document parsed successfully');
  assert(pdfResult.products_extracted >= 2, `Extracted ${pdfResult.products_extracted} items from PDF tables`);
  assert(pdfResult.products[0].category.includes('Sports Flooring'), 'Accurately detected category from technical PDF');

  // Test 4: Option 4 - Google Business Profile Connection
  console.log('\n--- Test M1.4: Option 4 - Google Business Profile ---');
  const gbpResult = await ingestAgent.connectGoogleBusiness({
    businessName: 'Studio Lumina Commercial Photography',
    businessUrl: 'https://maps.google.com/?cid=9021884',
  });

  assert(gbpResult.success === true, 'Google Business Profile connected');
  assert(gbpResult.business.location.includes('Pune'), 'Extracted business location (Pune)');
  assert(gbpResult.products_extracted >= 2, 'Converted services to machine-readable products');

  // Test 5: Manual Product Correction Flow
  console.log('\n--- Test M1.5: Manual Product Correction ---');
  const targetProd = ingestAgent.getProducts()[0];
  const updateRes = ingestAgent.updateProduct(targetProd.id, {
    price: 9999,
    stock_quantity: 42,
  });

  assert(updateRes.success === true, 'Product update succeeded');
  assert(updateRes.product.price === 9999, 'Price manually updated to ₹9,999');
  assert(updateRes.product.stock_quantity === 42, 'Stock manually updated to 42');
  assert(updateRes.product.manually_corrected === true, 'Flagged as manually_corrected: true');

  // Test 6: Re-Sync Connection via On-Demand Sync Button
  console.log('\n--- Test M1.6: On-Demand Re-Sync ---');
  const connToSync = ingestAgent.getSourceConnections()[0];
  const reSyncRes = await ingestAgent.syncConnection(connToSync.id);
  assert(reSyncRes.success === true, 'Connection re-synced successfully');
  assert(reSyncRes.connection.lastSyncedAt !== undefined, 'Updated lastSyncedAt timestamp');

  // Test 7: Sync History & Alerts
  console.log('\n--- Test M1.7: Sync History & Alert Tracking ---');
  const history = ingestAgent.getSyncHistory();
  assert(history.length >= 4, `Tracked ${history.length} sync runs`);
  assert(history[0].status === 'SUCCESS', 'Sync status is SUCCESS');

  return { passed, failed };
}
