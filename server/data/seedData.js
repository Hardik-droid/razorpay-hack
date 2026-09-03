import { v4 as uuidv4 } from 'uuid';

export const INITIAL_MERCHANTS = [
  {
    id: 'merchant-subko-001',
    name: 'Subko Specialty Coffee & Craft Bakehouse',
    slug: 'subko-coffee',
    category: 'Gourmet Food & Artisanal Beverages',
    website: 'https://subko.coffee',
    currency: 'INR',
    country: 'IN',
    razorpay_account_id: 'acc_subko_test_9021',
    logo_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
    description: 'Specialty coffee roasters sourcing micro-lots from the Indian subcontinent with artisanal single-origin roast profiles.',
    verification_status: 'VERIFIED',
    mcp_endpoint: '/api/mcp/tools',
    geo_visibility_score: 54, // Baseline before remediation
    trust_score: 92,
  },
  {
    id: 'merchant-bluetokai-002',
    name: 'Blue Tokai Coffee Roasters',
    slug: 'blue-tokai',
    category: 'Specialty Coffee',
    website: 'https://bluetokai.com',
    currency: 'INR',
    country: 'IN',
    razorpay_account_id: 'acc_bt_test_4810',
    logo_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&auto=format&fit=crop&q=80',
    description: 'Pioneering fresh roasted specialty Arabica and bespoke espresso blends across India.',
    verification_status: 'VERIFIED',
    mcp_endpoint: '/api/mcp/tools',
    geo_visibility_score: 61,
    trust_score: 95,
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-subko-lot-77',
    merchant_id: 'merchant-subko-001',
    canonical_id: 'CAN-SUBKO-LOT77-ANAE',
    title: 'Subko Lot 77: Ratnagiri Estate Anaerobic Naturals',
    slug: 'ratnagiri-estate-anaerobic-naturals',
    brand: 'Subko',
    category: 'Single Origin Coffee',
    description: 'Complex cup with vibrant notes of passionfruit, wild strawberry jam, and dark cacao. Fermented for 72 hours under nitrogen purge.',
    price: 850,
    mrp: 950,
    currency: 'INR',
    stock_quantity: 42,
    is_available: true,
    rating: 4.9,
    review_count: 128,
    image_url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600&auto=format&fit=crop&q=80',
    tax_rate: 0.05,
    attributes: {
      estate: 'Ratnagiri Estate (Bababudangiri)',
      altitude: '1450m MASL',
      varietal: 'Catuai / SLN 795',
      process: 'Anaerobic Natural',
      roast_level: 'Medium-Light',
      flavour_notes: ['Passionfruit', 'Wild Strawberry', 'Cacao Nibs'],
      harvest_year: '2026',
    },
    variants: [
      { id: 'var-subko-lot77-wb-250', sku: 'SUBKO-LOT77-WB-250G', name: 'Whole Bean - 250g', price: 850, stock: 24 },
      { id: 'var-subko-lot77-fp-250', sku: 'SUBKO-LOT77-FP-250G', name: 'French Press Grind - 250g', price: 850, stock: 10 },
      { id: 'var-subko-lot77-ae-250', sku: 'SUBKO-LOT77-AE-250G', name: 'AeroPress Grind - 250g', price: 850, stock: 8 },
      { id: 'var-subko-lot77-wb-500', sku: 'SUBKO-LOT77-WB-500G', name: 'Whole Bean - 500g Value Pack', price: 1600, stock: 12 },
    ]
  },
  {
    id: 'prod-subko-pour-over-kit',
    merchant_id: 'merchant-subko-001',
    canonical_id: 'CAN-SUBKO-V60-DRIP-KIT',
    title: 'Subko Craft Manual Brew Ceramic Dripper V60',
    slug: 'craft-manual-brew-ceramic-dripper-v60',
    brand: 'Subko',
    category: 'Brewing Equipment',
    description: 'Handcrafted stoneware ceramic cone dripper with optimal spiral ribbing for uniform thermal stability and extraction.',
    price: 1850,
    mrp: 2200,
    currency: 'INR',
    stock_quantity: 18,
    is_available: true,
    rating: 4.8,
    review_count: 64,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    tax_rate: 0.18,
    attributes: {
      material: 'Stoneware Ceramic',
      capacity: '1-4 Cups (02 Size)',
      color: 'Matte Charcoal Ash',
      dishwasher_safe: true,
    },
    variants: [
      { id: 'var-subko-v60-ash', sku: 'SUBKO-V60-02-ASH', name: 'Matte Charcoal Ash', price: 1850, stock: 12 },
      { id: 'var-subko-v60-sand', sku: 'SUBKO-V60-02-SND', name: 'Coastal Sand Beige', price: 1850, stock: 6 },
    ]
  },
  {
    id: 'prod-subko-coldbrew-can-4pack',
    merchant_id: 'merchant-subko-001',
    canonical_id: 'CAN-SUBKO-CB-CANS-4X',
    title: 'Subko Ready-to-Drink Nitro Cold Brew (Pack of 4)',
    slug: 'subko-ready-to-drink-nitro-cold-brew-4pack',
    brand: 'Subko',
    category: 'Cold Brews & Beverages',
    description: 'Steeped for 20 hours in cold filtered water and nitrogen-infused for a silky, cascading head. Zero added sugar.',
    price: 680,
    mrp: 760,
    currency: 'INR',
    stock_quantity: 65,
    is_available: true,
    rating: 4.7,
    review_count: 310,
    image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
    tax_rate: 0.12,
    attributes: {
      volume: '250ml per can',
      calories: '2 kcal / 100ml',
      shelf_life: '90 Days Refrigerated',
      nitro_infused: true,
    },
    variants: [
      { id: 'var-subko-cb-black-4', sku: 'SUBKO-CB-BLK-4PK', name: 'Classic Black Nitro (Pack of 4)', price: 680, stock: 40 },
      { id: 'var-subko-cb-vanilla-4', sku: 'SUBKO-CB-VAN-4PK', name: 'Oat Milk Vanilla Nitro (Pack of 4)', price: 740, stock: 25 },
    ]
  },
  {
    id: 'prod-subko-subscription-quarterly',
    merchant_id: 'merchant-subko-001',
    canonical_id: 'CAN-SUBKO-SUB-QTR-3M',
    title: 'Subko Roaster Curated Discovery Subscription (3 Months)',
    slug: 'subko-roaster-curated-discovery-subscription-3m',
    brand: 'Subko',
    category: 'Coffee Subscriptions',
    description: 'Two curated 250g bags of freshly roasted rare micro-lot coffees delivered twice monthly for 3 months with tasting notes.',
    price: 4200,
    mrp: 4800,
    currency: 'INR',
    stock_quantity: 50,
    is_available: true,
    rating: 4.95,
    review_count: 89,
    image_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80',
    tax_rate: 0.05,
    attributes: {
      deliveries: '6 Total Shipments (Bi-weekly)',
      weight_per_shipment: '2x 250g (3kg total)',
      roast_customization: 'Filter & Espresso',
    },
    variants: [
      { id: 'var-subko-sub-whole', sku: 'SUBKO-SUB-WB-3M', name: 'Whole Bean (Bi-Weekly)', price: 4200, stock: 35 },
      { id: 'var-subko-sub-filter', sku: 'SUBKO-SUB-FLT-3M', name: 'Pour Over Filter Grind (Bi-Weekly)', price: 4200, stock: 15 },
    ]
  }
];

