import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Bot, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  PhoneOff,
  Layers,
  Zap
} from 'lucide-react';

export default function OutreachView({ onRouteToPaymaster, onEventNotification }) {
  const [carts, setCarts] = useState([]);
  const [customIntent, setCustomIntent] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    try {
      const res = await fetch('/api/cart/list');
      const data = await res.json();
      setCarts(data.carts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSynthesizeCart = async () => {
    if (!customIntent.trim()) return;
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/cart/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentText: customIntent,
          productCanonicalIds: ['CAN-SUBKO-LOT77-ANAE', 'CAN-SUBKO-CB-CANS-4X'],
          budget: 3000,
          requestedBy: 'Autonomous AI Buyer (Synthesized)',
        })
      });
      const data = await res.json();
      loadCarts();
      setCustomIntent('');
      if (onEventNotification) {
        onEventNotification(`Outreach Agent synthesized structured cart from buyer intent.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-mono-code text-xs uppercase mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>Agent 04: Outreach Agent & Intent Cart Dispatcher</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Transform Inbound AI Shopping Intent into Qualified Carts
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Listens to incoming search queries, AI shopping sessions, and abandoned carts. Generates verifiable Buyer Intent Objects and hands them off to the Paymaster payment layer with strict TRAI compliance.
          </p>
        </div>

        {/* TRAI Compliance Badge */}
        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-mono-code text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-emerald-300 font-bold">TRAI Compliant</div>
            <div className="text-[10px] text-slate-400">Explicit Consent Only</div>
          </div>
        </div>
      </div>

      {/* Cart Synthesizer Input */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <label className="text-xs font-mono-code text-indigo-300 font-semibold uppercase flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Simulate Inbound Buyer Shopping Prompt</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customIntent}
            onChange={(e) => setCustomIntent(e.target.value)}
            placeholder="e.g. 'Procure 2 bags of anaerobic coffee + cold brew pack for office tasting'..."
            className="flex-1 px-4 py-2 rounded-lg bg-[#07090e] border border-slate-700 text-slate-200 font-mono-code text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSynthesizeCart}
            disabled={isSynthesizing}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs font-mono-code flex items-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Generate Cart</span>
          </button>
        </div>
      </div>

      {/* Active Qualified Carts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {carts.map((cart) => (
          <div key={cart.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-code text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
                  {cart.channel}
                </span>
                <span className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded border ${
                  cart.status === 'QUALIFIED_FOR_PAYMASTER'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border-amber-500/40'
                }`}>
                  {cart.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-mono-code text-slate-400 font-semibold uppercase">Stated Buyer Intent:</h4>
                <p className="text-sm font-semibold text-slate-100 mt-0.5 leading-snug">
                  "{cart.customer_intent}"
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                {cart.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-center justify-between text-xs font-mono-code text-slate-300 bg-slate-950/50 p-2 rounded">
                    <div>
                      <span className="font-semibold text-white">{item.name}</span>
                      <div className="text-[10px] text-slate-500">{item.canonical_id} • Qty: {item.quantity}</div>
                    </div>
                    <span className="font-bold text-cyan-400">₹{item.line_total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions & Total */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono-code text-slate-500">Cart Total (Incl. Tax)</div>
                <div className="text-lg font-display font-extrabold text-white">₹{cart.total_amount?.toLocaleString() || cart.subtotal}</div>
              </div>

              <button
                onClick={() => onRouteToPaymaster(cart)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-mono-code cursor-pointer transition-all transform hover:scale-[1.02]"
              >
                <span>Route to Paymaster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
