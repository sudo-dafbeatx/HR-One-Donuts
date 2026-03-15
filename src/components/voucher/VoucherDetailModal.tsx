import { Voucher } from "@/app/actions/voucher-actions";
import { XMarkIcon, TagIcon, ClockIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

interface VoucherDetailModalProps {
  voucher: Voucher | null;
  onClose: () => void;
}

export default function VoucherDetailModal({ voucher, onClose }: VoucherDetailModalProps) {
  if (!voucher) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-[env(safe-area-inset-bottom)] sm:pb-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in sm:zoom-in-95 slide-in-from-bottom-full sm:slide-in-from-bottom-0 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <TagIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 leading-tight">Detail Voucher</h3>
              <p className="text-[12px] text-slate-500 font-medium uppercase tracking-widest">{voucher.code}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto p-5 pb-8 space-y-6">
          <div className="text-center bg-linear-to-br from-primary/5 to-blue-500/5 rounded-2xl p-6 border border-primary/10">
            <p className="text-sm font-bold text-slate-500 mb-1">Total Diskon</p>
            <h4 className="text-3xl font-black text-primary">
              {voucher.discount_type === 'percentage' 
                ? `${voucher.discount_value}%` 
                : `Rp ${voucher.discount_value.toLocaleString('id-ID')}`}
            </h4>
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-2">Ketentuan Penggunaan</h4>
            
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-1.5 rounded-lg shrink-0 mt-0.5">
                <InformationCircleIcon className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Minimal Pembelian</p>
                <p className="text-sm text-slate-600">
                  Rp {voucher.min_purchase.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {voucher.max_discount && voucher.discount_type === 'percentage' && (
              <div className="flex items-start gap-3">
                <div className="bg-slate-100 p-1.5 rounded-lg shrink-0 mt-0.5">
                  <InformationCircleIcon className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Maksimal Diskon</p>
                  <p className="text-sm text-slate-600">
                    Rp {voucher.max_discount.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            )}

            {(voucher.start_date || voucher.end_date) && (
              <div className="flex items-start gap-3">
                <div className="bg-slate-100 p-1.5 rounded-lg shrink-0 mt-0.5">
                  <ClockIcon className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Masa Berlaku</p>
                  <p className="text-sm text-slate-600">
                    {voucher.start_date ? new Date(voucher.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Kapan saja'} 
                    {' - '}
                    {voucher.end_date ? new Date(voucher.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tidak ada batas waktu'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* S&K Component / Description */}
          {voucher.description && (
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Syarat & Ketentuan</h4>
              <div className="text-sm text-slate-600 space-y-2 leading-relaxed">
                {/* Parse newlines as line breaks */}
                {voucher.description.split('\n').map((line, i) => (
                  <p key={i} className="flex gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{line}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Sticky footer for mobile */}
        <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 sm:hidden">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
