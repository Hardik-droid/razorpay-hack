import { ingestAgent } from '../../server/agents/ingestAgent.js';

export async function runIngestTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING: Ingest Agent Production Tests');
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

  // Test 1: JSON / Excel Object Parsing with Variants (Nike Shoes example from user prompt)
  console.log('\n--- Test 1.1: Product Ingestion with Variants (JSON / Excel) ---');
  const sampleShoe = {
    name: 'Nike Air Zoom Running Shoes',
    price: 4999,
    size: ['8', '9', '10'],
    stock: 60,
    category: 'Footwear & Athletic Shoes',
    brand: 'Nike'
  };

  const jsonResult = await ingestAgent.parseMessyCatalog(sampleShoe, 'application/json', 'merchant-nike-test');
  assert(jsonResult.success === true, 'JSON ingestion succeeds');
  assert(jsonResult.count === 1, 'Extracted exactly 1 product');

  const ingestedShoe = ingestAgent.getProducts().find(p => p.title === 'Nike Air Zoom Running Shoes');
  assert(ingestedShoe !== undefined, 'Product exists in internal catalog');
  assert(ingestedShoe.price === 4999, 'Extracted exact price of ₹4,999');
  assert(ingestedShoe.variants.length === 3, 'Created exactly 3 variants for sizes 8, 9, 10');
  assert(ingestedShoe.variants[0].name === 'Size 8', 'Variant 1 correctly named "Size 8"');
  assert(ingestedShoe.category === 'Footwear & Athletic Shoes', 'Category accurately assigned');

  // Test 2: Structured CSV Parsing
  console.log('\n--- Test 1.2: Structured CSV Parsing ---');
  const sampleCsv = `sku,name,price,stock,category,brand
ABC-LAP-001,"ABC UltraBook Pro 14",54999,25,"Laptops & Computers","ABC Pro"
ABC-PHN-002,"ABC Neo 5G Smartphone",19999,40,"Smartphones & Mobile","ABC Pro"`;

  const csvResult = await ingestAgent.parseMessyCatalog(sampleCsv, 'text/csv', 'merchant-abc-test');
  assert(csvResult.success === true, 'CSV ingestion succeeds');
  assert(csvResult.count === 2, 'Parsed exactly 2 products from CSV');

  const laptop = ingestAgent.getProductById('ABC-LAP-001');
  assert(laptop !== undefined, 'Laptop SKU "ABC-LAP-001" found');
  assert(laptop.price === 54999, 'Laptop price ₹54,999 extracted accurately');
  assert(laptop.stock_quantity === 25, 'Stock quantity 25 extracted');
  assert(laptop.is_available === true, 'Availability marked true for in-stock item');

  // Test 3: Dynamic Category Detection
  console.log('\n--- Test 1.3: Dynamic Category Classification ---');
  assert(ingestAgent.detectCategory('MacBook Pro M3 Max') === 'Laptops & Computers', 'Detects MacBook as Laptops & Computers');
  assert(ingestAgent.detectCategory('Ergonomic Mesh Office Chair') === 'Office Furniture', 'Detects Office Chair as Office Furniture');
  assert(ingestAgent.detectCategory('Polyurethane Sports Flooring Turf') === 'Sports Flooring & Infrastructure', 'Detects Sports Flooring');

  // Test 4: Duplicate Detection & Upsert
  console.log('\n--- Test 1.4: Duplicate Detection ---');
  const countBefore = ingestAgent.getProducts().length;
  // Upload exact same laptop again with updated price
  const duplicateCsv = `sku,name,price,stock,category,brand
ABC-LAP-001,"ABC UltraBook Pro 14",52999,30,"Laptops & Computers","ABC Pro"`;
  await ingestAgent.parseMessyCatalog(duplicateCsv, 'text/csv', 'merchant-abc-test');
  const countAfter = ingestAgent.getProducts().length;
  assert(countAfter === countBefore, 'Duplicate SKU updated existing product without duplicating catalog count');

  const updatedLaptop = ingestAgent.getProductById('ABC-LAP-001');
  assert(updatedLaptop.price === 52999, 'Price successfully updated on duplicate re-ingest');

  // Test 5: MCP Tool list_catalog
  console.log('\n--- Test 1.5: MCP Tool Execution ---');
  const mcpList = ingestAgent.handleMcpToolCall('list_catalog', { category: 'Laptops' });
  assert(mcpList.total_products >= 1, 'MCP list_catalog filters by category');
  assert(mcpList.products[0].title.includes('UltraBook'), 'Returned UltraBook product');

  // Test 6: Health Metrics Reporting
  console.log('\n--- Test 1.6: Health Metrics Telemetry ---');
  const health = ingestAgent.getHealthMetrics();
  assert(health.status === 'Running', 'Health status is Running');
  assert(health.productsProcessed > 0, 'Products processed metric is tracking');
  assert(health.successRate === '100%', 'Success rate is 100%');

  return { passed, failed };
}
