import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Award
} from 'lucide-react';

export default function AnalyticsView() {
  const topQueries = [
    { query: 'Best specialty coffee in Mumbai under 1000', count: 412, conv: '22.4%', rev: '₹28,900' },
    { query: 'Subko Lot 77 anaerobic coffee beans', count: 320, conv: '34.1%', rev: '₹19,550' },
    { query: 'Craft ceramic pour over dripper V60', count: 184, conv: '15.2%', rev: '₹9,250' },
    { query: 'Artisanal cold brew 4 pack online', count: 142, conv: '18.9%', rev: '₹6,550' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>AI Commerce Performance</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Analytics & Conversions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Measure how much commercial revenue and footfall is driven by autonomous shopping agents.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            Last 30 Days
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500">Revenue from AI Shoppers</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono-code">₹64,250</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            <span>+28.4% vs last month</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500">Autonomous Checkouts</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono-code">58 orders</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            <span>+14.2%</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500">AI Conversion Rate</span>
          <div className="text-2xl font-bold text-blue-600 mt-1 font-mono-code">18.4%</div>
          <p className="text-[11px] text-slate-400 mt-1">3x higher than standard web visitors</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500">AI Inbound Traffic</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono-code">1,420</div>
          <p className="text-[11px] text-slate-400 mt-1">Direct machine queries</p>
        </div>
      </div>

      {/* Visual Chart Graphic & Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Weekly AI Volume SVG Chart */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Weekly AI Order Volume (INR)</h3>
            <span className="text-xs font-medium text-slate-400">Past 6 Weeks</span>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-4 bg-slate-50/50 rounded-xl border border-slate-100">
            {[
              { week: 'W1', value: 35, amount: '₹12k' },
              { week: 'W2', value: 48, amount: '₹18k' },
              { week: 'W3', value: 62, amount: '₹24k' },
              { week: 'W4', value: 55, amount: '₹21k' },
              { week: 'W5', value: 78, amount: '₹32k' },
              { week: 'W6', value: 92, amount: '₹38k' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono-code text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.amount}
                </span>
                <div
                  className="w-full max-w-[48px] bg-blue-600 group-hover:bg-blue-700 rounded-t-lg transition-all"
                  style={{ height: `${bar.value}%` }}
                />
                <span className="text-xs font-medium text-slate-500">{bar.week}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Channels Breakdown */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Traffic by AI Model</h3>
          
          <div className="space-y-3">
            {[
              { name: 'ChatGPT Search', share: '52%', count: '738 queries', color: 'bg-emerald-500' },
              { name: 'Google AI Overviews', share: '28%', count: '398 queries', color: 'bg-blue-500' },
              { name: 'Claude & Shopping Bots', share: '14%', count: '198 queries', color: 'bg-indigo-500' },
              { name: 'Perplexity & Others', share: '6%', count: '86 queries', color: 'bg-slate-400' },
            ].map((ch, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>{ch.name}</span>
                  <span className="font-bold text-slate-900">{ch.share}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${ch.color} rounded-full`} style={{ width: ch.share }} />
                </div>
                <div className="text-[10px] text-slate-400 text-right">{ch.count}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top Converting Queries Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Converting Customer Queries</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Customer Intent Query</th>
                <th>Query Frequency</th>
                <th>Conversion Rate</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topQueries.map((tq, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="font-semibold text-slate-900">"{tq.query}"</td>
                  <td className="text-slate-600 font-mono-code">{tq.count} times</td>
                  <td className="font-bold text-emerald-600 font-mono-code">{tq.conv}</td>
                  <td className="font-bold text-slate-900 font-mono-code">{tq.rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
