import React, { useState, useEffect } from 'react';
import { 
  SearchCheck, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Play, 
  BarChart3,
  Bot,
  Zap,
  RefreshCw
} from 'lucide-react';

export default function VisibilityView({ onEventNotification }) {
  const [scorecard, setScorecard] = useState(null);
  const [customQuery, setCustomQuery] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRemediating, setIsRemediating] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const res = await fetch('/api/visibility/report');
      const data = await res.json();
      setScorecard(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunQuery = async () => {
    if (!customQuery.trim()) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/visibility/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: customQuery }),
      });
      const data = await res.json();
      setScorecard(data);
      if (onEventNotification) {
        onEventNotification(`Evaluated buyer intent query across 3 Answer Engines: "${customQuery}"`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRemediate = async () => {
    setIsRemediating(true);
    try {
      const res = await fetch('/api/visibility/remediate', { method: 'POST' });
      const data = await res.json();
      setScorecard(data.scorecard);
      if (onEventNotification) {
        onEventNotification('GEO Feed Remediation deployed! Overall score boosted to 96%.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRemediating(false);
    }
  };

  const metrics = scorecard?.metrics || {
    brandVisibilityScore: 54,
    productAccuracyScore: 68,
    citationScore: 59,
    trustScore: 92,
    overallGeoScore: 58,
    isRemediated: false,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-mono-code text-xs uppercase mb-1">
            <SearchCheck className="w-4 h-4" />
            <span>Agent 03: Visibility Agent & Answer Engine GEO Engine</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Generative Engine Optimization (GEO) & Citation Accuracy
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Measures how LLMs and Answer Engines (Perplexity, ChatGPT, Claude, Gemini) cite your catalog, detects hallucinated pricing, and pushes feed remediations to boost AI recommendation authority.
          </p>
        </div>

        <button
          onClick={handleRemediate}
          disabled={isRemediating || metrics.isRemediated}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
            metrics.isRemediated
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 shadow-amber-500/20'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{metrics.isRemediated ? 'GEO Optimized (96% Score)' : 'Apply 1-Click GEO Remediation'}</span>
        </button>
      </div>

      {/* 4 Scorecard Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall GEO Score', val: metrics.overallGeoScore, target: '90+', color: 'text-amber-400', bar: 'bg-amber-400' },
          { label: 'Brand Visibility', val: metrics.brandVisibilityScore, target: '85+', color: 'text-cyan-400', bar: 'bg-cyan-400' },
          { label: 'Product Accuracy', val: metrics.productAccuracyScore, target: '95+', color: 'text-emerald-400', bar: 'bg-emerald-400' },
          { label: 'Trust & Citation Index', val: metrics.trustScore, target: '90+', color: 'text-purple-400', bar: 'bg-purple-400' },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400">
              <span>{m.label}</span>
              <span>Target: {m.target}</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-display font-extrabold ${m.color}`}>
                {m.val}%
              </span>
              <span className="text-[10px] font-mono-code text-slate-500">
                {metrics.isRemediated ? '+38% Boosted' : 'Pre-Remediation'}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${m.bar}`}
                style={{ width: `${m.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Intent Query Benchmarking Sandbox */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono-code text-xs font-bold text-slate-200 uppercase">
              Answer Engine Intent Query Benchmarks
            </h3>
          </div>
          <span className="text-[10px] font-mono-code text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            Live AI Panel
          </span>
        </div>

        {/* Query Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Type intent query (e.g. 'Best single-origin anaerobic coffee under ₹1000 in India')..."
            className="flex-1 px-4 py-2 rounded-lg bg-[#07090e] border border-slate-700 text-slate-200 font-mono-code text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleRunQuery}
            disabled={isEvaluating}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs font-mono-code flex items-center space-x-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Benchmark Query</span>
          </button>
        </div>

        {/* Benchmark Results Feed */}
        <div className="space-y-3">
          {(scorecard?.benchmarks || []).map((bench) => (
            <div key={bench.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-amber-300 font-semibold">
                  "{bench.intent_query}"
                </span>
                <span className="text-[10px] font-mono-code text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                  {bench.target_category}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {bench.answer_engines.map((eng, eIdx) => (
                  <div key={eIdx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono-code">
                      <span className="text-white font-bold">{eng.engine}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        eng.cited ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                      }`}>
                        {eng.cited ? `Rank #${eng.rank_position}` : 'Uncited'}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono-code text-slate-400">
                      Accuracy Score: <strong className="text-cyan-300">{eng.fact_accuracy_score}%</strong>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug italic line-clamp-3">
                      "{eng.excerpt}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
