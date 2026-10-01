import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Wifi, 
  Shield, 
  DollarSign, 
  Database, 
  Plus, 
  Trash2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { HotspotSettings, RatePlan } from '../../types';
import { DEFAULT_SETTINGS } from '../../utils/storage';

interface SettingsTabProps {
  settings: HotspotSettings;
  setSettings: React.Dispatch<React.SetStateAction<HotspotSettings>>;
  onResetDatabase: () => void;
  onSeedSampleData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  setSettings,
  onResetDatabase,
  onSeedSampleData,
}) => {
  const [formData, setFormData] = useState<HotspotSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRateChange = (index: number, field: keyof RatePlan, value: any) => {
    const updatedRates = [...formData.ratePlans];
    updatedRates[index] = { ...updatedRates[index], [field]: value };
    setFormData((prev) => ({ ...prev, ratePlans: updatedRates }));
  };

  const handleAddRatePlan = () => {
    const newPlan: RatePlan = {
      id: `plan-${Date.now()}`,
      name: '4 Hours',
      minutes: 240,
      price: 45,
    };
    setFormData((prev) => ({ ...prev, ratePlans: [...prev.ratePlans, newPlan] }));
  };

  const handleRemoveRatePlan = (index: number) => {
    const updated = formData.ratePlans.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, ratePlans: updated }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">System & Network Settings</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure Windows Mobile Hotspot SSID, portal gateway address, voucher prefix, and rate tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotspot & Network Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Hotspot Network Parameters</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Hotspot SSID (Network Name)</label>
              <input
                type="text"
                value={formData.ssid}
                onChange={(e) => setFormData({ ...formData, ssid: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Must match your Windows Mobile Hotspot name in Windows Settings.
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Hotspot WPA2 Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Printed on voucher cards for customers to connect to the hotspot.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Captive Portal Gateway IP</label>
                <input
                  type="text"
                  value={formData.portalIp}
                  onChange={(e) => setFormData({ ...formData, portalIp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Default: 192.168.137.1
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Voucher Prefix</label>
                <input
                  type="text"
                  value={formData.voucherPrefix}
                  onChange={(e) => setFormData({ ...formData, voucherPrefix: e.target.value.toUpperCase() })}
                  maxLength={5}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  e.g. NGT &rarr; NGT-XXXX
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-slate-300 font-medium block mb-1">Currency Symbol</label>
              <div className="flex items-center gap-2">
                {['₱', '$', '€', '£', 'Rs'].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setFormData({ ...formData, currencySymbol: curr })}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                      formData.currencySymbol === curr
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center text-xs text-white"
                  placeholder="Custom"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Access Policies & Sessions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Access & Enforcement Policies</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={formData.autoBlockNewDevices}
                onChange={(e) => setFormData({ ...formData, autoBlockNewDevices: e.target.checked })}
                className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Automatic Firewall Quarantine</span>
                <span className="text-[11px] text-slate-400 leading-normal block mt-0.5">
                  Immediately isolate any newly connected device on 192.168.137.x using 4 netsh rules until a valid voucher code is submitted.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={formData.allowPauseResume}
                onChange={(e) => setFormData({ ...formData, allowPauseResume: e.target.checked })}
                className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Allow Session Pause & Resume</span>
                <span className="text-[11px] text-slate-400 leading-normal block mt-0.5">
                  Allows customers to click "Pause Session" in the captive portal so their remaining minutes don't expire while away.
                </span>
              </div>
            </label>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="font-semibold text-slate-200 block mb-2">Database Maintenance</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onSeedSampleData}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg transition-colors font-medium text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Load Demo Fixtures</span>
                </button>
                <button
                  type="button"
                  onClick={onResetDatabase}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 rounded-lg transition-colors font-medium text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Factory Reset Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Duration Tier Plans */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Duration Plans & Pricing Tiers</h3>
          </div>
          <button
            type="button"
            onClick={handleAddRatePlan}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {formData.ratePlans.map((plan, idx) => (
            <div key={plan.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={plan.name}
                  onChange={(e) => handleRateChange(idx, 'name', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold text-xs w-28"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRatePlan(idx)}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded"
                  title="Remove plan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 block">Minutes</label>
                  <input
                    type="number"
                    min={1}
                    value={plan.minutes}
                    onChange={(e) => handleRateChange(idx, 'minutes', parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 block">Price ({formData.currencySymbol})</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={plan.price}
                    onChange={(e) => handleRateChange(idx, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-400 font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
