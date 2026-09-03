import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  RefreshCw, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  TrendingDown, 
  ArrowRight,
  ShieldCheck,
  Radio,
  Sliders
} from 'lucide-react';

export default function IntegrityView({ onEventNotification }) {
  const [ledger, setLedger] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isDriftEnabled, setIsDriftEnabled] = useState(true);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      const res = await fetch('/api/integrity/ledger');
      const data = await res.json();
      setLedger(data.ledger || []);
      setIsDriftEnabled(data.isDriftSimulationActive);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/integrity/scan', { method: 'POST' });
      const data = await res.json();
      setLedger(data.ledger || []);
      if (onEventNotification) {
        onEventNotification(`Integrity Agent scanned 4 aggregator sources. Found ${data.discrepancy_count} discrepancy records.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemediate = async (id) => {
    try {
      const res = await fetch(`/api/integrity/remediate/${id}`, { method: 'POST' });
      const data = await res.json();
      loadLedger();
      if (onEventNotification) {
        onEventNotification(`Discrepancy ${id} remediated. Machine feed synced.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDrift = async (enabled) => {
    try {
      const res = await fetch('/api/integrity/toggle-drift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      setIsDriftEnabled(data.enabled);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/20">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-mono-code text-xs uppercase mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Agent 02: Integrity Agent & Web Truth Crawler</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Aggregator Price Drift & Stale Listing Discrepancy Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Continuously crawls aggregators (Amazon, Flipkart, Swiggy, Google Shopping) for stale listings, outdated prices, or discontinued SKUs. Feeds directly into Paymaster to catch price drift mid-checkout before funds leave the account.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Drift Simulation Toggle */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono-code">
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-300">Drift Injection Shield:</span>
            <button
              onClick={() => toggleDrift(!isDriftEnabled)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                isDriftEnabled ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {isDriftEnabled ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {/* Trigger Scan Button */}
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Crawling Web Aggregators...</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5" />
                <span>Crawl External Truth Sources</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Discrepancy Ledger Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-mono-code text-xs font-bold text-slate-200 uppercase">
              Active Discrepancy Findings ({ledger.length})
            </h3>
            <span className="text-[10px] font-mono-code text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
              Live Interception Ready
            </span>
          </div>

          <span className="text-xs font-mono-code text-slate-400">
            Auto-Sync Protocol: <strong className="text-emerald-400">AP2 Verified</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono-code text-slate-400">
                <th className="pb-3 pr-4 font-semibold">PRODUCT & ISSUE</th>
                <th className="pb-3 pr-4 font-semibold">SOURCE CHANNEL</th>
                <th className="pb-3 pr-4 font-semibold">CANONICAL VS SCRAPED</th>
                <th className="pb-3 pr-4 font-semibold">PRICE DRIFT</th>
                <th className="pb-3 pr-4 font-semibold">CONFIDENCE</th>
                <th className="pb-3 pr-4 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono-code">
              {ledger.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  {/* Product & Issue */}
                  <td className="py-3.5 pr-3">
                    <div className="font-semibold text-white">{item.product_title}</div>
                    <div className="text-[11px] text-rose-400 mt-0.5 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span>{item.detected_issue}</span>
                    </div>
                  </td>

                  {/* Channel */}
                  <td className="py-3.5 pr-3">
                    <div className="text-slate-300">{item.source_channel}</div>
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-0.5 mt-0.5"
                    >
                      <span className="truncate max-w-[140px]">{item.source_url}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>

                  {/* Canonical vs Scraped */}
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-emerald-400 font-bold">₹{item.merchant_canonical_price}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-rose-400 font-bold line-through">₹{item.external_scraped_price}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Ground Truth vs Scraped</div>
                  </td>

                  {/* Drift Percentage */}
                  <td className="py-3.5 pr-3">
                    {item.price_drift_percentage !== 0 ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                        <TrendingDown className="w-3 h-3" />
                        <span>{item.price_drift_percentage}%</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">0% (Attribute Drift)</span>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="py-3.5 pr-3">
                    <span className="text-cyan-300 font-bold">{(item.confidence_score * 100).toFixed(0)}%</span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 pr-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      item.status === 'ACTIVE_DRIFT_ALERT'
                        ? 'bg-rose-950 text-rose-300 border-rose-500/50 animate-pulse'
                        : item.status === 'REMEDIATED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        : 'bg-amber-950 text-amber-300 border-amber-500/50'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  {/* Remediation Action */}
                  <td className="py-3.5 text-right">
                    {item.status !== 'REMEDIATED' ? (
                      <button
                        onClick={() => handleRemediate(item.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        Auto-Remediate
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[11px] flex items-center justify-end space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Synced</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
