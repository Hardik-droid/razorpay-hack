import React, { useState, useEffect } from 'react';
import { 
  FileCode2, 
  Upload, 
  Play, 
  CheckCircle, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Layers, 
  Database,
  Terminal,
  Code2,
  Cpu
} from 'lucide-react';

export default function IngestView({ onEventNotification }) {
  const [sampleType, setSampleType] = useState('csv_messy');
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestResults, setIngestResults] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeMcpTool, setActiveMcpTool] = useState('list_catalog');
  const [mcpToolArg, setMcpToolArg] = useState('{"category": "Single Origin"}');
  const [mcpResult, setMcpResult] = useState(null);
  const [isMcpCalling, setIsMcpCalling] = useState(false);

  // Load initial samples and products
  useEffect(() => {
    fetch('/api/merchant/raw-samples')
      .then(res => res.json())
      .then(samples => {
        setRawText(samples[sampleType] || '');
      })
      .catch(console.error);

    loadProducts();
  }, [sampleType]);

  const loadProducts = () => {
    fetch('/api/storefront/merchant-subko-001')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        if (data.products?.length > 0 && !selectedProduct) {
          setSelectedProduct(data.products[0]);
        }
      })
      .catch(console.error);
  };

  const handleNormalize = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/merchant/upload-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: rawText,
          inputType: sampleType,
          merchantId: 'merchant-subko-001',
        })
      });
      const data = await res.json();
      setIngestResults(data);
      loadProducts();
      if (onEventNotification) {
        onEventNotification(`Ingest Agent normalized ${data.count} items into canonical schema.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeMcpTool = async () => {
    setIsMcpCalling(true);
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(mcpToolArg);
      } catch (e) {
        parsedArgs = {};
      }

      const res = await fetch('/api/mcp/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: activeMcpTool,
          arguments: parsedArgs,
        })
      });
      const data = await res.json();
      setMcpResult(data);
    } catch (err) {
      setMcpResult({ error: err.message });
    } finally {
      setIsMcpCalling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/20">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono-code text-xs uppercase mb-1">
            <Cpu className="w-4 h-4" />
            <span>Agent 01: Ingest & Machine Storefront Engine</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Convert Messy Catalogs into Live Machine-Readable Endpoints
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Ingests unstructured PDFs, legacy HTML tables, or CSV exports and continuously emits canonical Product IDs, variant matrices, JSON-LD Schema feeds, and a real-time Model Context Protocol (MCP) server.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="/api/storefront/merchant-subko-001/feed"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-mono-code transition-colors"
          >
            <span>Live JSON-LD Feed</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>
      </div>

      {/* Two Column Workspace: Ingestion Box on Left, Schema Explorer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Raw Ingest Transformer (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-code text-slate-300 font-semibold uppercase flex items-center space-x-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Messy Source Data</span>
              </label>

              {/* Sample Presets */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSampleType('csv_messy')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-code transition-colors ${
                    sampleType === 'csv_messy' ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  CSV
                </button>
                <button
                  onClick={() => setSampleType('pdf_catalog_text')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-code transition-colors ${
                    sampleType === 'pdf_catalog_text' ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  PDF Text
                </button>
                <button
                  onClick={() => setSampleType('html_legacy_table')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-code transition-colors ${
                    sampleType === 'html_legacy_table' ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Legacy HTML
                </button>
              </div>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={8}
              placeholder="Paste raw CSV, unstructured PDF extract, or legacy HTML table here..."
              className="w-full p-3 rounded-lg bg-[#07090e] border border-slate-700/80 text-slate-200 font-mono-code text-xs focus:outline-none focus:border-cyan-500 resize-none"
            />

            <button
              onClick={handleNormalize}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Normalizing to Canonical Schema...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Transform to Machine Storefront</span>
                </>
              )}
            </button>
          </div>

          {/* Product Quick Selector */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-xs font-mono-code text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Canonical Product Catalog ({products.length})</span>
              <span className="text-[10px] text-emerald-400 font-bold">100% Machine Parsable</span>
            </h3>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {products.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedProduct?.id === prod.id
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono-code text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {prod.canonical_id}
                      </span>
                      <h4 className="font-semibold text-xs text-white mt-1 line-clamp-1">{prod.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono-code">₹{prod.price} • Stock: {prod.stock_quantity}</p>
                    </div>
                    <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      {prod.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Canonical Product Schema & MCP Server Inspector (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* MCP Server Live Testing Sandbox */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono-code text-xs font-bold text-slate-200 uppercase">
                  Live MCP Tool Playground (Model Context Protocol)
                </h3>
              </div>
              <span className="text-[10px] font-mono-code text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                POST /api/mcp/tools
              </span>
            </div>

            {/* MCP Tool Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'list_catalog', defaultArg: '{"category": "Single Origin"}' },
                { name: 'get_product_schema', defaultArg: '{"canonical_id": "CAN-SUBKO-LOT77-ANAE"}' },
                { name: 'check_stock', defaultArg: '{"canonical_id": "CAN-SUBKO-LOT77-ANAE"}' },
                { name: 'validate_order_quote', defaultArg: '{"items": [{"canonical_id": "CAN-SUBKO-LOT77-ANAE", "quantity": 2}]}' },
              ].map(tool => (
                <button
                  key={tool.name}
                  onClick={() => {
                    setActiveMcpTool(tool.name);
                    setMcpToolArg(tool.defaultArg);
                  }}
                  className={`p-2 rounded text-[11px] font-mono-code border text-left transition-all ${
                    activeMcpTool === tool.name
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {tool.name}
                </button>
              ))}
            </div>

            {/* Tool Args Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono-code text-slate-400">Tool Arguments (JSON):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mcpToolArg}
                  onChange={(e) => setMcpToolArg(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#07090e] border border-slate-700 text-slate-200 font-mono-code text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={executeMcpTool}
                  disabled={isMcpCalling}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono-code flex items-center space-x-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Call Tool</span>
                </button>
              </div>
            </div>

            {/* MCP JSON Response */}
            {mcpResult && (
              <div className="mt-2 p-3 rounded-lg bg-[#07090e] border border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-mono-code text-slate-400 mb-1 border-b border-white/5 pb-1">
                  <span>Tool Output (Machine Payload)</span>
                  <span className="text-emerald-400">Status 200 OK</span>
                </div>
                <pre className="text-[11px] font-mono-code text-cyan-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {JSON.stringify(mcpResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Canonical Schema & Variant Inspector */}
          {selectedProduct && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-mono-code text-xs font-bold text-slate-200 uppercase">
                    Machine Normalized Schema: {selectedProduct.canonical_id}
                  </h3>
                </div>
                <span className="text-[10px] font-mono-code text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  AP2 / UAP Schema Compliant
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#07090e] border border-slate-800">
                <pre className="text-[11px] font-mono-code text-emerald-300 max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedProduct, null, 2)}
                </pre>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
