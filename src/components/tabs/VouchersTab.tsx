import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Printer, 
  Pause, 
  Play, 
  XCircle, 
  Copy, 
  Check, 
  Clock, 
  Smartphone,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Voucher, VoucherStatus, HotspotSettings } from '../../types';
import { formatSeconds } from '../../utils/qr';

interface VouchersTabProps {
  vouchers: Voucher[];
  settings: HotspotSettings;
  onUpdateVoucher: (id: string, updates: Partial<Voucher>) => void;
  onDeleteVoucher: (id: string) => void;
  onPauseVoucher: (id: string) => void;
  onResumeVoucher: (id: string) => void;
  onExpireVoucher: (id: string) => void;
  onBatchAddToPrint: (ids: string[]) => void;
  onClearExpired: () => void;
}

export const VouchersTab: React.FC<VouchersTabProps> = ({
  vouchers,
  settings,
  onUpdateVoucher,
  onDeleteVoucher,
  onPauseVoucher,
  onResumeVoucher,
  onExpireVoucher,
  onBatchAddToPrint,
  onClearExpired,
}) => {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      (v.boundIp && v.boundIp.includes(search)) ||
      (v.boundMac && v.boundMac.toLowerCase().includes(search.toLowerCase())) ||
      (v.boundHostname && v.boundHostname.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const copyCode = (voucher: Voucher) => {
    navigator.clipboard.writeText(voucher.code);
    setCopiedId(voucher.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Pause className="w-2.5 h-2.5" />
            Paused
          </span>
        );
      case 'unused':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Unused
          </span>
        );
      case 'expired':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-slate-800 text-slate-500">
            Expired
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, IP, MAC address..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['all', 'unused', 'active', 'paused', 'expired'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st} ({st === 'all' ? vouchers.length : vouchers.filter((v) => v.status === st).length})
            </button>
          ))}
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {filteredVouchers.some((v) => !v.inPrintQueue) && (
            <button
              onClick={() => onBatchAddToPrint(filteredVouchers.map((v) => v.id))}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Add all shown to print queue"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Queue Shown</span>
            </button>
          )}

          {vouchers.some((v) => v.status === 'expired') && (
            <button
              onClick={onClearExpired}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Remove all expired records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Expired</span>
            </button>
          )}
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Duration & Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time Remaining</th>
                <th className="py-3 px-4">Client Binding</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No vouchers match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-slate-850/50 transition-colors">
                    {/* Code */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyCode(voucher)}
                          className="font-mono font-bold text-sm text-cyan-400 hover:text-cyan-300 tracking-wider flex items-center gap-1.5 select-all"
                          title="Click to copy code"
                        >
                          <span>{voucher.code}</span>
                          {copiedId === voucher.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500 opacity-60 hover:opacity-100" />
                          )}
                        </button>
                        {voucher.inPrintQueue && (
                          <span className="text-[10px] text-slate-500 font-mono" title="In Print Queue">
                            [Queued]
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Duration & Price */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{voucher.durationLabel}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {settings.currencySymbol}{voucher.price.toFixed(2)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(voucher.status)}
                    </td>

                    {/* Time Remaining */}
                    <td className="py-3 px-4 font-mono tabular-nums">
                      {voucher.status === 'unused' ? (
                        <span className="text-slate-400 font-sans text-[11px]">{voucher.durationMinutes}m ready</span>
                      ) : voucher.status === 'expired' ? (
                        <span className="text-slate-600">00:00:00</span>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-200 font-bold">
                          <Clock className={`w-3.5 h-3.5 ${voucher.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`} />
                          <span className={voucher.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}>
                            {formatSeconds(voucher.remainingSeconds)}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Client Binding */}
                    <td className="py-3 px-4">
                      {voucher.boundIp ? (
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                            <Smartphone className="w-3 h-3 text-slate-500" />
                            <span>{voucher.boundHostname || 'Device'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {voucher.boundIp} · {voucher.boundMac || 'N/A'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px]">Unbound</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Pause / Resume */}
                        {voucher.status === 'active' && (
                          <button
                            onClick={() => onPauseVoucher(voucher.id)}
                            className="p-1.5 rounded hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
                            title="Pause session"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {voucher.status === 'paused' && (
                          <button
                            onClick={() => onResumeVoucher(voucher.id)}
                            className="p-1.5 rounded hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="Resume session"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Expire */}
                        {(voucher.status === 'active' || voucher.status === 'paused') && (
                          <button
                            onClick={() => onExpireVoucher(voucher.id)}
                            className="p-1.5 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Terminate session immediately"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Toggle print queue */}
                        <button
                          onClick={() => onUpdateVoucher(voucher.id, { inPrintQueue: !voucher.inPrintQueue })}
                          className={`p-1.5 rounded transition-colors ${
                            voucher.inPrintQueue
                              ? 'text-cyan-400 bg-cyan-500/10'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title={voucher.inPrintQueue ? 'Remove from print queue' : 'Add to print queue'}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete unused */}
                        {voucher.status === 'unused' && (
                          <button
                            onClick={() => onDeleteVoucher(voucher.id)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
