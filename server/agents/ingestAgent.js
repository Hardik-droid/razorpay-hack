import { v4 as uuidv4 } from 'uuid';
import { INITIAL_PRODUCTS } from '../data/seedData.js';
import { orchestrator } from './orchestrator.js';
import { CrawlerService } from '../services/crawlerService.js';
import { EcommerceSyncService } from '../services/ecommerceSyncService.js';
import { DocumentParserService } from '../services/documentParserService.js';
import { GoogleBusinessService } from '../services/googleBusinessService.js';

class IngestAgent {
  constructor() {
    this.products = [...INITIAL_PRODUCTS];
    this.sourceConnections = [
      {
        id: 'conn-website-01',
        merchantId: 'merchant-subko-001',
        type: 'WEBSITE',
        name: 'Official Website Crawler',
        endpointUrl: 'https://subko.coffee',
        status: 'ACTIVE',
        lastSyncedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        productsCount: 4,
      },
      {
        id: 'conn-shopify-02',
        merchantId: 'merchant-subko-001',
        type: 'SHOPIFY',
        name: 'Shopify Store Connector',
        endpointUrl: 'subko-specialty.myshopify.com',
        status: 'ACTIVE',
        lastSyncedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        productsCount: 8,
      }
    ];
    this.syncHistory = [
      {
        id: 'sync-hist-01',
        connectionId: 'conn-shopify-02',
        status: 'SUCCESS',
        productsFound: 8,
        productsSynced: 8,
        errorsCount: 0,
        durationMs: 420,
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      }
    ];
    this.extractionLogs = [];
    this.extractionAlerts = [
      {
        id: 'alert-01',
        productId: 'CAN-SUBKO-LOT77-ANAE',
        productTitle: 'Subko Lot 77: Ratnagiri Estate Anaerobic Naturals',
        issue: 'Third-party marketplace quote differs from canonical web price',
        severity: 'LOW',
        needsManualReview: false,
        confidence: 0.94,
      }
    ];
    this.stats = {
      status: 'Running',
      lastExecution: new Date().toISOString(),
      productsProcessed: INITIAL_PRODUCTS.length,
      failedRuns: 0,
      successRate: '100%',
    };
  }

  getProducts(merchantId) {
    if (!merchantId) return this.products;
    return this.products.filter(p => p.merchant_id === merchantId);
  }

  getProductById(idOrCanonical) {
    return this.products.find(p => p.id === idOrCanonical || p.canonical_id === idOrCanonical);
  }

  getSourceConnections(merchantId) {
    return this.sourceConnections;
  }

  getSyncHistory() {
    return this.syncHistory;
  }

  getExtractionAlerts() {
    return this.extractionAlerts;
  }

  getHealthMetrics() {
    return {
      status: this.stats.status,
      lastExecution: this.stats.lastExecution,
      productsProcessed: this.products.length,
      successRate: this.stats.successRate,
      connectedSources: this.sourceConnections.length,
      activeAlerts: this.extractionAlerts.length,
    };
  }

  // OPTION 1: Connect Website Crawler
  async connectWebsite({ url, industry = 'General Retail', merchantId = 'merchant-subko-001' }) {
    const result = await CrawlerService.crawlWebsite(url, industry);
    
    // Create or update connection record
    let connection = this.sourceConnections.find(c => c.endpointUrl === url);
    if (!connection) {
      connection = {
        id: `conn-web-${uuidv4().substring(0, 6)}`,
        merchantId,
        type: 'WEBSITE',
        name: `${result.domain} Website Crawler`,
        endpointUrl: url,
        status: 'ACTIVE',
        lastSyncedAt: new Date().toISOString(),
        productsCount: result.products.length,
      };
      this.sourceConnections.unshift(connection);
    } else {
      connection.lastSyncedAt = new Date().toISOString();
      connection.productsCount = result.products.length;
    }

    // Ingest and normalize extracted products
    await this.ingestExtractedProducts(result.products, merchantId, connection.id);

    // Record sync history
    this.recordSyncRun({
      connectionId: connection.id,
      productsFound: result.products_found,
      productsSynced: result.products.length,
      errorsCount: 0,
      durationMs: result.duration_ms,
    });

    orchestrator.logEvent('INGEST', 'WEBSITE_CRAWL_SYNCED', {
      url,
      domain: result.domain,
      productsFound: result.products.length,
      connectionId: connection.id,
    });

    return {
      success: true,
      connection,
      products_extracted: result.products.length,
      products: result.products,
      logs: result.logs,
      message: `Website crawled successfully! Extracted ${result.products.length} products.`,
    };
  }

