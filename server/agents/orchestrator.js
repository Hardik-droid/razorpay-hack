import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

class MasterOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.agentRuns = [];
    this.activeSubscribers = new Set();
    
    // Detailed Agent Monitoring state for Phase 6 Internal Debug Panel
    this.agentMonitoringRecords = {
      ingest: {
        agentName: 'Ingest Agent',
        status: 'SUCCESS',
        lastRun: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        input: 'Website URL (https://subko.coffee) & Shopify Connector',
        output: '532 Products Created & Normalized into Schema.org JSON-LD',
        executionTime: '420ms',
        errors: '0 errors',
        databaseChanges: '+532 Products, 4 Categories, 1,064 Variants Synced',
        channel: 'Web Crawler / Shopify API',
      },
      integrity: {
        agentName: 'Integrity Agent',
        status: 'SUCCESS',
        lastRun: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        input: 'Aggregator Scrape (Amazon India, Flipkart, Swiggy Instamart)',
        output: 'Price Comparison Complete: 3 Discrepancies Flagged with 98% Confidence',
        executionTime: '310ms',
        errors: '0 errors',
        databaseChanges: '3 Discrepancy Records written to Ledger, 1 Stale Cache Alert',
        channel: 'Marketplace Crawl Engine',
      },
      visibility: {
        agentName: 'Visibility Agent',
        status: 'SUCCESS',
        lastRun: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        input: 'Synthetic Buyer Intent Query: "Best laptop under ₹50,000"',
        output: 'Position #1 Identified; Overall GEO Score: 85% (Feed Remediated to 94%)',
        executionTime: '265ms',
        errors: '0 errors',
        databaseChanges: 'Visibility Benchmark Scorecard Updated',
        channel: 'Generative Search Simulator',
      },
      outreach: {
        agentName: 'Outreach Agent',
        status: 'SUCCESS',
        lastRun: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
        input: 'Inbound Signal: "I need 100 office chairs for company restock"',
        output: 'Buyer Intent Extracted (Procurement, Qty: 100, Budget: ₹200k) -> Cart Created',
        executionTime: '180ms',
        errors: '0 errors',
        databaseChanges: '1 Active Cart Session Created (TRAI Consent Verified)',
        channel: 'ChatGPT Commerce Intent Listener',
      },
      paymaster: {
        agentName: 'Paymaster Agent',
        status: 'SUCCESS',
        lastRun: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        input: 'Razorpay Mandate Authorization: ₹850 Autonomous Checkout',
        output: 'AP2 Cryptographic Token Validated -> Razorpay Test Mode Captured',
        executionTime: '345ms',
        errors: '0 errors',
        databaseChanges: 'Mandate Balance Deducted, 1 Cryptographic Audit Record Appended',
        channel: 'AP2 Payment Engine / Razorpay Test API',
      },
    };

    this.agentStatuses = {
      INGEST: { status: 'ACTIVE', lastRun: this.agentMonitoringRecords.ingest.lastRun, totalParsed: 532 },
      INTEGRITY: { status: 'MONITORING', lastRun: this.agentMonitoringRecords.integrity.lastRun, activeDiscrepancies: 3 },
      VISIBILITY: { status: 'EVALUATED', lastRun: this.agentMonitoringRecords.visibility.lastRun, currentGeoScore: 85 },
      OUTREACH: { status: 'LISTENING', lastRun: this.agentMonitoringRecords.outreach.lastRun, qualifiedCarts: 18 },
      PAYMASTER: { status: 'ARMED', lastRun: this.agentMonitoringRecords.paymaster.lastRun, successfulTxs: 9, guardedTxs: 2 },
    };
  }

  logEvent(agentType, action, details, level = 'INFO') {
    const event = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      agentType,
      action,
      details,
      level,
    };

    this.agentRuns.unshift(event);
    if (this.agentRuns.length > 200) this.agentRuns.pop();

    if (this.agentStatuses[agentType]) {
      this.agentStatuses[agentType].status = level === 'ERROR' ? 'ALERT' : 'ACTIVE';
      this.agentStatuses[agentType].lastRun = event.timestamp;
    }

    // Update monitoring record if relevant
    const key = agentType.toLowerCase();
    if (this.agentMonitoringRecords[key]) {
      this.agentMonitoringRecords[key].lastRun = event.timestamp;
      this.agentMonitoringRecords[key].status = level === 'ERROR' ? 'ERROR' : 'SUCCESS';
      if (details.output) this.agentMonitoringRecords[key].output = String(details.output);
      if (details.executionTimeMs) this.agentMonitoringRecords[key].executionTime = `${details.executionTimeMs}ms`;
      if (details.dbChanges) this.agentMonitoringRecords[key].databaseChanges = String(details.dbChanges);
    }

    this.emit('agent_event', event);
    this.broadcastToSSE(event);
    return event;
  }

  recordAgentMonitoringRun(agentKey, record) {
    if (this.agentMonitoringRecords[agentKey]) {
      this.agentMonitoringRecords[agentKey] = {
        ...this.agentMonitoringRecords[agentKey],
        ...record,
        lastRun: new Date().toISOString(),
      };
    }
  }

  getAgentMonitoringLogs() {
    return Object.values(this.agentMonitoringRecords);
  }

  addSSESubscriber(res) {
    this.activeSubscribers.add(res);
    res.on('close', () => {
      this.activeSubscribers.delete(res);
    });
  }

  broadcastToSSE(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of this.activeSubscribers) {
      try {
        client.write(payload);
      } catch (err) {
        this.activeSubscribers.delete(client);
      }
    }
  }

  getSystemOverview() {
    return {
      agentStatuses: this.agentStatuses,
      agentMonitoring: this.getAgentMonitoringLogs(),
      recentEvents: this.agentRuns.slice(0, 50),
      totalSubscribers: this.activeSubscribers.size,
    };
  }
}

export const orchestrator = new MasterOrchestrator();
