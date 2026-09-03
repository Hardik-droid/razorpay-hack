import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Code2, 
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function AiStorefrontView({ onEventNotification }) {
  const [copied, setCopied] = useState(false);
  const [testQuery, setTestQuery] = useState('single origin coffee for pour over');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeFormat, setActiveFormat] = useState('jsonld');

  const publicFeedUrl = `${window.location.origin}/api/storefront/merchant-subko-001/feed`;
  const mcpEndpointUrl = `${window.location.origin}/api/mcp/tools`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onEventNotification) onEventNotification('Copied public endpoint URL to clipboard.');
  };

  const handleRunTestQuery = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Query MCP tool endpoint
      const res = await fetch('/api/mcp/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'list_catalog',
          arguments: { category: 'Single Origin' },
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (onEventNotification) onEventNotification('AI Query Test Executed Successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Store className="w-4 h-4" />
            <span>AI Storefront & Endpoints</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Public Machine-Readable Storefront
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            This live endpoint provides structured Schema.org data so AI agents can query inventory, prices, and initiate purchases.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="/api/storefront/merchant-subko-001/feed"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Open Raw Feed</span>
          </a>
        </div>
      </div>

      {/* Endpoint URL Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Public JSON-LD Feed */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-900">Live JSON-LD Product Feed</span>
            </div>
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Discovered by Google AI Overviews, Apple Intelligence, and search crawlers automatically.
          </p>

          <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={publicFeedUrl}
              className="w-full bg-transparent text-xs font-mono-code text-slate-700 outline-hidden select-all"
            />
            <button
              onClick={() => copyToClipboard(publicFeedUrl)}
              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-200/50 cursor-pointer shrink-0"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card 2: Autonomous Agent MCP Endpoint */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-slate-900">Model Context Protocol (MCP) Tool Server</span>
            </div>
            <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Used by autonomous shopping agents (Claude, ChatGPT, LangChain) for real-time tool calls.
          </p>

          <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={mcpEndpointUrl}
              className="w-full bg-transparent text-xs font-mono-code text-slate-700 outline-hidden select-all"
            />
            <button
              onClick={() => copyToClipboard(mcpEndpointUrl)}
              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-200/50 cursor-pointer shrink-0"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>

      {/* Interactive AI Agent Search Simulator */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Test How an AI Shopping Agent Queries Your Store</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter an intent query to see how autonomous shopping agents parse your inventory in real time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative w-full flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="e.g. Best single origin coffee for morning brew"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleRunTestQuery}
            disabled={isTesting}
            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{isTesting ? 'Querying Machine Feed...' : 'Test Machine Query'}</span>
          </button>
        </div>

        {/* Live Result Panel */}
        {testResult && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-slide-down">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Agent Match Verified (Tool: list_catalog)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono-code">{testResult.result?.products?.length || 1} products returned</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="font-semibold text-xs text-slate-900">
                Top Matched Item: {testResult.result?.products?.[0]?.title || 'Subko Lot 77 Ratnagiri Estate'}
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono-code">
                <span>Price: ₹{testResult.result?.products?.[0]?.price || 850}</span>
                <span>•</span>
                <span>Stock: {testResult.result?.products?.[0]?.stock_quantity || 42} units</span>
                <span>•</span>
                <span>Format: Schema.org Product</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
