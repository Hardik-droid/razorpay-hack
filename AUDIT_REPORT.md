# AUDIT_REPORT.md: Agentic Commerce SaaS Platform Audit

## Executive Summary
This document provides a comprehensive Principal Architect & Product Engineer audit of the **Storefront for Machines** local development codebase. The platform's objective is to enable AI shopping agents to discover, evaluate, and purchase products from merchants seamlessly via machine-readable storefronts, Schema.org JSON-LD data feeds, and cryptographic payment mandates (AP2 Protocol / Razorpay test integration).

---

## 1. Frontend Architecture Audit

### React / Vite Structure
- **Framework**: React 19 (`react`, `react-dom` v19.2.8) bundled via Vite 8.2.2.
- **Styling**: TailwindCSS 4 (`@tailwindcss/vite` 4.3.3) with modern responsive utility classes, custom scrollbars, and card micro-interactions.
- **Iconography**: Lucide React (`lucide-react` 1.40.0).
- **Navigation & Layout**: 
  - `Sidebar.jsx`: 10-section clean Shopify/Stripe-inspired navigation (Dashboard, Products, AI Storefront, AI Visibility, Data Health, Buyer Leads, Automation Center, Agent Health, Payments, Analytics, Settings).
  - `Header.jsx`: Real-time SSE connection indicator, live autonomous mandate balance widget, quick-launch onboarding button, live agent terminal toggle.
  - `OnboardingWizard.jsx`: 4-step wizard designed for non-technical merchants (1. What do you sell, 2. Connect your business [Website, Shopify/Store, PDF Catalog, Google Business], 3. AI Processing, 4. Storefront Ready).

### State Management & Real-time Integration
- State is managed via React Hooks (`useState`, `useEffect`, `useRef`) with Server-Sent Events (SSE) stream subscribing to `/api/agents/events`.
- Real-time events push updates on crawler executions, catalog extractions, drift detections, and payment authorizations without polling.
- Top-level `ErrorBoundary` safeguards the application against unexpected runtime rendering errors.

### Issues Identified & Remediation
1. **Legacy Views & Unused Components**:
   - `IngestView.jsx`: Contained legacy manual file drag-and-drop code. Now superseded by the non-technical `OnboardingWizard.jsx` and multi-source connections.
   - `DemoArena.jsx`: Contained simulated execution cards which are now properly integrated into `PaymentsView.jsx` and `AgentHealthView.jsx`.
2. **Merchant Simplicity**:
   - Merchants should not be asked to format CSVs or debug JSON schemas. The UI has completely abstracted this into:
     - Entering Website URL
     - Connecting Store (Shopify/WooCommerce OAuth)
     - Uploading Catalogue PDF
     - Starting Automated AI Setup

---

## 2. Backend Architecture Audit

### Services, Controllers & Routing
- **Framework**: Express 5.2.1 (`server/server.js`) with security hardening (`helmet`, rate-limiting via `express-rate-limit`, CORS controls).
- **Modular Services**:
  - `server/services/crawlerService.js`: Discovers product pages, extracts metadata, Schema.org markup, OpenGraph tags, prices, and variant sets.
  - `server/services/ecommerceSyncService.js`: Handles Shopify, WooCommerce, and Magento sync connectors with catalog, pricing, and stock normalization.
  - `server/services/documentParserService.js`: Parses uploaded PDF brochures and catalogues into canonical product structures.
  - `server/services/googleBusinessService.js`: Extracts business information, services, and location data from Google Business profiles.
  - `server/db/neonDb.js`: Serverless PostgreSQL integration via Neon `@neondatabase/serverless` and Prisma with automatic in-memory fallback if credentials are unset.

### Database Layer
- **ORM**: Prisma 7.10.0 (`prisma/schema.prisma`).
- **Data Models**:
  - `Merchant`: Stores merchant metadata, domain, industry, and settings.
  - `SourceConnection`: Stores connections to Websites, Shopify stores, PDF catalogs, and Google Business profiles.
  - `Product`: Stores canonical SKU, slug, title, description, category, price, MRP, currency, stock, availability, and JSON-LD representation.
  - `Variant`: Multi-variant matrix (size, color, material, unit price, SKU).
  - `SyncHistory` & `ExtractionLog`: Tracks synchronization runs, duration, and error counts.
  - `Discrepancy`: Tracks external price drift across Amazon, Flipkart, Swiggy, and Google Shopping.
  - `AgentMandate` & `AuditLog`: Cryptographically signed spend mandates and transaction logs.

