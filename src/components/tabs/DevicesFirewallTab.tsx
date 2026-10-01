import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  Terminal, 
  Copy, 
  Check, 
  Plus, 
  Smartphone, 
  Radio, 
  Wifi, 
  ArrowRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { Device, FirewallRule, HotspotSettings } from '../../types';

interface DevicesFirewallTabProps {
  devices: Device[];
  rules: FirewallRule[];
  settings: HotspotSettings;
  onAllowDevice: (ip: string) => void;
  onBlockDevice: (ip: string) => void;
  onAddDevice: (device: Partial<Device>) => void;
  onRemoveDevice: (id: string) => void;
}

export const DevicesFirewallTab: React.FC<DevicesFirewallTabProps> = ({
  devices,
  rules,
  settings,
  onAllowDevice,
  onBlockDevice,
  onAddDevice,
  onRemoveDevice,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newHostname, setNewHostname] = useState<string>('Android-Phone');
  const [newIp, setNewIp] = useState<string>(`192.168.137.${Math.floor(Math.random() * 150) + 50}`);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 1800);
  };

  const handleSimulateDevice = () => {
    const randomHex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
    const mac = `${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}`;

    onAddDevice({
      ip: newIp,
      mac,
      hostname: newHostname,
      status: 'blocked',
      connectedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      dataDownloadedMb: 0.1,
      dataUploadedMb: 0.05,
      signalStrength: -65,
    });

    setShowAddModal(false);
    setNewHostname('iPad-Mini');
    setNewIp(`192.168.137.${Math.floor(Math.random() * 150) + 50}`);
  };

  // Generate complete netsh command batch
  const allNetshScript = rules
    .map(
      (r) =>
        `netsh advfirewall firewall add rule name="${r.name}" dir=${r.direction.toLowerCase()} action=${r.action.toLowerCase()} remoteip=${r.remoteIp}${
          r.port ? ` protocol=${r.protocol} ${r.direction === 'Inbound' ? 'localport' : 'remoteport'}=${r.port}` : ''
        }`
    )
    .join('\n');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Devices & Windows Firewall Isolation</h2>
          <p className="text-xs text-slate-400 mt-1">
            Windows Firewall ensures unpaid clients only access the portal ({settings.portalIp}:80) while blocking WAN.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Device Connect</span>
          </button>
        </div>
      </div>

      {/* Firewall Architecture Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">4-Rule Enforcement Logic (Windows Firewall Architecture)</h3>
          </div>
          <button
            onClick={() => copyToClipboard(allNetshScript, 'all-netsh')}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedCmd === 'all-netsh' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>Copy All Netsh Rules</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-cyan-400 font-bold">ALLOW_{`{ip}`}</span>
              <span className="text-[10px] text-emerald-400 font-mono">INBOUND</span>
            </div>
            <div className="text-slate-400 text-[11px]">TCP Port 80</div>
            <div className="text-[10px] text-slate-500">Allows web portal HTTP replies to reach client</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-cyan-400 font-bold">ALLOW_{`{ip}`}_out</span>
              <span className="text-[10px] text-emerald-400 font-mono">OUTBOUND</span>
            </div>
            <div className="text-slate-400 text-[11px]">TCP Port 80</div>
            <div className="text-[10px] text-slate-500">Allows client browser to request captive portal</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-rose-400 font-bold">BLOCK_{`{ip}`}</span>
              <span className="text-[10px] text-rose-400 font-mono">INBOUND</span>
            </div>
            <div className="text-slate-400 text-[11px]">All Protocols / Ports</div>
            <div className="text-[10px] text-slate-500">Blocks inbound external internet to unauthorized device</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-rose-400 font-bold">BLOCK_{`{ip}`}_out</span>
              <span className="text-[10px] text-rose-400 font-mono">OUTBOUND</span>
            </div>
            <div className="text-slate-400 text-[11px]">All WAN Traffic</div>
            <div className="text-[10px] text-slate-500">Blocks DNS, HTTPS, and games outside local portal</div>
          </div>
        </div>
      </div>

      {/* Connected Devices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Active Leases & Connected Devices ({devices.length})</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Subnet: 192.168.137.0/24</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                <th className="py-3 px-4">Device / Hostname</th>
                <th className="py-3 px-4">IP & MAC Address</th>
                <th className="py-3 px-4">Firewall Status</th>
                <th className="py-3 px-4">Active Voucher</th>
                <th className="py-3 px-4">Data Usage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {devices.map((device) => {
                const isOnline = device.status === 'active_session';
                const isAllowed = device.status === 'allowed';
                return (
                  <tr key={device.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{device.hostname}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Signal: {device.signalStrength} dBm</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-cyan-400 font-bold">{device.ip}</div>
                      <div className="text-slate-500 text-[10px]">{device.mac}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        isOnline
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isAllowed
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {isOnline ? 'Online (Voucher)' : isAllowed ? 'Manual Allowed' : 'Firewall Blocked'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {device.activeVoucherCode ? (
                        <span className="text-cyan-400 font-bold">{device.activeVoucherCode}</span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-300">
                      <div>{(device.dataDownloadedMb + device.dataUploadedMb).toFixed(1)} MB</div>
                      <div className="text-[10px] text-slate-500">↓ {device.dataDownloadedMb.toFixed(1)} / ↑ {device.dataUploadedMb.toFixed(1)}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {device.status === 'blocked' ? (
                          <button
                            onClick={() => onAllowDevice(device.ip)}
                            className="px-2.5 py-1 text-[11px] bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded font-semibold transition-colors"
                          >
                            Allow WAN
                          </button>
                        ) : (
                          <button
                            onClick={() => onBlockDevice(device.ip)}
                            className="px-2.5 py-1 text-[11px] bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded font-semibold transition-colors"
                          >
                            Block WAN
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveDevice(device.id)}
                          className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800"
                          title="Disconnect & remove"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Windows Firewall Rules Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Active Windows Firewall Rules ({rules.length})</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Managed via netsh advfirewall</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs">
          {rules.map((rule) => {
            const netshCmd = `netsh advfirewall firewall add rule name="${rule.name}" dir=${rule.direction.toLowerCase()} action=${rule.action.toLowerCase()} remoteip=${rule.remoteIp}${
              rule.port ? ` protocol=${rule.protocol} localport=${rule.port}` : ''
            }`;
            return (
              <div key={rule.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${rule.action === 'Allow' ? 'text-cyan-400' : 'text-rose-400'}`}>
                      {rule.name}
                    </span>
                    <span className="text-[10px] text-slate-500">[{rule.direction}]</span>
                    <span className="text-[10px] text-slate-400">· {rule.purpose}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {netshCmd}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(netshCmd, rule.id)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 shrink-0"
                  title="Copy netsh command"
                >
                  {copiedCmd === rule.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Simulate Device */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Simulate Device Connecting to Hotspot</h3>
            <p className="text-xs text-slate-400">
              Adds a simulated smartphone or laptop connecting to <span className="text-cyan-400">{settings.ssid}</span>. By default, NetGate immediately blocks all external WAN traffic until a voucher is entered in the portal.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Device Hostname</label>
                <input
                  type="text"
                  value={newHostname}
                  onChange={(e) => setNewHostname(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Assigned IP (Hotspot Subnet)</label>
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulateDevice}
                className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg"
              >
                Connect Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
