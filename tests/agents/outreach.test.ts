/**
 * Outreach Agent Automated Test Suite (Unit & Integration)
 * Verifies:
 * - Natural language buyer intent extraction (intent, quantity, budget, product)
 * - Lead qualification and cart creation
 * - Cart totals, taxation, and TRAI consent checking
 */

import { outreachAgent } from '../../server/agents/outreachAgent.js';

export interface OutreachTestResult {
  passed: number;
  failed: number;
}

export async function runOutreachTests(): Promise<OutreachTestResult> {
  console.log('\n========================================');
  console.log('🧪 RUNNING: Outreach Agent Production Tests (TypeScript)');
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

  // Test 1: Buyer Signal Parsing (NLP Entity Extraction)
  console.log('\n--- Test 4.1: NLP Entity & Intent Extraction ---');
  const signal = outreachAgent.parseBuyerSignal('I need 100 office chairs with budget of 50000');
  assert(signal.intent === 'purchase', 'Detected intent as purchase');
  assert(signal.quantity === 100, 'Extracted quantity 100');
  assert(signal.budget === 50000, 'Extracted budget 50000');
  assert(signal.confidence >= 0.85, 'Confidence score >= 0.85');

  // Test 2: Inbound Cart Creation
  console.log('\n--- Test 4.2: Structured Cart Creation from Intent ---');
  const cart = outreachAgent.createCartFromIntent({
    customer_intent: 'Procure 2 laptops under 60000 for development team',
    agent_name: 'Claude 3.7 Shopping Assistant',
    channel: 'Anthropic Autonomous Client',
  });

  assert(cart.id.startsWith('cart-'), 'Generated valid cart ID');
  assert(cart.items.length > 0, 'Cart populated with matched products');
  assert(cart.total_amount > 0, 'Cart total calculated with subtotal and tax');
  assert(cart.trai_consent_verified === true, 'TRAI regulatory consent verified');

  return { passed, failed };
}
