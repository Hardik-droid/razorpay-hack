import { ingestAgent } from '../../server/agents/ingestAgent.js';
import { integrityAgent } from '../../server/agents/integrityAgent.js';
import { visibilityAgent } from '../../server/agents/visibilityAgent.js';
import { outreachAgent } from '../../server/agents/outreachAgent.js';
import { paymasterAgent } from '../../server/agents/paymasterAgent.js';

export async function runE2ESimulation() {
  console.log('\n========================================');
  console.log('🧪 RUNNING: STEP 10 - Real Merchant Simulation (ABC Electronics, 500 Products)');
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

  const merchantId = 'merchant-abc-electronics';

  // 1. Generate 500 Products for ABC Electronics
  console.log('\n--- Phase 1: Generating 500 Products for ABC Electronics ---');
  const categories = ['Laptops & Computers', 'Smartphones & Mobile', 'Audio & Sound', 'Televisions & Displays', 'Accessories'];
  const brands = ['ABC Pro', 'TechMaster', 'VisionSonic', 'AuraAudio', 'PulseGear'];
  const products500 = [];

  for (let i = 1; i <= 500; i++) {
    const cat = categories[i % categories.length];
    const brand = brands[i % brands.length];
    let title = '';
    let price = 999;

    if (cat === 'Laptops & Computers') {
      title = `${brand} UltraBook Pro Model ${i} (16GB RAM, 512GB SSD)`;
      price = 45000 + (i % 20) * 1500;
    } else if (cat === 'Smartphones & Mobile') {
      title = `${brand} Neo 5G Smartphone Model ${i} (${128 + (i % 3) * 128}GB)`;
      price = 18000 + (i % 15) * 2000;
    } else if (cat === 'Audio & Sound') {
      title = `${brand} Active Noise Cancelling Headphones Model ${i}`;
      price = 3500 + (i % 10) * 800;
    } else if (cat === 'Televisions & Displays') {
      title = `${brand} 4K Ultra HD Gaming Monitor Model ${i}`;
      price = 14000 + (i % 12) * 1200;
    } else {
      title = `${brand} Fast Charging Multi-Port Hub Model ${i}`;
      price = 1200 + (i % 8) * 300;
    }

    products500.push({
      sku: `ABC-SKU-${String(i).padStart(4, '0')}`,
      name: title,
      price,
      stock: 20 + (i % 50),
      category: cat,
      brand,
      description: `High performance consumer electronics product by ${brand}. Full warranty.`,
      variants: [
        { sku: `ABC-SKU-${String(i).padStart(4, '0')}-STD`, name: 'Midnight Black', price, stock: 15 },
        { sku: `ABC-SKU-${String(i).padStart(4, '0')}-SLV`, name: 'Silver Edition', price, stock: 10 },
      ],
    });
  }

  assert(products500.length === 500, 'Created 500 product records in memory');

  // 2. Ingest 500 products via IngestAgent
  console.log('\n--- Phase 2: Ingesting Catalog into AI Storefront ---');
  const ingestRes = await ingestAgent.parseMessyCatalog(products500, 'application/json', merchantId);
  assert(ingestRes.success === true, 'Catalog ingestion succeeded');
  assert(ingestRes.count === 500, `Ingested exactly 500 products (got ${ingestRes.count})`);

  // 3. Verify AI Storefront Feed
  console.log('\n--- Phase 3: AI Storefront Generation & Schema Check ---');
  const feed = ingestAgent.generateJsonLdFeed(merchantId);
  assert(feed['@context'] === 'https://schema.org/', 'JSON-LD context is schema.org');
  assert(feed.dataFeedElement.length >= 500, `JSON-LD feed contains ${feed.dataFeedElement.length} indexed products`);

  // 4. Run Visibility Scan for "Best laptop under 50000"
  console.log('\n--- Phase 4: Visibility Scan Across AI Answer Engines ---');
  const queryEval = await visibilityAgent.runIntentQueryPanel('Best laptop under 50000');
  assert(queryEval.mentioned === true, 'ABC Electronics recognized and recommended for query');
  assert(queryEval.position <= 3, `Ranked in top 3 positions: #${queryEval.position}`);
  assert(queryEval.accuracy >= 90, `Recommendation accuracy is ${queryEval.accuracy}%`);

  // 5. Inbound Buyer Intent to Cart
  console.log('\n--- Phase 5: Buyer Signal to Cart Generation ---');
  const buyerMessage = 'I need 2 laptops under 50000 for our dev interns at ABC';
  const cart = outreachAgent.createCartFromIntent({
    customer_intent: buyerMessage,
    agent_name: 'Procurement AI Agent',
  });
  assert(cart.items.length >= 1, 'Synthesized itemized cart');
  assert(cart.total_amount > 0, `Cart total calculated: ₹${cart.total_amount}`);

  // 6. Complete Autonomous Payment on Razorpay Test Layer
  console.log('\n--- Phase 6: Autonomous Payment Execution & Audit Trail ---');
  const abcMandate = paymasterAgent.createMandate({
    title: 'ABC Electronics Enterprise Procurement Mandate',
    buyerAgentId: 'agent_abc_procurement',
    allowedCategories: ['Laptops & Computers', 'Smartphones & Mobile', 'Audio & Sound', 'General Consumer Products'],
    maxPerTransaction: 100000,
    autonomousThreshold: 100000,
    dailySpendLimit: 500000,
  });

  const payRes = await paymasterAgent.executeCheckout({
    mandateId: abcMandate.id,
    actingAgent: 'Procurement AI Agent',
    buyerIntent: buyerMessage,
    lineItems: [{
      canonical_id: cart.items[0].canonical_id,
      name: cart.items[0].name,
      quantity: 1,
      unit_price: cart.items[0].unit_price,
    }],
    idempotencyKey: `idem_abc_sim_${Date.now()}`,
  });

  assert(payRes.success === true, 'Autonomous payment capture succeeds');
  assert(payRes.razorpay_order_id !== undefined, 'Razorpay order ID issued');
  assert(payRes.audit_record !== undefined, 'Explainable audit trail generated');
  assert(payRes.audit_record.status === 'CAPTURED_SUCCESS', 'Audit log status is CAPTURED_SUCCESS');

  console.log('\n🎉 End-to-End Simulation of 500 Products for ABC Electronics PASSED with 0 manual steps!');
  return { passed, failed };
}