  // OPTION 2: Connect Ecommerce Platform (Shopify / WooCommerce / Magento)
  async connectEcommerceStore({ platform = 'shopify', storeUrl, accessToken, merchantId = 'merchant-subko-001' }) {
    const result = await EcommerceSyncService.syncStore({ platform, storeUrl, accessToken });

    let connection = this.sourceConnections.find(c => c.endpointUrl === storeUrl);
    if (!connection) {
      connection = {
        id: `conn-store-${uuidv4().substring(0, 6)}`,
        merchantId,
        type: platform.toUpperCase(),
        name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Store (${storeUrl || 'Connected'})`,
        endpointUrl: storeUrl || `${platform}.mystore.com`,
        status: 'ACTIVE',
        lastSyncedAt: new Date().toISOString(),
        productsCount: result.products.length,
      };
      this.sourceConnections.unshift(connection);
    } else {
      connection.lastSyncedAt = new Date().toISOString();
      connection.productsCount = result.products.length;
    }

    await this.ingestExtractedProducts(result.products, merchantId, connection.id);

    this.recordSyncRun({
      connectionId: connection.id,
      productsFound: result.products_synced,
      productsSynced: result.products.length,
      errorsCount: 0,
      durationMs: result.duration_ms,
    });

    orchestrator.logEvent('INGEST', 'ECOMMERCE_STORE_SYNCED', {
      platform,
      storeUrl,
      productsSynced: result.products.length,
      connectionId: connection.id,
    });

    return {
      success: true,
      connection,
      products_synced: result.products.length,
      products: result.products,
      logs: result.logs,
      message: `${platform.toUpperCase()} store synchronized! Ingested ${result.products.length} products.`,
    };
  }

  // OPTION 3: Upload Business Documents (PDF Catalog / Brochure)
  async ingestBusinessDocument({ filename = 'catalog.pdf', docType = 'PDF_CATALOG', merchantId = 'merchant-subko-001' }) {
    const result = await DocumentParserService.parseBusinessDocument({ filename, docType });

    const connection = {
      id: `conn-doc-${uuidv4().substring(0, 6)}`,
      merchantId,
      type: 'PDF_CATALOG',
      name: `Catalogue Document (${filename})`,
      endpointUrl: filename,
      status: 'ACTIVE',
      lastSyncedAt: new Date().toISOString(),
      productsCount: result.products.length,
    };
    this.sourceConnections.unshift(connection);

    await this.ingestExtractedProducts(result.products, merchantId, connection.id);

    this.recordSyncRun({
      connectionId: connection.id,
      productsFound: result.products_found,
      productsSynced: result.products.length,
      errorsCount: 0,
      durationMs: result.duration_ms,
    });

    orchestrator.logEvent('INGEST', 'PDF_DOCUMENT_INGESTED', {
      filename,
      productsFound: result.products.length,
      connectionId: connection.id,
    });

    return {
      success: true,
      connection,
      products_extracted: result.products.length,
      products: result.products,
      logs: result.logs,
      message: `PDF catalogue parsed successfully! Extracted ${result.products.length} products.`,
    };
  }

  // OPTION 4: Google Business Profile
  async connectGoogleBusiness({ businessName = 'Studio Lumina Photography', businessUrl, merchantId = 'merchant-subko-001' }) {
    const result = await GoogleBusinessService.extractProfile({ businessName, businessUrl });

    const connection = {
      id: `conn-gbp-${uuidv4().substring(0, 6)}`,
      merchantId,
      type: 'GOOGLE_BUSINESS',
      name: `Google Business Profile (${businessName})`,
      endpointUrl: businessUrl || 'https://maps.google.com/business',
      status: 'ACTIVE',
      lastSyncedAt: new Date().toISOString(),
      productsCount: result.products.length,
    };
    this.sourceConnections.unshift(connection);

    await this.ingestExtractedProducts(result.products, merchantId, connection.id);

    this.recordSyncRun({
      connectionId: connection.id,
      productsFound: result.products_found,
      productsSynced: result.products.length,
      errorsCount: 0,
      durationMs: result.duration_ms,
    });

    orchestrator.logEvent('INGEST', 'GOOGLE_PROFILE_CONNECTED', {
      businessName,
      location: result.business?.location,
      productsCreated: result.products.length,
      connectionId: connection.id,
    });

    return {
      success: true,
      connection,
      business: result.business,
      products_extracted: result.products.length,
      products: result.products,
      logs: result.logs,
      message: `Google Business Profile connected! Added ${result.products.length} services to AI Storefront.`,
    };
  }

  // Trigger manual sync on any connection
  async syncConnection(connectionId) {
    const conn = this.sourceConnections.find(c => c.id === connectionId);
    if (!conn) return { success: false, error: 'Connection not found' };

    conn.lastSyncedAt = new Date().toISOString();
    this.stats.lastExecution = new Date().toISOString();

    let syncResult = null;
    if (conn.type === 'WEBSITE') {
      syncResult = await this.connectWebsite({ url: conn.endpointUrl, merchantId: conn.merchantId });
    } else if (conn.type === 'SHOPIFY' || conn.type === 'WOOCOMMERCE') {
      syncResult = await this.connectEcommerceStore({ platform: conn.type.toLowerCase(), storeUrl: conn.endpointUrl, merchantId: conn.merchantId });
    } else if (conn.type === 'GOOGLE_BUSINESS') {
      syncResult = await this.connectGoogleBusiness({ businessName: conn.name, businessUrl: conn.endpointUrl, merchantId: conn.merchantId });
    } else {
      syncResult = await this.ingestBusinessDocument({ filename: conn.endpointUrl, merchantId: conn.merchantId });
    }

    orchestrator.logEvent('INGEST', 'CONNECTION_MANUALLY_SYNCED', {
      connectionId,
      name: conn.name,
      lastSyncedAt: conn.lastSyncedAt,
    });

    return {
      success: true,
      connection: conn,
      syncResult,
      message: `${conn.name} re-synchronized successfully.`,
    };
  }

  // Normalizer & Upsert Engine for products from any source
  async ingestExtractedProducts(extractedItems, merchantId = 'merchant-subko-001', connectionId = null) {
    for (const item of extractedItems) {
      const canonicalSku = item.sku || item.canonical_id || `CAN-${item.brand?.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'PROD'}-${uuidv4().substring(0, 6).toUpperCase()}`;
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const normalized = {
        id: item.id || `prod-${uuidv4().substring(0, 8)}`,
        merchant_id: merchantId,
        connection_id: connectionId,
        canonical_id: canonicalSku,
        title: item.title,
        slug,
        brand: item.brand || 'Merchant Brand',
        category: item.category || this.detectCategory(item.title),
        description: item.description || `Authentic ${item.title} available for direct automated procurement.`,
        price: parseFloat(item.price) || 999,
        mrp: parseFloat(item.mrp || item.price * 1.15),
        currency: 'INR',
        stock_quantity: parseInt(item.stock || 25, 10),
        is_available: item.availability !== false,
        rating: 4.8,
        review_count: 24,
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80'],
        variants: item.variants || [
          { sku: `${canonicalSku}-STD`, name: 'Standard Edition', price: parseFloat(item.price) || 999, stock: 25 },
        ],
        last_updated: new Date().toISOString(),
      };

      // Check duplicate by canonical_id or slug
      const existingIdx = this.products.findIndex(p => p.canonical_id === normalized.canonical_id || p.slug === normalized.slug);
      if (existingIdx >= 0) {
        this.products[existingIdx] = { ...this.products[existingIdx], ...normalized, id: this.products[existingIdx].id };
      } else {
        this.products.unshift(normalized);
      }
    }

    this.stats.productsProcessed = this.products.length;
    this.stats.lastExecution = new Date().toISOString();
  }

  // Manual Product Correction Option (for merchant UI)
  updateProduct(productId, updates) {
    const idx = this.products.findIndex(p => p.id === productId || p.canonical_id === productId);
    if (idx === -1) return { success: false, error: 'Product not found' };

    this.products[idx] = {
      ...this.products[idx],
      ...updates,
      price: updates.price ? parseFloat(updates.price) : this.products[idx].price,
      stock_quantity: updates.stock_quantity ? parseInt(updates.stock_quantity, 10) : this.products[idx].stock_quantity,
      last_updated: new Date().toISOString(),
      manually_corrected: true,
    };

    // If an alert existed for this product, clear it
    this.extractionAlerts = this.extractionAlerts.filter(a => a.productId !== productId && a.productId !== this.products[idx].canonical_id);

    orchestrator.logEvent('INGEST', 'PRODUCT_MANUALLY_CORRECTED', {
      productId,
      title: this.products[idx].title,
      updatedFields: Object.keys(updates),
    });

    return {
      success: true,
      product: this.products[idx],
      message: 'Product updated successfully.',
    };
  }

  recordSyncRun({ connectionId, productsFound, productsSynced, errorsCount = 0, durationMs = 350 }) {
    this.syncHistory.unshift({
      id: `sync-${uuidv4().substring(0, 8)}`,
      connectionId,
      status: errorsCount === 0 ? 'SUCCESS' : 'WARNING',
      productsFound,
      productsSynced,
      errorsCount,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  }

  detectCategory(title = '') {
    const lower = title.toLowerCase();
    if (lower.includes('macbook') || lower.includes('laptop') || lower.includes('pc') || lower.includes('computer')) return 'Laptops & Computers';
    if (lower.includes('phone') || lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) return 'Smartphones & Mobile';
    if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('boot') || lower.includes('footwear')) return 'Footwear & Athletic Shoes';
    if (lower.includes('shirt') || lower.includes('tee') || lower.includes('pant') || lower.includes('trouser') || lower.includes('apparel')) return 'Fashion & Apparel';
    if (lower.includes('chair') || lower.includes('desk') || lower.includes('furniture') || lower.includes('table')) return 'Office Furniture';
    if (lower.includes('coffee') || lower.includes('bean') || lower.includes('roast') || lower.includes('brew')) return 'Single Origin Coffee';
    if (lower.includes('flooring') || lower.includes('turf') || lower.includes('court') || lower.includes('tile')) return 'Sports Flooring & Infrastructure';
    if (lower.includes('photo') || lower.includes('shoot') || lower.includes('studio') || lower.includes('service')) return 'Services & Media Production';
    return 'General Consumer Goods';
  }

  // Backward compatibility method for automated tests
  async parseMessyCatalog(rawInput, mimeType = 'text/csv', merchantId = 'merchant-subko-001') {
    let items = [];
    if (Array.isArray(rawInput)) {
      items = rawInput.map(r => ({
        title: r.name || r.title,
        price: r.price,
        stock: r.stock || r.stock_quantity || 20,
        category: r.category || this.detectCategory(r.name || r.title),
        brand: r.brand || 'Merchant Brand',
        sku: r.sku,
        variants: r.variants || (r.size ? r.size.map(s => ({ sku: `${r.sku || 'SKU'}-${s}`, name: `Size ${s}`, price: r.price, stock: Math.round(r.stock / r.size.length) })) : null),
      }));
    } else if (typeof rawInput === 'object' && rawInput !== null) {
      items = [{
        title: rawInput.name || rawInput.title,
        price: rawInput.price,
        stock: rawInput.stock || 30,
        category: rawInput.category || this.detectCategory(rawInput.name),
        brand: rawInput.brand || 'Merchant Brand',
        sku: rawInput.sku,
        variants: rawInput.size ? rawInput.size.map(s => ({ sku: `SKU-${s}`, name: `Size ${s}`, price: rawInput.price, stock: 20 })) : null,
      }];
    } else if (typeof rawInput === 'string') {
      const lines = rawInput.trim().split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
          items.push({
            sku: parts[0],
            title: parts[1],
            price: parseFloat(parts[2]) || 999,
            stock: parseInt(parts[3], 10) || 10,
            category: parts[4] || this.detectCategory(parts[1]),
            brand: parts[5] || 'Merchant Brand',
          });
        }
      }
    }

    await this.ingestExtractedProducts(items, merchantId);
    return { success: true, count: items.length };
  }

  // Generate Schema.org JSON-LD Feed for Autonomous Machines
  generateJsonLdFeed(merchantId = 'merchant-subko-001') {
    const merchantProducts = this.getProducts(merchantId);

    const schemaFeed = {
      '@context': 'https://schema.org/',
      '@type': 'DataFeed',
      name: 'Storefront for Machines Canonical Autonomous Catalog',
      dateModified: new Date().toISOString(),
      provider: {
        '@type': 'Organization',
        name: 'Storefront for Machines Merchant Network',
      },
      dataFeedElement: merchantProducts.map(p => ({
        '@type': 'Product',
        name: p.title,
        sku: p.canonical_id,
        category: p.category,
        brand: { '@type': 'Brand', name: p.brand },
        description: p.description,
        image: p.images,
        offers: {
          '@type': 'Offer',
          priceCurrency: p.currency,
          price: p.price,
          priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          availability: p.is_available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      })),
    };

    return schemaFeed;
  }

  handleMcpToolCall(toolName, args) {
    if (toolName === 'list_catalog') {
      const categoryFilter = args?.category?.toLowerCase();
      let matches = this.products;
      if (categoryFilter) {
        matches = matches.filter(p => p.category.toLowerCase().includes(categoryFilter) || p.title.toLowerCase().includes(categoryFilter));
      }
      return { total_products: matches.length, products: matches };
    }
    return { error: `Tool ${toolName} not supported` };
  }
}

export const ingestAgent = new IngestAgent();
