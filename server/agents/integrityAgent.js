import { v4 as uuidv4 } from 'uuid';
import { INITIAL_DISCREPANCIES } from '../data/seedData.js';
import { orchestrator } from './orchestrator.js';
import { ingestAgent } from './ingestAgent.js';

class IntegrityAgent {
  constructor() {
    this.discrepancies = [...INITIAL_DISCREPANCIES];
    this.isDriftSimulationActive = true;
    this.stats = {
      status: 'Scanning',
      lastExecution: new Date().toISOString(),
      scansCompleted: 14,
      issuesFound: INITIAL_DISCREPANCIES.length,
      accuracy: 98.4,
    };
  }

  getDiscrepancyLedger() {
    return this.discrepancies;
  }

  getHealthMetrics() {
    return {
      status: this.stats.status,
      lastExecution: this.stats.lastExecution,
      scansCompleted: this.stats.scansCompleted,
      issuesFound: this.discrepancies.filter(d => d.status !== 'REMEDIATED').length,
      totalIssuesRecorded: this.discrepancies.length,
      accuracy: `${this.stats.accuracy}%`,
    };
  }

  // Generic Comparison Engine: compares internal product price against external crawled sources
  comparePrice({ internalPrice, externalPrice, productTitle, channel = 'Amazon India' }) {
    const pInternal = parseFloat(internalPrice);
    const pExternal = parseFloat(externalPrice);
    const diff = pExternal - pInternal;
    const driftPercent = Math.round((diff / pInternal) * 1000) / 10;

    const hasMismatch = Math.abs(driftPercent) >= 1.0; // Mismatch if >= 1% difference
    let confidence = 0.95;
    if (Math.abs(driftPercent) > 10) confidence = 0.98;
    if (Math.abs(driftPercent) > 30) confidence = 0.99;

    let issue = hasMismatch ? 'Price mismatch' : 'Price verified';
    let suggestion = hasMismatch ? 'Update external listing' : 'No action required';

    const result = {
      product_title: productTitle || 'Catalog Item',
      internal_price: pInternal,
      external_price: pExternal,
      price_drift_percentage: driftPercent,
      issue,
      confidence,
      suggestion,
      has_mismatch: hasMismatch,
      source_channel: channel,
      timestamp: new Date().toISOString(),
    };

    if (hasMismatch) {
      const discrepancyRecord = {
        id: `disc-${uuidv4().substring(0, 6)}`,
        product_id: `prod-cmp-${uuidv4().substring(0, 6)}`,
        product_title: productTitle || 'Catalog Item',
        source_channel: channel,
        source_url: `https://${channel.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/listing`,
        detected_issue: `${issue}: External quote ₹${pExternal} differs from internal price ₹${pInternal} (${driftPercent}%)`,
        merchant_canonical_price: pInternal,
        external_scraped_price: pExternal,
        price_drift_percentage: driftPercent,
        confidence_score: confidence,
        status: 'ACTIVE_DRIFT_ALERT',
        last_crawled_at: new Date().toISOString(),
        suggested_action: suggestion,
        trigger_fail_demo: true,
      };

      this.discrepancies.unshift(discrepancyRecord);
      this.stats.issuesFound++;
    }

    return result;
  }

