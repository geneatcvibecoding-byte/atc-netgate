export type VoucherStatus = 'unused' | 'active' | 'paused' | 'expired';

export interface RatePlan {
  id: string;
  name: string;
  minutes: number;
  price: number;
  popular?: boolean;
}

export interface Voucher {
  id: string;
  code: string;
  durationMinutes: number;
  durationLabel: string;
  price: number;
  status: VoucherStatus;
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  pausedAt?: string;
  remainingSeconds: number;
  boundIp?: string;
  boundMac?: string;
  boundHostname?: string;
  dataUsedMb: number;
  batchId?: string;
  inPrintQueue: boolean;
  notes?: string;
}

export type DeviceStatus = 'blocked' | 'allowed' | 'active_session';

export interface Device {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  status: DeviceStatus;
  activeVoucherCode?: string;
  connectedAt: string;
  lastSeen: string;
  dataDownloadedMb: number;
  dataUploadedMb: number;
  signalStrength: number; // dBm e.g. -54
  isManuallyOverridden?: boolean;
}

export interface FirewallRule {
  id: string;
  name: string;
  direction: 'Inbound' | 'Outbound';
  action: 'Allow' | 'Block';
  remoteIp: string;
  port?: string;
  protocol: string;
  purpose: string;
  active: boolean;
}

export interface EventLog {
  id: string;
  timestamp: string;
  type: 'voucher' | 'firewall' | 'device' | 'portal' | 'system';
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface HotspotSettings {
  ssid: string;
  password: string;
  voucherPrefix: string;
  portalIp: string;
  portalPort: number;
  currencySymbol: string;
  autoBlockNewDevices: boolean;
  allowPauseResume: boolean;
  ratePlans: RatePlan[];
  lcdMessage: string;
  lcdTheme: 'green' | 'blue' | 'amber';
  hotspotEnabled: boolean;
  portalRunning: boolean;
}

export type ViewMode = 'admin' | 'portal' | 'split';
