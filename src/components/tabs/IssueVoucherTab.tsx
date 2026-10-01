import React, { useState } from 'react';
import { 
  Ticket, 
  Sparkles, 
  Clock, 
  DollarSign, 
  Printer, 
  Check, 
  Copy,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { HotspotSettings, RatePlan, Voucher } from '../../types';
import { VoucherCard } from '../VoucherCard';
import { generateVoucherCode } from '../../utils/storage';
import { formatDuration } from '../../utils/qr';

interface IssueVoucherTabProps {
  settings: HotspotSettings;
  onIssueVouchers: (newVouchers: Voucher[]) => void;
  onNavigateToPrint: () => void;
}

export const IssueVoucherTab: React.FC<IssueVoucherTabProps> = ({
  settings,
  onIssueVouchers,
  onNavigateToPrint,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1hour');
  const [customMinutes, setCustomMinutes] = useState<number>(60);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customPrice, setCustomPrice] = useState<number>(15);
  const [quantity, setQuantity] = useState<number>(1);
  const [addToPrintQueue, setAddToPrintQueue] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const [recentlyIssued, setRecentlyIssued] = useState<Voucher[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const selectedPlan = settings.ratePlans.find((p) => p.id === selectedPlanId);

  const activeMinutes = isCustom ? customMinutes : (selectedPlan?.minutes || 60);
  const activePrice = isCustom ? customPrice : (selectedPlan?.price || 15);
  const activeLabel = isCustom ? formatDuration(customMinutes) : (selectedPlan?.name || '1 Hour');

  // Live preview voucher dummy
  const previewVoucher: Voucher = {
    id: 'preview-id',
    code: `${settings.voucherPrefix}-PREV`,
    durationMinutes: activeMinutes,
    durationLabel: activeLabel,
    price: activePrice,
    status: 'unused',
    createdAt: new Date().toISOString(),
    remainingSeconds: activeMinutes * 60,
    dataUsedMb: 0,
    inPrintQueue: addToPrintQueue,
  };

  const handleGenerate = (andPrint: boolean = false) => {
    const batchId = `batch-${Date.now()}`;
    const generated: Voucher[] = [];

    for (let i = 0; i < quantity; i++) {
      const code = generateVoucherCode(settings.voucherPrefix);
      generated.push({
        id: `v-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        code,
        durationMinutes: activeMinutes,
        durationLabel: activeLabel,
        price: activePrice,
        status: 'unused',
        createdAt: new Date().toISOString(),
        remainingSeconds: activeMinutes * 60,
        dataUsedMb: 0,
        batchId,
        inPrintQueue: addToPrintQueue || andPrint,
        notes: notes || undefined,
      });
    }

    onIssueVouchers(generated);
    setRecentlyIssued(generated);

    if (andPrint) {
      onNavigateToPrint();
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-xl font-bold text-white tracking-tight">Issue WiFi Vouchers</h2>
        <p className="text-xs text-slate-400 mt-1">
          Generate prepaid access codes with automated Windows Firewall session enforcement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          {/* Plan Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Duration Plan
              </label>
              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                {isCustom ? 'Use Presets' : 'Custom Duration'}
              </button>
            </div>

            {!isCustom ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {settings.ratePlans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-xs'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold truncate flex items-center justify-between">
                        <span>{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[9px] font-normal text-cyan-400">HOT</span>
                        )}
                      </div>
                      <div className="text-lg font-black font-mono text-cyan-400 mt-1">
                        {settings.currencySymbol}{plan.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {plan.minutes} mins
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={43200}
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white font-mono"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    = {formatDuration(customMinutes)}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Price ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white font-mono"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Rate per voucher
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quantity & Print Queue Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Quantity to Generate
              </label>
              <div className="flex items-center gap-2">
                {[1, 5, 10, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuantity(num)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                      quantity === num
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Print Queue
              </label>
              <label className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={addToPrintQueue}
                  onChange={(e) => setAddToPrintQueue(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-xs text-slate-300 font-medium">Add to batch print queue</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
            >
              <Ticket className="w-4 h-4" />
              <span>Generate {quantity} Voucher{quantity > 1 ? 's' : ''}</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenerate(true)}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Generate & Go to Print</span>
            </button>
          </div>

          {/* Recently Issued List */}
          {recentlyIssued.length > 0 && (
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Successfully Issued ({recentlyIssued.length})
                </span>
                <span className="font-mono text-slate-500">Ready to sell</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                {recentlyIssued.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 text-xs">
                    <div className="font-mono font-bold text-cyan-400 tracking-wider">
                      {v.code}
                    </div>
                    <div className="text-slate-400">
                      {v.durationLabel} · {settings.currencySymbol}{v.price.toFixed(2)}
                    </div>
                    <button
                      onClick={() => copyToClipboard(v.code)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                      title="Copy Code"
                    >
                      {copiedCode === v.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Card Preview Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="font-bold uppercase tracking-wider">Live Card Preview</span>
            <span className="text-[10px] font-mono text-slate-500">Format: Standard 3x2"</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-center">
            <VoucherCard voucher={previewVoucher} settings={settings} />
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            The customer will connect to <span className="text-slate-300 font-mono font-medium">{settings.ssid}</span> and enter this code at <span className="text-slate-300 font-mono font-medium">{settings.portalIp}</span> or scan the QR code.
          </p>
        </div>
      </div>
    </div>
  );
};
