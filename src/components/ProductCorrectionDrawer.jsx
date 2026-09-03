import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  RefreshCw, 
  Save, 
  AlertCircle, 
  Package, 
  Tag, 
  DollarSign, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function ProductCorrectionDrawer({ product, isOpen, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    stock_quantity: '',
    description: '',
    brand: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        price: product.price || '',
        category: product.category || '',
        stock_quantity: product.stock_quantity || '',
        description: product.description || '',
        brand: product.brand || '',
      });
      setSaveError(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`/api/products/update/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        if (onSaveSuccess) onSaveSuccess(data.product);
        onClose();
      } else {
        setSaveError(data.error || 'Failed to update product');
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-fade-in flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left border-l border-slate-200">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Manual Product Correction</h3>
              <span className="text-[11px] text-slate-400 font-mono-code">{product.canonical_id}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form id="correction-form" onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {saveError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Product Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Price (INR ₹)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono-code focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Stock Units</label>
              <input
                type="number"
                required
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono-code focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Variants Readonly Preview */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="font-semibold text-slate-700 block">Extracted Variants ({product.variants.length})</label>
              <div className="space-y-1.5">
                {product.variants.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
                    <span className="font-medium text-slate-800">{v.name}</span>
                    <div className="space-x-2 font-mono-code">
                      <span className="text-slate-500">SKU: {v.sku}</span>
                      <span className="font-semibold text-slate-900">₹{v.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-blue-900 leading-snug">
            💡 Manual edits immediately update your machine-readable Schema.org feed and purge any active external price alerts.
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="correction-form"
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Corrections</span>
          </button>
        </div>

      </div>
    </div>
  );
}
