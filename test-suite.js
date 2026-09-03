// Automated Test Suite for Storefront for Machines
import { ingestAgent } from './server/agents/ingestAgent.js';
import { integrityAgent } from './server/agents/integrityAgent.js';
import { visibilityAgent } from './server/agents/visibilityAgent.js';
import { outreachAgent } from './server/agents/outreachAgent.js';
import { paymasterAgent } from './server/agents/paymasterAgent.js';
import { RAW_CATALOG_SAMPLES } from './server/data/seedData.js';

async function runTests() {
  console.log('🧪 Starting Verification Test Suite for Storefront for Machines...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. INGEST AGENT TESTS
  console.log('--- 1. Testing Ingest Agent & MCP Server ---');
  const messyCsv = RAW_CATALOG_SAMPLES.csv_messy;
  const ingestResult = await ingestAgent.parseMessyCatalog(messyCsv, 'csv_messy', 'merchant-subko-001');
  assert(ingestResult.success === true, 'Messy CSV parsing succeeds');
  assert(ingestResult.count > 0, `Normalized ${ingestResult.count} canonical products`);

  const mcpListResult = ingestAgent.handleMcpToolCall('list_catalog', { category: 'Single Origin' });
  assert(mcpListResult.total_products > 0, 'MCP list_catalog tool returns products');

  const mcpQuoteResult = ingestAgent.handleMcpToolCall('validate_order_quote', {
    items: [{ canonical_id: 'CAN-SUBKO-LOT77-ANAE', quantity: 2 }]
  });
  assert(mcpQuoteResult.valid === true, 'MCP validate_order_quote returns valid total');
  assert(mcpQuoteResult.total === 1785, `Order quote calculation correct (₹1785 including tax)`);

  const feed = ingestAgent.generateJsonLdFeed('merchant-subko-001');
  assert(feed['@context'] === 'https://schema.org/', 'JSON-LD feed contains schema.org context');
  assert(feed.dataFeedElement.length > 0, 'JSON-LD feed has product items');

  // 2. INTEGRITY AGENT TESTS
  console.log('\n--- 2. Testing Integrity Agent & Discrepancy Ledger ---');
  const scanResult = await integrityAgent.scanExternalAggregators();
  assert(scanResult.success === true, 'Aggregator crawler successfully scanned sources');
  assert(scanResult.discrepancy_count > 0, 'Discrepancy ledger contains findings');

  const driftCheck = integrityAgent.checkProductIntegrity('CAN-SUBKO-LOT77-ANAE');
  assert(driftCheck.hasDrift === true, 'Integrity Agent correctly detects active price drift on Amazon listing');

  // 3. VISIBILITY AGENT TESTS
  console.log('\n--- 3. Testing Visibility Agent & GEO Scorecard ---');
  const geoResult = await visibilityAgent.runIntentQueryPanel('Best artisanal coffee under ₹1000 in India');
  assert(geoResult.metrics.overallGeoScore > 0, 'Initial GEO score calculated');

  const remediateResult = visibilityAgent.applyFeedRemediation();
  assert(remediateResult.success === true, 'Feed remediation successfully applied');
  assert(remediateResult.scorecard.metrics.overallGeoScore === 96, 'GEO score boosted to 96% post-remediation');

  // 4. OUTREACH AGENT TESTS
  console.log('\n--- 4. Testing Outreach Agent & Cart Synthesizer ---');
  const cart = outreachAgent.createCartFromIntent({
    intentText: 'Procure 1 pack of Subko Lot 77 Anaerobic',
    productCanonicalIds: ['CAN-SUBKO-LOT77-ANAE'],
    budget: 2000,
  });
  assert(cart.id.startsWith('cart-session-'), 'Structured cart created with canonical IDs');
  assert(cart.trai_consent_verified === true, 'TRAI compliance flag verified');

  // 5. PAYMASTER AGENT & RAZORPAY TEST MODE TESTS
  console.log('\n--- 5. Testing Paymaster Agent & Razorpay Payment Scenarios ---');

  // Test 5A: Autonomous Purchase (Below Gate Limit)
  integrityAgent.isDriftSimulationActive = false; // Disable drift for happy path
  const autoBuyResult = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_autonomous_shopper_01',
    actingAgent: 'Subko Autonomous Shopper Agent',
    buyerIntent: 'Restock morning pour over coffee',
    lineItems: [{ canonical_id: 'CAN-SUBKO-LOT77-ANAE', quantity: 1, unit_price: 850 }],
    idempotencyKey: 'test_idem_auto_001',
  });
  assert(autoBuyResult.success === true, 'Autonomous purchase approved without human gate');
  assert(autoBuyResult.razorpay_order_id.startsWith('order_test_'), 'Razorpay test order ID generated');

  // Test 5B: Idempotency Replay (Zero Double-Charge)
  const retryResult = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_autonomous_shopper_01',
    actingAgent: 'Subko Autonomous Shopper Agent',
    buyerIntent: 'Restock morning pour over coffee',
    lineItems: [{ canonical_id: 'CAN-SUBKO-LOT77-ANAE', quantity: 1, unit_price: 850 }],
    idempotencyKey: 'test_idem_auto_001', // Identical key
  });
  assert(retryResult.is_idempotent_replay === true, 'Idempotent duplicate request recognized');
  assert(retryResult.audit_record.idempotency_key === 'test_idem_auto_001', 'Returned original audit record without double charging');

  // Test 5C: Signature Failure Demo (Price Drift Caught Mid-Checkout)
  integrityAgent.isDriftSimulationActive = true; // Re-enable drift
  const driftHaltResult = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_autonomous_shopper_01',
    actingAgent: 'Shopping Agent',
    buyerIntent: 'Buy Subko Lot 77 based on stale price quote',
    lineItems: [{ canonical_id: 'CAN-SUBKO-LOT77-ANAE', quantity: 1, unit_price: 850 }],
    idempotencyKey: 'test_idem_drift_002',
    forcePriceDriftTest: true,
  });
  assert(driftHaltResult.drift_halted === true, 'Paymaster successfully halted transaction due to price drift');
  assert(driftHaltResult.audit_record.status === 'HALTED_PRICE_DRIFT', 'Audit log records HALTED_PRICE_DRIFT');

  // Test 5D: Human Gate Escalation (Order > ₹2,000 Threshold)
  integrityAgent.isDriftSimulationActive = false;
  const gateResult = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_enterprise_restock_02',
    actingAgent: 'Pantry Procurement Agent',
    buyerIntent: 'Quarterly office specialty coffee subscription',
    lineItems: [{ canonical_id: 'CAN-SUBKO-SUB-QTR-3M', quantity: 1, unit_price: 4200 }],
    idempotencyKey: 'test_idem_gate_003',
  });
  assert(gateResult.requires_human_approval === true, 'High-value transaction correctly routed to Human Approval Drawer');
  
  // Test 5E: Human Approval Execution
  const approvalResult = paymasterAgent.approveGateTransaction(gateResult.transaction_id);
  assert(approvalResult.success === true, 'Human gate approval captured transaction on Razorpay');

  // Test 5F: Mandate Exhaustion Refusal
  const exhaustResult = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_autonomous_shopper_01',
    actingAgent: 'Rogue Shopper Agent',
    buyerIntent: 'Bulk order exceeding budget cap',
    lineItems: [{ canonical_id: 'CAN-SUBKO-SUB-QTR-3M', quantity: 10, unit_price: 4200 }], // ₹42,000 > ₹5,000 cap
    idempotencyKey: 'test_idem_exhaust_004',
  });
  assert(exhaustResult.success === false, 'Paymaster strictly rejected over-budget transaction in code');

  console.log(`\n========================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed === 0) {
    console.log('🎉 All Agentic Commerce and Payment engine tests passed flawlessly!');
  } else {
    process.exit(1);
  }
}

runTests().catch(console.error);
