import React, { useState } from 'react';
import { 
  Play, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw, 
  Ban, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  Cpu
} from 'lucide-react';

export default function DemoArena({ 
  onEventNotification, 
  onTriggerApprovalModal,
  setActiveTab 
}) {
  const [runningScenario, setRunningScenario] = useState(null);
  const [lastScenarioResult, setLastScenarioResult] = useState(null);

  const demoScenarios = [
    {
      id: 'autonomous_buy',
      number: '01',
      title: 'Autonomous Agent Purchase',
      subtitle: 'Bounded, Autonomous & Instant on Razorpay',
      description: 'AI Buyer queries MCP product feed, validates AP2 Mandate, and captures transaction autonomously on Razorpay Test API without human intervention (Amount ₹850 <= ₹2,000 Gate).',
      badge: 'HAPPY PATH',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      icon: Zap,
      buttonText: 'Run Autonomous Buy',
      buttonGradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'price_drift_halt',
      number: '02',
      title: 'Signature Failure: Price Drift Caught Mid-Checkout',
      subtitle: 'The Demo Moment: Multi-Agent Coordination',
      description: 'Agent holds a cart quoted at feed price. Between quote and capture, Integrity Agent flags live price has moved on Amazon. Paymaster halts before authorization, protects buyer funds, and records explainable audit trail.',
      badge: 'HERO FAILURE DEMO',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-500/50 animate-pulse',
      icon: AlertTriangle,
      buttonText: 'Trigger Price Drift Halt',
      buttonGradient: 'from-rose-500 to-amber-600',
    },
    {
      id: 'human_gate_escalation',
      number: '03',
      title: 'Human Gatekeeper Approval Escalation',
      subtitle: 'High-Value Order Protection (> ₹2,000 Threshold)',
      description: 'AI Agent attempts to purchase a 3-Month Roaster Subscription (₹6,050). Because amount exceeds the ₹2,000 autonomous ceiling, Paymaster pauses and routes to the live Human Approval Drawer.',
      badge: 'GATE ESCALATION',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-500/40',
      icon: ShieldCheck,
      buttonText: 'Trigger Gate Approval',
      buttonGradient: 'from-amber-500 to-yellow-600',
    },
    {
      id: 'mandate_exhaustion_refusal',
      number: '04',
      title: 'Mandate Exhaustion Clean Refusal',
      subtitle: 'Cryptographic Budget Ceiling Protection',
      description: 'Agent attempts to purchase bulk inventory exceeding its remaining daily budget cap (₹12,600 > ₹5,000 daily limit). The Paymaster code layer strictly blocks execution with zero charges.',
      badge: 'BUDGET GUARD',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-500/40',
      icon: Ban,
      buttonText: 'Trigger Budget Refusal',
      buttonGradient: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'idempotent_retry',
      number: '05',
      title: 'Zero Double-Charge Idempotency',
      subtitle: 'Production Grade Network Retry Safety',
      description: 'Simulates network disconnection during agent checkout. Re-dispatches identical payment with same Idempotency-Key. Paymaster returns original receipt with 100% deduplication guarantee.',
      badge: 'IDEMPOTENCY SAFE',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
      icon: RotateCcw,
      buttonText: 'Test Idempotent Retry',
      buttonGradient: 'from-cyan-500 to-blue-600',
    },
  ];

  const handleRun = async (scenario) => {
    setRunningScenario(scenario.id);
    setLastScenarioResult(null);
    try {
      const res = await fetch(`/api/simulate/${scenario.id}`, { method: 'POST' });
      const data = await res.json();
      setLastScenarioResult({ scenario, data });

      if (data.result?.requires_human_approval && onTriggerApprovalModal) {
        onTriggerApprovalModal(data.result.pending_transaction);
      }

      if (onEventNotification) {
        onEventNotification(`Executed Demo Scenario: ${scenario.title}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunningScenario(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-mono-code text-xs uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Interactive Live Demo Arena</span>
            </div>
            <h2 className="text-2xl font-display font-extrabold text-white">
              End-to-End Agentic Commerce Demo Scenarios
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Execute live agent-to-agent interactions, the signature mid-checkout price drift defense, human-in-the-loop threshold gates, and verifiable Razorpay transactions with a single click.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono-code text-emerald-400 bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ready for Demo Day</span>
          </div>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoScenarios.map((sc) => {
          const Icon = sc.icon;
          const isRunning = runningScenario === sc.id;

          return (
            <div
              key={sc.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-bold text-slate-500">
                    DEMO {sc.number}
                  </span>
                  <span className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-300 group-hover:bg-cyan-950 group-hover:text-cyan-400 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {sc.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono-code">{sc.subtitle}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <button
                onClick={() => handleRun(sc)}
                disabled={isRunning}
                className={`w-full py-2.5 px-4 rounded-xl font-mono-code font-bold text-xs flex items-center justify-center space-x-2 text-slate-950 bg-gradient-to-r ${sc.buttonGradient} hover:opacity-90 transition-all cursor-pointer shadow-md`}
              >
                {isRunning ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Scenario...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{sc.buttonText}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Scenario Execution Live Output Inspector */}
      {lastScenarioResult && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono-code text-xs font-bold text-slate-200 uppercase">
                Last Scenario Execution Result: {lastScenarioResult.scenario.title}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('paymaster')}
              className="text-xs font-mono-code text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <span>View in Explainable Audit Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#07090e] border border-slate-800">
            <pre className="text-xs font-mono-code text-cyan-300 max-h-72 overflow-y-auto whitespace-pre-wrap">
              {JSON.stringify(lastScenarioResult.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
