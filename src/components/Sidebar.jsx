import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Store, 
  Search, 
  ShieldAlert, 
  Users, 
  Cpu, 
  Activity,
  CreditCard, 
  BarChart3, 
  Settings, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenWizard, 
  discrepanciesCount = 3, 
  leadsCount = 2,
  isOpen = false,
  onClose
}) {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: '542' },
    { id: 'storefront', label: 'AI Storefront', icon: Store, badge: 'Live' },
    { id: 'visibility', label: 'AI Visibility', icon: Search, badge: '94%' },
    { id: 'datahealth', label: 'Data Health', icon: ShieldAlert, badge: discrepanciesCount > 0 ? String(discrepanciesCount) : null, badgeColor: 'bg-amber-100 text-amber-700' },
    { id: 'buyerleads', label: 'Buyer Leads', icon: Users, badge: leadsCount > 0 ? String(leadsCount) : null, badgeColor: 'bg-blue-100 text-blue-700' },
    { id: 'automation', label: 'Automation Center', icon: Cpu, badge: '5 Active' },
    { id: 'health', label: 'Agent Health', icon: Activity, badge: '100% Pass', badgeColor: 'bg-emerald-100 text-emerald-700' },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top: Store Brand & Switcher */}
        <div>
          <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                SM
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-sm text-slate-900 leading-none">Subko Coffee</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-[11px] text-slate-500 font-normal">Storefront for Machines</span>
              </div>
            </div>
            
            {/* Close on mobile */}
            <button 
              onClick={onClose} 
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Setup Wizard Prompt Box */}
          <div className="p-3 mx-3 mt-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1.5 text-blue-700 font-medium text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Onboarding Wizard</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Ready for AI Buyers?</p>
            </div>
            <button
              onClick={() => {
                if (onOpenWizard) onOpenWizard();
                if (onClose) onClose();
              }}
              className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Setup
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-0.5">
            <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Merchant Center
            </div>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer
                    ${isActive 
                      ? 'bg-slate-100 text-blue-600 font-semibold shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Merchant Profile & Help */}
        <div className="p-3 border-t border-slate-200 space-y-1">
          <a
            href="/api/storefront/merchant-subko-001/feed"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Storefront Feed</span>
            </div>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">JSON-LD</span>
          </a>

          <div className="pt-2 flex items-center justify-between px-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-700 text-xs">
                SK
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-900 text-xs leading-none">Subko Admin</div>
                <div className="text-[10px] text-slate-400">admin@subko.coffee</div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
          </div>
        </div>
      </aside>
    </>
  );
}
