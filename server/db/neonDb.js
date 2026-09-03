import { neon, Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { INITIAL_PRODUCTS, INITIAL_DISCREPANCIES, INITIAL_MANDATES, INITIAL_AUDIT_LOGS } from '../data/seedData.js';

dotenv.config();

// Fallback to sample Neon PostgreSQL connection if not explicitly provided
const DEFAULT_NEON_FALLBACK = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_sample9021@ep-weathered-snow-a5v8d7y8.us-east-2.aws.neon.tech/neondb?sslmode=require';

class NeonDatabaseManager {
  constructor() {
    this.connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '';
    this.isConnected = false;
    this.lastError = null;
    this.tableCounts = {};
    this.isInitialized = false;
  }

  getConnectionString() {
    return this.connectionString || process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '';
  }

  setConnectionString(newUrl) {
    if (newUrl) {
      this.connectionString = newUrl.trim();
      process.env.DATABASE_URL = this.connectionString;
      process.env.NEON_DATABASE_URL = this.connectionString;
    }
  }

  getSql() {
    const conn = this.getConnectionString();
    if (!conn || !conn.startsWith('postgres')) {
      return null;
    }
    return neon(conn);
  }

  // Provision complete schema on Neon PostgreSQL
  async initializeSchema(connString) {
    if (connString) {
      this.setConnectionString(connString);
    }

    const sql = this.getSql();
    if (!sql) {
      return {
        success: false,
        is_connected: false,
        error: 'No valid Neon connection string found. Set DATABASE_URL in .env or provide connection string.',
      };
    }

    const startTime = Date.now();
    try {
      // 1. Test ping
      const pingResult = await sql`SELECT 1 as connected, NOW() as server_time, current_database() as db_name`;
      this.isConnected = true;
      this.lastError = null;

      // 2. Create tables
      await sql`
        CREATE TABLE IF NOT EXISTS merchants (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          category VARCHAR(100),
          website VARCHAR(255),
          currency VARCHAR(10) DEFAULT 'INR',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS source_connections (
          id VARCHAR(64) PRIMARY KEY,
          merchant_id VARCHAR(64),
          type VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL,
          endpoint_url TEXT,
          status VARCHAR(50) DEFAULT 'ACTIVE',
          products_count INT DEFAULT 0,
          last_synced_at TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(64) PRIMARY KEY,
          merchant_id VARCHAR(64),
          canonical_id VARCHAR(128) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          brand VARCHAR(100),
          category VARCHAR(100),
          description TEXT,
          price NUMERIC(12, 2) NOT NULL,
          mrp NUMERIC(12, 2),
          currency VARCHAR(10) DEFAULT 'INR',
          stock_quantity INT DEFAULT 0,
          is_available BOOLEAN DEFAULT TRUE,
          rating NUMERIC(3, 1) DEFAULT 5.0,
          images JSONB,
          variants JSONB,
          manually_corrected BOOLEAN DEFAULT FALSE,
          last_updated TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS sync_history (
          id VARCHAR(64) PRIMARY KEY,
          connection_id VARCHAR(64),
          status VARCHAR(50) DEFAULT 'SUCCESS',
          products_found INT DEFAULT 0,
          products_synced INT DEFAULT 0,
          errors_count INT DEFAULT 0,
          duration_ms INT DEFAULT 0,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS discrepancies (
          id VARCHAR(64) PRIMARY KEY,
          product_id VARCHAR(64),
          product_title VARCHAR(255),
          source_channel VARCHAR(100),
          detected_issue TEXT,
          merchant_canonical_price NUMERIC(12, 2),
          external_scraped_price NUMERIC(12, 2),
          price_drift_percentage NUMERIC(6, 2),
          confidence_score NUMERIC(4, 2),
          status VARCHAR(50) DEFAULT 'ACTIVE_DRIFT_ALERT',
          last_crawled_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS payment_mandates (
          id VARCHAR(64) PRIMARY KEY,
          buyer_agent_id VARCHAR(100),
          title VARCHAR(255),
          owner_name VARCHAR(100),
          max_per_transaction NUMERIC(12, 2),
          daily_spend_limit NUMERIC(12, 2),
          spent_today NUMERIC(12, 2) DEFAULT 0,
          remaining_daily_budget NUMERIC(12, 2),
          allowed_categories JSONB,
          status VARCHAR(50) DEFAULT 'ACTIVE',
          crypto_signature TEXT,
          expiry_timestamp TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id VARCHAR(64) PRIMARY KEY,
          transaction_id VARCHAR(64) UNIQUE NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          acting_agent VARCHAR(255),
          buyer_intent TEXT,
          amount NUMERIC(12, 2),
          currency VARCHAR(10) DEFAULT 'INR',
          gate_decision VARCHAR(100),
          approver VARCHAR(100),
          idempotency_key VARCHAR(128),
          razorpay_order_id VARCHAR(128),
          razorpay_payment_id VARCHAR(128),
          status VARCHAR(50),
          passed_constraints JSONB,
          explainable_summary TEXT
        );
      `;

      // 3. Seed initial records if empty
      const existingMerchants = await sql`SELECT COUNT(*) FROM merchants`;
      if (parseInt(existingMerchants[0].count, 10) === 0) {
        await sql`
          INSERT INTO merchants (id, name, slug, category, website)
          VALUES ('merchant-subko-001', 'Subko Coffee Roasters', 'subko-coffee', 'Single Origin Coffee', 'https://subko.coffee')
          ON CONFLICT DO NOTHING;
        `;
      }

      const existingProducts = await sql`SELECT COUNT(*) FROM products`;
      if (parseInt(existingProducts[0].count, 10) === 0) {
        for (const p of INITIAL_PRODUCTS) {
          await sql`
            INSERT INTO products (
              id, merchant_id, canonical_id, title, slug, brand, category, description,
              price, mrp, stock_quantity, is_available, rating, images, variants
            ) VALUES (
              ${p.id}, ${p.merchant_id}, ${p.canonical_id}, ${p.title}, ${p.slug}, ${p.brand},
              ${p.category}, ${p.description}, ${p.price}, ${p.mrp || p.price}, ${p.stock_quantity},
              ${p.is_available}, ${p.rating}, ${JSON.stringify(p.images)}, ${JSON.stringify(p.variants)}
            ) ON CONFLICT (canonical_id) DO NOTHING;
          `;
        }
      }

      // 4. Query row counts
      const counts = await this.queryTableCounts(sql);
      this.tableCounts = counts;
      this.isInitialized = true;

      const durationMs = Date.now() - startTime;

      return {
        success: true,
        is_connected: true,
        database: pingResult[0]?.db_name,
        server_time: pingResult[0]?.server_time,
        latency_ms: durationMs,
        tables_provisioned: 7,
        table_counts: counts,
        message: 'Neon PostgreSQL database connected and schema provisioned successfully!',
      };
    } catch (err) {
      this.isConnected = false;
      this.lastError = err.message;
      return {
        success: false,
        is_connected: false,
        error: err.message,
      };
    }
  }

  async queryTableCounts(sqlInstance) {
    const sql = sqlInstance || this.getSql();
    if (!sql) return {};
    try {
      const [m, sc, p, sh, d, pm, al] = await Promise.all([
        sql`SELECT COUNT(*) FROM merchants`,
        sql`SELECT COUNT(*) FROM source_connections`,
        sql`SELECT COUNT(*) FROM products`,
        sql`SELECT COUNT(*) FROM sync_history`,
        sql`SELECT COUNT(*) FROM discrepancies`,
        sql`SELECT COUNT(*) FROM payment_mandates`,
        sql`SELECT COUNT(*) FROM audit_logs`,
      ]);

      return {
        merchants: parseInt(m[0]?.count || 0, 10),
        source_connections: parseInt(sc[0]?.count || 0, 10),
        products: parseInt(p[0]?.count || 0, 10),
        sync_history: parseInt(sh[0]?.count || 0, 10),
        discrepancies: parseInt(d[0]?.count || 0, 10),
        payment_mandates: parseInt(pm[0]?.count || 0, 10),
        audit_logs: parseInt(al[0]?.count || 0, 10),
      };
    } catch {
      return {};
    }
  }

  // Get live diagnostics status
  async getStatus() {
    const conn = this.getConnectionString();
    if (!conn || !conn.startsWith('postgres')) {
      return {
        is_configured: false,
        is_connected: false,
        status: 'AWAITING_CONNECTION_STRING',
        message: 'No Neon connection string configured. Set DATABASE_URL in .env or pass via API.',
        table_counts: {
          merchants: 1,
          products: INITIAL_PRODUCTS.length,
          discrepancies: INITIAL_DISCREPANCIES.length,
          payment_mandates: INITIAL_MANDATES.length,
          audit_logs: INITIAL_AUDIT_LOGS.length,
        },
        storage_engine: 'In-Memory High-Performance Cache (Neon Fallback Active)',
      };
    }

    try {
      const sql = neon(conn);
      const ping = await sql`SELECT 1 as ok, NOW() as server_time, current_database() as db_name`;
      const counts = await this.queryTableCounts(sql);
      this.isConnected = true;
      this.tableCounts = counts;

      // Mask password in preview
      const maskedUrl = conn.replace(/:([^:@]+)@/, ':••••••••@');

      return {
        is_configured: true,
        is_connected: true,
        status: 'ONLINE',
        storage_engine: 'Neon Serverless PostgreSQL (Active)',
        database: ping[0]?.db_name,
        server_time: ping[0]?.server_time,
        connection_preview: maskedUrl,
        table_counts: counts,
      };
    } catch (err) {
      this.isConnected = false;
      this.lastError = err.message;
      return {
        is_configured: true,
        is_connected: false,
        status: 'CONNECTION_FAILED',
        storage_engine: 'In-Memory High-Performance Cache (Fallback Active)',
        error: err.message,
      };
    }
  }
}

export const neonDb = new NeonDatabaseManager();
