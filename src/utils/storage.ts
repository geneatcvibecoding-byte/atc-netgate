import { HotspotSettings, Voucher, Device, FirewallRule, EventLog, RatePlan } from '../types';

export const DEFAULT_RATE_PLANS: RatePlan[] = [
  { id: 'quick', name: 'Quick', minutes: 15, price: 5 },
  { id: 'short', name: 'Short', minutes: 30, price: 10 },
  { id: '1hour', name: '1 Hour', minutes: 60, price: 15, popular: true },
  { id: '2hours', name: '2 Hours', minutes: 120, price: 25 },
  { id: '3hours', name: '3 Hours', minutes: 180, price: 35 },
  { id: '6hours', name: '6 Hours', minutes: 360, price: 60 },
  { id: '12hours', name: '12 Hours', minutes: 720, price: 100 },
  { id: '24hours', name: '24 Hours', minutes: 1440, price: 180 },
];

export const DEFAULT_SETTINGS: HotspotSettings = {
  ssid: 'NetGate-WiFi',
  password: 'netgate123',
  voucherPrefix: 'NGT',
  portalIp: '192.168.137.1',
  portalPort: 80,
  currencySymbol: '₱',
  autoBlockNewDevices: true,
  allowPauseResume: true,
  ratePlans: DEFAULT_RATE_PLANS,
  lcdMessage: 'NETGATE WIFI HOTSPOT * HIGH SPEED INTERNET * GET VOUCHER AT COUNTER *',
  lcdTheme: 'green',
  hotspotEnabled: true,
  portalRunning: true,
};

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-1',
    ip: '192.168.137.45',
    mac: '74:D4:35:8A:2B:10',
    hostname: 'iPhone-14-Pro',
    status: 'active_session',
    activeVoucherCode: 'NGT-8F2K',
    connectedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    lastSeen: new Date().toISOString(),
    dataDownloadedMb: 342.5,
    dataUploadedMb: 48.2,
    signalStrength: -58,
  },
  {
    id: 'dev-2',
    ip: '192.168.137.89',
    mac: 'BC:D0:74:12:9E:44',
    hostname: 'Galaxy-S23-Ultra',
    status: 'active_session',
    activeVoucherCode: 'NGT-4M7P',
    connectedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    lastSeen: new Date().toISOString(),
    dataDownloadedMb: 188.1,
    dataUploadedMb: 24.6,
    signalStrength: -62,
  },
  {
    id: 'dev-3',
    ip: '192.168.137.104',
    mac: '52:54:00:8B:A1:C9',
    hostname: 'Redmi-Note-12',
    status: 'blocked',
    connectedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    lastSeen: new Date().toISOString(),
    dataDownloadedMb: 1.2,
    dataUploadedMb: 0.4,
    signalStrength: -74,
  },
  {
    id: 'dev-4',
    ip: '192.168.137.150',
    mac: 'A8:7D:12:F4:33:02',
    hostname: 'MacBookAir-M2',
    status: 'blocked',
    connectedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    lastSeen: new Date().toISOString(),
    dataDownloadedMb: 0.8,
    dataUploadedMb: 0.2,
    signalStrength: -51,
  },
];

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'v-1',
    code: 'NGT-8F2K',
    durationMinutes: 60,
    durationLabel: '1 Hour',
    price: 15,
    status: 'active',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    activatedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 28 * 60 * 1000).toISOString(),
    remainingSeconds: 28 * 60,
    boundIp: '192.168.137.45',
    boundMac: '74:D4:35:8A:2B:10',
    boundHostname: 'iPhone-14-Pro',
    dataUsedMb: 390.7,
    inPrintQueue: false,
  },
  {
    id: 'v-2',
    code: 'NGT-4M7P',
    durationMinutes: 120,
    durationLabel: '2 Hours',
    price: 25,
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    activatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
    remainingSeconds: 105 * 60,
    boundIp: '192.168.137.89',
    boundMac: 'BC:D0:74:12:9E:44',
    boundHostname: 'Galaxy-S23-Ultra',
    dataUsedMb: 212.7,
    inPrintQueue: false,
  },
  {
    id: 'v-3',
    code: 'NGT-3V9X',
    durationMinutes: 30,
    durationLabel: 'Short (30m)',
    price: 10,
    status: 'paused',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    activatedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    pausedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    remainingSeconds: 18 * 60,
    boundIp: '192.168.137.202',
    boundMac: '2C:F0:EE:1A:38:88',
    boundHostname: 'Pixel-7',
    dataUsedMb: 64.2,
    inPrintQueue: false,
  },
  {
    id: 'v-4',
    code: 'NGT-7X9B',
    durationMinutes: 15,
    durationLabel: 'Quick (15m)',
    price: 5,
    status: 'unused',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    remainingSeconds: 15 * 60,
    dataUsedMb: 0,
    inPrintQueue: true,
  },
  {
    id: 'v-5',
    code: 'NGT-9K2L',
    durationMinutes: 60,
    durationLabel: '1 Hour',
    price: 15,
    status: 'unused',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    remainingSeconds: 60 * 60,
    dataUsedMb: 0,
    inPrintQueue: true,
  },
  {
    id: 'v-6',
    code: 'NGT-2H8W',
    durationMinutes: 1440,
    durationLabel: '24 Hours',
    price: 180,
    status: 'unused',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    remainingSeconds: 1440 * 60,
    dataUsedMb: 0,
    inPrintQueue: true,
  },
  {
    id: 'v-7',
    code: 'NGT-1A5Z',
    durationMinutes: 30,
    durationLabel: '30 Min',
    price: 10,
    status: 'expired',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    activatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    remainingSeconds: 0,
    boundIp: '192.168.137.104',
    boundMac: '52:54:00:8B:A1:C9',
    boundHostname: 'Redmi-Note-12',
    dataUsedMb: 114.5,
    inPrintQueue: false,
  },
];

