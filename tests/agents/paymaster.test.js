import { paymasterAgent } from '../../server/agents/paymasterAgent.js';
import { integrityAgent } from '../../server/agents/integrityAgent.js';

export async function runPaymasterTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING: Paymaster Agent Production Tests');
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

  // Test 1 (User Spec 6.1): Valid Payment Under Mandate -> SUCCESS
  console.log('\n--- Test 5.1: Valid Payment Under Mandate ---');
  const validPayment = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_autonomous_shopper_01',
    actingAgent: 'Automated Procurement Shopper',
    buyerIntent: 'Procure 1 pack of coffee under mandate threshold',
    lineItems: [{ canonical_id: 'CAN-SUBKO-CB-CANS-4X', unit_price: 680, quantity: 1 }],
    idempotencyKey: `idem_valid_test_${Date.now()}`,
  });

  assert(validPayment.success === true, 'Payment status is success: true');
  assert(validPayment.status === 'CAPTURED_SUCCESS', 'Transaction status is CAPTURED_SUCCESS');
  assert(validPayment.razorpay_order_id !== undefined, 'Razorpay test order ID generated');
  assert(validPayment.razorpay_payment_id !== undefined, 'Razorpay test payment ID generated');
  assert(validPayment.audit_record !== undefined, 'Immutable audit record created');
  assert(validPayment.audit_record.gate_decision.includes('AUTONOMOUS_APPROVED'), 'Gate decision marked as autonomous approved');

  // Test 2 (User Spec 6.2): Payment Above Limit -> BLOCK
  console.log('\n--- Test 5.2: Payment Above Limit (BLOCK) ---');
  // Mandate has max_per_transaction: 2000. Three canonical ₹680 items total ₹2,040.
  const aboveLimitPayment = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_autonomous_shopper_01',
    actingAgent: 'Rogue Shopper',
    buyerIntent: 'Single order exceeding per-transaction limit',
    lineItems: [{ canonical_id: 'CAN-SUBKO-CB-CANS-4X', unit_price: 680, quantity: 3 }],
    idempotencyKey: `idem_limit_test_${Date.now()}`,
  });

  assert(aboveLimitPayment.success === false, 'Payment blocked: success is false');
  assert(aboveLimitPayment.status === 'BLOCKED', 'Status is BLOCKED');
  assert(aboveLimitPayment.code === 'MAX_PER_TX_EXCEEDED', 'Error code is MAX_PER_TX_EXCEEDED');
  assert(aboveLimitPayment.error.includes('MANDATE_EXCEEDED'), 'Error message cites mandate ceiling violation');

  // Unknown mandates must never fall back to another buyer's authorization.
  const unknownMandate = await paymasterAgent.executeCheckout({
    mandateId: 'mandate-does-not-exist',
    lineItems: [{ canonical_id: 'CAN-SUBKO-CB-CANS-4X', unit_price: 680, quantity: 1 }],
  });
  assert(unknownMandate.success === false, 'Unknown mandate is rejected');
  assert(unknownMandate.code === 'MANDATE_INVALID', 'Unknown mandate cannot fall back to the default mandate');

  // Client-supplied prices are checked against the canonical catalog price.
  const forgedPrice = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_autonomous_shopper_01',
    lineItems: [{ canonical_id: 'CAN-SUBKO-CB-CANS-4X', unit_price: 1, quantity: 1 }],
  });
  assert(forgedPrice.success === false, 'Forged client price is rejected');
  assert(forgedPrice.code === 'PRICE_MISMATCH', 'Forged price reports canonical price mismatch');

  const derivedPrice = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_autonomous_shopper_01',
    lineItems: [{ canonical_id: 'CAN-SUBKO-CB-CANS-4X', quantity: 1 }],
  });
  assert(derivedPrice.success === true, 'Missing client price is derived from the canonical catalog');
  assert(derivedPrice.audit_record.amount === 680, 'Canonical catalog price is charged');

  const previousDriftState = integrityAgent.isDriftSimulationActive;
  integrityAgent.isDriftSimulationActive = false;
  const forcedDrift = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_autonomous_shopper_01',
    lineItems: [{ canonical_id: 'CAN-SUBKO-LOT77-ANAE', unit_price: 850, quantity: 1 }],
    forcePriceDriftTest: true,
  });
  assert(forcedDrift.status === 'HALTED_PRICE_DRIFT', 'Forced drift demo remains deterministic');
  assert(integrityAgent.isDriftSimulationActive === false, 'Forced drift does not leak global state into later checkouts');
  integrityAgent.isDriftSimulationActive = previousDriftState;

  // Test 3 (User Spec 6.3): Duplicate Payment Request -> Only ONE Transaction (Idempotent)
  console.log('\n--- Test 5.3: Duplicate Request / Idempotency ---');
  const sharedKey = `idem_fixed_key_suite_${Date.now()}`;
  
  // First attempt
  const attempt1 = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_autonomous_shopper_01',
    actingAgent: 'Client Agent',
    buyerIntent: 'Idempotency verification purchase',
    lineItems: [{ canonical_id: 'CAN-SUBKO-CB-CANS-4X', unit_price: 680, quantity: 1 }],
    idempotencyKey: sharedKey,
  });

  assert(attempt1.success === true, 'First attempt succeeds');
  const originalTxId = attempt1.transaction_id;

  // Second attempt (identical key)
  const attempt2 = await paymasterAgent.executeCheckout({
    mandateId: 'mandate_autonomous_shopper_01',
    actingAgent: 'Client Agent (Retry)',
    buyerIntent: 'Idempotency verification purchase',
    lineItems: [{ canonical_id: 'CAN-SUBKO-CB-CANS-4X', unit_price: 680, quantity: 1 }],
    idempotencyKey: sharedKey,
  });

  assert(attempt2.success === true, 'Retry attempt succeeds without throwing');
  assert(attempt2.is_idempotent_replay === true, 'Flagged as is_idempotent_replay: true');
  assert(attempt2.audit_record.transaction_id === originalTxId, 'Returned original transaction ID without creating a new transaction');

  // Test 4 (User Spec 6.4): Expired Mandate -> REJECT
  console.log('\n--- Test 5.4: Expired Mandate (REJECT) ---');
  const expiredMandate = paymasterAgent.createMandate({
    title: 'Test Expired Mandate',
    expiryDays: -5, // Expired 5 days ago
  });

  const expiredPayment = await paymasterAgent.executeCheckout({
    mandateId: expiredMandate.id,
    actingAgent: 'Shopper Agent',
    buyerIntent: 'Attempt checkout on expired mandate',
    lineItems: [{ canonical_id: 'CAN-SUBKO-CB-CANS-4X', unit_price: 680, quantity: 1 }],
    idempotencyKey: `idem_expired_${Date.now()}`,
  });

  assert(expiredPayment.success === false, 'Payment on expired mandate rejected (success: false)');
  assert(expiredPayment.status === 'REJECTED', 'Status is REJECTED');
  assert(expiredPayment.code === 'MANDATE_EXPIRED', 'Code is MANDATE_EXPIRED');

  // Test 5: Human Gate Approval Flow (Orders > ₹2,000)
  console.log('\n--- Test 5.5: Human Gate Escalation & Approval ---');
  // Order on mandate with autonomous_threshold_gate: 2000, max_per_tx: 10000
  const gateMandate = paymasterAgent.createMandate({
    title: 'High-Value Corporate Mandate',
    maxPerTransaction: 10000,
    autonomousThreshold: 2000,
    dailySpendLimit: 25000,
  });

  const gatePayment = await paymasterAgent.executeCheckout({
    mandateId: gateMandate.id,
    actingAgent: 'Office Manager AI',
    buyerIntent: 'High-value quarterly restock',
    lineItems: [{ canonical_id: 'CAN-SUBKO-SUB-QTR-3M', unit_price: 4200, quantity: 1 }],
    idempotencyKey: `idem_gate_test_${Date.now()}`,
  });

  assert(gatePayment.status === 'PENDING_HUMAN_APPROVAL', 'Status is PENDING_HUMAN_APPROVAL');
  assert(gatePayment.requires_human_approval === true, 'requires_human_approval is true');
  assert(gatePayment.pending_transaction !== undefined, 'Pending transaction generated');

  // Human Admin approves transaction
  const approvalResult = paymasterAgent.approveGateTransaction(gatePayment.transaction_id);
  assert(approvalResult.success === true, 'Human approval succeeded');
  assert(approvalResult.status === 'CAPTURED_SUCCESS', 'Status updated to CAPTURED_SUCCESS post-approval');
  assert(approvalResult.razorpay_order_id !== undefined, 'Razorpay order ID issued upon human approval');

  // Test 6: Health Metrics Telemetry
  console.log('\n--- Test 5.6: Health Metrics Telemetry ---');
  const health = paymasterAgent.getHealthMetrics();
  assert(health.status === 'Ready', 'Paymaster status is Ready');
  assert(health.transactions > 0, 'Total transactions metric is tracking');
  assert(health.successful > 0, 'Successful transactions metric is tracking');
  assert(health.blocked > 0, 'Blocked transactions metric is tracking');

  return { passed, failed };
}
