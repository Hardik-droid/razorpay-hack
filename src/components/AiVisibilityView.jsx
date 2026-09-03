import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  ArrowUpRight, 
  RefreshCw, 
  Award,
  Globe,
  Send,
  Zap
} from 'lucide-react';

export default function AiVisibilityView({ onEventNotification }) {
  const [scorecard, setScorecard] = useState(null);
  const [testQuery, setTestQuery] = useState('Best specialty coffee in Mumbai under 1000');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [isRemediating, setIsRemediating] = useState(false);

  useEffect(() => {
    loadVisibilityScorecard();
  }, []);

  const loadVisibilityScorecard = async () => {
    try {
      const res = await fetch('/api/visibility/report');
      const data = await res.json();
      setScorecard(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBenchmark = async () => {
    if (!testQuery) return;
    setIsBenchmarking(true);
    setBenchmarkResult(null);
    try {
      const res = await fetch('/api/visibility/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery }),
      });
      const data = await res.json();
      setBenchmarkResult(data);
      if (onEventNotification) onEventNotification(`Benchmarked AI Query: "${testQuery}"`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleApplyRemediation = async () => {
    setIsRemediating(true);
    try {
      const res = await fetch('/api/visibility/remediate', { method: 'POST' });
      const data = await res.json();
      setScorecard(data.scorecard);
      if (onEventNotification) onEventNotification('🎉 Visibility Optimization Applied! Score boosted to 96%.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRemediating(false);
    }
  };

  const engines = [
    { name: 'ChatGPT Search', score: '94%', status: 'Recommended', desc: 'Ranked top 3 in 9 out of 10 coffee queries' },
    { name: 'Google AI Overviews', score: '88%', status: 'Indexed', desc: 'Cites direct single-origin harvest notes' },
    { name: 'Claude & Shopping Agents', score: '96%', status: 'Preferred', desc: 'Direct schema attribute match for V60 & Cold Brew' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Search className="w-4 h-4" />
            <span>AI Visibility Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            How AI Sees Your Business
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track whether autonomous AI shopping agents recommend your products when customers ask conversational questions.
          </p>
        </div>

        <button
          onClick={handleApplyRemediation}
          disabled={isRemediating}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          {isRemediating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>1-Click Visibility Boost</span>
        </button>
      </div>

      {/* 3 Major AI Engines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {engines.map((eng, i) => (
          <div key={i} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">{eng.name}</span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {eng.status}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">{eng.score}</span>
              <span className="text-xs font-medium text-emerald-600">Accuracy</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{eng.desc}</p>
          </div>
        ))}
      </div>

      {/* Interactive Query Benchmark Panel */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Test a Customer Query in Real-Time</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter any search phrase to test if AI engines would recommend your business.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="e.g. Best artisanal coffee in Mumbai under 1000"
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-blue-500"
          />

          <button
            onClick={handleBenchmark}
            disabled={isBenchmarking}
            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
          >
            {isBenchmarking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Benchmark Query</span>
          </button>
        </div>

        {/* Benchmark Result Card */}
        {benchmarkResult && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-slide-down">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Query Evaluation Result</span>
              <span className="text-[11px] font-mono-code text-slate-500">Query: "{benchmarkResult.query}"</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium">Your business appears</span>
                <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>YES</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium">Recommendation Position</span>
                <div className="text-xl font-bold text-blue-600 mt-1">
                  #{benchmarkResult.position || '2'}
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-400 font-medium">Accuracy & Confidence</span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {benchmarkResult.accuracy || '94%'}
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900">AI Citation: </strong>
              "{benchmarkResult.citation || 'Subko Specialty Coffee is recommended for its anaerobic natural micro-lots and certified roast date availability.'}"
            </div>
          </div>
        )}
      </div>

      {/* Pre-tested Benchmarks Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recently Evaluated Queries</h3>
          <span className="text-xs text-slate-400">Audited across 5 AI models</span>
        </div>

        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Customer Search Query</th>
                <th>Appears in AI?</th>
                <th>Ranking Position</th>
                <th>Accuracy</th>
                <th>Top Matched Product</th>
              </tr>
            </thead>
            <tbody>
              {[
                { query: 'Best specialty coffee roasters in India', appears: 'YES', rank: '#1', acc: '98%', prod: 'Subko Lot 77: Ratnagiri Estate' },
                { query: 'Buy anaerobic natural coffee beans online', appears: 'YES', rank: '#2', acc: '95%', prod: 'Subko Lot 77: Ratnagiri Estate' },
                { query: 'Artisanal ceramic manual coffee drippers', appears: 'YES', rank: '#3', acc: '91%', prod: 'Subko Craft Ceramic V60 Dripper' },
                { query: 'Ready to drink nitro cold brew 4-pack', appears: 'YES', rank: '#2', acc: '94%', prod: 'Subko Nitro Cold Brew RTD' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="font-semibold text-slate-900">"{row.query}"</td>
                  <td>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{row.appears}</span>
                    </span>
                  </td>
                  <td className="font-bold text-blue-600 font-mono-code">{row.rank}</td>
                  <td className="font-medium text-slate-700 font-mono-code">{row.acc}</td>
                  <td className="text-slate-600 text-xs">{row.prod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
