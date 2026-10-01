import React, { useState } from 'react';
import { FileCode2, Copy, Check, Download, ExternalLink, Terminal, ShieldCheck } from 'lucide-react';
import { PYTHON_HOTSPOT_MANAGER_SCRIPT } from '../../utils/pythonScript';

export const PythonScriptTab: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_HOTSPOT_MANAGER_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([PYTHON_HOTSPOT_MANAGER_SCRIPT], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wifi_hotspot_manager.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Python Core Script (Windows Native)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete standalone Python 3.10+ application with CustomTkinter GUI, SQLite, and Windows Firewall automation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Python Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download wifi_hotspot_manager.py</span>
          </button>
        </div>
      </div>

      {/* Quick Setup Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px] font-mono">1</span>
            <span>Install Dependencies</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 select-all">
            pip install customtkinter qrcode[pil] pillow
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Requires Python 3.10 or newer installed on Windows 10 or 11.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px] font-mono">2</span>
            <span>Enable Windows Hotspot</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            Go to <b className="text-white">Settings &rarr; Network &rarr; Mobile Hotspot</b> and turn it ON.
          </p>
          <p className="text-[11px] text-slate-500 leading-normal">
            Set network name to <code className="text-cyan-400 font-mono">NetGate-WiFi</code> and password <code className="text-cyan-400 font-mono">netgate123</code>.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px] font-mono">3</span>
            <span>Run as Administrator</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 select-all">
            python wifi_hotspot_manager.py
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Must be run as Administrator to bind to port 80 and execute netsh firewall commands.
          </p>
        </div>
      </div>

      {/* Code Editor / Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">wifi_hotspot_manager.py</span>
            <span className="text-[10px] text-slate-500">· Python 3.10+</span>
          </div>
          <span className="text-[10px] text-slate-500">Standalone Executable Script</span>
        </div>

        <pre className="p-4 overflow-x-auto max-h-[500px] text-slate-300 leading-relaxed bg-[#0b101b]">
          <code>{PYTHON_HOTSPOT_MANAGER_SCRIPT}</code>
        </pre>
      </div>
    </div>
  );
};
