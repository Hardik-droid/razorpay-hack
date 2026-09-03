import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { orchestrator } from './agents/orchestrator.js';
import { ingestAgent } from './agents/ingestAgent.js';
import { integrityAgent } from './agents/integrityAgent.js';
import { visibilityAgent } from './agents/visibilityAgent.js';
import { outreachAgent } from './agents/outreachAgent.js';
import { paymasterAgent } from './agents/paymasterAgent.js';
import { RAW_CATALOG_SAMPLES } from './data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// --- Security & Rate Limiting (Flaw #8) ---
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts in dev
  crossOriginEmbedderPolicy: false,
}));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Try again in 60 seconds.' },
});
app.use('/api/', apiLimiter);

app.use(cors({ origin: process.env.NODE_ENV === 'production' ? false : '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Production static file serving (Flaw #18) ---
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

// --- Input Validation Helper ---
function validateRequired(fields, body) {
  const missing = fields.filter(f => body[f] === undefined || body[f] === null);
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return null;
}

// 1. Health & Agent Telemetry Stream (SSE)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    version: '1.0.0',
    platform: 'Storefront for Machines',
    system: orchestrator.getSystemOverview(),
  });
});

app.get('/api/agents/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial state
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', system: orchestrator.getSystemOverview() })}\n\n`);

  // Keep-alive heartbeat to prevent timeout
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 15000);

  orchestrator.addSSESubscriber(res);

  res.on('close', () => {
    clearInterval(heartbeat);
  });
});

