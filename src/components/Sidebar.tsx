import React from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  ListFilter, 
  ShieldAlert, 
  Tv, 
  Printer, 
  History, 
  Settings, 
  FileCode2, 
  Wifi, 
  Radio, 
  Power,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { HotspotSettings } from '../types';

export type TabId = 
  | 'dashboard' 
  | 'issue' 
  | 'vouchers' 
  | 'devices' 
  | 'lcd' 
  | 'print' 
  | 'logs' 
  | 'settings' 
  | 'python';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  settings: HotspotSettings;
  onToggleHotspot: () => void;
  onTogglePortal: () => void;
  unusedCount: number;
  activeCount: number;
  printQueueCount: number;
  blockedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onToggleHotspot,
  onTogglePortal,
  unusedCount,
  activeCount,
  printQueueCount,
  blockedCount,
}) => {
  const navItems = [
    { id: 'dashboard' as TabId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'issue' as TabId, label: 'Issue Voucher', icon: Ticket },
    { id: 'vouchers' as TabId, label: 'All Vouchers', icon: ListFilter, badge: unusedCount > 0 ? `${unusedCount}` : undefined },
    { id: 'devices' as TabId, label: 'Devices & Firewall', icon: ShieldAlert, badge: blockedCount > 0 ? `${blockedCount} Blocked` : undefined },
    { id: 'lcd' as TabId, label: 'LCD Display', icon: Tv },
    { id: 'print' as TabId, label: 'Print Queue', icon: Printer, badge: printQueueCount > 0 ? `${printQueueCount}` : undefined },
    { id: 'logs' as TabId, label: 'Event Log', icon: History },
    { id: 'settings' as TabId, label: 'Settings', icon: Settings },
    { id: 'python' as TabId, label: 'Python Script', icon: FileCode2 },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-3.5rem)] select-none">
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* System Status Panel */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">System Status</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Elevated
            </span>
          </div>

          {/* Hotspot Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${settings.hotspotEnabled ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Mobile Hotspot</div>
                <div className="text-[10px] text-slate-500 font-mono">{settings.ssid}</div>
              </div>
            </div>
            <button
              onClick={onToggleHotspot}
              className={`p-1.5 rounded-md text-xs font-semibold transition-colors ${
                settings.hotspotEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
              }`}
              title="Toggle Hotspot"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Captive Portal Toggle */}
          <div className="flex items-center justify-between border-t border-slate-850 pt-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${settings.portalRunning ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                <Radio className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Captive Portal</div>
                <div className="text-[10px] text-slate-500 font-mono">{settings.portalIp}:80</div>
              </div>
            </div>
            <button
              onClick={onTogglePortal}
              className={`px-2 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                settings.portalRunning
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {settings.portalRunning ? 'Active' : 'Off'}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    isActive ? 'bg-cyan-500/20 text-cyan-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 space-y-1 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <span>NetGate Core</span>
          <span className="font-mono text-slate-400">v2.4.0</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Active Users</span>
          <span className="font-mono font-semibold text-cyan-400">{activeCount} Online</span>
        </div>
      </div>
    </aside>
  );
};
