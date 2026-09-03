import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Check, 
  RefreshCw, 
  X,
  Globe,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Zap
} from 'lucide-react';
import ProductCorrectionDrawer from './ProductCorrectionDrawer';

export default function ProductsView({ onEventNotification, onOpenWizard }) {
  const [products, setProducts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Correction Drawer State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Single Origin Coffee');

  useEffect(() => {
    loadCatalogData();
  }, []);

  const loadCatalogData = async () => {
    setIsLoading(true);
    try {
      // 1. Load products
      const pRes = await fetch('/api/storefront/merchant-subko-001');
      const pData = await pRes.json();
      
      const augmented = (pData.products || []).map((p, i) => ({
        ...p,
        aiReadiness: p.manually_corrected ? 100 : (i === 1 ? 84 : 96),
        issue: p.manually_corrected ? null : (i === 1 ? 'Third-party marketplace quote differs from canonical price' : null),
      }));
      setProducts(augmented);

      // 2. Load connected sources
      const cRes = await fetch('/api/connections/list');
      const cData = await cRes.json();
      setConnections(cData.connections || []);
      setAlerts(cData.alerts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const activeConn = connections[0];
      if (activeConn) {
        await fetch(`/api/connections/sync/${activeConn.id}`, { method: 'POST' });
      }
      await loadCatalogData();
      if (onEventNotification) {
        onEventNotification('Catalog re-synced successfully across connected business sources.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenCorrection = (product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const handleSaveCorrectionSuccess = (updated) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated, aiReadiness: 100, issue: null } : p)));
    setAlerts([]);
    if (onEventNotification) {
      onEventNotification(`Product "${updated.title}" manually corrected and feed synchronized.`);
    }
  };

  const handleQuickAddProduct = (e) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;

    const newProd = {
      id: `prod-manual-${Date.now()}`,
      canonical_id: `CAN-MANUAL-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      category: newCategory,
      price: parseFloat(newPrice),
      stock_quantity: 40,
      is_available: true,
      aiReadiness: 94,
      issue: null,
      rating: 5.0,
      review_count: 1,
      variants: [{ name: 'Standard Edition', sku: `SKU-${Date.now().toString().slice(-4)}`, price: parseFloat(newPrice), stock: 40 }],
    };

    setProducts([newProd, ...products]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewPrice('');
    if (onEventNotification) {
      onEventNotification(`Added product: "${newTitle}"`);
    }
  };

  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.canonical_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">

      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Package className="w-4 h-4" />
            <span>Product Catalog</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            AI-Ready Products ({filteredProducts.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Products normalized into machine-readable schemas with real-time inventory and pricing for AI shopping agents.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenWizard}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Connect Sources</span>
          </button>
          
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Connected Sources Status Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900">Connected Business Sources:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {connections.length} Active
              </span>
            </div>
            <div className="flex items-center space-x-3 text-slate-500 text-[11px] mt-0.5">
              {connections.map((c) => (
                <span key={c.id} className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-700">{c.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Last sync:</span>
          <span className="font-mono-code font-semibold text-slate-700">
            {connections[0]?.lastSyncedAt ? new Date(connections[0].lastSyncedAt).toLocaleTimeString() : 'Just now'}
          </span>
        </div>
      </div>

      {/* Extraction Alerts Banner (if any item has an alert) */}
      {alerts.length > 0 && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs animate-slide-down">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-900 block">
                Extraction Alert: 1 product flagged for review
              </span>
              <span className="text-amber-700 text-[11px]">
                {alerts[0].productTitle}: {alerts[0].issue}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              const target = products.find((p) => p.canonical_id === alerts[0].productId || p.id === alerts[0].productId) || products[0];
              handleOpenCorrection(target);
            }}
            className="px-3 py-1.5 bg-white text-amber-900 hover:bg-amber-100 font-semibold rounded-lg border border-amber-300 text-xs transition-colors cursor-pointer shrink-0"
          >
            Review & Correct
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, or canonical ID..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <span>Loading AI Storefront catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-semibold text-slate-700">No products found</div>
            <p className="text-slate-400 max-w-sm mx-auto">Try adjusting your search or category filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>AI Readiness</th>
                  <th>Issues & Optimization</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-medium text-slate-900">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 overflow-hidden border border-slate-200">
                          {prod.images && prod.images[0] ? (
                            <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                            <span>{prod.title}</span>
                            {prod.manually_corrected && (
                              <span className="text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-full">
                                Corrected
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono-code text-slate-400">
                            {prod.canonical_id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        {prod.category}
                      </span>
                    </td>

                    <td className="font-mono-code font-semibold text-slate-900">
                      ₹{prod.price.toLocaleString()}
                    </td>

                    <td>
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{prod.stock_quantity} in stock</span>
                      </span>
                    </td>

                    <td>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              prod.aiReadiness >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${prod.aiReadiness}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono-code font-semibold text-slate-700">
                          {prod.aiReadiness}%
                        </span>
                      </div>
                    </td>

                    <td>
                      {prod.issue ? (
                        <div className="flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 max-w-xs">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{prod.issue}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-xs text-emerald-600 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>Schema compliant</span>
                        </div>
                      )}
                    </td>

                    <td className="text-right">
                      <button
                        onClick={() => handleOpenCorrection(prod)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Product Correction Drawer */}
      <ProductCorrectionDrawer
        product={editingProduct}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSaveSuccess={handleSaveCorrectionSuccess}
      />

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Add Product Manually</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddProduct} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subko Nitro Cold Brew Draft"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Price (INR ₹)</label>
                <input
                  type="number"
                  required
                  placeholder="650"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500 font-mono-code"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="Single Origin Coffee">Single Origin Coffee</option>
                  <option value="Brewing Equipment">Brewing Equipment</option>
                  <option value="Cold Brews & Beverages">Cold Brews & Beverages</option>
                  <option value="Coffee Subscriptions">Coffee Subscriptions</option>
                  <option value="Laptops & Computers">Laptops & Computers</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
