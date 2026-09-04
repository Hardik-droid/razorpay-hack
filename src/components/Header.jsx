import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';

export default function Header({
  onToggleSidebar,
  isSidebarOpen,
  onSyncStore,
  isLive = false,
}) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
          aria-label="Toggle navigation menu"
          aria-controls="merchant-sidebar"
          aria-expanded={isSidebarOpen}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate">Merchant dashboard</div>
          <div
            role="status"
            aria-live="polite"
            className={`mt-0.5 flex items-center gap-1.5 text-[11px] font-medium ${isLive ? 'text-emerald-700' : 'text-amber-700'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{isLive ? 'Workspace online' : 'Reconnecting…'}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSyncStore}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Sync store</span>
      </button>
    </header>
  );
}
