import React, { useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  Search, 
  ShoppingCart, 
  ArrowUpRight, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Play,
  RotateCcw,
  Zap,
  Activity
} from 'lucide-react';

export default function DashboardView({ 
  onRunScenario, 
  onEventNotification, 
  onTriggerApprovalModal,
  setActiveTab,
  onOpenWizard
}) {
  const [runningScenario, setRunningScenario] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  const kpis = [
    { label: 'AI Store Health', value: '92%', change: '+4.2%', trend: 'up', desc: 'Catalog machine-readability', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Products Indexed', value: '542', change: '100% synced', trend: 'neutral', desc: 'Active in machine feed', icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'AI Visibility Score', value: '78%', change: '+12%', trend: 'up', desc: 'Appears in 8/10 AI queries', icon: Search, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Buyer Intent Leads', value: '23', change: '5 today', trend: 'up', desc: 'Carts created by AI shoppers', icon: ShoppingCart, color: 'text-amber-600 bg-amber-50' },
  ];

  const handleSimulate = async (scenarioId, label) => {
    setRunningScenario(scenarioId);
    setSimulationResult(null);
    try {
      const res = await fetch(`/api/simulate/${scenarioId}`, { method: 'POST' });
      const data = await res.json();
      setSimulationResult({ id: scenarioId, label, data });

      if (data.result?.requires_human_approval && onTriggerApprovalModal) {
        onTriggerApprovalModal(data.result.pending_transaction);
      }

      if (onEventNotification) {
        onEventNotification(`Simulation Completed: ${label}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunningScenario(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Store ID: merchant-subko-001 • Mumbai, IN</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Good morning, Subko Coffee
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Your store is live and ready for AI shopping agents. Products are indexed, price drift shields are active, and autonomous checkout is enabled via Razorpay.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenWizard}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Sync New Catalog</span>
          </button>
          <button
            onClick={() => setActiveTab('visibility')}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>Check AI Visibility</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
                <div className={`p-2 rounded-lg ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 mt-3">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  {kpi.change}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{kpi.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Interactive Simulation & Test Arena (Merchant-Friendly Terminology) */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Interactive Merchant Test Arena</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate how AI shopping agents interact with your store and verify safeguards with 1-click tests.
            </p>
          </div>
          <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            5 Test Scenarios Available
          </span>
        </div>

        {/* 5 Scenario Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { id: 'autonomous_buy', label: '1. Autonomous Purchase', sub: '₹850 below threshold', color: 'hover:border-emerald-400' },
            { id: 'price_drift_halt', label: '2. Price Mismatch Halt', sub: 'Intercepts wrong price', color: 'hover:border-rose-400' },
            { id: 'human_gate_escalation', label: '3. Order Approval Drawer', sub: '₹6,050 high-value gate', color: 'hover:border-amber-400' },
            { id: 'mandate_exhaustion_refusal', label: '4. Budget Limit Refusal', sub: 'Exceeds daily budget', color: 'hover:border-purple-400' },
            { id: 'idempotent_retry', label: '5. Network Retry Safety', sub: 'Zero duplicate charging', color: 'hover:border-cyan-400' },
          ].map((sc) => (
            <button
              key={sc.id}
              disabled={runningScenario !== null}
              onClick={() => handleSimulate(sc.id, sc.label)}
              className={`p-3 text-left rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex flex-col justify-between space-y-2 ${sc.color}`}
            >
              <div>
                <div className="font-semibold text-xs text-slate-900 flex items-center justify-between">
                  <span>{sc.label}</span>
                  {runningScenario === sc.id && <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{sc.sub}</div>
              </div>
              <span className="text-[10px] font-medium text-blue-600 hover:text-blue-700 flex items-center pt-1">
                Run Test →
              </span>
            </button>
          ))}
        </div>

        {/* Simulation Output Toast / Card */}
        {simulationResult && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-slide-down">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Test Result: {simulationResult.label}</span>
              </span>
              <span className="text-[11px] font-mono-code text-slate-500">Status: {simulationResult.data.result?.status || 'COMPLETED'}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {simulationResult.data.result?.explainable_summary || simulationResult.data.result?.message || 'Transaction executed and verified against active safeguards.'}
            </p>
          </div>
        )}
      </div>

      {/* Two Column Layout: Recent Buyer Activity & Quick Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Inbound AI Orders */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent AI Buyer Transactions</h3>
              <p className="text-xs text-slate-500">Latest autonomous purchases and carts placed by AI shoppers</p>
            </div>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center"
            >
              View all orders →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-2.5">Buyer Agent / Query</th>
                  <th className="pb-2.5">Items</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { agent: 'Subko Autonomous Shopper', query: 'Procure 1 pack of Subko Lot 77 Anaerobic', items: 'Subko Lot 77 (250g)', amount: '₹850', status: 'Captured', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', time: '10 min ago' },
                  { agent: 'Office Pantry Agent', query: 'Quarterly office specialty coffee restock', items: 'Roaster Discovery + V60', amount: '₹6,050', status: 'Human Approved', statusColor: 'bg-blue-50 text-blue-700 border-blue-200', time: '2 hours ago' },
                  { agent: 'Claude Shopping Assistant', query: 'Single origin beans based on stale cache', items: 'Subko Lot 77', amount: '₹850', status: 'Drift Halted', statusColor: 'bg-rose-50 text-rose-700 border-rose-200', time: 'Yesterday' },
                  { agent: 'Autonomous Client Agent', query: 'Cold brew 4-pack verification purchase', items: 'Nitro Cold Brew 4-Pack', amount: '₹680', status: 'Captured', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', time: 'Yesterday' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 pr-2">
                      <div className="font-semibold text-slate-900">{row.agent}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{row.query}</div>
                    </td>
                    <td className="py-3 text-slate-600">{row.items}</td>
                    <td className="py-3 font-semibold text-slate-900 font-mono-code">{row.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400 text-[11px]">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: AI Search Health & Quick Stats */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">AI Recommendation Engine</h3>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Optimal</span>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Leading shopping agents regularly test your catalog for availability, roast freshness, and price accuracy.
            </p>

            <div className="space-y-3 mt-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>ChatGPT Search Visibility</span>
                  <span className="text-blue-600 font-bold">92%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Google AI Overviews</span>
                  <span className="text-indigo-600 font-bold">85%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Price Shield Accuracy</span>
                  <span className="text-emerald-600 font-bold">98%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setActiveTab('datahealth')}
              className="w-full py-2 px-3 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>3 External Price Leaks Detected</span>
              </div>
              <span>Fix →</span>
            </button>

            <button
              onClick={() => setActiveTab('storefront')}
              className="w-full py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Inspect Public JSON-LD Feed</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
