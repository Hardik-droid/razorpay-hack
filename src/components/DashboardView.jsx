import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  IndianRupee,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

const kpis = [
  {
    label: 'Sales from AI shoppers',
    value: '₹18,450',
    note: '12 completed orders',
    icon: IndianRupee,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    label: 'Products available',
    value: '542',
    note: 'All products synced',
    icon: Package,
    tone: 'bg-blue-50 text-blue-700',
  },
  {
    label: 'Customer reach',
    value: '78%',
    note: 'Up 12% this month',
    icon: TrendingUp,
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    label: 'Requests waiting',
    value: '2',
    note: 'Ready for review',
    icon: Users,
    tone: 'bg-amber-50 text-amber-700',
  },
];

const recentOrders = [
  { buyer: 'Online shopper', item: 'Subko Lot 77 (250g)', amount: '₹850', status: 'Paid', time: '10 min ago' },
  { buyer: 'Office pantry', item: 'Roaster Discovery + V60', amount: '₹6,050', status: 'Approved', time: '2 hours ago' },
  { buyer: 'Online shopper', item: 'Nitro Cold Brew 4-Pack', amount: '₹680', status: 'Paid', time: 'Yesterday' },
];

const demoScenarios = [
  { id: 'autonomous_buy', label: 'Small order', note: 'Pays automatically under ₹2,000' },
  { id: 'price_drift_halt', label: 'Wrong price', note: 'Blocks a mismatched listing' },
  { id: 'human_gate_escalation', label: 'Large order', note: 'Asks you before payment' },
  { id: 'mandate_exhaustion_refusal', label: 'Daily limit', note: 'Stops overspending' },
  { id: 'idempotent_retry', label: 'Duplicate request', note: 'Prevents a second charge' },
];

export default function DashboardView({
  onEventNotification,
  onTriggerApprovalModal,
  setActiveTab,
  onOpenWizard,
}) {
  const [runningScenario, setRunningScenario] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  const handleSimulate = async (scenario) => {
    setRunningScenario(scenario.id);
    setSimulationResult(null);

    try {
      const response = await fetch(`/api/simulate/${scenario.id}`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Demo could not be completed.');

      const result = data.result || data;
      setSimulationResult({ label: scenario.label, result });

      if (result.requires_human_approval && onTriggerApprovalModal) {
        onTriggerApprovalModal(result.pending_transaction);
      }

      onEventNotification?.(`${scenario.label} safeguard checked successfully.`);
    } catch (error) {
      setSimulationResult({ label: scenario.label, error: error.message });
    } finally {
      setRunningScenario(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-7">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Your AI sales assistant is working
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Good morning, Subko Coffee
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Your catalog is up to date, customers can find your products, and checkout is protected. You only step in when an order needs approval.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onOpenWizard}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
              Sync products
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('buyerleads')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
            >
              Review buyer requests
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      <section aria-label="Store summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, note, icon: Icon, tone }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
                <p className="mt-1 text-[11px] text-slate-400">{note}</p>
              </div>
              <span className={`rounded-lg p-2 ${tone}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Needs your attention</h2>
              <p className="mt-0.5 text-xs text-slate-500">Only the decisions that need a person appear here.</p>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">3 items</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('buyerleads')}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50"
            >
              <span className="rounded-lg bg-blue-50 p-2 text-blue-700">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-900">2 buyer requests are ready</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">Review the items and continue to payment.</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50"
            >
              <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-900">1 listing needs a quick review</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">A marketplace price differs from your catalog.</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Working in the background</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">Routine checks stay out of your way.</p>

          <div className="mt-4 space-y-4">
            {[
              ['Catalog checked', '542 products are current'],
              ['Customer reach monitored', 'Visibility improved this month'],
              ['Checkout protected', '1 wrong-price order was stopped'],
            ].map(([title, note]) => (
              <div key={title} className="flex gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">{title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent orders</h2>
            <p className="mt-0.5 text-xs text-slate-500">The latest purchases handled for your store.</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Order</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={`${order.item}-${order.time}`}>
                  <td className="font-semibold text-slate-900">{order.buyer}</td>
                  <td>{order.item}</td>
                  <td className="font-semibold text-slate-900">{order.amount}</td>
                  <td>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      {order.status}
                    </span>
                  </td>
                  <td className="text-right text-[11px] text-slate-400">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <details className="group rounded-2xl border border-slate-200 bg-white shadow-xs">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Preview protected checkout</h2>
              <p className="mt-0.5 text-xs text-slate-500">Optional demo controls stay tucked away until you need them.</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" />
        </summary>

        <div className="border-t border-slate-100 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {demoScenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                disabled={runningScenario !== null}
                onClick={() => handleSimulate(scenario)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40 disabled:cursor-wait disabled:opacity-60"
              >
                <span className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-900">
                  {scenario.label}
                  {runningScenario === scenario.id && <Clock className="h-3.5 w-3.5 animate-spin text-blue-600" />}
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-slate-500">{scenario.note}</span>
              </button>
            ))}
          </div>

          {simulationResult && (
            <div
              aria-live="polite"
              className={`mt-4 rounded-xl border p-4 text-xs ${
                simulationResult.error
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              <p className="font-semibold">{simulationResult.label}</p>
              <p className="mt-1 leading-5">
                {simulationResult.error ||
                  simulationResult.result.explainable_summary ||
                  simulationResult.result.message ||
                  'The order was checked and handled safely.'}
              </p>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
