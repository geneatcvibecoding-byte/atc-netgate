import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  Ticket, 
  Smartphone, 
  Radio, 
  Terminal,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { EventLog } from '../../types';

interface EventLogTabProps {
  logs: EventLog[];
  onClearLogs: () => void;
}

export const EventLogTab: React.FC<EventLogTabProps> = ({ logs, onClearLogs }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `netgate_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getLogIcon = (type: EventLog['type'], level: EventLog['level']) => {
    switch (type) {
      case 'firewall':
        return <Terminal className="w-3.5 h-3.5 text-cyan-400" />;
      case 'voucher':
        return <Ticket className="w-3.5 h-3.5 text-emerald-400" />;
      case 'device':
        return <Smartphone className="w-3.5 h-3.5 text-amber-400" />;
      case 'portal':
        return <Radio className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['all', 'voucher', 'firewall', 'device', 'portal', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                filterType === t
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportLogsAsJson}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            title="Download audit logs as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={onClearLogs}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Clear all logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Table / Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
        <div className="p-3 bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold flex items-center justify-between text-[11px]">
          <span>Audit Log Entries ({filteredLogs.length})</span>
          <span>Logged from Windows Event subsystem</span>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-sans text-xs">
              No audit logs found matching criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-slate-850/50 transition-colors flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded bg-slate-950 border border-slate-800 shrink-0">
                  {getLogIcon(log.type, log.level)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-sans font-semibold text-slate-200 text-xs">
                      {log.message}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {log.details && (
                    <div className="text-[11px] text-slate-400 mt-1 break-all bg-slate-950/60 p-1.5 rounded border border-slate-850">
                      {log.details}
                    </div>
                  )}
                </div>

                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0 ${
                  log.level === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : log.level === 'warning'
                    ? 'bg-amber-500/10 text-amber-400'
                    : log.level === 'error'
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {log.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