export const RAW_CATALOG_SAMPLES = {
  csv_messy: `SKU_RAW,Item_Name,Cost,Retail,Inventory_Stk,Bean_Spec,Notes
SUB-77-WB,"Subko Lot 77: Ratnagiri Estate Anaerobic",850,950,42,"Catuaí 1450m","Passionfruit & Strawberry"
SUB-V60-CHAR,"Ceramic V60 Dripper Ash Grey",1850,2200,18,"Stoneware 02 size","Includes wooden base"
SUB-CB-NITRO,"Subko Nitro RTD Cold Brew 4pk",680,760,65,"Steeped 20h","Refrigerate"
SUB-SUB-3M,"Discovery Coffee Subscription (3 Mo)",4200,4800,50,"Bi-weekly 6 packs","Roaster Choice"`,

  pdf_catalog_text: `SUBKO SPECIALTY COFFEE ROASTERS - WHOLESALE & D2C CATALOG 2026
Page 1: MICRO-LOT HARVEST RELEASES
- Subko Lot 77: Ratnagiri Estate Anaerobic Naturals (Medium-Light Roast). Tasting notes: Passionfruit, Wild Strawberry Jam, Dark Cacao. Price: ₹850 (250g). MRP: ₹950. Stock: 42. Canonical SKU: CAN-SUBKO-LOT77-ANAE.
- Subko Craft Manual Brew Ceramic Dripper V60 (Ash Grey / Sand Beige). Price: ₹1,850. MRP: ₹2,200. Stock: 18. High thermal retention stoneware.
- Subko Ready-to-Drink Nitro Cold Brew (Pack of 4x 250ml cans). Price: ₹680. MRP: ₹760. Stock: 65. Zero sugar.
- Subko Roaster Curated Discovery Subscription (3 Months / 6 Shipments). Price: ₹4,200. MRP: ₹4,800. Stock: 50. Free shipping included.`,

  html_legacy_table: `<table class="legacy-catalog-table">
  <tr><th>Product Code</th><th>Title</th><th>Live Price</th><th>List Price</th><th>Availability</th></tr>
  <tr><td>SLOT-77</td><td>Subko Lot 77 Anaerobic 250g</td><td>850.00</td><td>950.00</td><td>In Stock (42)</td></tr>
  <tr><td>V60-02</td><td>Ceramic V60 Dripper Ash</td><td>1850.00</td><td>2200.00</td><td>In Stock (18)</td></tr>
  <tr><td>CB-4PK</td><td>Nitro Cold Brew 4-Pack</td><td>680.00</td><td>760.00</td><td>In Stock (65)</td></tr>
  <tr><td>SUB-3M</td><td>Discovery Subscription 3-Mo</td><td>4200.00</td><td>4800.00</td><td>In Stock (50)</td></tr>
</table>`
};

