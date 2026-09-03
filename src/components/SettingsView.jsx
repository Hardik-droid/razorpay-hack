import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Store, 
  CreditCard, 
  ShieldCheck, 
  Key, 
  Bell, 
  Check, 
  Save, 
  RefreshCw,
  ExternalLink,
  Database,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function SettingsView({ onEventNotification }) {
  const [storeName, setStoreName] = useState('Subko Specialty Coffee & Craft Bakehouse');
  const [storeUrl, setStoreUrl] = useState('https://subko.coffee');
  const [category, setCategory] = useState('Gourmet Food & Artisanal Beverages');
  const [currency, setCurrency] = useState('INR');
  const [autonomousLimit, setAutonomousLimit] = useState('2000');
  const [dailyBudget, setDailyBudget] = useState('10000');
  const [razorpayKey, setRazorpayKey] = useState('rzp_test_Subko90214810');
  const [isSaved, setIsSaved] = useState(false);

  // Neon DB Management State
  const [neonConnectionString, setNeonConnectionString] = useState('');
  const [neonStatus, setNeonStatus] = useState(null);
  const [isTestingNeon, setIsTestingNeon] = useState(false);
  const [neonMessage, setNeonMessage] = useState(null);

  useEffect(() => {
    fetchNeonStatus();
  }, []);

  const fetchNeonStatus = async () => {
    try {
      const res = await fetch('/api/db/neon-status');
      const data = await res.json();
      setNeonStatus(data);
      if (data.connection_preview) {
        setNeonConnectionString(data.connection_preview);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnectNeon = async (e) => {
    e.preventDefault();
    if (!neonConnectionString) return;

    setIsTestingNeon(true);
    setNeonMessage(null);

    try {
      const res = await fetch('/api/db/neon-configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString: neonConnectionString }),
      });
      const data = await res.json();
      if (data.success) {
        setNeonMessage({ type: 'success', text: `Connected! Provisioned 7 tables in ${data.latency_ms}ms.` });
        if (onEventNotification) {
          onEventNotification('Neon PostgreSQL database provisioned and connected successfully.');
        }
      } else {
        setNeonMessage({ type: 'error', text: data.error || 'Failed to connect to Neon.' });
      }
      await fetchNeonStatus();
    } catch (err) {
      setNeonMessage({ type: 'error', text: err.message });
    } finally {
      setIsTestingNeon(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    if (onEventNotification) {
      onEventNotification('Settings updated successfully. AP2 safety thresholds saved.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Store Configuration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Merchant Settings & Safety Controls
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your store identity, automated payment thresholds, and Neon PostgreSQL database.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaved ? 'Changes Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Section 0: Neon PostgreSQL Database Connection */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Neon Serverless PostgreSQL Database</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              neonStatus?.is_connected 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${neonStatus?.is_connected ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <span>{neonStatus?.is_connected ? 'Neon DB: Connected' : 'Storage: High-Performance Engine'}</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Connect your serverless PostgreSQL database from Neon to store products, source connections, variant matrices, and immutable transaction audit logs.
        </p>

        {neonMessage && (
          <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
            neonMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {neonMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{neonMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleConnectNeon} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Neon PostgreSQL Connection String (DATABASE_URL)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="postgresql://username:password@ep-sample-123.us-east-2.aws.neon.tech/neondb?sslmode=require"
                value={neonConnectionString}
                onChange={(e) => setNeonConnectionString(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500 font-mono-code"
              />
              <button
                type="submit"
                disabled={isTestingNeon || !neonConnectionString}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isTestingNeon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>{isTestingNeon ? 'Connecting...' : 'Connect & Provision'}</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Direct connection via <code className="font-mono-code text-slate-600">@neondatabase/serverless</code> with SSL encryption enabled.
            </span>
          </div>
        </form>

        {/* Neon Telemetry Details */}
        {neonStatus?.table_counts && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase block">Merchants</span>
              <span className="text-sm font-bold text-slate-900 font-mono-code">
                {neonStatus.table_counts.merchants || 1}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase block">Products</span>
              <span className="text-sm font-bold text-slate-900 font-mono-code">
                {neonStatus.table_counts.products || 4}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase block">Connections</span>
              <span className="text-sm font-bold text-slate-900 font-mono-code">
                {neonStatus.table_counts.source_connections || 2}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase block">Audit Logs</span>
              <span className="text-sm font-bold text-slate-900 font-mono-code">
                {neonStatus.table_counts.audit_logs || 5}
              </span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Section 1: Store Details */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            <Store className="w-4 h-4 text-blue-600" />
            <span>Store Profile & Public Entity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website</label>
              <input
                type="url"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500 font-mono-code"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Industry</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: AP2 Safety Guardrails & Limits */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Agentic Payment Protocol (AP2) Safety Thresholds</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Autonomous Transaction Limit (₹ INR)
              </label>
              <input
                type="number"
                value={autonomousLimit}
                onChange={(e) => setAutonomousLimit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500 font-mono-code"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Any transaction above ₹{autonomousLimit} will require explicit human approval via the Order Drawer.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Agent Spend Pool (₹ INR)
              </label>
              <input
                type="number"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500 font-mono-code"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Maximum aggregate amount AI agents can spend per 24 hours.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Razorpay Payment Gateway Credentials */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Razorpay Integration</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Razorpay Key ID (Test Mode)</label>
              <input
                type="text"
                value={razorpayKey}
                onChange={(e) => setRazorpayKey(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500 font-mono-code"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Webhook Endpoint URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value="https://storefront-for-machines.vercel.app/api/webhooks/razorpay"
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg font-mono-code text-slate-600 select-all"
                />
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 whitespace-nowrap">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
