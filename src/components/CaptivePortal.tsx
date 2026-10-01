import React, { useState } from 'react';
import { 
  Wifi, 
  Clock, 
  QrCode, 
  Camera, 
  Check, 
  AlertCircle, 
  Pause, 
  Play, 
  Smartphone, 
  ShieldCheck, 
  ShieldX, 
  RefreshCw,
  LogOut,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Voucher, Device, HotspotSettings } from '../types';
import { formatSeconds } from '../utils/qr';

interface CaptivePortalProps {
  settings: HotspotSettings;
  devices: Device[];
  vouchers: Voucher[];
  onActivateVoucher: (code: string, clientIp: string) => { success: boolean; message: string };
  onPauseSession: (voucherId: string) => void;
  onResumeSession: (voucherId: string) => void;
  onDisconnectDevice: (deviceIp: string) => void;
}

export const CaptivePortal: React.FC<CaptivePortalProps> = ({
  settings,
  devices,
  vouchers,
  onActivateVoucher,
  onPauseSession,
  onResumeSession,
  onDisconnectDevice,
}) => {
  // Select active device being simulated
  const [selectedDeviceIp, setSelectedDeviceIp] = useState<string>(
    devices.length > 0 ? devices[0].ip : '192.168.137.45'
  );
  const [voucherCodeInput, setVoucherCodeInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showFaq, setShowFaq] = useState<boolean>(false);

  // Find currently selected device
  const currentDevice = devices.find((d) => d.ip === selectedDeviceIp) || {
    id: 'sim-dev',
    ip: selectedDeviceIp,
    mac: '74:D4:35:8A:2B:10',
    hostname: 'Guest-Smartphone',
    status: 'blocked' as const,
    dataDownloadedMb: 0,
    dataUploadedMb: 0,
    signalStrength: -60,
    connectedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  };

  // Find active or paused voucher bound to this IP
  const boundVoucher = vouchers.find(
    (v) => (v.status === 'active' || v.status === 'paused') && (v.boundIp === currentDevice.ip || v.code === currentDevice.activeVoucherCode)
  );

  const isOnline = boundVoucher?.status === 'active';
  const isPaused = boundVoucher?.status === 'paused';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCodeInput.trim()) return;

    const result = onActivateVoucher(voucherCodeInput.trim().toUpperCase(), currentDevice.ip);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setVoucherCodeInput('');
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  // Quick test scan using first available unused voucher
  const handleSimulateScan = () => {
    const unused = vouchers.find((v) => v.status === 'unused');
    if (unused) {
      setVoucherCodeInput(unused.code);
      setIsScanning(false);
      setFeedback({ type: 'success', message: `Scanned QR Code: ${unused.code}` });
    } else {
      setFeedback({ type: 'error', message: 'No unused vouchers in database to scan. Issue one in Admin!' });
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-3.5rem)] p-4 sm:p-6 overflow-y-auto">
      {/* Device Simulator Switcher Toolbar */}
      <div className="w-full max-w-sm mb-4 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Simulated Device</div>
            <select
              value={selectedDeviceIp}
              onChange={(e) => {
                setSelectedDeviceIp(e.target.value);
                setFeedback(null);
              }}
              className="bg-transparent font-semibold text-slate-200 focus:outline-none cursor-pointer text-xs truncate max-w-[170px]"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.ip} className="bg-slate-900 text-white">
                  {d.hostname} ({d.ip})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
            isOnline
              ? 'bg-emerald-500/20 text-emerald-300'
              : isPaused
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-rose-500/20 text-rose-300'
          }`}>
            {isOnline ? 'Internet ON' : isPaused ? 'Paused' : 'WAN Blocked'}
          </span>
        </div>
      </div>

      {/* Smartphone Captive Portal Frame */}
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Browser Top URL Bar */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-[11px] text-slate-300 font-medium">http://{settings.portalIp}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">PORT 80</span>
        </div>

        {/* Portal Header */}
        <div className="p-6 bg-gradient-to-b from-slate-950 to-slate-900 text-center border-b border-slate-800">
          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Wifi className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">{settings.ssid}</h1>
          <p className="text-xs text-slate-400 mt-1">High Speed Time-Based Hotspot</p>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div
            className={`p-3 text-xs flex items-center gap-2 border-b ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-rose-950/60 text-rose-300 border-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="leading-tight">{feedback.message}</span>
          </div>
        )}

        {/* Dynamic Body: Active Session vs Voucher Entry */}
        <div className="p-6 space-y-5">
          {boundVoucher ? (
            /* ACTIVE OR PAUSED SESSION SCREEN */
            <div className="space-y-4 text-center">
              <div className="space-y-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono uppercase font-bold tracking-wider ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isOnline ? 'Online & Surfing' : 'Session Paused'}
                </span>
                <p className="text-xs text-slate-400 pt-1">Time Remaining</p>
              </div>

              {/* Huge Countdown Display */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-inner">
                <div className={`font-mono text-4xl sm:text-5xl font-black tracking-tight ${isOnline ? 'text-cyan-400' : 'text-amber-400'}`}>
                  {formatSeconds(boundVoucher.remainingSeconds)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Voucher: <b className="text-slate-300">{boundVoucher.code}</b> ({boundVoucher.durationLabel})
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-1000 ${isOnline ? 'bg-cyan-400' : 'bg-amber-400'}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (boundVoucher.remainingSeconds / (boundVoucher.durationMinutes * 60)) * 100))}%`,
                  }}
                />
              </div>

              {/* Device & Usage stats */}
              <div className="grid grid-cols-2 gap-2 text-left bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
                <div>
                  <span className="text-slate-600 block text-[10px]">Client IP:</span>
                  <span className="text-slate-200">{currentDevice.ip}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[10px]">Data Used:</span>
                  <span className="text-cyan-400 font-bold">{boundVoucher.dataUsedMb.toFixed(1)} MB</span>
                </div>
              </div>

              {/* Pause / Resume Controls */}
              {settings.allowPauseResume && (
                <div className="pt-2">
                  {isOnline ? (
                    <button
                      onClick={() => onPauseSession(boundVoucher.id)}
                      className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pause Session (Save Time)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onResumeSession(boundVoucher.id)}
                      className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Play className="w-4 h-4" />
                      <span>Resume Internet Access</span>
                    </button>
                  )}
                  <p className="text-[10px] text-slate-500 mt-2">
                    {isOnline
                      ? 'Click pause when stepping away to preserve your remaining time.'
                      : 'Internet blocked while paused. Click resume to restore internet.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* VOUCHER ENTRY FORM */
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-base font-bold text-white">Enter Voucher Code</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type your voucher code to activate internet access
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. NGT-8F2K"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3.5 text-center font-mono text-xl font-black text-white tracking-widest uppercase placeholder:text-slate-600 focus:outline-none transition-colors"
                    maxLength={14}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                >
                  <Wifi className="w-4 h-4" />
                  <span>Connect to Internet</span>
                </button>
              </form>

              {/* QR Scanner Option */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsScanning(!isScanning)}
                  className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Scan Voucher QR Code</span>
                </button>

                {isScanning && (
                  <div className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-3">
                    <div className="w-40 h-40 border-2 border-dashed border-cyan-400 rounded-xl mx-auto flex flex-col items-center justify-center text-slate-400 p-2">
                      <QrCode className="w-10 h-10 text-cyan-400 mb-2 animate-pulse" />
                      <span className="text-[11px] leading-tight">Camera Scanner Active</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded-lg text-xs font-semibold"
                    >
                      Scan Available Voucher
                    </button>
                  </div>
                )}
              </div>

              {/* Available Rates Table */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Hotspot Rates & Plans
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {settings.ratePlans.slice(0, 4).map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between"
                    >
                      <span className="text-slate-300">{plan.name}</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {settings.currencySymbol}{plan.price.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Portal Footer Help */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-500 space-y-1">
          <div>Need a voucher? Inquire at the counter or cashier.</div>
          <div className="text-[10px] text-slate-600">NetGate Captive Portal System · Subnet 192.168.137.1</div>
        </div>
      </div>
    </div>
  );
};
