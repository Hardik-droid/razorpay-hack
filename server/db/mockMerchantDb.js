import { v4 as uuidv4 } from 'uuid';

/**
 * Mock Merchant Database: Demo Electronics Store
 * Contains:
 * - 1 Merchant Profile: "Demo Electronics Store"
 * - 500 Realistic Sample Products across Electronics categories
 * - 100 Test Orders generated with realistic buyer agents, line items, and AP2 payment statuses
 */

const DEMO_MERCHANT = {
  id: 'merchant-demo-electronics',
  name: 'Demo Electronics Store',
  legalName: 'Demo Electronics Retail Private Limited',
  domain: 'https://demoelectronics.store',
  industry: 'Consumer Electronics & Computing',
  currency: 'INR',
  contactEmail: 'operations@demoelectronics.store',
  createdAt: '2026-01-15T10:00:00.000Z',
  totalRevenue: 2845600,
  activeCatalogSize: 500,
};

const CATEGORIES = [
  'Laptops & Computers',
  'Smartphones & Mobile',
  'Audio & Sound',
  'Televisions & Displays',
  'Smart Home & Accessories'
];

const BRANDS = [
  'AuraTech',
  'ZenithPro',
  'HyperPulse',
  'VisionSonic',
  'NexusGear',
  'TitanElectro',
  'CyberWave'
];

