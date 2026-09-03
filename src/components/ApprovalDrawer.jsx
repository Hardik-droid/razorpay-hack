import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  Clock, 
  Lock, 
  AlertTriangle,
  FileText,
  X
} from 'lucide-react';

export default function ApprovalDrawer({ pendingTx, onApprove, onReject, onClose }) {
  const [timeLeft, setTimeLeft] = useState(120);

  // Reset timer when new pendingTx appears
  useEffect(() => {
    if (!pendingTx) return;
    setTimeLeft(120);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReject(pendingTx.transaction_id || pendingTx.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pendingTx]);

  if (!pendingTx) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden space-y-5 p-6 sm:p-7">
        
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                Human Gatekeeper Escalation
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Order Exceeds Autonomous Threshold
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reason / Context Callout */}
        <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
          <div className="font-semibold flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Auto-Release Timeout: {timeLeft} seconds remaining</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            {pendingTx.reason || `Order amount (₹${pendingTx.amount}) exceeds the merchant autonomous limit of ₹2,000. Merchant authorization is required before capturing payment.`}
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">Order Summary</span>
            <span className="text-base font-extrabold text-slate-900 font-mono-code">
              ₹{pendingTx.amount?.toLocaleString()} {pendingTx.currency || 'INR'}
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate-600">
            <div><strong>Purchasing Agent:</strong> {pendingTx.acting_agent || 'Office Procurement Agent'}</div>
            <div><strong>Buyer Intent:</strong> "{pendingTx.buyer_intent || 'Bulk quarterly restocking order'}"</div>
            <div className="text-[11px] font-mono-code text-slate-400 pt-1">
              Transaction ID: {pendingTx.transaction_id || pendingTx.id}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={() => onReject(pendingTx.transaction_id || pendingTx.id)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Decline & Reject
          </button>
          
          <button
            onClick={() => onApprove(pendingTx.transaction_id || pendingTx.id)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Capture Payment</span>
          </button>
        </div>

      </div>
    </div>
  );
}