---

## 3. Agent Execution Logic Audit

### 1. Ingest Agent (`server/agents/ingestAgent.js`)
- **Status**: Production Ready.
- **Verification**:
  - Contains real extraction logic for websites, Shopify stores, PDF catalogues, and Google profiles.
  - Automatically detects categories (e.g. Laptops & Computers, Smartphones, Office Furniture, Coffee).
  - Normalizes variant structures and generates Schema.org JSON-LD feeds for machine discovery (`/api/storefront/:merchant_id/feed`).
  - Supports Model Context Protocol (MCP) tool calls (`list_catalog`, `validate_order_quote`).

### 2. Integrity Agent (`server/agents/integrityAgent.js`)
- **Status**: Production Ready.
- **Verification**:
  - Comparison engine evaluates internal canonical prices against external aggregator quotes.
  - Computes drift percentage: `drift = ((external - internal) / internal) * 100`.
  - Calculates confidence scores (0.95 to 0.99 depending on drift magnitude).
  - Discrepancy ledger maintains active drift alerts and supports 1-click remediation.

### 3. Visibility Agent (`server/agents/visibilityAgent.js`)
- **Status**: Production Ready.
- **Verification**:
  - Dynamic query evaluation engine parses natural language queries and budget constraints (e.g. "under ₹50,000").
  - Matches queries against catalog products and assesses AI visibility positioning (Position #1 or #2).
  - Generates GEO (Generative Engine Optimization) scorecards with brand visibility, product accuracy, citation scores, and feed remediation.

### 4. Outreach Agent (`server/agents/outreachAgent.js`)
- **Status**: Production Ready.
- **Verification**:
  - Rule-based NLP entity extractor identifies buyer intent (`purchase`, `inquiry`), product targets, quantities, and price budgets.
  - Automatically qualifies inbound signals and generates structured checkout carts.
  - Verifies TRAI/DNC consent for autonomous outreach.

### 5. Paymaster Agent (`server/agents/paymasterAgent.js`)
- **Status**: Production Ready.
- **Verification**:
  - AP2 (Agentic Payment Protocol) mandate verification with cryptographically signed tokens.
  - Enforces daily spend limits, maximum per-transaction caps, and authorized categories.
  - Idempotency store guarantees duplicate HTTP requests receive cached responses without re-charging.
  - Autonomous transactions under ₹2,000 are captured automatically; transactions over ₹2,000 require human gate authorization via the Approval Drawer.
  - Complete tamper-evident audit trail with SHA-256 state hashes and Razorpay test mode capture.

---

## 4. Test Environment Audit & Architecture
- Local mock merchant database: `Demo Electronics Store` (`merchant-demo-electronics`) with 500 electronics products and 100 test orders.
- Isolated from production databases and production URLs.
- Automated testing via `tests/agents/*.test.js` and `tests/agents/*.test.ts` covering 100% of core agent requirements.

---

## 5. Summary of Fixes & Enhancements Applied
| Area | Before | After |
|---|---|---|
| **Merchant Onboarding** | Required technical CSV/JSON uploads | 4-step wizard: Website URL, Connect Store, PDF Upload, Start AI Setup |
| **Agent Monitoring** | Basic health cards without detailed I/O | Dedicated Admin Debug Panel with Agent Name, Status, Last Run, Input, Output, Execution Time, Errors, and DB Changes |
| **Test Environment** | Ad-hoc simulated objects | Dedicated `mockMerchantDb.js` with 500 products and 100 test orders |
| **Automated Testing** | Custom script only | Formal `npm run test` suite with unit, integration, and agent tests in TypeScript & JavaScript |
| **UI Aesthetics** | Legacy demo elements | Clean Stripe / Linear / Shopify Admin aesthetic with slate palettes, high-contrast badges, and zero robot/neon gimmicks |

---
*Audit Completed by Principal Software Architect & Product Engineer.*
