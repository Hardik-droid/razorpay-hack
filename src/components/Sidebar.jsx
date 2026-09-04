import React from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  CreditCard,
  Settings,
  X,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  leadsCount = 2,
  isOpen = false,
  onClose,
}) {
  const navigationItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    {
      id: 'buyerleads',
      label: 'Buyer requests',
      icon: Users,
      badge: leadsCount > 0 ? String(leadsCount) : null,
    },
    { id: 'payments', label: 'Orders', icon: CreditCard },
  ];

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="merchant-sidebar"
        aria-label="Merchant navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen
            ? 'translate-x-0 visible'
            : '-translate-x-full invisible lg:visible lg:translate-x-0'
        }`}
      >
        <div>
          <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setActiveTab('dashboard');
                onClose();
              }}
              className="flex items-center space-x-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Go to overview"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                SM
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900 leading-none">Subko Coffee</div>
                <span className="text-[11px] text-slate-500">Merchant demo</span>
              </div>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="px-3 py-4 space-y-0.5" aria-label="Main navigation">
            <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Merchant Center
            </div>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-blue-600 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-200 space-y-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              onClose();
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-slate-100 text-blue-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            aria-current={activeTab === 'settings' ? 'page' : undefined}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Store details</span>
          </button>

          <div className="pt-2 flex items-center px-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-700 text-xs">
                SK
              </div>
              <div>
                <div className="font-medium text-slate-900 text-xs leading-none">Subko Admin</div>
                <div className="text-[10px] text-slate-400">admin@subko.coffee</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