export const INITIAL_RULES: FirewallRule[] = [
  // Device 3 (Blocked device)
  {
    id: 'r-1',
    name: 'ALLOW_192.168.137.104',
    direction: 'Inbound',
    action: 'Allow',
    remoteIp: '192.168.137.104',
    port: '80',
    protocol: 'TCP',
    purpose: 'Portal replies reach the device',
    active: true,
  },
  {
    id: 'r-2',
    name: 'ALLOW_192.168.137.104_out',
    direction: 'Outbound',
    action: 'Allow',
    remoteIp: '192.168.137.104',
    port: '80',
    protocol: 'TCP',
    purpose: 'Device can reach portal on port 80',
    active: true,
  },
  {
    id: 'r-3',
    name: 'BLOCK_192.168.137.104',
    direction: 'Inbound',
    action: 'Block',
    remoteIp: '192.168.137.104',
    protocol: 'Any',
    purpose: 'All other internet traffic blocked',
    active: true,
  },
  {
    id: 'r-4',
    name: 'BLOCK_192.168.137.104_out',
    direction: 'Outbound',
    action: 'Block',
    remoteIp: '192.168.137.104',
    protocol: 'Any',
    purpose: 'All other outbound blocked',
    active: true,
  },
  // Device 4 (Blocked device)
  {
    id: 'r-5',
    name: 'ALLOW_192.168.137.150',
    direction: 'Inbound',
    action: 'Allow',
    remoteIp: '192.168.137.150',
    port: '80',
    protocol: 'TCP',
    purpose: 'Portal replies reach the device',
    active: true,
  },
  {
    id: 'r-6',
    name: 'ALLOW_192.168.137.150_out',
    direction: 'Outbound',
    action: 'Allow',
    remoteIp: '192.168.137.150',
    port: '80',
    protocol: 'TCP',
    purpose: 'Device can reach portal on port 80',
    active: true,
  },
  {
    id: 'r-7',
    name: 'BLOCK_192.168.137.150',
    direction: 'Inbound',
    action: 'Block',
    remoteIp: '192.168.137.150',
    protocol: 'Any',
    purpose: 'All other internet traffic blocked',
    active: true,
  },
  {
    id: 'r-8',
    name: 'BLOCK_192.168.137.150_out',
    direction: 'Outbound',
    action: 'Block',
    remoteIp: '192.168.137.150',
    protocol: 'Any',
    purpose: 'All other outbound blocked',
    active: true,
  },
];

export const INITIAL_LOGS: EventLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    type: 'system',
    level: 'info',
    message: 'NetGate Hotspot Manager v2.4 initialized',
    details: 'Windows Mobile Hotspot gateway detected on 192.168.137.1:80',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 44 * 60 * 1000).toISOString(),
    type: 'portal',
    level: 'success',
    message: 'Captive portal server started on port 80',
    details: 'Bound to http://192.168.137.1:80 successfully',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    type: 'voucher',
    level: 'success',
    message: 'Voucher NGT-8F2K activated for 192.168.137.45 (iPhone-14-Pro)',
    details: 'Duration: 60 minutes. Firewall block rules removed.',
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    type: 'voucher',
    level: 'success',
    message: 'Voucher NGT-4M7P activated for 192.168.137.89 (Galaxy-S23-Ultra)',
    details: 'Duration: 120 minutes. Full internet access granted.',
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    type: 'device',
    level: 'warning',
    message: 'New device connected: 192.168.137.150 (MacBookAir-M2)',
    details: 'Unregistered device. Firewall isolation rules applied.',
  },
  {
    id: 'log-6',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    type: 'firewall',
    level: 'info',
    message: 'Applied 4 Windows Firewall rules for 192.168.137.104',
    details: 'BLOCK_192.168.137.104, ALLOW_192.168.137.104:80',
  },
];

export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`netgate_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Failed to read ${key} from localStorage:`, e);
    return fallback;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`netgate_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to write ${key} to localStorage:`, e);
  }
}

export function generateVoucherCode(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix.toUpperCase()}-${result}`;
}
