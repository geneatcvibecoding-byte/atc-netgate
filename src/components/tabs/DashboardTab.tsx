import React from 'react';
import { 
  Users, 
  Ticket, 
  PauseCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  ShieldX, 
  ArrowUpRight, 
  Radio, 
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { Voucher, Device, HotspotSettings, EventLog } from '../../types';
import { TabId } from '../Sidebar';

interface DashboardTabProps {
  vouchers: Voucher[];
  devices: Device[];
  settings: HotspotSettings;
  logs: EventLog[];
  setActiveTab: (tab: TabId) => void;
  onOpenIssueModal: (presetMinutes?: number) => void;
  onAllowDevice: (ip: string) => void;
  onBlockDevice: (ip: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  vouchers,
  devices,
  settings,
  logs,
  setActiveTab,
  onOpenIssueModal,
  onAllowDevice,
  onBlockDevice,
}) => {
  const unusedVouchers = vouchers.filter((v) => v.status === 'unused');
  const activeVouchers = vouchers.filter((v) => v.status === 'active');
  const pausedVouchers = vouchers.filter((v) => v.status === 'paused');
  const expiredVouchers = vouchers.filter((v) => v.status === 'expired');

  const totalEarnings = vouchers
    .filter((v) => v.status !== 'unused')
    .reduce((sum, v) => sum + v.price, 0);

  const blockedDevices = devices.filter((d) => d.status === 'blocked');
  const onlineDevices = devices.filter((d) => d.status === 'active_session' || d.status === 'allowed');

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Hotspot Operations Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Windows Mobile Hotspot on <span className="text-cyan-400 font-mono font-medium">{settings.ssid}</span> ({settings.portalIp}:80)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenIssueModal(60)}
            className="px-3.5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Quick Issue (1 Hr)</span>
          </button>
          <button
            onClick={() => setActiveTab('print')}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Print Batch</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Vouchers */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Vouchers</span>
            <Ticket className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-black font-mono text-white tabular-nums">{vouchers.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Issued to date</div>
        </div>

        {/* Unused */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Unused Stock</span>
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400 tabular-nums">{unusedVouchers.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Ready to sell</div>
        </div>

        {/* Active Now */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Sessions</span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">{activeVouchers.length}</div>
          <div className="text-[10px] text-emerald-500/80 mt-1 font-mono">Online & surfing</div>
        </div>

        {/* Paused */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Paused</span>
            <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 tabular-nums">{pausedVouchers.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Time preserved</div>
        </div>

        {/* Expired */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Expired</span>
            <ShieldX className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400 tabular-nums">{expiredVouchers.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Firewall blocked</div>
        </div>

        {/* Revenue */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Gross Sales</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white tabular-nums">
            {settings.currencySymbol}{totalEarnings.toFixed(0)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">From redeemed codes</div>
        </div>
      </div>

      {/* Main 2-Column Split: Connected Devices + Real-Time Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Devices (2 columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Connected Devices ({devices.length})</h3>
            </div>
            <button
              onClick={() => setActiveTab('devices')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Manage Firewall</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {devices.map((device) => {
              const isOnline = device.status === 'active_session';
              const isAllowed = device.status === 'allowed';
              return (
                <div key={device.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : isAllowed ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {isOnline || isAllowed ? <ShieldCheck className="w-4 h-4" /> : <ShieldX className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>{device.hostname}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({device.ip})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-500">{device.mac}</span>
                        <span>·</span>
                        {device.activeVoucherCode ? (
                          <span className="text-cyan-400 font-mono font-medium">Voucher: {device.activeVoucherCode}</span>
                        ) : (
                          <span className="text-rose-400 font-mono">No Active Voucher</span>
                        )}
                        <span>·</span>
                        <span>{device.dataDownloadedMb.toFixed(1)} MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      isOnline
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isAllowed
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {isOnline ? 'ONLINE' : isAllowed ? 'ALLOWED' : 'BLOCKED'}
                    </span>

                    {device.status === 'blocked' ? (
                      <button
                        onClick={() => onAllowDevice(device.ip)}
                        className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded font-medium transition-colors"
                      >
                        Allow
                      </button>
                    ) : (
                      <button
                        onClick={() => onBlockDevice(device.ip)}
                        className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded font-medium transition-colors"
                      >
                        Block
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Event Log Stream (1 column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Event Audit Trail</h3>
              </div>
              <button
                onClick={() => setActiveTab('logs')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {logs.slice(0, 6).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-slate-700 pl-2.5 py-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="uppercase">{log.type}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <div className="text-slate-300 text-[11px] font-medium mt-0.5 leading-snug">
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hotspot Rule Note */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Windows Firewall Isolation Active</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Unpaid devices reach captive portal on port 80 only. All external WAN traffic is blocked via netsh until voucher is authenticated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