// Helper to deterministically generate 500 electronics products
function generate500Products() {
  const products = [];

  const laptopSpecs = [
    { title: 'UltraBook Slim 14 (16GB RAM, 512GB NVMe)', price: 54999, mrp: 62999 },
    { title: 'ProStudio Creator 16 (32GB RAM, 1TB SSD, RTX 4060)', price: 92999, mrp: 104999 },
    { title: 'AeroBook Air 13 (M3 Equivalent, 8-Core, 256GB)', price: 68999, mrp: 74999 },
    { title: 'Gaming Titan X17 (AMD Ryzen 9, 32GB RAM, RTX 4080)', price: 135000, mrp: 149999 },
    { title: 'Business Elite 15.6 (Intel i7, 16GB, Fingerprint Secure)', price: 47999, mrp: 52999 },
  ];

  const phoneSpecs = [
    { title: 'Pro 5G Smartphone (256GB, 120Hz AMOLED, 50MP OIS)', price: 29999, mrp: 34999 },
    { title: 'Fold Infinity 5G (Dual Screen, 512GB, Snapdragon 8 Gen 3)', price: 89999, mrp: 99999 },
    { title: 'Lite Neo 5G (128GB, 5000mAh Battery, 67W Fast Charge)', price: 16999, mrp: 19999 },
    { title: 'Ultra Zoom Camera Edition (512GB, Periscope 100x)', price: 64999, mrp: 72999 },
  ];

  const audioSpecs = [
    { title: 'Hybrid Active Noise Cancelling Wireless Headphones', price: 6999, mrp: 8999 },
    { title: 'True Wireless Audiophile Earbuds with LDAC & Spatial Sound', price: 4499, mrp: 5999 },
    { title: 'Hi-Res Desktop Studio Monitor Speakers (Pair, 100W)', price: 12999, mrp: 15999 },
    { title: 'Dolby Atmos Soundbar with Wireless Subwoofer (300W)', price: 18999, mrp: 22999 },
  ];

  const displaySpecs = [
    { title: '27" QHD 180Hz Fast-IPS Gaming Monitor (1ms, HDR400)', price: 19999, mrp: 24999 },
    { title: '34" Curved WQHD Ultrawide Display (1000R, USB-C 90W PD)', price: 38999, mrp: 44999 },
    { title: '55" 4K Quantum Dot Smart Google TV (120Hz, Dolby Vision)', price: 42999, mrp: 49999 },
    { title: '15.6" Portable OLED USB-C Touch Monitor for Laptops', price: 14999, mrp: 17999 },
  ];

  const accessorySpecs = [
    { title: '100W GaN 4-Port Fast Travel Charger (2x USB-C, 2x USB-A)', price: 2499, mrp: 3299 },
    { title: '12-in-1 Aluminum USB-C Hub Dock (Dual HDMI 4K, 100W PD, GbE)', price: 3999, mrp: 4999 },
    { title: 'Magnetic Wireless Power Bank 10,000mAh with Kickstand', price: 1899, mrp: 2499 },
    { title: 'Ergonomic Vertical Wireless Mouse (Silent Clicks, Multi-Device)', price: 1499, mrp: 1999 },
    { title: 'Custom Mechanical Keyboard (Hot-Swap Switches, RGB, Wireless)', price: 4999, mrp: 6499 },
  ];

  const specPools = [laptopSpecs, phoneSpecs, audioSpecs, displaySpecs, accessorySpecs];

  for (let i = 1; i <= 500; i++) {
    const catIndex = (i - 1) % CATEGORIES.length;
    const category = CATEGORIES[catIndex];
    const brand = BRANDS[(i - 1) % BRANDS.length];
    const pool = specPools[catIndex];
    const spec = pool[(i - 1) % pool.length];

    const skuNum = String(i).padStart(4, '0');
    const canonicalSku = `DEMO-ELE-${skuNum}`;
    const variantSuffix = (i % 3 === 0) ? 'Space Gray' : (i % 3 === 1 ? 'Matte Black' : 'Silver White');
    const title = `${brand} ${spec.title} (Gen ${((i % 4) + 1)} - ${variantSuffix})`;
    const priceAdjustment = ((i % 10) - 5) * 50;
    const finalPrice = Math.max(499, spec.price + priceAdjustment);
    const finalMrp = Math.round(finalPrice * 1.18);
    const stock = 10 + (i % 45);

    products.push({
      id: `prod-demo-${skuNum}`,
      merchant_id: DEMO_MERCHANT.id,
      canonical_id: canonicalSku,
      sku: canonicalSku,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      brand,
      category,
      description: `Premium ${category} offering by ${brand}. Designed for autonomous machine procurement with verified warranty, instant dispatch, and guaranteed quality.`,
      price: finalPrice,
      mrp: finalMrp,
      currency: 'INR',
      stock_quantity: stock,
      is_available: stock > 0,
      rating: +(4.2 + ((i % 8) * 0.1)).toFixed(1),
      review_count: 12 + (i % 140),
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
      ],
      variants: [
        { sku: `${canonicalSku}-STD`, name: variantSuffix, price: finalPrice, stock: Math.floor(stock * 0.6) },
        { sku: `${canonicalSku}-PLUS`, name: `${variantSuffix} (Extended Care)`, price: finalPrice + 999, stock: Math.ceil(stock * 0.4) }
      ],
      last_updated: new Date(Date.now() - (i % 24) * 3600 * 1000).toISOString(),
    });
  }

  return products;
}