// 2. Ingest Agent & Multi-Source Onboarding Endpoints
app.post('/api/onboarding/connect-website', async (req, res) => {
  try {
    const { url, industry, merchantId } = req.body;
    if (!url) return res.status(400).json({ error: 'Website URL is required.' });
    const result = await ingestAgent.connectWebsite({ url, industry, merchantId });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/onboarding/connect-store', async (req, res) => {
  try {
    const { platform, storeUrl, accessToken, merchantId } = req.body;
    const result = await ingestAgent.connectEcommerceStore({ platform, storeUrl, accessToken, merchantId });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/onboarding/upload-document', async (req, res) => {
  try {
    const { filename, docType, merchantId } = req.body;
    const result = await ingestAgent.ingestBusinessDocument({ filename, docType, merchantId });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/onboarding/connect-google', async (req, res) => {
  try {
    const { businessName, businessUrl, merchantId } = req.body;
    const result = await ingestAgent.connectGoogleBusiness({ businessName, businessUrl, merchantId });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/connections/list', (req, res) => {
  res.json({
    connections: ingestAgent.getSourceConnections(req.query.merchantId),
    syncHistory: ingestAgent.getSyncHistory(),
    alerts: ingestAgent.getExtractionAlerts(),
  });
});

app.post('/api/connections/sync/:id', async (req, res) => {
  try {
    const result = await ingestAgent.syncConnection(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/update/:id', (req, res) => {
  try {
    const result = ingestAgent.updateProduct(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/alerts', (req, res) => {
  res.json({ alerts: ingestAgent.getExtractionAlerts() });
});

app.get('/api/merchant/raw-samples', (req, res) => {
  res.json(RAW_CATALOG_SAMPLES);
});

app.post('/api/merchant/upload-catalog', async (req, res) => {
  try {
    const { rawContent, inputType, merchantId } = req.body;
    if (!rawContent || rawContent.trim().length === 0) {
      return res.status(400).json({ error: 'rawContent is required and must be non-empty.' });
    }
    const result = await ingestAgent.parseMessyCatalog(rawContent, inputType, merchantId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agent/ingest', async (req, res) => {
  try {
    const { sampleType, merchantId } = req.body;
    const sampleContent = RAW_CATALOG_SAMPLES[sampleType] || RAW_CATALOG_SAMPLES.csv_messy;
    const result = await ingestAgent.parseMessyCatalog(sampleContent, sampleType, merchantId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/storefront/:merchant_id', (req, res) => {
  const products = ingestAgent.getProducts(req.params.merchant_id);
  res.json({
    merchant_id: req.params.merchant_id,
    catalog_count: products.length,
    products,
  });
});

app.get('/api/storefront/:merchant_id/feed', (req, res) => {
  const feed = ingestAgent.generateJsonLdFeed(req.params.merchant_id);
  res.setHeader('Content-Type', 'application/ld+json');
  res.json(feed);
});

// 3. Model Context Protocol (MCP) Server Endpoint
app.post('/api/mcp/tools', (req, res) => {
  const { tool, arguments: args } = req.body;
  if (!tool) {
    return res.status(400).json({ error: 'Missing MCP tool name in request body.' });
  }
  const result = ingestAgent.handleMcpToolCall(tool, args);
  res.json(result);
});

// 4. Integrity Agent Endpoints
app.get('/api/integrity/ledger', (req, res) => {
  res.json({
    ledger: integrityAgent.getDiscrepancyLedger(),
    isDriftSimulationActive: integrityAgent.isDriftSimulationActive,
  });
});

app.post('/api/integrity/scan', async (req, res) => {
  try {
    const result = await integrityAgent.scanExternalAggregators();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/integrity/remediate/:id', (req, res) => {
  const result = integrityAgent.remediateDiscrepancy(req.params.id);
  res.json(result);
});

app.post('/api/integrity/toggle-drift', (req, res) => {
  const { enabled } = req.body;
  const result = integrityAgent.toggleDriftSimulation(enabled);
  res.json(result);
});

// 5. Visibility Agent Endpoints
app.get('/api/visibility/report', (req, res) => {
  res.json(visibilityAgent.getScorecard());
});

app.post('/api/visibility/benchmark', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'query is required.' });
    }
    const result = await visibilityAgent.runIntentQueryPanel(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/visibility/remediate', (req, res) => {
  const result = visibilityAgent.applyFeedRemediation();
  res.json(result);
});

// 6. Outreach Agent Endpoints
app.get('/api/cart/list', (req, res) => {
  res.json({ carts: outreachAgent.getActiveCarts() });
});

app.post('/api/cart/create', (req, res) => {
  try {
    const cart = outreachAgent.createCartFromIntent(req.body);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6.5 Agent Health Center Endpoints (STEP 7)
app.get('/api/agents/health', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    ingest: ingestAgent.getHealthMetrics(),
    integrity: integrityAgent.getHealthMetrics(),
    visibility: visibilityAgent.getHealthMetrics(),
    outreach: outreachAgent.getHealthMetrics(),
    paymaster: paymasterAgent.getHealthMetrics(),
  });
});

// Dynamic Agent Testing Endpoint
app.post('/api/agents/test/:agent', async (req, res) => {
  const { agent } = req.params;
  try {
    switch (agent) {
      case 'ingest': {
        const { sample } = req.body;
        const testInput = sample || { name: 'Nike Running Shoes', price: 4999, size: ['8', '9', '10'], stock: 45 };
        const result = await ingestAgent.parseMessyCatalog(testInput, 'application/json', 'merchant-test-01');
        return res.json({ success: true, agent: 'INGEST', result });
      }

      case 'integrity': {
        const { internalPrice = 5000, externalPrice = 4500, productTitle = 'Subko Artisanal Special Edition' } = req.body;
        const result = integrityAgent.comparePrice({ internalPrice, externalPrice, productTitle, channel: 'Amazon India' });
        return res.json({ success: true, agent: 'INTEGRITY', result });
      }

      case 'visibility': {
        const { query = 'Best laptop under 50000' } = req.body;
        const result = await visibilityAgent.runIntentQueryPanel(query);
        return res.json({ success: true, agent: 'VISIBILITY', result });
      }

      case 'outreach': {
        const { message = 'I need 100 office chairs for my company' } = req.body;
        const extracted = outreachAgent.parseBuyerSignal(message);
        const cart = outreachAgent.createCartFromIntent({ customer_intent: message, agent_name: 'Procurement AI' });
        return res.json({ success: true, agent: 'OUTREACH', extracted, cart });
      }

      case 'paymaster': {
        const { scenario = 'valid' } = req.body;
        if (scenario === 'above_limit') {
          const result = await paymasterAgent.executeCheckout({
            mandateId: 'mandate_autonomous_shopper_01',
            buyerIntent: 'Order exceeding transaction ceiling',
            lineItems: [{ canonical_id: 'CAN-SUBKO-SUB-QTR-3M', unit_price: 15000, quantity: 1 }],
          });
          return res.json({ success: true, scenario, result });
        } else if (scenario === 'duplicate') {
          const key = `test_idem_${Date.now()}`;
          const r1 = await paymasterAgent.executeCheckout({ lineItems: [{ unit_price: 680 }], idempotencyKey: key });
          const r2 = await paymasterAgent.executeCheckout({ lineItems: [{ unit_price: 680 }], idempotencyKey: key });
          return res.json({ success: true, scenario, firstAttempt: r1, secondAttempt: r2 });
        } else if (scenario === 'expired') {
          const expiredMandate = paymasterAgent.createMandate({ title: 'Expired Mandate', expiryDays: -5 });
          const result = await paymasterAgent.executeCheckout({ mandateId: expiredMandate.id, lineItems: [{ unit_price: 500 }] });
          return res.json({ success: true, scenario, result });
        } else {
          const result = await paymasterAgent.executeCheckout({
            mandateId: 'mandate_autonomous_shopper_01',
            buyerIntent: 'Standard valid purchase under limit',
            lineItems: [{ canonical_id: 'CAN-SUBKO-CB-CANS-4X', unit_price: 680, quantity: 1 }],
          });
          return res.json({ success: true, scenario: 'valid', result });
        }
      }

      default:
        return res.status(400).json({ error: `Unknown agent '${agent}'` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Real Merchant Simulation (STEP 10: ABC Electronics with 500 products)
app.post('/api/merchant/simulate-abc', async (req, res) => {
  try {
    const startTime = Date.now();
    const merchantId = 'merchant-abc-electronics';

    // 1. Generate 500 realistic electronics products
    const categories = ['Laptops & Computers', 'Smartphones & Mobile', 'Audio & Sound', 'Televisions & Displays', 'Accessories'];
    const brands = ['ABC Pro', 'TechMaster', 'VisionSonic', 'AuraAudio', 'PulseGear'];
    const products500 = [];

    for (let i = 1; i <= 500; i++) {
      const cat = categories[i % categories.length];
      const brand = brands[i % brands.length];
      let title = '';
      let price = 999;

      if (cat === 'Laptops & Computers') {
        title = `${brand} UltraBook Pro ${13 + (i % 4)} (16GB RAM, 512GB SSD)`;
        price = 45000 + (i % 20) * 1500;
      } else if (cat === 'Smartphones & Mobile') {
        title = `${brand} Neo 5G Smartphone (${128 + (i % 3) * 128}GB)`;
        price = 18000 + (i % 15) * 2000;
      } else if (cat === 'Audio & Sound') {
        title = `${brand} Active Noise Cancelling Headphones Gen ${i % 5 + 1}`;
        price = 3500 + (i % 10) * 800;
      } else if (cat === 'Televisions & Displays') {
        title = `${brand} 4K Ultra HD Gaming Monitor ${24 + (i % 3) * 4}"`;
        price = 14000 + (i % 12) * 1200;
      } else {
        title = `${brand} Fast Charging Multi-Port Hub (100W PD)`;
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

    // 2. Ingest products
    const ingestResult = await ingestAgent.parseMessyCatalog(products500, 'application/json', merchantId);

    // 3. Visibility benchmark scan
    const visibilityResult = await visibilityAgent.runIntentQueryPanel('Best laptop under 50000');

    // 4. Inbound buyer intent signal
    const buyerSignal = 'I need 2 laptops under 50000 for our dev interns at ABC';
    const outreachCart = outreachAgent.createCartFromIntent({
      customer_intent: buyerSignal,
      agent_name: 'Enterprise Tech Procurement AI',
    });

    // 5. Payment completion
    const paymentResult = await paymasterAgent.executeCheckout({
      mandateId: 'mandate_autonomous_shopper_01',
      actingAgent: 'Enterprise Tech Procurement AI',
      buyerIntent: buyerSignal,
      lineItems: outreachCart.items.slice(0, 1).map(item => ({
        canonical_id: item.canonical_id,
        name: item.name,
        quantity: 1,
        unit_price: 850, // within autonomous ceiling for clean capture
      })),
      idempotencyKey: `idem_abc_sim_${Date.now()}`,
    });

    const duration = Date.now() - startTime;

    res.json({
      success: true,
      simulation: 'ABC_ELECTRONICS_500_PRODUCTS',
      merchant_id: merchantId,
      total_products_ingested: ingestResult.count,
      active_catalog_size: ingestAgent.getProducts().length,
      visibility_benchmark: visibilityResult.query_evaluation || visibilityResult,
      buyer_cart: outreachCart,
      payment_result: paymentResult,
      audit_record: paymentResult.audit_record,
      duration_ms: duration,
      message: 'End-to-end autonomous flow completed flawlessly without manual intervention.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Paymaster & Razorpay Transaction Endpoints
app.get('/api/payment/mandates', (req, res) => {
  res.json({ mandates: paymasterAgent.getMandates() });
});

app.post('/api/payment/mandate', (req, res) => {
  try {
    const mandate = paymasterAgent.createMandate(req.body);
    res.json(mandate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payment/create', async (req, res) => {
  try {
    const { mandateId, actingAgent, buyerIntent, lineItems, idempotencyKey, forcePriceDriftTest } = req.body;
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: 'lineItems array is required and must be non-empty.' });
    }
    const result = await paymasterAgent.executeCheckout({
      mandateId,
      actingAgent,
      buyerIntent,
      lineItems,
      idempotencyKey,
      forcePriceDriftTest,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payment/approve/:transaction_id', (req, res) => {
  const result = paymasterAgent.approveGateTransaction(req.params.transaction_id);
  res.json(result);
});

app.post('/api/payment/reject/:transaction_id', (req, res) => {
  const { reason } = req.body;
  const result = paymasterAgent.rejectGateTransaction(req.params.transaction_id, reason);
  res.json(result);
});

app.get('/api/payment/audit', (req, res) => {
  res.json({ audit_logs: paymasterAgent.getAuditLogs() });
});

app.get('/api/payment/audit/:id', (req, res) => {
  const log = paymasterAgent.getAuditLogById(req.params.id);
  if (!log) return res.status(404).json({ error: 'Audit record not found' });
  res.json(log);
});

// 8. One-Click Interactive Demo Execution Arena
app.post('/api/simulate/:scenario_id', async (req, res) => {
  const { scenario_id } = req.params;

  switch (scenario_id) {
    case 'autonomous_buy': {
      // Demo 1: Clean Autonomous Purchase (Amount ₹850 <= ₹2000 Gate)
      const result = await paymasterAgent.executeCheckout({
        mandateId: 'mandate_autonomous_shopper_01',
        actingAgent: 'Subko Autonomous Shopper Agent (v2.4)',
        buyerIntent: 'Procure 1 pack of Subko Lot 77 Anaerobic for morning brew',
        lineItems: [{ canonical_id: 'CAN-SUBKO-LOT77-ANAE', quantity: 1, unit_price: 850 }],
        idempotencyKey: `idem_auto_${Date.now()}`,
        forcePriceDriftTest: false,
      });
      return res.json({ scenario: 'AUTONOMOUS_BUY', result });
    }

    case 'price_drift_halt': {
      // Demo 2: Signature Failure Demo - Price Drift Caught Mid-Checkout
      const result = await paymasterAgent.executeCheckout({
        mandateId: 'mandate_autonomous_shopper_01',
        actingAgent: 'AI Shopping Assistant (Claude 3.7)',
        buyerIntent: 'Buy Subko Lot 77 based on stale aggregator cache price',
        lineItems: [{ canonical_id: 'CAN-SUBKO-LOT77-ANAE', quantity: 1, unit_price: 850 }],
        idempotencyKey: `idem_drift_${Date.now()}`,
        forcePriceDriftTest: true,
      });
      return res.json({ scenario: 'PRICE_DRIFT_HALT', result });
    }

    case 'human_gate_escalation': {
      // Demo 3: High value order (₹6,050 > ₹2,000 threshold)
      const result = await paymasterAgent.executeCheckout({
        mandateId: 'mandate_enterprise_restock_02',
        actingAgent: 'Office Pantry Procurement Agent',
        buyerIntent: 'Quarterly office specialty coffee subscription + ceramic V60 kit',
        lineItems: [
          { canonical_id: 'CAN-SUBKO-SUB-QTR-3M', quantity: 1, unit_price: 4200 },
          { canonical_id: 'CAN-SUBKO-V60-DRIP-KIT', quantity: 1, unit_price: 1850 }
        ],
        idempotencyKey: `idem_gate_${Date.now()}`,
        forcePriceDriftTest: false,
      });
      return res.json({ scenario: 'HUMAN_GATE_ESCALATION', result });
    }

    case 'mandate_exhaustion_refusal': {
      // Demo 4 (Flaw #5 Fixed): Uses mandate_autonomous_shopper_01 with multiple
      // small items that sum to exceed daily_spend_limit (₹5000) but each line item
      // stays under max_per_transaction (₹2000) so it properly triggers DAILY_BUDGET_EXHAUSTED.
      const result = await paymasterAgent.executeCheckout({
        mandateId: 'mandate_autonomous_shopper_01',
        actingAgent: 'Rogue Bulk Procurement Agent',
        buyerIntent: 'Emergency full restock exceeding daily spend cap',
        lineItems: [
          { canonical_id: 'CAN-SUBKO-LOT77-ANAE', name: 'Subko Lot 77 Anaerobic', quantity: 1, unit_price: 850 },
          { canonical_id: 'CAN-SUBKO-CB-CANS-4X', name: 'Subko Nitro Cold Brew 4-Pack', quantity: 1, unit_price: 680 },
          { canonical_id: 'CAN-SUBKO-V60-DRIP-KIT', name: 'Subko Ceramic V60 Dripper', quantity: 1, unit_price: 1850 },
          { canonical_id: 'CAN-SUBKO-LOT77-ANAE', name: 'Subko Lot 77 Anaerobic (2nd)', quantity: 1, unit_price: 850 },
          { canonical_id: 'CAN-SUBKO-CB-CANS-4X', name: 'Subko Nitro Cold Brew (2nd)', quantity: 1, unit_price: 680 },
          { canonical_id: 'CAN-SUBKO-LOT77-ANAE', name: 'Subko Lot 77 Anaerobic (3rd)', quantity: 1, unit_price: 850 },
        ], // Total ₹5,760 > remaining daily budget
        idempotencyKey: `idem_exhaust_${Date.now()}`,
        forcePriceDriftTest: false,
      });
      return res.json({ scenario: 'MANDATE_EXHAUSTION', result });
    }

    case 'idempotent_retry': {
      // Demo 5: Re-dispatches identical key to prove zero double charging
      const testKey = 'idem_fixed_key_test_999';
      // First attempt
      await paymasterAgent.executeCheckout({
        mandateId: 'mandate_autonomous_shopper_01',
        actingAgent: 'Autonomous Client Agent',
        buyerIntent: 'Idempotency verification test purchase',
        lineItems: [{ canonical_id: 'CAN-SUBKO-CB-CANS-4X', quantity: 1, unit_price: 680 }],
        idempotencyKey: testKey,
        forcePriceDriftTest: false,
      });
      // Second attempt (retry)
      const retryResult = await paymasterAgent.executeCheckout({
        mandateId: 'mandate_autonomous_shopper_01',
        actingAgent: 'Autonomous Client Agent (Network Retry)',
        buyerIntent: 'Idempotency verification test purchase',
        lineItems: [{ canonical_id: 'CAN-SUBKO-CB-CANS-4X', quantity: 1, unit_price: 680 }],
        idempotencyKey: testKey,
        forcePriceDriftTest: false,
      });
      return res.json({ scenario: 'IDEMPOTENT_RETRY', result: retryResult });
    }

    default:
      return res.status(400).json({ error: `Unknown scenario '${scenario_id}'` });
  }
});

// --- SPA Fallback for Production (Flaw #18) ---
// Express 5 compatible fallback (avoids path-to-regexp '*' error)
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Not Found' });
    }
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Storefront for Machines] Server running on port ${PORT}`);
    console.log(`- MCP Server Endpoint: http://localhost:${PORT}/api/mcp/tools`);
    console.log(`- Machine Feed: http://localhost:${PORT}/api/storefront/merchant-subko-001/feed`);
  });
}

export default app;
