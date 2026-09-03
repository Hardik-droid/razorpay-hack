import { outreachAgent } from '../../server/agents/outreachAgent.js';

export async function runOutreachTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING: Outreach Agent Production Tests');
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

  // Test 1: User Prompt Specification: "I need 100 office chairs for my company"
  console.log('\n--- Test 4.1: Buyer Intent Extraction (User Prompt Example) ---');
  const message = 'I need 100 office chairs for my company';
  const extracted = outreachAgent.parseBuyerSignal(message);

  assert(extracted.intent === 'purchase', 'Intent extracted as "purchase"');
  assert(extracted.product.toLowerCase().includes('office chair'), `Product identified as "${extracted.product}"`);
  assert(extracted.quantity === 100, `Quantity extracted as ${extracted.quantity} (expected 100)`);
  assert(extracted.budget === null, 'Budget identified as null when unspecified');
  assert(extracted.confidence >= 0.91, `Confidence score ${extracted.confidence} >= 0.91`);

  // Test 2: Extraction with Explicit Budget and Quantity
  console.log('\n--- Test 4.2: Extraction with Quantity and Budget ---');
  const budgetMessage = 'Please procure 2 laptops with a budget of 50000 each for dev team';
  const budgetExtracted = outreachAgent.parseBuyerSignal(budgetMessage);

  assert(budgetExtracted.intent === 'purchase', 'Intent is purchase');
  assert(budgetExtracted.quantity === 2, `Quantity is 2 (got ${budgetExtracted.quantity})`);
  assert(budgetExtracted.budget === 50000, `Budget is ₹50,000 (got ${budgetExtracted.budget})`);
  assert(budgetExtracted.confidence >= 0.95, `Confidence with budget is high: ${budgetExtracted.confidence}`);

  // Test 3: Structured Cart Creation from Intent
  console.log('\n--- Test 4.3: Structured Cart Creation ---');
  const cart = outreachAgent.createCartFromIntent({
    customer_intent: 'I need 100 office chairs for my company',
    agent_name: 'Autonomous Procurement Agent',
  });

  assert(cart.id.startsWith('cart-session-'), 'Valid cart session ID created');
  assert(cart.items.length >= 1, 'Cart contains itemized products');
  assert(cart.items[0].quantity === 100, 'Cart item has quantity 100');
  assert(cart.total_amount > 0, `Total amount calculated (₹${cart.total_amount})`);
  assert(cart.tax > 0, `Tax calculated (₹${cart.tax})`);
  assert(cart.status === 'HIGH_VALUE_GATE_APPROVAL_REQUIRED', 'Orders above ₹2,000 flagged for high value gate approval');

  // Test 4: Health Metrics Telemetry
  console.log('\n--- Test 4.4: Health Metrics Telemetry ---');
  const health = outreachAgent.getHealthMetrics();
  assert(health.status === 'Active', 'Outreach status is Active');
  assert(health.buyerIntentDetected > 0, 'Buyer intents detected metric is tracking');
  assert(health.cartCreated > 0, 'Carts created metric is tracking');

  return { passed, failed };
}
