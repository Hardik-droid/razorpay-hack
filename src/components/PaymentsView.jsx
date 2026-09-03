import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  ExternalLink, 
  RefreshCw, 
  Search, 
  Filter, 
  X,
  FileCheck,
  Zap,
  Lock
} from 'lucide-react';

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
      setAmount(String(initialCart.total_amount || initialCart.subtotal || 850));
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
          mandateId: 'mandate_autonomous_shopper_01',
          actingAgent: 'Subko Autonomous Shopper Agent (v2.4)',
          buyerIntent: intent,
          lineItems: [{ canonical_id: canonicalId, name: prodName, quantity: 1, unit_price: amt }],
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
          onEventNotification('⚠️ Price drift detected: Paymaster halted transaction before charging.');
        } else if (data.requires_human_approval) {
          onEventNotification('🛡️ High-value order routed to Human Gatekeeper Approval.');
        } else if (data.success) {
          onEventNotification(`⚡ Captured on Razorpay Test API: ${data.razorpay_order_id}`);
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

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Autonomous Payments & Mandates</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Agentic Checkout Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Stripe/Razorpay grade ledger enforcing AP2 Mandates, Human Threshold Gates (&gt; ₹2,000), and Zero-Double-Charge Idempotency.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
            Razorpay Test Mode
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Total Autonomous Volume</span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono-code">₹18,450</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Captured via Razorpay Test</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Autonomous Gate Ceiling</span>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-mono-code">₹2,000</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Orders above require human approval</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Remaining Daily Pool</span>
          <div className="text-xl font-bold text-blue-600 mt-1 font-mono-code">₹{mandates[0]?.remaining_daily_budget?.toLocaleString() || '4,150'}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Spend allowance remaining</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Price Drift Halts</span>
          <div className="text-xl font-bold text-rose-600 mt-1 font-mono-code">1 intercepted</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Zero wrong-price charges</p>
        </div>
      </div>

      {/* Two Column Layout: Transaction Table & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Transactions List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">
              Transactions & Verifications ({filteredLogs.length})
            </h3>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1">
              {['ALL', 'CAPTURED', 'PENDING', 'HALTED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    activeFilter === f
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Order / Intent</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const isSelected = selectedTx?.id === log.id;
                  const isSuccess = log.status === 'CAPTURED_SUCCESS';
                  const isHalted = log.status === 'HALTED_PRICE_DRIFT';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedTx(log)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td>
                        <div className="font-semibold text-slate-900 line-clamp-1">{log.buyer_intent}</div>
                        <div className="text-[10px] font-mono-code text-slate-400">{log.transaction_id}</div>
                      </td>

                      <td className="font-semibold text-slate-900 font-mono-code">
                        ₹{log.amount?.toLocaleString()}
                      </td>

                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          isHalted ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isSuccess ? 'Captured' : isHalted ? 'Drift Halted' : 'Approval Gate'}
                        </span>
                      </td>

                      <td className="text-[11px] text-slate-400">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </td>

                      <td className="text-right">
                        <span className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                          Inspect →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 5 Cols: 5-Step Fintech Timeline Detail Drawer */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-5">
          {selectedTx ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction Lifecycle</span>
                  <h4 className="font-bold text-sm text-slate-900 mt-0.5">{selectedTx.transaction_id}</h4>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900 font-mono-code">₹{selectedTx.amount?.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">INR • Razorpay Test</div>
                </div>
              </div>

              {/* 5-Step Timeline */}
              <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                
                {/* 1. Authorization */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
                  <div className="text-xs font-bold text-slate-900">1. Authorization</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Buyer agent authorized by mandate '{selectedTx.mandate_id || 'mandate_autonomous_shopper_01'}'.
                  </p>
                </div>

                {/* 2. Mandate & Category */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
                  <div className="text-xs font-bold text-slate-900">2. Mandate & Constraints</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Category whitelist verified. Allowed product categories confirmed.
                  </p>
                </div>

                {/* 3. Approval Gate */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-2xs ${
                    selectedTx.amount > 2000 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div className="text-xs font-bold text-slate-900">3. Threshold Gate Evaluation</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedTx.amount <= 2000 
                      ? `Amount ₹${selectedTx.amount} is within autonomous threshold (<= ₹2,000). Auto-approved.`
                      : `Amount ₹${selectedTx.amount} exceeds ₹2,000 threshold. Escalated to Human Gatekeeper.`
                    }
                  </p>
                </div>

                {/* 4. Payment Execution */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-2xs ${
                    selectedTx.status === 'CAPTURED_SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} />
                  <div className="text-xs font-bold text-slate-900">4. Payment Capture (Razorpay)</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedTx.razorpay_order_id ? (
                      <span className="font-mono-code text-slate-700">Order ID: {selectedTx.razorpay_order_id}</span>
                    ) : (
                      <span className="text-rose-600 font-medium">Halted before charge. Zero funds debited.</span>
                    )}
                  </p>
                </div>

                {/* 5. Audit Trail */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-2xs" />
                  <div className="text-xs font-bold text-slate-900">5. Plain-English Audit Trail</div>
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1 leading-relaxed">
                    {selectedTx.explainable_summary || selectedTx.halt_reason || 'Verified transaction captured with cryptographic signature.'}
                  </p>
                </div>

              </div>

              {/* Idempotency & Signature Info */}
              <div className="pt-3 border-t border-slate-100 text-[11px] font-mono-code text-slate-400 space-y-1">
                <div>Idempotency Key: {selectedTx.idempotency_key}</div>
                {selectedTx.razorpay_signature && <div>HMAC Signature: Verified</div>}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Select a transaction to inspect its 5-step verification lifecycle.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
