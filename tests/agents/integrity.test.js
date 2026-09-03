import { integrityAgent } from '../../server/agents/integrityAgent.js';

export async function runIntegrityTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING: Integrity Agent Production Tests');
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

  // Test 1: Price Mismatch Comparison Engine (User Spec Example: 5000 vs 4500)
  console.log('\n--- Test 2.1: Price Mismatch Comparison Logic ---');
  const comparison = integrityAgent.comparePrice({
    internalPrice: 5000,
    externalPrice: 4500,
    productTitle: 'ABC UltraBook Pro 14',
    channel: 'Amazon India'
  });

  assert(comparison.issue === 'Price mismatch', 'Accurately flags issue as "Price mismatch"');
  assert(comparison.confidence >= 0.95, `Confidence score ${comparison.confidence} >= 0.95`);
  assert(comparison.suggestion === 'Update external listing', 'Provides exact suggestion: "Update external listing"');
  assert(comparison.has_mismatch === true, 'has_mismatch flag is true');
  assert(comparison.price_drift_percentage === -10, 'Computes price drift percentage: -10%');

  // Test 2: In-bounds Matching Price (No Mismatch)
  console.log('\n--- Test 2.2: Consistent Pricing Verification ---');
  const matchingComparison = integrityAgent.comparePrice({
    internalPrice: 1200,
    externalPrice: 1200,
    productTitle: 'ABC Fast Charging Hub',
    channel: 'Flipkart'
  });

  assert(matchingComparison.has_mismatch === false, 'Matching prices result in no mismatch');
  assert(matchingComparison.issue === 'Price verified', 'Issue marked as "Price verified"');
  assert(matchingComparison.suggestion === 'No action required', 'No action required for verified prices');

  // Test 3: Web Aggregator Crawl Simulation & Discrepancy Storage
  console.log('\n--- Test 2.3: Aggregator Crawl & Ledger Storage ---');
  const scanResult = await integrityAgent.scanExternalAggregators();
  assert(scanResult.success === true, 'Aggregator crawl scan completed successfully');
  assert(scanResult.scanned_sources === 5, 'Scanned 5 external truth channels');
  assert(scanResult.discrepancy_count > 0, 'Discrepancies recorded in persistent ledger');

  // Test 4: Drift Detection Check Mid-Checkout
  console.log('\n--- Test 2.4: Mid-Checkout Integrity Interception ---');
  integrityAgent.isDriftSimulationActive = true;
  const driftCheck = integrityAgent.checkProductIntegrity('CAN-SUBKO-LOT77-ANAE');
  assert(driftCheck.hasDrift === true, 'Integrity Agent flags active drift for flagged SKU');
  assert(driftCheck.canonicalPrice === 850, 'Identified internal canonical price ₹850');
  assert(driftCheck.scrapedPrice === 650, 'Identified external stale price ₹650');

  // Test 5: 1-Click Remediation
  console.log('\n--- Test 2.5: Discrepancy Remediation ---');
  const targetDiscrepancy = integrityAgent.getDiscrepancyLedger()[0];
  const remediationResult = integrityAgent.remediateDiscrepancy(targetDiscrepancy.id);
  assert(remediationResult.success === true, 'Remediation completed successfully');
  assert(remediationResult.discrepancy.status === 'REMEDIATED', 'Discrepancy status updated to REMEDIATED');

  // Test 6: Health Metrics Telemetry
  console.log('\n--- Test 2.6: Health Metrics Telemetry ---');
  const health = integrityAgent.getHealthMetrics();
  assert(health.status === 'Scanning', 'Integrity status is Scanning');
  assert(health.scansCompleted > 0, 'Scans completed metric is tracking');
  assert(health.accuracy.includes('%'), 'Accuracy metric reported as percentage');

  return { passed, failed };
}