export const INITIAL_DISCREPANCIES = [
  {
    id: 'disc-001',
    product_id: 'prod-subko-lot-77',
    product_title: 'Subko Lot 77: Ratnagiri Estate Anaerobic Naturals',
    source_channel: 'Amazon India (Third Party Seller)',
    source_url: 'https://amazon.in/dp/B0CX92SUBKO',
    detected_issue: 'Outdated price (stale listing from 2024 harvest)',
    merchant_canonical_price: 850,
    external_scraped_price: 650,
    price_drift_percentage: -23.5,
    confidence_score: 0.98,
    status: 'ACTIVE_DRIFT_ALERT',
    last_crawled_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    suggested_action: 'Trigger price-drift shield on Paymaster; issue automated MAP violation notice to Amazon ASIN seller.',
    trigger_fail_demo: true,
  },
  {
    id: 'disc-002',
    product_id: 'prod-subko-pour-over-kit',
    product_title: 'Subko Craft Manual Brew Ceramic Dripper V60',
    source_channel: 'Flipkart Supermart',
    source_url: 'https://flipkart.com/subko-ceramic-v60/p/itm941',
    detected_issue: 'Incorrect variant attributes (listed as Plastic instead of Stoneware Ceramic)',
    merchant_canonical_price: 1850,
    external_scraped_price: 1850,
    price_drift_percentage: 0,
    confidence_score: 0.94,
    status: 'DISCREPANCY_FLAGGED',
    last_crawled_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    suggested_action: 'Push machine-readable JSON-LD Schema to sync material attributes.',
    trigger_fail_demo: false,
  },
  {
    id: 'disc-003',
    product_id: 'prod-subko-coldbrew-can-4pack',
    product_title: 'Subko Ready-to-Drink Nitro Cold Brew (Pack of 4)',
    source_channel: 'Swiggy Instamart (Indiranagar Store)',
    source_url: 'https://swiggy.com/instamart/item/subko-nitro-cb',
    detected_issue: 'Discontinued single 200ml can SKU still active instead of 4-pack bundle',
    merchant_canonical_price: 680,
    external_scraped_price: 180,
    price_drift_percentage: -73.5,
    confidence_score: 0.96,
    status: 'DISCREPANCY_FLAGGED',
    last_crawled_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    suggested_action: 'Deprecate legacy SKU in aggregator product feed & route to 4-pack bundle.',
    trigger_fail_demo: false,
  }
];

export const VISIBILITY_BENCHMARKS = [
  {
    id: 'bench-001',
    intent_query: 'Best single-origin anaerobic specialty coffee under ₹1000 in India with strawberry notes',
    target_category: 'Specialty Coffee',
    answer_engines: [
      {
        engine: 'Perplexity AI Search',
        cited: true,
        rank_position: 1,
        fact_accuracy_score: 98,
        mentioned_product: 'Subko Lot 77 Ratnagiri Anaerobic (₹850)',
        excerpt: 'Subko Specialty Coffee offers Lot 77 from Ratnagiri Estate processed via 72h anaerobic natural fermentation with prominent passionfruit and wild strawberry notes at ₹850 for 250g.',
        status: 'VERIFIED_ACCURATE'
      },
      {
        engine: 'ChatGPT Search (GPT-4o)',
        cited: true,
        rank_position: 2,
        fact_accuracy_score: 92,
        mentioned_product: 'Subko Lot 77 & Blue Tokai Attikan',
        excerpt: 'Subko\'s Ratnagiri Estate anaerobic lot is widely recognized for berry and passionfruit notes at ₹850.',
        status: 'VERIFIED_ACCURATE'
      },
      {
        engine: 'Claude 3.7 Sonnet (Shopping Tooling)',
        cited: true,
        rank_position: 1,
        fact_accuracy_score: 100,
        mentioned_product: 'CAN-SUBKO-LOT77-ANAE (₹850)',
        excerpt: 'Using the live Subko MCP server tool, found CAN-SUBKO-LOT77-ANAE in stock (42 units) at ₹850 with anaerobic natural process.',
        status: 'MCP_SYNCHRONIZED'
      }
    ]
  },
  {
    id: 'bench-002',
    intent_query: 'Artisanal ceramic V60 pour over brewing dripper India under ₹2000',
    target_category: 'Brewing Equipment',
    answer_engines: [
      {
        engine: 'Perplexity AI Search',
        cited: true,
        rank_position: 1,
        fact_accuracy_score: 95,
        mentioned_product: 'Subko Craft Ceramic V60 Dripper (₹1,850)',
        excerpt: 'Subko offers a handmade stoneware ceramic V60 cone dripper in Matte Charcoal Ash for ₹1,850.',
        status: 'VERIFIED_ACCURATE'
      },
      {
        engine: 'Google Gemini Search',
        cited: false,
        rank_position: null,
        fact_accuracy_score: 45,
        mentioned_product: 'Generic Hario V60',
        excerpt: 'Suggested Hario and generic plastic cones due to lack of structured product feed indexing.',
        status: 'REMEDIATION_REQUIRED'
      }
    ]
  }
];