// Helper to deterministically generate 100 test orders
function generate100Orders(products) {
  const orders = [];
  const buyerAgents = [
    'ChatGPT Shopping Agent (OpenAI v4.1)',
    'Claude 3.7 Autonomous Buyer (Anthropic)',
    'Perplexity Autonomous Restock AI',
    'Gemini Procurement Assistant',
    'Enterprise Tech Procurement Agent (Internal)',
    'Office Tech Restock Bot (Slack Integration)',
    'Autonomous Developer Station Agent'
  ];

  const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'HIGH_VALUE_GATE_APPROVAL', 'PROCESSING'];

  for (let i = 1; i <= 100; i++) {
    const orderNum = String(i).padStart(4, '0');
    const orderId = `ORD-DEMO-${orderNum}`;
    const agentName = buyerAgents[i % buyerAgents.length];
    const status = statuses[i % statuses.length];

    // Pick 1 to 3 items from products
    const prod1 = products[(i * 3) % products.length];
    const prod2 = products[(i * 7 + 1) % products.length];
    const hasSecondItem = (i % 2 === 0);

    const items = [
      {
        canonical_id: prod1.canonical_id,
        name: prod1.title,
        sku: prod1.sku,
        quantity: 1 + (i % 2),
        unit_price: prod1.price,
        line_total: prod1.price * (1 + (i % 2))
      }
    ];

    if (hasSecondItem) {
      items.push({
        canonical_id: prod2.canonical_id,
        name: prod2.title,
        sku: prod2.sku,
        quantity: 1,
        unit_price: prod2.price,
        line_total: prod2.price
      });
    }

    const subtotal = items.reduce((sum, it) => sum + it.line_total, 0);
    const tax = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + tax;

    const daysAgo = Math.floor((100 - i) * 0.28); // span over last ~28 days
    const orderTime = new Date(Date.now() - (daysAgo * 86400 * 1000) - (i * 123456 % 86400000)).toISOString();

    orders.push({
      id: orderId,
      merchant_id: DEMO_MERCHANT.id,
      order_number: orderId,
      buyer_agent: agentName,
      customer_email: `autonomous-buyer-${i}@agentic-procure.io`,
      customer_intent: `Procure ${items[0].name}${hasSecondItem ? ` and ${items[1].name}` : ''} for office deployment`,
      items,
      subtotal,
      tax,
      total_amount: totalAmount,
      currency: 'INR',
      status,
      payment_method: 'Razorpay Test Mode (Mandate AP2)',
      mandate_id: totalAmount <= 2000 ? 'mandate_autonomous_shopper_01' : 'mandate_enterprise_restock_02',
      razorpay_order_id: `order_test_${uuidv4().substring(0, 14)}`,
      razorpay_payment_id: status === 'COMPLETED' ? `pay_test_${uuidv4().substring(0, 14)}` : null,
      autonomous_gated: totalAmount > 2000,
      requires_human_approval: status === 'HIGH_VALUE_GATE_APPROVAL',
      created_at: orderTime,
      updated_at: orderTime,
    });
  }

  return orders;
}

class MockMerchantDatabase {
  constructor() {
    this.merchant = { ...DEMO_MERCHANT };
    this.products = generate500Products();
    this.orders = generate100Orders(this.products);
  }

  getMerchant() {
    return {
      ...this.merchant,
      totalProducts: this.products.length,
      totalOrders: this.orders.length,
      totalRevenue: this.orders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + o.total_amount, 0),
    };
  }

  getProducts({ category, query, limit = 50, offset = 0 } = {}) {
    let list = this.products;

    if (category && category !== 'ALL') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.canonical_id.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + limit);

    return {
      total,
      limit,
      offset,
      products: paginated,
    };
  }

  getProductBySku(sku) {
    return this.products.find(p => p.canonical_id === sku || p.sku === sku || p.id === sku);
  }

  getOrders({ status, limit = 25, offset = 0 } = {}) {
    let list = this.orders;

    if (status && status !== 'ALL') {
      list = list.filter(o => o.status === status);
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + limit);

    return {
      total,
      limit,
      offset,
      orders: paginated,
    };
  }

  getOrderById(id) {
    return this.orders.find(o => o.id === id || o.order_number === id);
  }

  createOrder(orderData) {
    const newOrder = {
      id: `ORD-DEMO-${String(this.orders.length + 1).padStart(4, '0')}`,
      merchant_id: this.merchant.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'COMPLETED',
      ...orderData,
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  resetDatabase() {
    this.products = generate500Products();
    this.orders = generate100Orders(this.products);
    return {
      success: true,
      message: 'Demo Electronics Store mock database reset to 500 products and 100 test orders.',
      productsCount: this.products.length,
      ordersCount: this.orders.length,
    };
  }
}

export const mockMerchantDb = new MockMerchantDatabase();
