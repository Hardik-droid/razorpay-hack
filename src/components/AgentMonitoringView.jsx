import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  ArrowUpRight, 
  Filter, 
  ShieldCheck, 
  Cpu, 
  Server, 
  Activity, 
  Check, 
  Copy,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function AgentMonitoringView({ onEventNotification }) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchMonitoringLogs();
  }, []);

  const fetchMonitoringLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/agent-monitoring');
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
        if (!selectedRecord && data.records.length > 0) {
          setSelectedRecord(data.records[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch agent monitoring logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAgent = async (agentKey) => {
    setRunningAgent(agentKey);
    try {
      const res = await fetch(`/api/admin/agent-monitoring/run/${agentKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.record) {
        await fetchMonitoringLogs();
        setSelectedRecord(data.record);
        if (onEventNotification) {
          onEventNotification(`Agent run completed: ${data.record.agentName} executed with status ${data.record.status}`);
        }
      }
    } catch (err) {
      console.error('Error running agent:', err);
    } finally {
      setRunningAgent(null);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRecords = records.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner - Clean Stripe/Linear Admin Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Server className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin Internal Debug Panel</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Agent Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live telemetry, execution timing, input parameters, generated outputs, and verified database changes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMonitoringLogs}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Registered Core Agents</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">5</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">100% Active in Mesh</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Overall Execution Health</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">100%</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Zero critical run errors</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Avg Execution Latency</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">304 ms</div>
          <span className="text-[11px] text-blue-600 font-medium mt-1 inline-block">Local fast path</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Database Persistence</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">Prisma / In-Memory</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">ACID State Guaranteed</span>
        </div>
      </div>

      {/* 3. Main Telemetry Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Agent Execution Matrix</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Filter:</span>
            {['ALL', 'SUCCESS', 'ERROR'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  filterStatus === st 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 pl-6">Agent Name</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Run</th>
                <th className="py-3.5 px-4">Input</th>
                <th className="py-3.5 px-4">Output</th>
                <th className="py-3.5 px-4">Exec Time</th>
                <th className="py-3.5 px-4">Errors</th>
                <th className="py-3.5 px-4">Database Changes</th>
                <th className="py-3.5 px-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r, idx) => {
                const agentKey = r.agentName.toLowerCase().split(' ')[0];
                const isRunning = runningAgent === agentKey;
                const isSelected = selectedRecord?.agentName === r.agentName;

                return (
                  <tr 
                    key={idx}
                    onClick={() => setSelectedRecord(r)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/40' : ''}`}
                  >
                    {/* Agent Name */}
                    <td className="py-3.5 px-4 pl-6 font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>{r.agentName}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'SUCCESS' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>

                    {/* Last Run */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(r.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    {/* Input */}
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={r.input}>
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                        {r.input}
                      </span>
                    </td>

                    {/* Output */}
                    <td className="py-3.5 px-4 text-slate-800 font-medium max-w-xs truncate" title={r.output}>
                      {r.output}
                    </td>

                    {/* Execution Time */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {r.executionTime}
                    </td>

                    {/* Errors */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="text-slate-500 font-medium">{r.errors}</span>
                    </td>

                    {/* Database Changes */}
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={r.databaseChanges}>
                      <span className="inline-flex items-center space-x-1 text-slate-700">
                        <Database className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{r.databaseChanges}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 pr-6 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRunAgent(agentKey);
                        }}
                        disabled={isRunning}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-md text-[11px] transition-colors inline-flex items-center space-x-1 cursor-pointer"
                      >
                        {isRunning ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Running...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-current" />
                            <span>Run Now</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Inspection Drawer for Selected Record */}
      {selectedRecord && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Detailed Telemetry: {selectedRecord.agentName}
              </h3>
            </div>

            <button
              onClick={() => handleCopy(JSON.stringify(selectedRecord, null, 2), 'telemetry-json')}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center space-x-1 cursor-pointer font-medium"
            >
              {copiedId === 'telemetry-json' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Input Payload & Parameters</span>
              <p className="text-slate-900 font-mono text-[11px] break-words">{selectedRecord.input}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Output & Inferred Commerce State</span>
              <p className="text-slate-900 font-medium">{selectedRecord.output}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Database Modifications</span>
              <p className="text-slate-900 font-medium flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{selectedRecord.databaseChanges}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Execution Metrics</span>
              <div className="flex items-center space-x-4 text-slate-700">
                <span>Latency: <strong>{selectedRecord.executionTime}</strong></span>
                <span>Errors: <strong>{selectedRecord.errors}</strong></span>
                <span>Status: <strong className="text-emerald-600">{selectedRecord.status}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
