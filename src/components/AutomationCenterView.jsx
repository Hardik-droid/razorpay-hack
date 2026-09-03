import React, { useState } from 'react';
import { 
  Cpu, 
  Package, 
  ShieldAlert, 
  Search, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle2, 
  RefreshCw, 
  Play, 
  Pause, 
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function AutomationCenterView({ onEventNotification, setActiveTab }) {
  const [agents, setAgents] = useState([
    {
      id: 'catalog',
      name: '1. Catalog Agent',
      purpose: 'Converts your products into an AI-readable format.',
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Package,
      whatItDoes: 'Continuously normalizes attributes, categorizes items, and emits live Schema.org JSON-LD feeds for search engines and shopping bots.',
      lastActivity: 'Indexed 4 items 2 minutes ago',
      problemsFound: 'None (Catalog 100% structured)',
      actionText: 'Re-index Catalog',
      targetTab: 'products'
    },
    {
      id: 'protection',
      name: '2. Data Protection Agent',
      purpose: 'Finds wrong prices and fake listings online.',
      status: 'Scanning',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: ShieldAlert,
      whatItDoes: 'Monitors Amazon, Flipkart, and Swiggy for price mismatches, stale descriptions, or discontinued SKUs to prevent undercharging.',
      lastActivity: 'Scanned Amazon India 5 mins ago',
      problemsFound: '3 price leaks detected',
      actionText: 'Review Discrepancies',
      targetTab: 'datahealth'
    },
    {
      id: 'visibility',
      name: '3. AI Visibility Agent',
      purpose: 'Checks if AI recommends your business to shoppers.',
      status: 'Running',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Search,
      whatItDoes: 'Simulates customer queries in ChatGPT, Google AI Overviews, and Claude to verify your store ranks in top recommendation spots.',
      lastActivity: 'Tested 12 intent queries today',
      problemsFound: 'None (94% accuracy score)',
      actionText: 'Test AI Query',
      targetTab: 'visibility'
    },
    {
      id: 'sales',
      name: '4. Sales Agent',
      purpose: 'Finds buying opportunities and synthesizes carts.',
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: ShoppingCart,
      whatItDoes: 'Listens for customer purchase signals and builds verified, itemized shopping carts for AI shoppers.',
      lastActivity: 'Built cart #cart_subko_lot77 10 mins ago',
      problemsFound: 'None (2 carts awaiting checkout)',
      actionText: 'View Buyer Leads',
      targetTab: 'buyerleads'
    },
    {
      id: 'payment',
      name: '5. Payment Agent',
      purpose: 'Handles secure AI checkout and enforces budget gates.',
      status: 'Ready',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CreditCard,
      whatItDoes: 'Enforces AP2 mandate thresholds, human approval gates (for orders > ₹2,000), and captures payments via Razorpay Test Mode.',
      lastActivity: 'Authorized ₹850 order 12 mins ago',
      problemsFound: 'None (Idempotency verified)',
      actionText: 'Manage Payments',
      targetTab: 'payments'
    }
  ]);

  const [runningAgentId, setRunningAgentId] = useState(null);

  const handleRunAgentAction = (agent) => {
    setRunningAgentId(agent.id);
    setTimeout(() => {
      setRunningAgentId(null);
      if (onEventNotification) {
        onEventNotification(`Triggered task for ${agent.name}: Completed successfully.`);
      }
      if (agent.targetTab && setActiveTab) {
        setActiveTab(agent.targetTab);
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Automations & Background Agents</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Automation Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Five specialized automations work in harmony to maintain your catalog, protect your pricing, and capture sales from AI buyers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>5 Automations Online</span>
          </span>
        </div>
      </div>

      {/* 5 Clean Cards */}
      <div className="space-y-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isBusy = runningAgentId === agent.id;
          return (
            <div
              key={agent.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-blue-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{agent.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{agent.purpose}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${agent.statusColor}`}>
                    {agent.status}
                  </span>
                  <button
                    onClick={() => handleRunAgentAction(agent)}
                    disabled={isBusy}
                    className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5"
                  >
                    {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>{agent.actionText}</span>
                  </button>
                </div>
              </div>

              {/* 3 Detail Columns: What it does, Last Activity, Problems Found */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    What it does
                  </span>
                  <p className="text-slate-600 leading-relaxed">{agent.whatItDoes}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Last Activity
                  </span>
                  <div className="text-slate-700 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{agent.lastActivity}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Problems Found
                  </span>
                  <div className={`font-medium ${agent.problemsFound.includes('detected') ? 'text-amber-600' : 'text-emerald-600'} flex items-center space-x-1.5`}>
                    {agent.problemsFound.includes('detected') ? (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{agent.problemsFound}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
