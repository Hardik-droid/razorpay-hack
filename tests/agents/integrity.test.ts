/**
 * Integrity Agent Automated Test Suite (Unit & Integration)
 * Verifies:
 * - Comparison engine for internal vs external pricing
 * - Issue detection (Price mismatch vs Price verified)
 * - Confidence score calculation based on drift magnitude
 * - External aggregator scanning and discrepancy ledger management
 */

import { integrityAgent } from '../../server/agents/integrityAgent.js';

export interface IntegrityTestResult {
  passed: number;
  failed: number;
}

export async function runIntegrityTests(): Promise<IntegrityTestResult> {
  console.log('\n========================================');
  console.log('🧪 RUNNING: Integrity Agent Production Tests (TypeScript)');
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

  // Test 1: Price Comparison Engine with Drift
  console.log('\n--- Test 2.1: Price Drift Comparison Engine ---');
  const comp1 = integrityAgent.comparePrice({
    internalPrice: 5000,
    externalPrice: 4500,
    productTitle: 'Demo Electronics Laptop',
    channel: 'Amazon India',
  });

  assert(comp1.has_mismatch === true, 'Accurately flags has_mismatch as true');
  assert(comp1.issue === 'Price mismatch', 'Issue labeled as Price mismatch');
  assert(comp1.price_drift_percentage === -10, 'Calculates exact -10% drift');
  assert(comp1.confidence >= 0.95, 'Calculates confidence >= 0.95');
  assert(comp1.suggestion === 'Update external listing', 'Generates correct remediation action');

  // Test 2: Verified Matching Price
  console.log('\n--- Test 2.2: Consistent Pricing Verification ---');
  const comp2 = integrityAgent.comparePrice({
    internalPrice: 2499,
    externalPrice: 2499,
    productTitle: '100W GaN Travel Charger',
    channel: 'Flipkart',
  });

  assert(comp2.has_mismatch === false, 'Matching prices produce has_mismatch false');
  assert(comp2.issue === 'Price verified', 'Issue labeled as Price verified');

  // Test 3: Aggregator Scan and Discrepancy Recording
  console.log('\n--- Test 2.3: Aggregator Crawl & Ledger ---');
  const scan = await integrityAgent.scanExternalAggregators();
  assert(scan.success === true, 'Aggregator crawl scan returns success');
  assert(scan.scanned_sources === 5, 'Scanned 5 truth channels');

  const ledger = integrityAgent.getDiscrepancyLedger();
  assert(ledger.length > 0, 'Ledger contains discrepancies');

  return { passed, failed };
}
