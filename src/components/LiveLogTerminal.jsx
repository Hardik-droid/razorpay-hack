import React, { useState } from 'react';
import { Terminal, Trash2, X, ChevronDown, ChevronUp, Copy, Radio } from 'lucide-react';

export default function LiveLogTerminal({ events = [], isOpen, onClose }) {
  const [filter, setFilter] = useState('ALL');

  if (!isOpen) return null;

  const filteredEvents = filter === 'ALL' 
    ? events 
    : events.filter(e => e.agentType === filter);

  return (
    <div className="fixed bottom-4 right-4 z-40 w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-slide-up text-slate-100">
      
      {/* Terminal Title Bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 font-mono-code text-xs text-slate-300">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="font-semibold">Event Stream & Agent Traces</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1">
          {['ALL', 'INGEST', 'INTEGRITY', 'VISIBILITY', 'PAYMASTER'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono-code transition-colors cursor-pointer ${
                filter === f ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Logs Body */}
      <div className="p-3 font-mono-code text-[11px] space-y-2 max-h-72 overflow-y-auto bg-slate-900">
        {filteredEvents.length === 0 ? (
          <div className="text-slate-500 text-center py-6">Listening for live background events...</div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const isWarn = evt.level === 'WARN' || evt.level === 'ERROR';

            return (
              <div
                key={evt.id || idx}
                className={`p-2 rounded-lg border transition-all ${
                  isWarn
                    ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-bold text-blue-400">{evt.agentType}</span>
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-slate-200 font-semibold">{evt.eventType}</div>
                {evt.payload && (
                  <pre className="mt-1 text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap">
                    {typeof evt.payload === 'string' ? evt.payload : JSON.stringify(evt.payload, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
        <span>Total Events: {events.length}</span>
        <span>SSE Heartbeat Active</span>
      </div>
    </div>
  );
}
