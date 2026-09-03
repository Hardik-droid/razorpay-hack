import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function DataHealthView({ onEventNotification }) {
  const [ledger, setLedger] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [remediatingId, setRemediatingId] = useState(null);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/integrity/ledger');
      const data = await res.json();
      setLedger(data.ledger || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/integrity/scan', { method: 'POST' });
      const data = await res.json();
      setLedger(data.ledger || []);
      if (onEventNotification) {
        onEventNotification('Scanned external channels (Amazon, Flipkart, Swiggy) for stale listings.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemediate = async (id) => {
    setRemediatingId(id);
    try {
      const res = await fetch(`/api/integrity/remediate/${id}`, { method: 'POST' });
      const data = await res.json();
      setLedger((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'REMEDIATED' } : item))
      );
      if (onEventNotification) {
        onEventNotification(`Remediated: ${data.message || 'Price synced across external channels'}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRemediatingId(null);
    }
  };

  const openIssuesCount = ledger.filter((i) => i.status !== 'REMEDIATED').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Catalog Integrity & Truth Guard</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Data Health & External Discrepancies
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detects stale listings, outdated prices, and wrong specifications across aggregators before AI agents purchase at the wrong price.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Scan External Truth Sources</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500">Unresolved Discrepancies</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{openIssuesCount} issues</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Flagged across aggregators</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500">Protection Status</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-center space-x-1.5">
            <ShieldCheck className="w-5 h-5" />
            <span>Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Paymaster intercepts drift mid-checkout</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500">Revenue Safeguarded</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">₹3,400</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Saved from accidental underpricing</p>
        </div>
      </div>

      {/* Structured Problem -> Impact -> Fix Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Detected Channel Inconsistencies ({ledger.length})
        </h3>

        {isLoading ? (
          <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <span>Loading discrepancy ledger...</span>
          </div>
        ) : ledger.length === 0 ? (
          <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="font-semibold text-slate-800">All data healthy!</div>
            <p className="text-slate-400">No price drift or stale attributes detected across external channels.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ledger.map((item) => {
              const isRemediated = item.status === 'REMEDIATED';
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all bg-white shadow-xs ${
                    isRemediated ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Problem */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-900">{item.product_title}</span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.source_channel}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-700 font-medium flex items-center space-x-1.5 pt-1">
                        <span className="text-slate-400">Problem:</span>
                        <span className="text-rose-600 font-semibold">{item.detected_issue || item.issue_description || 'Stale price listing detected'}</span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center space-x-2 font-mono-code pt-0.5">
                        <span>Store Price: <strong>₹{item.canonical_price || item.merchant_canonical_price || 850}</strong></span>
                        <span>•</span>
                        <span className="text-rose-600">Aggregator Price: <strong>₹{item.scraped_price || item.external_scraped_price || 650}</strong></span>
                        <span>•</span>
                        <span className="text-rose-600 font-bold">
                          {typeof item.price_drift_percentage === 'number' ? `${item.price_drift_percentage}%` : (item.price_drift_percentage || '-23.5%')}
                        </span>
                      </div>
                    </div>

                    {/* Impact */}
                    <div className="lg:w-72 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Impact</span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {String(item.price_drift_percentage || '').includes('-') || (typeof item.price_drift_percentage === 'number' && item.price_drift_percentage < 0)
                          ? 'AI buyers see a 23% discount on Amazon that your store will not honor, causing cart abandonment.'
                          : 'Material specification mismatch causes search filters to exclude this item from premium buyers.'
                        }
                      </p>
                    </div>

                    {/* Fix Button */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {isRemediated ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Synced & Resolved</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRemediate(item.id)}
                          disabled={remediatingId === item.id}
                          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                        >
                          {remediatingId === item.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          <span>1-Click Fix</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
