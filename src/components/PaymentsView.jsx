import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function PaymentsView({ 
  initialCart, 
  onEventNotification, 
  onTriggerApprovalModal 
}) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [mandates, setMandates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  // New Transaction Form state
  const [amount, setAmount] = useState('850');
  const [intent, setIntent] = useState('Procure 1 pack of Subko Lot 77 for morning brew');
  const [forceDrift, setForceDrift] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, []);

  useEffect(() => {
    if (initialCart) {
      setAmount(String(initialCart.subtotal || initialCart.total_amount || 850));
      setIntent(initialCart.customer_intent || 'Procure items from buyer cart');
    }
  }, [initialCart]);

  const loadPaymentData = async () => {
    setIsLoading(true);
    try {
      const [auditRes, mandatesRes] = await Promise.all([
        fetch('/api/payment/audit'),
        fetch('/api/payment/mandates'),
      ]);
      const auditData = await auditRes.json();
      const mandatesData = await mandatesRes.json();
      setAuditLogs(auditData.audit_logs || []);
      setMandates(mandatesData.mandates || []);
      if (auditData.audit_logs?.length > 0 && !selectedTx) {
        setSelectedTx(auditData.audit_logs[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecutePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const amt = parseFloat(amount) || 850;
      const routedItems = initialCart?.line_items || initialCart?.items;
      let canonicalId = 'CAN-SUBKO-LOT77-ANAE';
      let prodName = 'Subko Lot 77 Ratnagiri Anaerobic';
      if (amt === 680) {
        canonicalId = 'CAN-SUBKO-CB-CANS-4X';
        prodName = 'Subko Nitro Cold Brew RTD 4-Pack';
      } else if (amt === 1850) {
        canonicalId = 'CAN-SUBKO-V60-DRIP-KIT';
        prodName = 'Subko Ceramic V60 Dripper';
      } else if (amt >= 4000) {
        canonicalId = 'CAN-SUBKO-SUB-QTR-3M';
        prodName = 'Subko 3-Month Roaster Subscription';
      }

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mandateId: initialCart && Number(initialCart.subtotal || initialCart.total_amount) > 2000
            ? 'mandate_enterprise_restock_02'
            : 'mandate_autonomous_shopper_01',
          actingAgent: 'Subko Autonomous Shopper Agent (v2.4)',
          buyerIntent: intent,
          lineItems: routedItems?.length
            ? routedItems.map(({ canonical_id, quantity, unit_price }) => ({ canonical_id, quantity, unit_price }))
            : [{ canonical_id: canonicalId, name: prodName, quantity: 1, unit_price: amt }],
          idempotencyKey: `idem_${Date.now()}`,
          forcePriceDriftTest: forceDrift,
        }),
      });

      const data = await res.json();
      await loadPaymentData();

      if (data.audit_record) {
        setSelectedTx(data.audit_record);
      }

      if (data.requires_human_approval && onTriggerApprovalModal) {
        onTriggerApprovalModal(data.pending_transaction);
      }

      if (onEventNotification) {
        if (data.drift_halted) {
          onEventNotification('Price changed, so the order was stopped before payment.');
        } else if (data.requires_human_approval) {
          onEventNotification('This order is waiting for your approval.');
        } else if (data.success) {
          onEventNotification('Order paid successfully.');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (activeFilter === 'CAPTURED') return log.status === 'CAPTURED_SUCCESS';
    if (activeFilter === 'HALTED') return log.status === 'HALTED_PRICE_DRIFT';
    if (activeFilter === 'PENDING') return log.gate_decision?.includes('GATE');
    return true;
  });

  const completedOrders = auditLogs.filter((log) => log.status === 'CAPTURED_SUCCESS');
  const protectedOrders = auditLogs.filter((log) => log.status === 'HALTED_PRICE_DRIFT');
  const completedValue = completedOrders.reduce((total, log) => total + Number(log.amount || 0), 0);

  const getStatus = (log) => {
    if (log.status === 'CAPTURED_SUCCESS') return ['Paid', 'bg-emerald-50 text-emerald-700 border-emerald-200'];
    if (log.status === 'HALTED_PRICE_DRIFT') return ['Payment stopped', 'bg-rose-50 text-rose-700 border-rose-200'];
    if (log.status === 'GATE_REJECTED') return ['Declined', 'bg-slate-100 text-slate-600 border-slate-200'];
    return ['Needs approval', 'bg-amber-50 text-amber-700 border-amber-200'];
  };

  const getSafetyMessage = (log) => {
    if (log.status === 'HALTED_PRICE_DRIFT') return 'The price changed, so payment was stopped. Nothing was charged.';
    if (log.status === 'GATE_REJECTED') return 'This order was declined. Nothing was charged.';
    if (log.status === 'CAPTURED_SUCCESS' && Number(log.amount) > 2000) return 'This larger order was approved before payment.';
    if (log.status === 'CAPTURED_SUCCESS') return 'This order was within your automatic payment limit and completed safely.';
    return 'This order needs your approval before any payment can happen.';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <CreditCard className="h-4 w-4" />
            <span>Orders</span>
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Orders &amp; approvals</h2>
          <p className="mt-1 max-w-2xl text-xs text-slate-500">
            Review completed orders and see when a payment was held for your approval or stopped for safety.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          <span>Price protection is on</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Completed value</span>
          <div className="mt-1 text-xl font-bold text-slate-900">₹{completedValue.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Paid orders</span>
          <div className="mt-1 text-xl font-bold text-emerald-600">{completedOrders.length}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Stopped safely</span>
          <div className="mt-1 text-xl font-bold text-rose-600">{protectedOrders.length}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Available today</span>
          <div className="mt-1 text-xl font-bold text-blue-600">
            ₹{mandates[0]?.remaining_daily_budget?.toLocaleString() || '4,150'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent orders ({filteredLogs.length})</h3>
            <div className="flex items-center gap-1">
              {[
                ['ALL', 'All'],
                ['CAPTURED', 'Paid'],
                ['PENDING', 'Reviewed'],
                ['HALTED', 'Stopped'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    activeFilter === value
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading orders…</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No orders in this view.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th className="text-right">&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const [status, statusClass] = getStatus(log);
                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedTx(log)}
                        className={`cursor-pointer transition-colors ${
                          selectedTx?.id === log.id ? 'bg-blue-50/50' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td>
                          <div className="max-w-xs truncate font-semibold text-slate-900">{log.buyer_intent || 'Store order'}</div>
                        </td>
                        <td className="font-semibold text-slate-900">₹{Number(log.amount || 0).toLocaleString()}</td>
                        <td>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}>{status}</span>
                        </td>
                        <td className="text-[11px] text-slate-400">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now'}
                        </td>
                        <td className="text-right text-xs font-semibold text-blue-600">View</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5">
          {selectedTx ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order details</span>
                  <h4 className="mt-1 text-sm font-bold text-slate-900">{selectedTx.buyer_intent || 'Store order'}</h4>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold text-slate-900">₹{Number(selectedTx.amount || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">Total</div>
                </div>
              </div>

              <div>
                <h5 className="mb-2 text-xs font-bold text-slate-900">Items</h5>
                <div className="space-y-2">
                  {(selectedTx.line_items || []).map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                      <div className="flex min-w-0 items-center gap-2">
                        <ShoppingBag className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate text-slate-700">{item.name || 'Catalog item'} × {item.quantity || 1}</span>
                      </div>
                      <span className="shrink-0 font-semibold text-slate-900">
                        ₹{Number(item.total ?? (item.unit_price || 0) * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>Safety check</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-blue-800">{getSafetyMessage(selectedTx)}</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                <span>{getStatus(selectedTx)[0]}</span>
                <span>{selectedTx.timestamp ? new Date(selectedTx.timestamp).toLocaleString() : 'Just now'}</span>
              </div>
            </div>
          ) : (
            <div className="flex min-h-64 items-center justify-center text-center text-xs text-slate-400">
              Select an order to see its items and payment status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
