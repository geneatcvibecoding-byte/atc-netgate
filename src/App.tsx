import React, { useState, useEffect, useRef } from 'react';
import { 
  Voucher, 
  Device, 
  FirewallRule, 
  EventLog, 
  HotspotSettings, 
  ViewMode 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  INITIAL_VOUCHERS, 
  INITIAL_DEVICES, 
  INITIAL_RULES, 
  INITIAL_LOGS,
  getStoredData, 
  setStoredData 
} from './utils/storage';
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { DashboardTab } from './components/tabs/DashboardTab';
import { IssueVoucherTab } from './components/tabs/IssueVoucherTab';
import { VouchersTab } from './components/tabs/VouchersTab';
import { DevicesFirewallTab } from './components/tabs/DevicesFirewallTab';
import { PrintQueueTab } from './components/tabs/PrintQueueTab';
import { LcdDisplayTab } from './components/tabs/LcdDisplayTab';
import { EventLogTab } from './components/tabs/EventLogTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { PythonScriptTab } from './components/tabs/PythonScriptTab';
import { CaptivePortal } from './components/CaptivePortal';
import { QuickIssueModal } from './components/QuickIssueModal';

export default function App() {
  // State Initialization with local storage fallback
  const [settings, setSettings] = useState<HotspotSettings>(() =>
    getStoredData('settings', DEFAULT_SETTINGS)
  );
  const [vouchers, setVouchers] = useState<Voucher[]>(() =>
    getStoredData('vouchers', INITIAL_VOUCHERS)
  );
  const [devices, setDevices] = useState<Device[]>(() =>
    getStoredData('devices', INITIAL_DEVICES)
  );
  const [rules, setRules] = useState<FirewallRule[]>(() =>
    getStoredData('rules', INITIAL_RULES)
  );
  const [logs, setLogs] = useState<EventLog[]>(() =>
    getStoredData('logs', INITIAL_LOGS)
  );

  // Navigation states
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isQuickIssueOpen, setIsQuickIssueOpen] = useState<boolean>(false);
  const [quickIssuePreset, setQuickIssuePreset] = useState<number>(60);

  // Sync to local storage
  useEffect(() => setStoredData('settings', settings), [settings]);
  useEffect(() => setStoredData('vouchers', vouchers), [vouchers]);
  useEffect(() => setStoredData('devices', devices), [devices]);
  useEffect(() => setStoredData('rules', rules), [rules]);
  useEffect(() => setStoredData('logs', logs), [logs]);

  // Logging helper
  const addLog = (
    type: EventLog['type'],
    level: EventLog['level'],
    message: string,
    details?: string
  ) => {
    const newEntry: EventLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type,
      level,
      message,
      details,
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
  };

  // Background timer ticker (runs every second like Python worker thread)
  useEffect(() => {
    const interval = setInterval(() => {
      setVouchers((prevVouchers) => {
        let hasChanges = false;
        const updated = prevVouchers.map((v) => {
          if (v.status !== 'active') return v;
          hasChanges = true;

          // Increment mock data usage slightly for realism
          const newUsage = v.dataUsedMb + (Math.random() * 0.05 + 0.02);

          if (v.remainingSeconds <= 1) {
            // Expired!
            addLog(
              'voucher',
              'warning',
              `Session expired for voucher ${v.code}`,
              `Bound IP ${v.boundIp || 'unknown'} has been blocked via Windows Firewall.`
            );

            // Re-apply firewall block for this device
            if (v.boundIp) {
              applyDeviceBlocking(v.boundIp);
            }

            return {
              ...v,
              status: 'expired' as const,
              remainingSeconds: 0,
              dataUsedMb: newUsage,
            };
          }

          return {
            ...v,
            remainingSeconds: v.remainingSeconds - 1,
            dataUsedMb: newUsage,
          };
        });

        return hasChanges ? updated : prevVouchers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Windows Firewall Netsh Logic Helpers
  const applyDeviceBlocking = (ip: string) => {
    setRules((prevRules) => {
      // Remove any existing rules for this IP
      const filtered = prevRules.filter((r) => r.remoteIp !== ip);
      // Add 4 standard NetGate isolation rules
      const newRules: FirewallRule[] = [
        {
          id: `rule-${Date.now()}-1`,
          name: `ALLOW_${ip}`,
          direction: 'Inbound',
          action: 'Allow',
          remoteIp: ip,
          port: '80',
          protocol: 'TCP',
          purpose: 'Portal replies reach the device',
          active: true,
        },
        {
          id: `rule-${Date.now()}-2`,
          name: `ALLOW_${ip}_out`,
          direction: 'Outbound',
          action: 'Allow',
          remoteIp: ip,
          port: '80',
          protocol: 'TCP',
          purpose: 'Device can reach portal on port 80',
          active: true,
        },
        {
          id: `rule-${Date.now()}-3`,
          name: `BLOCK_${ip}`,
          direction: 'Inbound',
          action: 'Block',
          remoteIp: ip,
          protocol: 'Any',
          purpose: 'All other internet traffic blocked',
          active: true,
        },
        {
          id: `rule-${Date.now()}-4`,
          name: `BLOCK_${ip}_out`,
          direction: 'Outbound',
          action: 'Block',
          remoteIp: ip,
          protocol: 'Any',
          purpose: 'All other outbound blocked',
          active: true,
        },
      ];
      return [...filtered, ...newRules];
    });

    setDevices((prevDevices) =>
      prevDevices.map((d) => (d.ip === ip ? { ...d, status: 'blocked' as const } : d))
    );
  };

  const clearDeviceBlocking = (ip: string) => {
    // When voucher is active, all block rules for that device are removed
    setRules((prevRules) => prevRules.filter((r) => r.remoteIp !== ip));
  };

  // Captive Portal Voucher Activation Handler
  const handleActivateVoucher = (
    code: string,
    clientIp: string
  ): { success: boolean; message: string } => {
    const voucher = vouchers.find((v) => v.code === code);
    if (!voucher) {
      addLog('voucher', 'error', `Failed login attempt with invalid code ${code} from ${clientIp}`);
      return { success: false, message: 'Invalid voucher code. Please check and try again.' };
    }

    if (voucher.status === 'expired') {
      return { success: false, message: 'This voucher has already expired.' };
    }

    const device = devices.find((d) => d.ip === clientIp);
    const now = new Date();
    const expires = new Date(now.getTime() + voucher.remainingSeconds * 1000);

    if (voucher.status === 'unused') {
      // First time activation
      setVouchers((prev) =>
        prev.map((v) =>
          v.id === voucher.id
            ? {
                ...v,
                status: 'active',
                activatedAt: now.toISOString(),
                expiresAt: expires.toISOString(),
                boundIp: clientIp,
                boundHostname: device?.hostname || 'Smartphone',
                boundMac: device?.mac,
              }
            : v
        )
      );

      // Unblock device in firewall
      clearDeviceBlocking(clientIp);

      // Update device
      setDevices((prev) =>
        prev.map((d) =>
          d.ip === clientIp
            ? {
                ...d,
                status: 'active_session',
                activeVoucherCode: code,
                lastSeen: now.toISOString(),
              }
            : d
        )
      );

      addLog(
        'voucher',
        'success',
        `Voucher ${code} activated by ${clientIp} (${device?.hostname || 'Client'})`,
        `Granted ${voucher.durationMinutes} minutes internet access. Firewall rules cleared.`
      );

      return {
        success: true,
        message: `Internet access activated! Duration: ${voucher.durationLabel}.`,
      };
    } else if (voucher.status === 'paused') {
      // Resume paused session
      handleResumeVoucher(voucher.id);
      return { success: true, message: 'Welcome back! Your session has been resumed.' };
    } else if (voucher.status === 'active') {
      if (voucher.boundIp === clientIp) {
        return { success: true, message: 'Session is currently active on this device.' };
      }
      return {
        success: false,
        message: 'This voucher is currently in use on another device.',
      };
    }

    return { success: false, message: 'Could not activate voucher.' };
  };

  // Pause / Resume Handlers
  const handlePauseVoucher = (voucherId: string) => {
    const v = vouchers.find((item) => item.id === voucherId);
    if (!v || v.status !== 'active') return;

    setVouchers((prev) =>
      prev.map((item) =>
        item.id === voucherId
          ? { ...item, status: 'paused', pausedAt: new Date().toISOString() }
          : item
      )
    );

    if (v.boundIp) {
      applyDeviceBlocking(v.boundIp);
      setDevices((prev) =>
        prev.map((d) => (d.ip === v.boundIp ? { ...d, status: 'blocked' } : d))
      );
    }

    addLog(
      'voucher',
      'warning',
      `Session paused for voucher ${v.code} (${v.boundIp || 'Client'})`,
      'Internet blocked. Time counter frozen until resumed.'
    );
  };

  const handleResumeVoucher = (voucherId: string) => {
    const v = vouchers.find((item) => item.id === voucherId);
    if (!v || v.status !== 'paused') return;

    setVouchers((prev) =>
      prev.map((item) =>
        item.id === voucherId
          ? {
              ...item,
              status: 'active',
              expiresAt: new Date(Date.now() + item.remainingSeconds * 1000).toISOString(),
            }
            : item
      )
    );

    if (v.boundIp) {
      clearDeviceBlocking(v.boundIp);
      setDevices((prev) =>
        prev.map((d) =>
          d.ip === v.boundIp ? { ...d, status: 'active_session', activeVoucherCode: v.code } : d
        )
      );
    }

    addLog(
      'voucher',
      'success',
      `Session resumed for voucher ${v.code} (${v.boundIp || 'Client'})`,
      'Firewall isolation removed. Full internet restored.'
    );
  };

  const handleExpireVoucher = (voucherId: string) => {
    const v = vouchers.find((item) => item.id === voucherId);
    if (!v) return;

    setVouchers((prev) =>
      prev.map((item) =>
        item.id === voucherId
          ? { ...item, status: 'expired', remainingSeconds: 0 }
          : item
      )
    );

    if (v.boundIp) {
      applyDeviceBlocking(v.boundIp);
      setDevices((prev) =>
        prev.map((d) => (d.ip === v.boundIp ? { ...d, status: 'blocked', activeVoucherCode: undefined } : d))
      );
    }

    addLog('voucher', 'warning', `Session terminated manually by admin for voucher ${v.code}`);
  };

  // Device Management Actions
  const handleAllowDevice = (ip: string) => {
    clearDeviceBlocking(ip);
    setDevices((prev) =>
      prev.map((d) => (d.ip === ip ? { ...d, status: 'allowed' } : d))
    );
    addLog('device', 'info', `Device ${ip} manually allowed by administrator`);
  };

  const handleBlockDevice = (ip: string) => {
    applyDeviceBlocking(ip);
    setDevices((prev) =>
      prev.map((d) => (d.ip === ip ? { ...d, status: 'blocked', activeVoucherCode: undefined } : d))
    );
    addLog('firewall', 'warning', `Device ${ip} manually blocked by administrator`);
  };

  const handleAddDevice = (devicePartial: Partial<Device>) => {
    const newDev: Device = {
      id: `dev-${Date.now()}`,
      ip: devicePartial.ip || '192.168.137.100',
      mac: devicePartial.mac || '00:11:22:33:44:55',
      hostname: devicePartial.hostname || 'New Device',
      status: 'blocked',
      connectedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      dataDownloadedMb: 0.1,
      dataUploadedMb: 0.05,
      signalStrength: -60,
    };
    setDevices((prev) => [...prev, newDev]);
    applyDeviceBlocking(newDev.ip);
    addLog('device', 'info', `New device connected: ${newDev.hostname} (${newDev.ip})`);
  };

  const handleRemoveDevice = (id: string) => {
    const dev = devices.find((d) => d.id === id);
    if (dev) {
      clearDeviceBlocking(dev.ip);
      setDevices((prev) => prev.filter((d) => d.id !== id));
      addLog('device', 'info', `Device disconnected: ${dev.hostname} (${dev.ip})`);
    }
  };

  // Voucher updates
  const handleIssueVouchers = (newVouchers: Voucher[]) => {
    setVouchers((prev) => [...newVouchers, ...prev]);
    addLog(
      'voucher',
      'info',
      `Generated ${newVouchers.length} new voucher(s)`,
      `Batch codes: ${newVouchers.map((v) => v.code).slice(0, 3).join(', ')}${
        newVouchers.length > 3 ? '...' : ''
      }`
    );
  };

  const handleUpdateVoucher = (id: string, updates: Partial<Voucher>) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const handleDeleteVoucher = (id: string) => {
    setVouchers((prev) => prev.filter((v) => v.id !== id));
  };

  const handleBatchAddToPrint = (ids: string[]) => {
    setVouchers((prev) =>
      prev.map((v) => (ids.includes(v.id) ? { ...v, inPrintQueue: true } : v))
    );
  };

  const handleClearExpired = () => {
    setVouchers((prev) => prev.filter((v) => v.status !== 'expired'));
    addLog('system', 'info', 'Purged all expired vouchers from database');
  };

  const handleClearPrintQueue = () => {
    setVouchers((prev) => prev.map((v) => ({ ...v, inPrintQueue: false })));
  };

  // Hotspot / Portal Toggles
  const handleToggleHotspot = () => {
    setSettings((prev) => {
      const next = !prev.hotspotEnabled;
      addLog(
        'system',
        next ? 'success' : 'warning',
        `Windows Mobile Hotspot turned ${next ? 'ON' : 'OFF'}`
      );
      return { ...prev, hotspotEnabled: next };
    });
  };

  const handleTogglePortal = () => {
    setSettings((prev) => {
      const next = !prev.portalRunning;
      addLog(
        'portal',
        next ? 'success' : 'warning',
        `Captive Portal server on port 80 turned ${next ? 'ON' : 'OFF'}`
      );
      return { ...prev, portalRunning: next };
    });
  };

  // Factory reset / Seed demo
  const handleResetDatabase = () => {
    if (window.confirm('Reset all NetGate vouchers, devices, and rules to default state?')) {
      setVouchers(INITIAL_VOUCHERS);
      setDevices(INITIAL_DEVICES);
      setRules(INITIAL_RULES);
      setLogs(INITIAL_LOGS);
      setSettings(DEFAULT_SETTINGS);
      addLog('system', 'warning', 'Database reset to factory state');
    }
  };

  const handleSeedSampleData = () => {
    setVouchers(INITIAL_VOUCHERS);
    setDevices(INITIAL_DEVICES);
    setRules(INITIAL_RULES);
    addLog('system', 'info', 'Loaded standard demo fixtures');
  };

  const activeVouchersCount = vouchers.filter((v) => v.status === 'active').length;
  const unusedVouchersCount = vouchers.filter((v) => v.status === 'unused').length;
  const printQueueCount = vouchers.filter((v) => v.inPrintQueue).length;
  const blockedDevicesCount = devices.filter((d) => d.status === 'blocked').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        settings={settings}
        setSettings={setSettings}
        onOpenIssueModal={() => {
          setQuickIssuePreset(60);
          setIsQuickIssueOpen(true);
        }}
        activeCount={activeVouchersCount}
      />

      {/* Main View Area */}
      {viewMode === 'admin' && (
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            settings={settings}
            onToggleHotspot={handleToggleHotspot}
            onTogglePortal={handleTogglePortal}
            unusedCount={unusedVouchersCount}
            activeCount={activeVouchersCount}
            printQueueCount={printQueueCount}
            blockedCount={blockedDevicesCount}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
            {activeTab === 'dashboard' && (
              <DashboardTab
                vouchers={vouchers}
                devices={devices}
                settings={settings}
                logs={logs}
                setActiveTab={setActiveTab}
                onOpenIssueModal={(mins) => {
                  setQuickIssuePreset(mins || 60);
                  setIsQuickIssueOpen(true);
                }}
                onAllowDevice={handleAllowDevice}
                onBlockDevice={handleBlockDevice}
              />
            )}

            {activeTab === 'issue' && (
              <IssueVoucherTab
                settings={settings}
                onIssueVouchers={handleIssueVouchers}
                onNavigateToPrint={() => setActiveTab('print')}
              />
            )}

            {activeTab === 'vouchers' && (
              <VouchersTab
                vouchers={vouchers}
                settings={settings}
                onUpdateVoucher={handleUpdateVoucher}
                onDeleteVoucher={handleDeleteVoucher}
                onPauseVoucher={handlePauseVoucher}
                onResumeVoucher={handleResumeVoucher}
                onExpireVoucher={handleExpireVoucher}
                onBatchAddToPrint={handleBatchAddToPrint}
                onClearExpired={handleClearExpired}
              />
            )}

            {activeTab === 'devices' && (
              <DevicesFirewallTab
                devices={devices}
                rules={rules}
                settings={settings}
                onAllowDevice={handleAllowDevice}
                onBlockDevice={handleBlockDevice}
                onAddDevice={handleAddDevice}
                onRemoveDevice={handleRemoveDevice}
              />
            )}

            {activeTab === 'print' && (
              <PrintQueueTab
                vouchers={vouchers}
                settings={settings}
                onUpdateVoucher={handleUpdateVoucher}
                onRemoveFromQueue={(id) => handleUpdateVoucher(id, { inPrintQueue: false })}
                onClearQueue={handleClearPrintQueue}
              />
            )}

            {activeTab === 'lcd' && (
              <LcdDisplayTab
                settings={settings}
                setSettings={setSettings}
                activeVouchersCount={activeVouchersCount}
              />
            )}

            {activeTab === 'logs' && (
              <EventLogTab
                logs={logs}
                onClearLogs={() => setLogs([])}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                setSettings={setSettings}
                onResetDatabase={handleResetDatabase}
                onSeedSampleData={handleSeedSampleData}
              />
            )}

            {activeTab === 'python' && <PythonScriptTab />}
          </main>
        </div>
      )}

      {/* Customer Captive Portal Preview Mode */}
      {viewMode === 'portal' && (
        <div className="flex-1 bg-slate-925 overflow-y-auto">
          <CaptivePortal
            settings={settings}
            devices={devices}
            vouchers={vouchers}
            onActivateVoucher={handleActivateVoucher}
            onPauseSession={handlePauseVoucher}
            onResumeSession={handleResumeVoucher}
            onDisconnectDevice={handleBlockDevice}
          />
        </div>
      )}

      {/* Split Mode: Admin Desktop on Left, Customer Portal on Right */}
      {viewMode === 'split' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          <div className="lg:col-span-8 flex overflow-hidden border-r border-slate-800">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              settings={settings}
              onToggleHotspot={handleToggleHotspot}
              onTogglePortal={handleTogglePortal}
              unusedCount={unusedVouchersCount}
              activeCount={activeVouchersCount}
              printQueueCount={printQueueCount}
              blockedCount={blockedDevicesCount}
            />
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950">
              {activeTab === 'dashboard' && (
                <DashboardTab
                  vouchers={vouchers}
                  devices={devices}
                  settings={settings}
                  logs={logs}
                  setActiveTab={setActiveTab}
                  onOpenIssueModal={(mins) => {
                    setQuickIssuePreset(mins || 60);
                    setIsQuickIssueOpen(true);
                  }}
                  onAllowDevice={handleAllowDevice}
                  onBlockDevice={handleBlockDevice}
                />
              )}
              {activeTab === 'issue' && (
                <IssueVoucherTab
                  settings={settings}
                  onIssueVouchers={handleIssueVouchers}
                  onNavigateToPrint={() => setActiveTab('print')}
                />
              )}
              {activeTab === 'vouchers' && (
                <VouchersTab
                  vouchers={vouchers}
                  settings={settings}
                  onUpdateVoucher={handleUpdateVoucher}
                  onDeleteVoucher={handleDeleteVoucher}
                  onPauseVoucher={handlePauseVoucher}
                  onResumeVoucher={handleResumeVoucher}
                  onExpireVoucher={handleExpireVoucher}
                  onBatchAddToPrint={handleBatchAddToPrint}
                  onClearExpired={handleClearExpired}
                />
              )}
              {activeTab === 'devices' && (
                <DevicesFirewallTab
                  devices={devices}
                  rules={rules}
                  settings={settings}
                  onAllowDevice={handleAllowDevice}
                  onBlockDevice={handleBlockDevice}
                  onAddDevice={handleAddDevice}
                  onRemoveDevice={handleRemoveDevice}
                />
              )}
              {activeTab === 'print' && (
                <PrintQueueTab
                  vouchers={vouchers}
                  settings={settings}
                  onUpdateVoucher={handleUpdateVoucher}
                  onRemoveFromQueue={(id) => handleUpdateVoucher(id, { inPrintQueue: false })}
                  onClearQueue={handleClearPrintQueue}
                />
              )}
              {activeTab === 'lcd' && (
                <LcdDisplayTab
                  settings={settings}
                  setSettings={setSettings}
                  activeVouchersCount={activeVouchersCount}
                />
              )}
              {activeTab === 'logs' && (
                <EventLogTab logs={logs} onClearLogs={() => setLogs([])} />
              )}
              {activeTab === 'settings' && (
                <SettingsTab
                  settings={settings}
                  setSettings={setSettings}
                  onResetDatabase={handleResetDatabase}
                  onSeedSampleData={handleSeedSampleData}
                />
              )}
              {activeTab === 'python' && <PythonScriptTab />}
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-925 overflow-y-auto p-4 flex flex-col items-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Customer Mobile View (192.168.137.1)
            </div>
            <CaptivePortal
              settings={settings}
              devices={devices}
              vouchers={vouchers}
              onActivateVoucher={handleActivateVoucher}
              onPauseSession={handlePauseVoucher}
              onResumeSession={handleResumeVoucher}
              onDisconnectDevice={handleBlockDevice}
            />
          </div>
        </div>
      )}

      {/* Quick Issue Modal */}
      <QuickIssueModal
        isOpen={isQuickIssueOpen}
        onClose={() => setIsQuickIssueOpen(false)}
        settings={settings}
        onIssueVouchers={handleIssueVouchers}
        defaultMinutes={quickIssuePreset}
      />
    </div>
  );
}