  // Scan external web aggregators (Amazon, Flipkart, Swiggy, Google Shopping, Croma)
  async scanExternalAggregators() {
    const startTime = Date.now();
    this.stats.scansCompleted++;
    this.stats.lastExecution = new Date().toISOString();

    orchestrator.logEvent('INTEGRITY', 'AGGREGATOR_CRAWL_STARTED', {
      channels: ['Amazon India', 'Flipkart', 'Swiggy Instamart', 'Google Shopping Cache', 'Croma'],
      timestamp: new Date().toISOString(),
    });

    const canonicalProducts = ingestAgent.getProducts();
    const findings = [];

    // Check canonical products against simulated crawled quotes
    for (const prod of canonicalProducts) {
      if (prod.canonical_id === 'CAN-SUBKO-LOT77-ANAE' || prod.title.toLowerCase().includes('lot 77')) {
        findings.push({
          id: `disc-${uuidv4().substring(0, 6)}`,
          product_id: prod.id,
          product_title: prod.title,
          source_channel: 'Amazon India (Third Party Seller)',
          source_url: 'https://amazon.in/dp/B0CX92SUBKO',
          detected_issue: 'Outdated price (stale listing from 2024 harvest)',
          merchant_canonical_price: prod.price,
          external_scraped_price: 650,
          price_drift_percentage: -23.5,
          confidence_score: 0.98,
          status: 'ACTIVE_DRIFT_ALERT',
          last_crawled_at: new Date().toISOString(),
          suggested_action: 'Update external listing; purge marketplace cache.',
          trigger_fail_demo: true,
        });
      } else if (prod.title.toLowerCase().includes('laptop') || prod.price >= 40000) {
        // Electronic product scan demonstration
        findings.push({
          id: `disc-${uuidv4().substring(0, 6)}`,
          product_id: prod.id,
          product_title: prod.title,
          source_channel: 'Flipkart Electronics',
          source_url: 'https://flipkart.com/item-laptop',
          detected_issue: 'Price mismatch: ₹45,000 on Flipkart vs ₹50,000 official catalog',
          merchant_canonical_price: prod.price,
          external_scraped_price: Math.round(prod.price * 0.9),
          price_drift_percentage: -10.0,
          confidence_score: 0.96,
          status: 'ACTIVE_DRIFT_ALERT',
          last_crawled_at: new Date().toISOString(),
          suggested_action: 'Update external listing',
          trigger_fail_demo: false,
        });
      }
    }

    if (findings.length > 0) {
      this.discrepancies = [...findings, ...this.discrepancies.filter(d => !findings.some(f => f.product_id === d.product_id))];
    }

    const duration = Date.now() - startTime;
    this.stats.issuesFound = this.discrepancies.filter(d => d.status !== 'REMEDIATED').length;

    orchestrator.logEvent('INTEGRITY', 'DISCREPANCY_LEDGER_UPDATED', {
      totalDiscrepancies: this.discrepancies.length,
      activeAlerts: this.stats.issuesFound,
      durationMs: duration,
    });

    return {
      success: true,
      scanned_sources: 5,
      discrepancy_count: this.discrepancies.length,
      ledger: this.discrepancies,
    };
  }

  // Check if a specific product or SKU has an active price drift or integrity block
  checkProductIntegrity(canonicalId, forceSimulation = false) {
    if (!canonicalId) return { hasDrift: false };

    const prod = ingestAgent.getProductById(canonicalId);
    const isLot77 = canonicalId === 'CAN-SUBKO-LOT77-ANAE' || (prod && prod.title.toLowerCase().includes('lot 77'));

    const activeDrift = this.discrepancies.find(d => {
      const matchesTarget = (d.product_id === canonicalId) || 
                            (d.canonical_sku && d.canonical_sku === canonicalId) ||
                            (isLot77 && d.product_title && d.product_title.toLowerCase().includes('lot 77'));
      return matchesTarget && (d.status === 'ACTIVE_DRIFT_ALERT' || forceSimulation) && d.trigger_fail_demo;
    });

    if (activeDrift && (this.isDriftSimulationActive || forceSimulation)) {
      orchestrator.logEvent('INTEGRITY', 'PRICE_DRIFT_TRIGGERED_MID_CHECKOUT', {
        canonicalId,
        canonicalPrice: activeDrift.merchant_canonical_price,
        externalPrice: activeDrift.external_scraped_price,
        discrepancyId: activeDrift.id,
        action: 'HALT_PAYMASTER_CHECKOUT',
      }, 'WARN');

      return {
        hasDrift: true,
        issue: activeDrift.detected_issue,
        canonicalPrice: activeDrift.merchant_canonical_price,
        scrapedPrice: activeDrift.external_scraped_price,
        discrepancy: activeDrift,
      };
    }

    return { hasDrift: false };
  }

  // Remediate a discrepancy
  remediateDiscrepancy(discrepancyId) {
    const item = this.discrepancies.find(d => d.id === discrepancyId);
    if (!item) return { success: false, error: 'Discrepancy not found' };

    item.status = 'REMEDIATED';
    item.suggested_action = 'Machine feed synchronized. External cache purge dispatched.';

    orchestrator.logEvent('INTEGRITY', 'DISCREPANCY_REMEDIATED', {
      discrepancyId,
      productTitle: item.product_title,
      status: 'REMEDIATED',
    });

    return { success: true, discrepancy: item, message: 'Price synced across external channels' };
  }

  toggleDriftSimulation(enabled) {
    this.isDriftSimulationActive = enabled;
    orchestrator.logEvent('INTEGRITY', 'DRIFT_SIMULATION_TOGGLED', { enabled });
    return { enabled: this.isDriftSimulationActive };
  }
}

export const integrityAgent = new IntegrityAgent();
