import React from 'react';
import { 
  Menu, 
  Search, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  Bell, 
  Terminal,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function Header({ 
  onToggleSidebar, 
  onOpenWizard, 
  mandateBalance = 4150, 
  isLive = true,
  onToggleTerminal,
  isTerminalOpen
}) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products, orders, AI buyer queries..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-hidden text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right: Status Badges, Wizard CTA & Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* AI Storefront Live Status */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>AI Storefront: <strong>Live</strong></span>
        </div>

        {/* Razorpay Test Mode */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-medium text-blue-700">
          <CreditCard className="w-3 h-3 text-blue-500" />
          <span>Razorpay: <strong>Test Mode</strong></span>
        </div>

        {/* Mandate Balance Pool */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Daily Limit Pool: <strong>₹{mandateBalance.toLocaleString()}</strong></span>
        </div>

        {/* Setup Wizard Button */}
        <button
          onClick={onOpenWizard}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Onboarding Wizard</span>
          <span className="sm:hidden">Wizard</span>
        </button>

        {/* Terminal Toggle */}
        <button
          onClick={onToggleTerminal}
          className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
            isTerminalOpen
              ? 'bg-slate-900 text-slate-100 border-slate-900'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
          }`}
          title="Toggle Background Event Logs"
        >
          <Terminal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
