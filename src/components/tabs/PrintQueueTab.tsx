import React, { useState } from 'react';
import { 
  Printer, 
  Trash2, 
  CheckSquare, 
  Square, 
  LayoutGrid, 
  Receipt, 
  Download,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Voucher, HotspotSettings } from '../../types';
import { VoucherCard } from '../VoucherCard';

interface PrintQueueTabProps {
  vouchers: Voucher[];
  settings: HotspotSettings;
  onUpdateVoucher: (id: string, updates: Partial<Voucher>) => void;
  onRemoveFromQueue: (id: string) => void;
  onClearQueue: () => void;
}

export const PrintQueueTab: React.FC<PrintQueueTabProps> = ({
  vouchers,
  settings,
  onUpdateVoucher,
  onRemoveFromQueue,
  onClearQueue,
}) => {
  const [printLayout, setPrintLayout] = useState<'cards' | 'thermal'>('cards');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const queuedVouchers = vouchers.filter((v) => v.inPrintQueue);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === queuedVouchers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(queuedVouchers.map((v) => v.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMarkPrinted = () => {
    const toRemove = selectedIds.length > 0 ? selectedIds : queuedVouchers.map((v) => v.id);
    toRemove.forEach((id) => {
      onUpdateVoucher(id, { inPrintQueue: false });
    });
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls - Hidden on print */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Print Queue & Voucher Cards</h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate printable voucher batches with QR codes for storefront sales, Sari-Sari stores, and internet cafes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Layout Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setPrintLayout('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                printLayout === 'cards'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Standard Cards</span>
            </button>
            <button
              onClick={() => setPrintLayout('thermal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                printLayout === 'thermal'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Thermal Receipt</span>
            </button>
          </div>

          {queuedVouchers.length > 0 && (
            <>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print ({queuedVouchers.length})</span>
              </button>

              <button
                onClick={handleMarkPrinted}
                className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="Remove from print queue without deleting vouchers"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Printed</span>
              </button>

              <button
                onClick={onClearQueue}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Clear all from print queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Print Preview Area */}
      {queuedVouchers.length === 0 ? (
        <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Printer className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Print Queue is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Generate new vouchers in the "Issue Voucher" tab or click the printer icon on any voucher in "All Vouchers" to queue them for printing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="no-print flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {queuedVouchers.length} cards ready to print</span>
            <span className="font-mono text-slate-500">Page size: A4 / Letter standard sheet</span>
          </div>

          {/* Cards Grid Container (Designed to look great on screen & formatted for browser print) */}
          <div
            className={`p-6 bg-slate-900/60 border border-slate-800 rounded-xl print:bg-white print:border-none print:p-0 ${
              printLayout === 'cards'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-3'
                : 'max-w-xs mx-auto space-y-4 print:max-w-none print:space-y-3'
            }`}
          >
            {queuedVouchers.map((voucher) => (
              <div key={voucher.id} className="relative group">
                <div className="no-print absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onRemoveFromQueue(voucher.id)}
                    className="p-1 bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 rounded text-xs shadow-xs"
                    title="Remove from print batch"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <VoucherCard voucher={voucher} settings={settings} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
