import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  Zap, 
  Eye, 
  ExternalLink, 
  ArrowRight,
  Sliders,
  FileCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function PaymasterView({ 
  initialCart, 
  onEventNotification, 
  onTriggerApprovalModal 
}) {
  const [mandates, setMandates] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedMandateId, setSelectedMandateId] = useState('mandate_autonomous_shopper_01');
  const [customAmount, setCustomAmount] = useState('850');
  const [intentText, setIntentText] = useState('Restock single-origin coffee for morning filter brews');
  const [customKey, setCustomKey] = useState(`idem_${Date.now()}`);
  const [forceDrift, setForceDrift] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  useEffect(() => {
    loadPaymasterData();
  }, []);

  useEffect(() => {
    if (initialCart) {
      setCustomAmount(String(initialCart.total_amount || initialCart.subtotal));
      setIntentText(initialCart.customer_intent);
      setCustomKey(`idem_cart_${Date.now()}`);
    }
  }, [initialCart]);

  const loadPaymasterData = async () => {
    try {
      const [mandatesRes, auditRes] = await Promise.all([
        fetch('/api/payment/mandates'),
        fetch('/api/payment/audit'),
      ]);
      const mandatesData = await mandatesRes.json();
      const auditData = await auditRes.json();

      setMandates(mandatesData.mandates || []);
      setAuditLogs(auditData.audit_logs || []);
      if (auditData.audit_logs?.length > 0 && !selectedAuditLog) {
        setSelectedAuditLog(auditData.audit_logs[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);
    setCheckoutResult(null);
    try {
      const amount = parseFloat(customAmount) || 850;
      
      // Flaw #11 Fix: Accurate product resolution based on amount / initial cart
      let resolvedLineItems;
      if (initialCart && initialCart.line_items && initialCart.line_items.length > 0) {
        resolvedLineItems = initialCart.line_items;
      } else {
        let canonicalId = 'CAN-SUBKO-LOT77-ANAE';
        let prodName = 'Subko Lot 77 Ratnagiri Anaerobic';
        if (amount === 680) {
          canonicalId = 'CAN-SUBKO-CB-CANS-4X';
          prodName = 'Subko Nitro Cold Brew RTD (Pack of 4)';
        } else if (amount === 1850) {
          canonicalId = 'CAN-SUBKO-V60-DRIP-KIT';
          prodName = 'Subko Craft Manual Brew Ceramic Dripper V60';
        } else if (amount >= 4000) {
          canonicalId = 'CAN-SUBKO-SUB-QTR-3M';
          prodName = 'Subko Quarterly Roaster Discovery Subscription (3 Months)';
        } else {
          canonicalId = 'CAN-SUBKO-LOT77-ANAE';
          prodName = `Subko Curated Coffee Selection (₹${amount})`;
        }

        resolvedLineItems = [
          {
            canonical_id: canonicalId,
            name: prodName,
            quantity: 1,
            unit_price: amount,
          }
        ];
      }

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mandateId: selectedMandateId,
          actingAgent: 'Subko Autonomous Shopper Agent (v2.4)',
          buyerIntent: intentText,
          lineItems: resolvedLineItems,
          idempotencyKey: customKey,
          forcePriceDriftTest: forceDrift,
        })
      });

      const data = await res.json();
      setCheckoutResult(data);
      await loadPaymasterData();

      // Flaw #4 Fix: Ensure latest audit record is immediately selected and displayed
      if (data.audit_record) {
        setSelectedAuditLog(data.audit_record);
        setAuditLogs(prev => [data.audit_record, ...prev.filter(l => l.id !== data.audit_record.id)]);
      }

      if (data.requires_human_approval && onTriggerApprovalModal) {
        onTriggerApprovalModal(data.pending_transaction);
      }

      // Generate a fresh idempotency key for next run
      setCustomKey(`idem_${Date.now()}`);

      if (onEventNotification) {
        if (data.drift_halted) {
          onEventNotification('⚠️ Price drift caught mid-checkout! Paymaster halted before authorization.');
        } else if (data.requires_human_approval) {
          onEventNotification('🛡️ High-value order routed to Human Gatekeeper Approval.');
        } else if (data.success) {
          onEventNotification(`⚡ Autonomous payment captured on Razorpay Test API: ${data.razorpay_order_id}`);
        } else {
          onEventNotification(`❌ Paymaster check failed: ${data.error || 'Transaction halted'}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeMandate = mandates.find(m => m.id === selectedMandateId) || mandates[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-mono-code text-xs uppercase mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Agent 05: Paymaster Agent & Razorpay Test Layer</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Bounded, Explainable & Gated Agentic Transaction Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Enforces strict AP2 Mandates, Threshold Gates (autonomous below ₹2,000, human approval above), Zero-Double-Charge Idempotency, and generates a plain-English explainable timeline for every single rupee.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-right font-mono-code">
            <div className="text-[10px] text-slate-400 uppercase">Remaining Pool</div>
            <div className="text-lg font-bold text-emerald-400">₹{activeMandate?.remaining_daily_budget?.toLocaleString() || 4150}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Checkout Simulator on Left, Audit Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Transaction Trigger & Mandate Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Mandate Selector Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-code text-emerald-400 font-semibold uppercase flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AP2 Mandate Authorization</span>
              </label>
              <span className="text-[10px] font-mono-code text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Code Enforced
              </span>
            </div>

            <select
              value={selectedMandateId}
              onChange={(e) => setSelectedMandateId(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#07090e] border border-slate-700 text-slate-200 font-mono-code text-xs focus:outline-none focus:border-emerald-500"
            >
              {mandates.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title} (Cap: ₹{m.max_per_transaction.toLocaleString()} / Daily: ₹{m.daily_spend_limit.toLocaleString()})
                </option>
              ))}
            </select>

            {activeMandate && (
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-code text-slate-400 pt-1">
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span>Per-Tx Ceiling:</span> <strong className="text-white">₹{activeMandate.max_per_transaction}</strong>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span>Auto Gate Limit:</span> <strong className="text-cyan-300">₹{activeMandate.autonomous_threshold_gate}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Agent Payment Dispatcher */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono-code text-slate-300 font-semibold uppercase flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dispatch Agentic Payment</span>
            </h3>

            <div>
              <label className="text-[11px] font-mono-code text-slate-400">Buyer Intent String:</label>
              <input
                type="text"
                value={intentText}
                onChange={(e) => setIntentText(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-[#07090e] border border-slate-700 text-slate-200 font-mono-code text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-mono-code text-slate-400">Amount (₹):</label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full mt-1 p-2 rounded bg-[#07090e] border border-slate-700 text-slate-200 font-mono-code text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono-code text-slate-400">Idempotency Key:</label>
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full mt-1 p-2 rounded bg-[#07090e] border border-slate-700 text-slate-200 font-mono-code text-[11px] focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Price Drift Checkbox for Failure Demo */}
            <div className="flex items-center space-x-2 p-2.5 rounded bg-rose-950/30 border border-rose-500/20 text-xs font-mono-code text-rose-300">
              <input
                type="checkbox"
                id="forceDriftCheckbox"
                checked={forceDrift}
                onChange={(e) => setForceDrift(e.target.checked)}
                className="rounded border-rose-500 text-rose-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="forceDriftCheckbox" className="cursor-pointer">
                Inject Aggregator Price Drift (Signature Failure Demo)
              </label>
            </div>

            <button
              onClick={handleExecutePayment}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs font-mono-code flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying AP2 Mandates & Razorpay...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Execute Razorpay Test Payment</span>
                </>
              )}
            </button>
          </div>

          {/* Checkout Result Status Banner */}
          {checkoutResult && (
            <div className={`p-4 rounded-xl border font-mono-code text-xs space-y-2 ${
              checkoutResult.drift_halted
                ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                : checkoutResult.requires_human_approval
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
                : checkoutResult.success
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>Transaction Status:</span>
                <span>{checkoutResult.status || (checkoutResult.drift_halted ? 'HALTED_PRICE_DRIFT' : 'FAILED')}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {checkoutResult.message || checkoutResult.error}
              </p>
              {checkoutResult.razorpay_order_id && (
                <div className="text-[10px] text-slate-300 pt-1 border-t border-white/10">
                  Razorpay Ref: {checkoutResult.razorpay_order_id} ({checkoutResult.razorpay_payment_id})
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Explainable Audit Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono-code text-xs font-bold text-slate-200 uppercase">
                  Explainable Payment Audit Timeline ({auditLogs.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono-code text-slate-400">
                1 Row = Instant Explainability
              </span>
            </div>

            {/* Audit Log Selector / Feed */}
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {auditLogs.map((log) => {
                const isSelected = selectedAuditLog?.id === log.id;
                const isHalted = log.status === 'HALTED_PRICE_DRIFT';
                const isApproved = log.status === 'CAPTURED_SUCCESS';

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedAuditLog(log)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                      isSelected
                        ? 'bg-slate-850 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Timestamp, Status, and Amount */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded border ${
                            isHalted
                              ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                              : isApproved
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950 text-amber-300 border-amber-500/40'
                          }`}>
                            {log.status}
                          </span>
                          <span className="text-[10px] font-mono-code text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-white mt-1">
                          {log.acting_agent}
                        </h4>
                      </div>

                      <div className="text-right font-mono-code">
                        <div className={`text-base font-extrabold ${isHalted ? 'text-rose-400 line-through' : 'text-emerald-400'}`}>
                          ₹{log.amount?.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">{log.currency}</div>
                      </div>
                    </div>

                    {/* Stated Buyer Intent */}
                    <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-[11px] font-mono-code text-slate-300">
                      <span className="text-slate-500">Intent: </span>
                      <span className="text-cyan-300 font-medium">"{log.buyer_intent}"</span>
                    </div>

                    {/* Explainable Plain-English Summary */}
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {log.explainable_summary || log.halt_reason || `Authorized ₹${log.amount} for ${log.buyer_intent}.`}
                    </p>

                    {/* Passed Constraints Checklist */}
                    <div className="space-y-1 pt-2 border-t border-slate-800 text-[10px] font-mono-code text-slate-400">
                      {(log.passed_constraints || []).map((constraint, cIdx) => (
                        <div key={cIdx} className="flex items-center space-x-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                          <span>{constraint}</span>
                        </div>
                      ))}
                    </div>

                    {/* References & Reversal Path */}
                    {log.razorpay_order_id && (
                      <div className="flex items-center justify-between text-[10px] font-mono-code text-slate-500 pt-1 border-t border-white/5">
                        <span>Razorpay ID: {log.razorpay_order_id}</span>
                        <span className="text-cyan-400">{log.reversal_path}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
