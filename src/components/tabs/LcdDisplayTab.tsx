import React, { useState, useEffect } from 'react';
import { Tv, Maximize2, Minimize2, Palette, Sparkles, RefreshCw, Volume2 } from 'lucide-react';
import { HotspotSettings, Voucher } from '../../types';

interface LcdDisplayTabProps {
  settings: HotspotSettings;
  setSettings: React.Dispatch<React.SetStateAction<HotspotSettings>>;
  activeVouchersCount: number;
}

export const LcdDisplayTab: React.FC<LcdDisplayTabProps> = ({
  settings,
  setSettings,
  activeVouchersCount,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scrolling ticker offset
  useEffect(() => {
    const ticker = setInterval(() => {
      setScrollOffset((prev) => (prev + 1) % 1500);
    }, 60);
    return () => clearInterval(ticker);
  }, []);

  const ratesTicker = settings.ratePlans
    .map((p) => `${p.name.toUpperCase()}: ${settings.currencySymbol}${p.price.toFixed(0)}`)
    .join('  •  ');

  const fullTickerText = `${settings.lcdMessage}   ***   RATES: ${ratesTicker}   ***   SSID: ${settings.ssid}   ***   PORTAL: ${settings.portalIp}   ***   `;

  // LCD Color Palettes
  const themeStyles = {
    green: {
      screenBg: 'bg-[#0a2312]',
      border: 'border-[#14532d]',
      text: 'text-[#4ade80]',
      glow: 'shadow-[0_0_35px_rgba(74,222,128,0.25)]',
      subText: 'text-[#22c55e]/70',
      glass: 'bg-[#15803d]/5',
    },
    blue: {
      screenBg: 'bg-[#031525]',
      border: 'border-[#0369a1]',
      text: 'text-[#38bdf8]',
      glow: 'shadow-[0_0_35px_rgba(56,189,248,0.25)]',
      subText: 'text-[#0284c7]/70',
      glass: 'bg-[#0284c7]/5',
    },
    amber: {
      screenBg: 'bg-[#261303]',
      border: 'border-[#b45309]',
      text: 'text-[#fbbf24]',
      glow: 'shadow-[0_0_35px_rgba(251,191,36,0.25)]',
      subText: 'text-[#f59e0b]/70',
      glass: 'bg-[#d97706]/5',
    },
  }[settings.lcdTheme || 'green'];

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-black p-6 flex flex-col justify-center items-center' : ''}`}>
      {/* Header controls (hidden if fullscreen) */}
      {!isFullscreen && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Customer LCD & Kiosk Secondary Display</h2>
            <p className="text-xs text-slate-400 mt-1">
              Live display screen for connected secondary monitor at the cashier counter or sari-sari store kiosk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Color Theme Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['green', 'blue', 'amber'] as const).map((thm) => (
                <button
                  key={thm}
                  onClick={() => setSettings((prev) => ({ ...prev, lcdTheme: thm }))}
                  className={`px-2.5 py-1 text-xs font-semibold rounded capitalize transition-colors ${
                    settings.lcdTheme === thm
                      ? 'bg-slate-800 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {thm}
                </button>
              ))}
            </div>

            <button
              onClick={toggleFullscreen}
              className="px-3.5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen Kiosk Mode</span>
            </button>
          </div>
        </div>
      )}

      {/* Physical LCD Bezel Frame */}
      <div className={`w-full max-w-4xl mx-auto rounded-3xl p-6 bg-gradient-to-b from-slate-900 via-slate-925 to-slate-950 border-4 border-slate-700 shadow-2xl relative select-none ${isFullscreen ? 'scale-110' : ''}`}>
        {/* Hardware Bezel Header */}
        <div className="flex items-center justify-between pb-3 px-2 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold tracking-widest text-slate-300">NETGATE LCD-2004 V1.2</span>
          </div>
          <div className="flex items-center gap-3">
            <span>HD44780 CONTROLLER</span>
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="text-slate-400 hover:text-white p-1 rounded"
                title="Exit Fullscreen"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* LCD Glass Screen */}
        <div
          className={`rounded-xl p-6 sm:p-8 border-2 ${themeStyles.border} ${themeStyles.screenBg} ${themeStyles.glow} relative overflow-hidden font-mono`}
          style={{ fontFamily: "'VT323', 'JetBrains Mono', monospace" }}
        >
          {/* Subtle Scanline Effect */}
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/30 pointer-events-none" />

          {/* Line 1: Header + Hotspot SSID & Status */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between text-2xl sm:text-3xl ${themeStyles.text} tracking-wider font-bold border-b border-current/20 pb-3 mb-4`}>
            <div className="flex items-center gap-3">
              <span>WIFI: {settings.ssid}</span>
            </div>
            <div className="text-xl sm:text-2xl mt-1 sm:mt-0 font-normal">
              {currentTime}
            </div>
          </div>

          {/* Line 2: Big Rates & Users Info Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 py-3 my-2 text-xl sm:text-2xl ${themeStyles.text}`}>
            <div className="p-3 rounded-lg border border-current/20 bg-black/20">
              <div className={`text-sm ${themeStyles.subText} uppercase font-sans font-semibold tracking-wider`}>Portal IP</div>
              <div className="text-2xl font-bold mt-1 tracking-wider">{settings.portalIp}</div>
            </div>
            <div className="p-3 rounded-lg border border-current/20 bg-black/20">
              <div className={`text-sm ${themeStyles.subText} uppercase font-sans font-semibold tracking-wider`}>Active Users</div>
              <div className="text-2xl font-bold mt-1 tracking-wider">{activeVouchersCount} ONLINE</div>
            </div>
            <div className="p-3 rounded-lg border border-current/20 bg-black/20">
              <div className={`text-sm ${themeStyles.subText} uppercase font-sans font-semibold tracking-wider`}>Password</div>
              <div className="text-2xl font-bold mt-1 tracking-wider">{settings.password}</div>
            </div>
          </div>

          {/* Line 3: Scrolling News & Rate Ticker */}
          <div className="mt-4 pt-3 border-t border-current/20 overflow-hidden whitespace-nowrap relative">
            <div
              className={`text-2xl sm:text-3xl font-bold tracking-widest ${themeStyles.text} inline-block`}
              style={{
                transform: `translateX(-${scrollOffset % 1200}px)`,
                transition: 'transform 0.06s linear',
              }}
            >
              {fullTickerText} {fullTickerText}
            </div>
          </div>
        </div>

        {/* Screws & Physical Hardware Details */}
        <div className="flex items-center justify-between pt-3 px-2 text-[10px] text-slate-500 font-mono">
          <span>PWR: 5.0V DC</span>
          <span>BAUD: 9600</span>
          <span>I2C ADDR: 0x27</span>
        </div>
      </div>

      {/* LCD Message Configurator (hidden when fullscreen) */}
      {!isFullscreen && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Customize Scrolling Ticker Message</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={settings.lcdMessage}
              onChange={(e) => setSettings((prev) => ({ ...prev, lcdMessage: e.target.value }))}
              placeholder="Enter marquee message for secondary LCD screen..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
            <button
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  lcdMessage: 'NETGATE WIFI HOTSPOT * HIGH SPEED INTERNET * GET VOUCHERS AT STORE COUNTER *',
                }))
              }
              className="px-3.5 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
