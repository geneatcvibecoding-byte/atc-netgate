import React, { useState } from 'react';
import { X, Ticket, Clock, Check } from 'lucide-react';
import { HotspotSettings, Voucher } from '../types';
import { generateVoucherCode } from '../utils/storage';
import { formatDuration } from '../utils/qr';

interface QuickIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: HotspotSettings;
  onIssueVouchers: (newVouchers: Voucher[]) => void;
  defaultMinutes?: number;
}

export const QuickIssueModal: React.FC<QuickIssueModalProps> = ({
  isOpen,
  onClose,
  settings,
  onIssueVouchers,
  defaultMinutes = 60,
}) => {
  if (!isOpen) return null;

  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    const found = settings.ratePlans.find((p) => p.minutes === defaultMinutes);
    return found ? found.id : '1hour';
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [addToPrint, setAddToPrint] = useState<boolean>(true);

  const plan = settings.ratePlans.find((p) => p.id === selectedPlanId) || settings.ratePlans[0];

  const handleCreate = () => {
    const generated: Voucher[] = [];
    const batchId = `quick-${Date.now()}`;

    for (let i = 0; i < quantity; i++) {
      generated.push({
        id: `v-quick-${Date.now()}-${i}`,
        code: generateVoucherCode(settings.voucherPrefix),
        durationMinutes: plan.minutes,
        durationLabel: plan.name,
        price: plan.price,
        status: 'unused',
        createdAt: new Date().toISOString(),
        remainingSeconds: plan.minutes * 60,
        dataUsedMb: 0,
        batchId,
        inPrintQueue: addToPrint,
      });
    }

    onIssueVouchers(generated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Quick Issue Voucher</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Select Plan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {settings.ratePlans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    selectedPlanId === p.id
                      ? 'bg-cyan-500/10 border-cyan-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-cyan-400 font-mono font-bold text-sm mt-0.5">
                    {settings.currencySymbol}{p.price.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Count
              </label>
              <div className="flex items-center gap-1">
                {[1, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuantity(num)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold border transition-colors ${
                      quantity === num
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Print Queue
              </label>
              <label className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={addToPrint}
                  onChange={(e) => setAddToPrint(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500"
                />
                <span className="text-xs text-slate-300">Add to queue</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs text-slate-400 hover:text-white rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="px-4 py-2 text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg shadow-xs"
          >
            Issue Now ({quantity}x)
          </button>
        </div>
      </div>
    </div>
  );
};
