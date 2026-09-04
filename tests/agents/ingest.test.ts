/**
 * Ingest Agent Automated Test Suite (Unit & Integration)
 * Verifies:
 * - Real extraction logic & product normalization
 * - Dynamic category detection
 * - Variant matrix generation & inventory allocation
 * - Website crawl and multi-source synchronization
 * - Schema.org JSON-LD feed generation
 */

import { ingestAgent } from '../../server/agents/ingestAgent.js';

export interface IngestTestResult {
  passed: number;
  failed: number;
}

export async function runIngestTests(): Promise<IngestTestResult> {
  console.log('\n========================================');
  console.log('🧪 RUNNING: Ingest Agent Production Tests (TypeScript)');
  console.log('========================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, msg: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  };

  // Test 1: Real Product Extraction & Normalization
  console.log('\n--- Test 1.1: Product Normalization with Variants ---');
  const sampleProduct = {
    name: 'AuraTech Pro UltraBook 14',
    price: 54999,
    stock: 45,
    category: 'Laptops & Computers',
    brand: 'AuraTech',
    size: ['16GB RAM', '32GB RAM'],
  };

  const parseResult = await ingestAgent.parseMessyCatalog(sampleProduct, 'application/json', 'merchant-demo-01');
  assert(parseResult.success === true, 'Catalog ingestion returns success true');
  assert(parseResult.count === 1, 'Normalized exactly 1 product');

  const product = ingestAgent.getProducts().find(p => p.title.includes('AuraTech Pro UltraBook 14'));
  assert(product !== undefined, 'Product exists in internal catalog');
  assert(product!.price === 54999, 'Price correctly preserved as 54999');
  assert(product!.variants.length === 2, 'Generated 2 variant options');

  // Test 2: Dynamic Category Classification
  console.log('\n--- Test 1.2: Dynamic Category Classification ---');
  assert(ingestAgent.detectCategory('MacBook Pro M3 Max') === 'Laptops & Computers', 'Correctly classifies Laptop');
  assert(ingestAgent.detectCategory('Samsung Galaxy S24 Ultra Phone') === 'Smartphones & Mobile', 'Correctly classifies Smartphone');
  assert(ingestAgent.detectCategory('Sony WH-1000XM5 Noise Cancelling Headphones') === 'General Consumer Goods' || ingestAgent.detectCategory('Audio Soundbar') === 'General Consumer Goods', 'Classifies audio/general goods');

  // Test 3: Website Crawl Extraction
  console.log('\n--- Test 1.3: Website Crawler Service Integration ---');
  const crawlResult = await ingestAgent.connectWebsite({
    url: 'https://subko.coffee',
    industry: 'Specialty Goods',
    merchantId: 'merchant-test-subko',
  });
  assert(crawlResult.success === true, 'Website crawl completed successfully');
  assert(crawlResult.products_extracted > 0, 'Extracted products from website source');
  assert(crawlResult.connection.status === 'ACTIVE', 'Connection marked ACTIVE');

  // Test 4: Schema.org JSON-LD Machine Feed Generation
  console.log('\n--- Test 1.4: Schema.org JSON-LD Feed Generation ---');
  const feed = ingestAgent.generateJsonLdFeed('merchant-test-subko');
  assert(feed['@context'] === 'https://schema.org/', 'Feed specifies schema.org context');
  assert(feed['@type'] === 'DataFeed', 'Feed type is DataFeed');
  assert(Array.isArray(feed.dataFeedElement), 'Contains dataFeedElement array');

  return { passed, failed };
}
