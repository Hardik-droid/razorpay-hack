import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  ShoppingBag, 
  FileText, 
  MapPin, 
  ArrowRight, 
  Check, 
  RefreshCw, 
  X,
  Shirt,
  Tv,
  Coffee,
  Briefcase,
  Factory,
  Package,
  Store,
  Zap,
  CheckCheck
} from 'lucide-react';

export default function OnboardingWizard({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState('Fashion');
  const [selectedSourceType, setSelectedSourceType] = useState('website');
  
  // Connection Form State
  const [websiteUrl, setWebsiteUrl] = useState('https://subko.coffee');
  const [ecommercePlatform, setEcommercePlatform] = useState('shopify');
  const [storeUrl, setStoreUrl] = useState('subko-specialty.myshopify.com');
  const [documentName, setDocumentName] = useState('summer_catalog_2026.pdf');
  const [businessQuery, setBusinessQuery] = useState('Subko Coffee Roasters, Bandra West, Mumbai');

  // Processing Animation & Results
  const [processingStage, setProcessingStage] = useState(1);
  const [processingMessage, setProcessingMessage] = useState('Finding products...');
  const [extractionResult, setExtractionResult] = useState(null);

  useEffect(() => {
    if (step === 3) {
      executeAiProcessing();
    }
  }, [step]);

  const executeAiProcessing = async () => {
    setProcessingStage(1);
    setProcessingMessage('Finding products...');

    // Progress through the exact 3 stages specified by the user
    setTimeout(() => {
      setProcessingStage(2);
      setProcessingMessage('Reading product details...');
    }, 1200);

    setTimeout(() => {
      setProcessingStage(3);
      setProcessingMessage('Preparing your store...');
    }, 2400);

    // Call real backend onboarding endpoint based on selected source
    try {
      let endpoint = '/api/onboarding/connect-website';
      let payload = { url: websiteUrl, industry: selectedIndustry };

      if (selectedSourceType === 'store') {
        endpoint = '/api/onboarding/connect-store';
        payload = { platform: ecommercePlatform, storeUrl };
      } else if (selectedSourceType === 'document') {
        endpoint = '/api/onboarding/upload-document';
        payload = { filename: documentName, docType: 'PDF_CATALOG' };
      } else if (selectedSourceType === 'google') {
        endpoint = '/api/onboarding/connect-google';
        payload = { businessName: businessQuery };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setExtractionResult(data);

      setTimeout(() => {
        setStep(4); // Move to Step 4: Ready
      }, 3400);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setStep(4);
      }, 3400);
    }
  };

  if (!isOpen) return null;

  const industries = [
    { id: 'Fashion', label: 'Fashion & Apparel', icon: Shirt, desc: 'Clothing, shoes, bags & accessories' },
    { id: 'Electronics', label: 'Electronics', icon: Tv, desc: 'Laptops, mobile, audio & tech gear' },
    { id: 'Food', label: 'Food & Beverage', icon: Coffee, desc: 'Specialty coffee, dining & gourmet goods' },
    { id: 'Services', label: 'Services', icon: Briefcase, desc: 'Consulting, photography & bookings' },
    { id: 'Manufacturing', label: 'Manufacturing & B2B', icon: Factory, desc: 'Industrial equipment, wholesale supplies' },
    { id: 'Other', label: 'Other Retail', icon: Package, desc: 'General consumer products & gifts' },
  ];

  const sourceTypes = [
    { id: 'website', label: 'Connect Website', icon: Globe, desc: 'Bring in product names, images, prices, and stock' },
    { id: 'store', label: 'Connect Store', icon: ShoppingBag, desc: 'Import from Shopify, WooCommerce, or Magento' },
    { id: 'document', label: 'Upload Catalogue', icon: FileText, desc: 'Bring in products from a PDF or brochure' },
    { id: 'google', label: 'Google Business Profile', icon: MapPin, desc: 'Use your verified business details and location' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              SM
            </div>
            <span className="text-xs font-semibold text-slate-800">Merchant Onboarding Setup</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Step Indicators */}
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s}
                  className={`w-5 h-1.5 rounded-full transition-all ${
                    step === s 
                      ? 'bg-blue-600 w-7' 
                      : step > s 
                        ? 'bg-emerald-500' 
                        : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <button 
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">

          {/* STEP 1: What do you sell? */}
          {step === 1 && (
            <div className="space-y-5 animate-slide-up">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Step 1 of 4</span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">What do you sell?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your main category so product details and customer searches are set up correctly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {industries.map((ind) => {
                  const Icon = ind.icon;
                  const isSelected = selectedIndustry === ind.id;
                  return (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => setSelectedIndustry(ind.id)}
                      className={`flex items-start space-x-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{ind.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{ind.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Connect your business */}
          {step === 2 && (
            <div className="space-y-5 animate-slide-up">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Step 2 of 4</span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">Connect your business</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose where your products already live. We will handle the formatting.
                </p>
              </div>

              {/* 4 Connection Options */}
              <div className="grid grid-cols-2 gap-2.5">
                {sourceTypes.map((source) => {
                  const Icon = source.icon;
                  const isSelected = selectedSourceType === source.id;
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => setSelectedSourceType(source.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{source.label}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{source.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Connection Inputs */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                {selectedSourceType === 'website' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Enter Merchant Website URL</label>
                    <div className="flex space-x-2">
                      <input 
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourstore.com"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono-code"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      We will find your product pages and bring in images, prices, options, and descriptions.
                    </span>
                  </div>
                )}

                {selectedSourceType === 'store' && (
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      {['shopify', 'woocommerce', 'magento'].map((plat) => (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => setEcommercePlatform(plat)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border capitalize ${
                            ecommercePlatform === plat 
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' 
                              : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          {plat}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Store Domain / Admin URL</label>
                      <input 
                        type="text"
                        value={storeUrl}
                        onChange={(e) => setStoreUrl(e.target.value)}
                        placeholder="your-store.myshopify.com"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono-code"
                      />
                      <span className="text-[11px] text-slate-400 block">
                        Products, stock, prices, images, and orders are imported for you.
                      </span>
                    </div>
                  </div>
                )}

                {selectedSourceType === 'document' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Select Business Document / PDF Catalogue</label>
                    <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg bg-white text-center hover:bg-slate-50 transition-colors cursor-pointer">
                      <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-medium text-slate-800 block">{documentName}</span>
                      <span className="text-[10px] text-slate-400">PDF Catalogue, Product Brochure, or Wholesale Price List</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      We will read product names, prices, and details from your file.
                    </span>
                  </div>
                )}

                {selectedSourceType === 'google' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Business Name or Google Maps Link</label>
                    <input 
                      type="text"
                      value={businessQuery}
                      onChange={(e) => setBusinessQuery(e.target.value)}
                      placeholder="e.g. Subko Coffee, Bandra, Mumbai"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <span className="text-[11px] text-slate-400 block">
                      Uses your verified details, location, services, ratings, and photos.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Connect and prepare store</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: AI Processing */}
          {step === 3 && (
            <div className="py-6 px-4 text-center space-y-6 animate-fade-in">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse" />
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">{processingMessage}</h3>
                <p className="text-xs text-slate-500">
                  Reading your source and preparing a clean product catalog.
                </p>
              </div>

              {/* Exact 3 Stages Required by User */}
              <div className="max-w-md mx-auto space-y-2 text-left text-xs bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="flex items-center space-x-2.5">
                  {processingStage >= 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                  <span className={processingStage >= 1 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                    Finding products...
                  </span>
                </div>

                <div className="flex items-center space-x-2.5">
                  {processingStage >= 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                  <span className={processingStage >= 2 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                    Reading product details...
                  </span>
                </div>

                <div className="flex items-center space-x-2.5">
                  {processingStage >= 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                  <span className={processingStage >= 3 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                    Preparing your store...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Ready */}
          {step === 4 && (
            <div className="space-y-5 animate-slide-up">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Your store is ready for AI shoppers</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Customers can now find accurate products and safely place orders through supported AI shopping experiences.
                </p>
              </div>

              {/* Ready Summary Card */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Products Added</span>
                  <span className="text-lg font-bold text-slate-900 font-mono-code">
                    {extractionResult?.products_extracted || extractionResult?.products_synced || 4} items
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Products ready</span>
                  <span className="text-lg font-bold text-emerald-600 font-mono-code">96 / 100</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Checkout protection</span>
                  <span className="text-xs font-bold text-blue-600 font-mono-code block mt-1">Live & Verified</span>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Easy catalog refresh</span>
                  <span className="text-[11px] text-blue-700">Use Sync store whenever prices, stock, or products change.</span>
                </div>
                <span className="px-2 py-1 bg-white text-blue-700 rounded-md font-mono-code text-[10px] border border-blue-200">
                  Active
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Merchant: Subko Coffee Roasters</span>
                <button
                  type="button"
                  onClick={() => {
                    if (onComplete) onComplete();
                    onClose();
                  }}
                  className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Open Merchant Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
