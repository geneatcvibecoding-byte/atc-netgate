import React, { useEffect, useState } from 'react';
import { Wifi, Clock, ShieldCheck, Tag } from 'lucide-react';
import { Voucher, HotspotSettings } from '../types';
import { generateQrDataUrl } from '../utils/qr';

interface VoucherCardProps {
  voucher: Voucher;
  settings: HotspotSettings;
  compact?: boolean;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, settings, compact = false }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    generateQrDataUrl(voucher.code).then((url) => {
      if (isMounted) setQrUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [voucher.code]);

  if (compact) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {qrUrl ? (
            <img src={qrUrl} alt={voucher.code} className="w-12 h-12 bg-white rounded p-0.5" />
          ) : (
            <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-xs text-slate-500">QR</div>
          )}
          <div>
            <div className="font-mono font-bold text-sm tracking-wider text-cyan-400">{voucher.code}</div>
            <div className="text-xs text-slate-400">{voucher.durationLabel} · {settings.currencySymbol}{voucher.price.toFixed(2)}</div>
          </div>
        </div>
        <span className="text-xs text-slate-400 uppercase font-mono">{voucher.status}</span>
      </div>
    );
  }

  return (
    <div className="voucher-card relative bg-white text-slate-900 border-2 border-dashed border-slate-300 rounded-xl p-4 shadow-sm w-full max-w-[320px] mx-auto print:border-black print:shadow-none print:m-1">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-cyan-600 text-white rounded">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight text-slate-900 tracking-tight">NetGate WiFi</div>
            <div className="text-[10px] text-slate-500 font-medium leading-none">VOUCHER PASS</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-extrabold text-cyan-700 leading-none">
            {settings.currencySymbol}{voucher.price.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{voucher.durationLabel}</div>
        </div>
      </div>

      {/* Main Body with QR & Code */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-2.5">
        <div className="shrink-0 bg-white p-1 rounded border border-slate-200 shadow-2xs">
          {qrUrl ? (
            <img src={qrUrl} alt={`QR for ${voucher.code}`} className="w-20 h-20" />
          ) : (
            <div className="w-20 h-20 bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono">Loading...</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Voucher Code</div>
          <div className="font-mono text-xl font-black text-slate-900 tracking-wider select-all break-all leading-tight bg-white px-2 py-1 border border-slate-200 rounded">
            {voucher.code}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-600 font-medium">
            <Clock className="w-3 h-3 text-cyan-600 shrink-0" />
            <span>Valid for {voucher.durationMinutes} mins</span>
          </div>
        </div>
      </div>

      {/* Connection Info */}
      <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-200 pt-2 mb-2">
        <div className="flex justify-between">
          <span className="text-slate-500 font-medium">WiFi SSID:</span>
          <span className="font-mono font-bold text-slate-800">{settings.ssid}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 font-medium">Password:</span>
          <span className="font-mono font-semibold text-slate-800">{settings.password}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 font-medium">Portal URL:</span>
          <span className="font-mono text-cyan-700 font-bold">{settings.portalIp}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-[9.5px] leading-tight text-slate-600 bg-slate-100 p-2 rounded text-center">
        Connect to WiFi &rarr; Open browser &rarr; Enter or Scan code &rarr; Surf the Web!
      </div>
    </div>
  );
};
