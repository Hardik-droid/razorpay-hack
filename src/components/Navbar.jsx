import React from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Terminal, 
  Play, 
  Cpu
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isLive, 
  mandateBalance = 4150,
  onQuickDemo,
  toggleTerminal,
  isTerminalOpen
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07090e]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-extrabold text-lg tracking-tight text-white">
                STOREFRONT <span className="gradient-text-cyan font-mono-code text-sm uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">FOR MACHINES</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono-code">AI Agentic Commerce & Razorpay Test Protocol</p>
          </div>
        </div>

        {/* Live System Status Badges */}
        <div className="hidden lg:flex items-center space-x-3">
          {/* MCP Server Live Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono-code text-cyan-300">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`}></span>
            <span>MCP Server: <strong className="text-white">{isLive ? 'ONLINE' : 'CONNECTING...'}</strong></span>
          </div>

          {/* Razorpay Test Mode Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-950/40 border border-blue-500/30 text-xs font-mono-code text-blue-300">
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>Razorpay: <strong className="text-white">TEST MODE</strong></span>
          </div>

          {/* AP2 Mandate Pool */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono-code text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AP2 Balance: <strong className="text-white">₹{mandateBalance.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Demo Launch */}
          <button
            onClick={() => setActiveTab('demo')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer transform hover:scale-[1.02]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Demo Arena</span>
          </button>

          {/* Terminal Toggle */}
          <button
            onClick={toggleTerminal}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono-code transition-colors ${
              isTerminalOpen 
                ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300' 
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
            title="Toggle Agent Trace Terminal"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Telemetry</span>
          </button>
        </div>

      </div>
    </header>
  );
}
