import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Users,
} from 'lucide-react';

export default function BuyerLeadsView({ onRouteToPaymaster, onEventNotification }) {
  const [carts, setCarts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [customIntent, setCustomIntent] = useState('Procure 2 bags of light roast single origin for office filter brew');
  const [isGenerating, setIsGenerating] = useState(false);

  const loadCarts = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cart/list');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Buyer requests could not be loaded.');
      setCarts(data.carts || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCarts();
  }, []);

  const handleCreateCart = async () => {
    if (!customIntent.trim()) return;
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_intent: customIntent.trim(),
          agent_name: 'Demo shopping assistant',
        }),
      });
      const newCart = await response.json();
      if (!response.ok) throw new Error(newCart.error || 'The buyer request could not be created.');

      setCarts((current) => [newCart, ...current]);
      onEventNotification?.('A new buyer request is ready to review.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <Users className="h-4 w-4" />
            Buyer requests
          </div>
          <h1 className="mt-1 text-xl font-bold text-slate-900">Requests ready to review ({carts.length})</h1>
          <p className="mt-1 text-xs text-slate-500">
            Shoppers have already chosen the products. Review each request before it becomes an order.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Customer consent checked
        </span>
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-blue-600" />
          Loading buyer requests…
        </div>
      ) : carts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-800">No requests waiting</p>
          <p className="mt-1 text-xs text-slate-500">New buyer requests will appear here automatically.</p>
        </div>
      ) : (
        <section aria-label="Buyer request list" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {carts.map((cart) => {
            const items = cart.items || cart.line_items || [];
            const needsApproval = cart.status === 'HIGH_VALUE_GATE_APPROVAL_REQUIRED';

            return (
              <article key={cart.id} className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer asked for</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">“{cart.customer_intent}”</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      needsApproval
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-blue-200 bg-blue-50 text-blue-700'
                    }`}>
                      {needsApproval ? 'Approval needed' : 'Ready'}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={`${item.canonical_id}-${item.quantity}`} className="flex items-start justify-between gap-3 text-xs">
                          <span className="text-slate-700">{item.name} × {item.quantity || 1}</span>
                          <span className="shrink-0 font-semibold text-slate-900">₹{(item.line_total || item.total || item.unit_price || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-xs font-bold text-slate-900">
                      <span>Order total</span>
                      <span className="text-blue-700">₹{(cart.total_amount || cart.subtotal || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Received {cart.created_at ? new Date(cart.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRouteToPaymaster?.(cart)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
                >
                  Review order
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </article>
            );
          })}
        </section>
      )}

      <details className="group rounded-2xl border border-slate-200 bg-white shadow-xs">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Preview a new buyer request</h2>
              <p className="mt-0.5 text-xs text-slate-500">Optional demo — hidden until you open it.</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" />
        </summary>

        <div className="border-t border-slate-100 p-5">
          <label htmlFor="demo-buyer-request" className="text-xs font-semibold text-slate-700">What does the shopper need?</label>
          <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
            <input
              id="demo-buyer-request"
              type="text"
              value={customIntent}
              onChange={(event) => setCustomIntent(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleCreateCart}
              disabled={isGenerating || !customIntent.trim()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Create preview
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}
