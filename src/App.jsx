import React, { useState, useEffect, useRef, Component } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OnboardingWizard from './components/OnboardingWizard';
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import AiStorefrontView from './components/AiStorefrontView';
import AiVisibilityView from './components/AiVisibilityView';
import DataHealthView from './components/DataHealthView';
import BuyerLeadsView from './components/BuyerLeadsView';
import AutomationCenterView from './components/AutomationCenterView';
import AgentHealthView from './components/AgentHealthView';
import PaymentsView from './components/PaymentsView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import ApprovalDrawer from './components/ApprovalDrawer';
import LiveLogTerminal from './components/LiveLogTerminal';
import { 
  Sparkles, 
  CheckCircle2, 
  X, 
  Bell 
} from 'lucide-react';

// Error Boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl text-center space-y-4">
            <div className="text-3xl">⚠️</div>
            <h2 className="text-lg font-bold text-slate-900">Application Notice</h2>
            <p className="text-xs text-slate-500 font-mono-code">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs cursor-pointer"
            >
              Reload Platform
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingGateTx, setPendingGateTx] = useState(null);
  const [routedCart, setRoutedCart] = useState(null);
  const [liveMandateBalance, setLiveMandateBalance] = useState(4150);
  const [sseConnected, setSseConnected] = useState(false);

  const eventSourceRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const notifIdRef = useRef(0);

  const refreshMandateBalance = async () => {
    try {
      const res = await fetch('/api/payment/mandates');
      const data = await res.json();
      const primary = (data.mandates || []).find(m => m.id === 'mandate_autonomous_shopper_01');
      if (primary) {
        setLiveMandateBalance(primary.remaining_daily_budget);
      }
    } catch (err) {
      // silent
    }
  };

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/agents/events');
    eventSourceRef.current = es;

    es.onopen = () => setSseConnected(true);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type !== 'CONNECTED') {
          setEvents((prev) => [data, ...prev].slice(0, 100));
        }
      } catch (err) {
        console.error('SSE Error:', err);
      }
    };

    es.onerror = () => {
      setSseConnected(false);
      es.close();
      reconnectTimerRef.current = setTimeout(connectSSE, 3000);
    };
  };

  useEffect(() => {
    connectSSE();
    refreshMandateBalance();

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  const triggerNotification = (message) => {
    const id = ++notifIdRef.current;
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter(n => n.id !== id));
    }, 4500);
    refreshMandateBalance();
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const handleRouteToPaymaster = (cart) => {
    setRoutedCart(cart);
    setActiveTab('payments');
    triggerNotification(`Cart routed to Payments: ₹${cart.total_amount || cart.subtotal}`);
  };

  const handleApproveGateTx = async (transactionId) => {
    try {
      const res = await fetch(`/api/payment/approve/${transactionId}`, { method: 'POST' });
      const data = await res.json();
      setPendingGateTx(null);
      triggerNotification(`Order Approved! Captured on Razorpay Test API: ${data.razorpay_order_id}`);
      refreshMandateBalance();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectGateTx = async (transactionId) => {
    try {
      await fetch(`/api/payment/reject/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Declined by Merchant Admin in Approval Drawer' }),
      });
      setPendingGateTx(null);
      triggerNotification('Transaction safely rejected. Zero funds charged.');
      refreshMandateBalance();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      
      {/* 1. SaaS Sidebar (10-section Shopify/Stripe navigation) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWizard={() => setIsWizardOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        discrepanciesCount={3}
        leadsCount={2}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenWizard={() => setIsWizardOpen(true)}
          mandateBalance={liveMandateBalance}
          isLive={sseConnected}
          onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
          isTerminalOpen={isTerminalOpen}
        />

        {/* Dynamic Toast Notifications Stack */}
        <div className="fixed top-20 right-6 z-50 space-y-2 pointer-events-none">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="pointer-events-auto p-3.5 rounded-xl bg-white border border-slate-200 shadow-xl text-xs text-slate-800 flex items-center gap-2.5 max-w-sm animate-slide-down"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="flex-1 font-medium">{n.message}</span>
              <button
                onClick={() => dismissNotification(n.id)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Main Routed View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onEventNotification={triggerNotification}
              onTriggerApprovalModal={(tx) => setPendingGateTx(tx)}
              setActiveTab={setActiveTab}
              onOpenWizard={() => setIsWizardOpen(true)}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              onEventNotification={triggerNotification}
              onOpenWizard={() => setIsWizardOpen(true)}
            />
          )}

          {activeTab === 'storefront' && (
            <AiStorefrontView
              onEventNotification={triggerNotification}
            />
          )}

          {activeTab === 'visibility' && (
            <AiVisibilityView
              onEventNotification={triggerNotification}
            />
          )}

          {activeTab === 'datahealth' && (
            <DataHealthView
              onEventNotification={triggerNotification}
            />
          )}

          {activeTab === 'buyerleads' && (
            <BuyerLeadsView
              onRouteToPaymaster={handleRouteToPaymaster}
              onEventNotification={triggerNotification}
            />
          )}

          {activeTab === 'automation' && (
            <AutomationCenterView
              onEventNotification={triggerNotification}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'health' && (
            <AgentHealthView
              onEventNotification={triggerNotification}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              initialCart={routedCart}
              onEventNotification={triggerNotification}
              onTriggerApprovalModal={(tx) => setPendingGateTx(tx)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onEventNotification={triggerNotification}
            />
          )}
        </main>

        {/* Clean Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Storefront for Machines © 2026 • AI Commerce & Machine-Discoverable Storefront Platform
          </div>
          <div className="flex items-center space-x-3 text-slate-500 font-medium">
            <span>Schema.org JSON-LD</span>
            <span>•</span>
            <span>AP2 Protocol</span>
            <span>•</span>
            <span>Razorpay Test API</span>
          </div>
        </footer>

      </div>

      {/* 3. Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={() => triggerNotification('🎉 Onboarding Complete: Your store is now ready for AI buyers!')}
      />

      {/* 4. Human Approval Drawer Modal (for orders > ₹2,000) */}
      <ApprovalDrawer
        pendingTx={pendingGateTx}
        onApprove={handleApproveGateTx}
        onReject={handleRejectGateTx}
        onClose={() => setPendingGateTx(null)}
      />

      {/* 5. Live Agent Event Log Terminal */}
      <LiveLogTerminal
        events={events}
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
