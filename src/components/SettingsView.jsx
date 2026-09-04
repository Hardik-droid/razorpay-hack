import React, { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, ShieldCheck, Store } from 'lucide-react';

export default function SettingsView() {
  const [mandate, setMandate] = useState(null);

  useEffect(() => {
    fetch('/api/payment/mandates')
      .then((response) => response.json())
      .then((data) => setMandate((data.mandates || [])[0] || null))
      .catch(() => setMandate(null));
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
          <Store className="h-4 w-4" />
          Store details
        </div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">Subko Coffee</h1>
        <p className="mt-1 text-xs text-slate-500">The essentials behind your merchant workspace.</p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Business</h2>
          <dl className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {[
              ['Store name', 'Subko Coffee'],
              ['Website', 'subko.coffee'],
              ['Location', 'Mumbai, India'],
              ['Currency', 'Indian Rupee (INR)'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-4 py-3 text-xs">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Order protection</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">These live limits decide when you need to approve an order.</p>

          {mandate ? (
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-[11px] font-medium text-slate-500">Automatic orders up to</dt>
                <dd className="mt-1 text-xl font-bold text-slate-900">₹{mandate.autonomous_threshold?.toLocaleString() || '2,000'}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-[11px] font-medium text-slate-500">Available today</dt>
                <dd className="mt-1 text-xl font-bold text-slate-900">₹{mandate.remaining_daily_budget?.toLocaleString() || '0'}</dd>
              </div>
            </dl>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              Loading order limits…
            </div>
          )}

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-semibold text-emerald-900">Price protection is always on</p>
              <p className="mt-0.5 text-[11px] leading-5 text-emerald-700">An order stops automatically if its price no longer matches your catalog.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <h2 className="text-sm font-bold text-blue-950">Catalog refresh</h2>
        <p className="mt-1 text-xs leading-5 text-blue-800">
          Product updates are imported when you choose <strong>Sync store</strong> in the header. Monitoring and checkout checks stay out of your way.
        </p>
      </section>
    </div>
  );
}
