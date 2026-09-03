import React, { useState } from 'react';
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
  ExternalLink
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
            Configure your store identity, automated payment thresholds, and Razorpay credentials.
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

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Store Profile */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            <Store className="w-4 h-4 text-blue-600" />
            <span>Store Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business / Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Website URL</label>
              <input
                type="url"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500"
              >
                <option value="INR">Indian Rupee (INR - ₹)</option>
                <option value="USD">US Dollar (USD - $)</option>
                <option value="EUR">Euro (EUR - €)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Autonomous Payment Safety Gates */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Autonomous Safety & Human Approval Gates</span>
          </div>

          <p className="text-xs text-slate-500">
            Enforce code-level limits on what AI shopping agents can automatically charge before requiring merchant confirmation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Autonomous Approval Threshold (₹)
              </label>
              <input
                type="number"
                value={autonomousLimit}
                onChange={(e) => setAutonomousLimit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500 font-mono-code"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Orders &gt; ₹{autonomousLimit} pause and open the Human Approval Drawer.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Automated Spend Cap (₹)
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
                  value="https://api.storefront.ai/v1/webhooks/razorpay"
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
