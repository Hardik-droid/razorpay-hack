import React from 'react';
import {
  Cpu,
  Layers,
  ShieldCheck,
  Bot,
  ArrowRight,
  Sparkles,
  CreditCard,
  Radio,
  SearchCheck,
  FileCode2,
  Zap
} from 'lucide-react';

export default function LandingHero({ onEnter }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navbar mini */}
      <header className="w-full border-b border-white/5 bg-[#07090e]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5">
              <div className="w-full h-full bg-[#0b0f19] rounded-[6px] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="font-display font-extrabold text-sm tracking-tight text-white">
              STOREFRONT <span className="gradient-text-cyan font-mono-code text-[10px] uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">FOR MACHINES</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono-code text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Systems Online</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/5 blur-[120px]"></div>
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]"></div>
        </div>

        <div className="relative z-10 text-center max-w-3xl space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-xs font-mono-code text-cyan-300">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Growth & Agentic Commerce Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-tight tracking-tight">
            <span className="text-white">Make Your Store </span>
            <br />
            <span className="gradient-text-cyan">Understandable To AI Buyers</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Convert any merchant catalog into a machine-readable storefront that autonomous AI agents can <strong className="text-slate-200">discover</strong>, <strong className="text-slate-200">understand</strong>, <strong className="text-slate-200">recommend</strong>, and <strong className="text-cyan-300">purchase from</strong> — with bounded, explainable, gated payments on Razorpay.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onEnter}
              className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-display font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all cursor-pointer transform hover:scale-[1.03]"
            >
              <Sparkles className="w-4.5 h-4.5" />
              <span>Enter Live Demo Arena</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="/api/storefront/merchant-subko-001/feed"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-600 text-slate-200 text-sm font-mono-code transition-colors"
            >
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              <span>View Live JSON-LD Feed</span>
            </a>
          </div>
        </div>

        {/* Agent Pipeline Cards */}
        <div className="relative z-10 mt-20 w-full max-w-5xl">
          <h3 className="text-center text-xs font-mono-code text-slate-500 uppercase tracking-widest mb-6">
            5-Agent Autonomous Commerce Pipeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { icon: FileCode2, title: 'Ingest', desc: 'PDF/CSV → Machine Feed', color: 'text-cyan-400 border-cyan-500/30' },
              { icon: ShieldCheck, title: 'Integrity', desc: 'Price Drift Shield', color: 'text-rose-400 border-rose-500/30' },
              { icon: SearchCheck, title: 'Visibility', desc: 'GEO Score: 96%', color: 'text-amber-400 border-amber-500/30' },
              { icon: Bot, title: 'Outreach', desc: 'Buyer Intent Carts', color: 'text-indigo-400 border-indigo-500/30' },
              { icon: CreditCard, title: 'Paymaster', desc: 'Razorpay + AP2 Guard', color: 'text-emerald-400 border-emerald-500/30' },
            ].map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className={`p-4 rounded-xl bg-slate-900/60 border ${a.color} text-center space-y-2 hover:bg-slate-900/80 transition-colors`}>
                  <Icon className={`w-6 h-6 mx-auto ${a.color.split(' ')[0]}`} />
                  <h4 className="font-display font-bold text-sm text-white">{a.title}</h4>
                  <p className="text-[11px] font-mono-code text-slate-400">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
