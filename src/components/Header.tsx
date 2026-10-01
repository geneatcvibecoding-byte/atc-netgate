import React from 'react';
import { ViewMode, HotspotSettings } from '../types';
import { Smartphone, LayoutDashboard, Columns, Plus, Printer, Shield } from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  settings: HotspotSettings;
  setSettings: React.Dispatch<React.SetStateAction<HotspotSettings>>;
  onOpenIssueModal: () => void;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  settings,
  setSettings,
  onOpenIssueModal,
  activeCount,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur px-4 flex items-center justify-between z-20 shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>NetGate</span>
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Hotspot Manager</span>
        </a>
      </div>

      {/* Zone 2: Nav view mode controls */}
      <nav className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
        <button
          onClick={() => setViewMode('admin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            viewMode === 'admin'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Windows CustomTkinter desktop interface"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Admin App</span>
        </button>

        <button
          onClick={() => setViewMode('portal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            viewMode === 'portal'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Customer mobile captive portal on 192.168.137.1"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Captive Portal</span>
        </button>

        <button
          onClick={() => setViewMode('split')}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            viewMode === 'split'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Side-by-side: Admin & Phone Portal live sync"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split Preview</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 mr-2 border-r border-slate-800 pr-3 font-mono">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Admin OK</span>
          </span>
          <span>·</span>
          <span>{activeCount} Active</span>
        </div>

        <button
          onClick={onOpenIssueModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Issue Voucher</span>
        </button>
      </div>
    </header>
  );
};