export const INITIAL_MANDATES = [
  {
    id: 'mandate_autonomous_shopper_01',
    buyer_agent_id: 'agent_shopping_assistant_gpt4',
    title: 'Daily Office Specialty Coffee Restock Mandate',
    owner_name: 'Aditya Sharma (Engineering Lead)',
    owner_email: 'aditya@agentcommerce.dev',
    max_per_transaction: 2000,
    daily_spend_limit: 5000,
    spent_today: 850,
    remaining_daily_budget: 4150,
    allowed_categories: ['Single Origin Coffee', 'Cold Brews & Beverages', 'Brewing Equipment'],
    autonomous_threshold_gate: 2000, // <= 2000 auto, > 2000 requires human approval
    status: 'ACTIVE',
    expiry_timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    crypto_signature: '0x8f3c7b2a9d1e4f5068ab91c3d4e5f60718293a4b5c6d7e8f90123456789abcdef',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'mandate_enterprise_restock_02',
    buyer_agent_id: 'agent_procurement_bot_v2',
    title: 'Quarterly Executive Pantry & Subscription Mandate',
    owner_name: 'Priya Mehta (Operations Director)',
    owner_email: 'priya@subkotech.com',
    max_per_transaction: 10000,
    daily_spend_limit: 25000,
    spent_today: 0,
    remaining_daily_budget: 25000,
    allowed_categories: ['Single Origin Coffee', 'Coffee Subscriptions', 'Brewing Equipment'],
    autonomous_threshold_gate: 2000,
    status: 'ACTIVE',
    expiry_timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    crypto_signature: '0x7e6d5c4b3a2f109876543210fedcba9876543210abcdef0123456789abcdef01',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'tx_audit_901',
    transaction_id: 'tx_rzp_994821',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    acting_agent: 'Subko Autonomous Shopping Agent (v2.4)',
    buyer_intent: 'Restock premium single-origin coffee for morning filter brews',
    mandate_id: 'mandate_autonomous_shopper_01',
    product_canonical_ids: ['CAN-SUBKO-LOT77-ANAE'],
    product_titles: ['Subko Lot 77: Ratnagiri Estate Anaerobic Naturals'],
    line_items: [
      { sku: 'SUBKO-LOT77-WB-250G', name: 'Subko Lot 77 (Whole Bean 250g)', quantity: 1, unit_price: 850, total: 850 }
    ],
    amount: 850,
    currency: 'INR',
    gate_decision: 'AUTONOMOUS_APPROVED (Amount ₹850 <= ₹2,000 Threshold)',
    approver: 'Autonomous Rule Engine (AP2 Code Guard)',
    idempotency_key: 'idem_subko_994821_7a8f9c',
    razorpay_order_id: 'order_test_RP99482100A',
    razorpay_payment_id: 'pay_test_RP994821PAY1',
    razorpay_signature: 'rzp_sig_a7b8c9d0e1f2_verified',
    passed_constraints: [
      'Category Single Origin Coffee in Whitelist',
      'Amount ₹850 <= ₹2,000 Transaction Ceiling',
      'Daily Spend ₹850 <= ₹5,000 Daily Cap',
      'Mandate Not Expired (Valid until 2026-10-03)',
      'Price Integrity Check: Feed price (₹850) matched checkout quote',
      'Idempotency Key Validated (Single execution guarantee)'
    ],
    status: 'CAPTURED_SUCCESS',
    reversal_path: 'POST /api/payment/reversal/tx_rzp_994821 (Instant Razorpay Test Refund)'
  }
];
