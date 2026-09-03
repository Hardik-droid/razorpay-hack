import React from 'react';
import { 
  FileCode2, 
  ShieldAlert, 
  SearchCheck, 
  ShoppingCart, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  Zap
} from 'lucide-react';

export default function PipelineFlow({ activeTab, setActiveTab, systemOverview }) {
  const agents = [
    {
      id: 'ingest',
      number: '01',
      name: 'Ingest Agent',
      subtitle: 'Messy Data → Machine Storefront',
      badge: 'Live MCP & JSON-LD',
      icon: FileCode2,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400',
      activeColor: 'border-cyan-400 shadow-lg shadow-cyan-500/20 bg-cyan-950/40',
      status: 'ACTIVE',
      output: 'Canonical Product Schema',
    },
    {
      id: 'integrity',
      number: '02',
      name: 'Integrity Agent',
      subtitle: 'Web Crawl & Stale Price Guard',
      badge: 'Discrepancy Ledger',
      icon: ShieldAlert,
      color: 'from-rose-500/20 to-amber-500/10 border-rose-500/40 text-rose-400',
      activeColor: 'border-rose-400 shadow-lg shadow-rose-500/20 bg-rose-950/40',
      status: 'MONITORING',
      output: 'Price Drift Interception',
    },
    {
      id: 'visibility',
      number: '03',
      name: 'Visibility Agent',
      subtitle: 'Answer Engine GEO Scorecard',
      badge: 'Generative Engine Opt',
      icon: SearchCheck,
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-400',
      activeColor: 'border-amber-400 shadow-lg shadow-amber-500/20 bg-amber-950/40',
      status: 'SCORE: 96%',
      output: 'Citation Accuracy',
    },
    {
      id: 'outreach',
      number: '04',
      name: 'Outreach Agent',
      subtitle: 'Inbound Buyer Signal Qualifier',
      badge: 'TRAI Compliant',
      icon: ShoppingCart,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-400',
      activeColor: 'border-indigo-400 shadow-lg shadow-indigo-500/20 bg-indigo-950/40',
      status: 'LISTENING',
      output: 'Structured Buyer Carts',
    },
    {
      id: 'paymaster',
      number: '05',
      name: 'Paymaster Agent',
      subtitle: 'AP2 Mandates & Razorpay Test',
      badge: 'Hero Payment Engine',
      icon: CreditCard,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
      activeColor: 'border-emerald-400 shadow-lg shadow-emerald-500/20 bg-emerald-950/40',
      status: 'ARMED',
      output: 'Explainable Audit Trail',
    },
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-mono-code text-cyan-400 uppercase tracking-widest flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>Autonomous Pipeline Topology</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Click any specialized agent to inspect state, live telemetry, and control parameters</p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono-code text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>5/5 Agents Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          const isSelected = activeTab === agent.id;

          return (
            <div key={agent.id} className="relative group">
              <button
                onClick={() => setActiveTab(agent.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? agent.activeColor 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/80'
                }`}
              >
                {/* Header: Number and Badge */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono-code text-[11px] font-bold text-slate-500">
                    {agent.number}
                  </span>
                  <span className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded border ${
                    isSelected ? 'bg-white/10 text-white border-white/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                {/* Agent Icon and Title */}
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <div className={`p-2 rounded-lg bg-slate-800/80 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {agent.name}
                  </h3>
                </div>

                {/* Subtitle */}
                <p className="text-[11px] text-slate-400 leading-tight mb-2.5 line-clamp-2">
                  {agent.subtitle}
                </p>

                {/* Output pill */}
                <div className="flex items-center space-x-1 text-[10px] font-mono-code text-slate-400 pt-2 border-t border-white/5">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="truncate">{agent.output}</span>
                </div>
              </button>

              {/* Arrow connector between agents (desktop only) */}
              {idx < agents.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-600">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
