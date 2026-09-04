import React, { useState, useEffect, useRef, Component } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OnboardingWizard from './components/OnboardingWizard';
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import BuyerLeadsView from './components/BuyerLeadsView';
import PaymentsView from './components/PaymentsView';
import SettingsView from './components/SettingsView';
import ApprovalDrawer from './components/ApprovalDrawer';
import { 
  CheckCircle2, 
  X
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
            <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
            <p className="text-sm text-slate-500">We couldn't load your dashboard. Please try again.</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs cursor-pointer"
            >
              Reload dashboard
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
  const [notifications, setNotifications] = useState([]);
  const [pendingGateTx, setPendingGateTx] = useState(null);
  const [routedCart, setRoutedCart] = useState(null);
  const [sseConnected, setSseConnected] = useState(false);

  const eventSourceRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const notifIdRef = useRef(0);

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/agents/events');
    eventSourceRef.current = es;

    es.onopen = () => setSseConnected(true);

    es.onerror = () => {
      setSseConnected(false);
      es.close();
      reconnectTimerRef.current = setTimeout(connectSSE, 3000);
    };
  };

  useEffect(() => {
    connectSSE();

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
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const handleRouteToPaymaster = (cart) => {
    setRoutedCart(cart);
    setActiveTab('payments');
    triggerNotification(`Buyer request ready for review: ₹${cart.total_amount || cart.subtotal}`);
  };

  const handleApproveGateTx = async (transactionId) => {
    try {
      const res = await fetch(`/api/payment/approve/${transactionId}`, { method: 'POST' });
      await res.json();
      setPendingGateTx(null);
      triggerNotification('Order approved and payment captured.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectGateTx = async (transactionId) => {
    try {
      await fetch(`/api/payment/reject/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Declined by merchant' }),
      });
      setPendingGateTx(null);
      triggerNotification('Order declined. No payment was taken.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        leadsCount={2}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onSyncStore={() => setIsWizardOpen(true)}
          isLive={sseConnected}
        />

        {/* Dynamic Toast Notifications Stack */}
        <div className="fixed top-20 right-4 sm:right-6 z-50 space-y-2 pointer-events-none" aria-live="polite">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="pointer-events-auto p-3.5 rounded-xl bg-white border border-slate-200 shadow-xl text-xs text-slate-800 flex items-center gap-2.5 max-w-sm animate-slide-down"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="flex-1 font-medium">{n.message}</span>
              <button
                type="button"
                onClick={() => dismissNotification(n.id)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                aria-label="Dismiss notification"
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

          {activeTab === 'buyerleads' && (
            <BuyerLeadsView
              onRouteToPaymaster={handleRouteToPaymaster}
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

          {activeTab === 'settings' && (
            <SettingsView
              onEventNotification={triggerNotification}
            />
          )}
        </main>
      </div>

      {/* 3. Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={() => triggerNotification('Your store is synced and ready.')}
      />

      {/* 4. Human Approval Drawer Modal (for orders > ₹2,000) */}
      <ApprovalDrawer
        pendingTx={pendingGateTx}
        onApprove={handleApproveGateTx}
        onReject={handleRejectGateTx}
        onClose={() => setPendingGateTx(null)}
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
