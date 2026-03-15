import { Voucher } from "@/app/actions/voucher-actions";
import { TagIcon, ExclamationCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

interface VoucherAppliedBannerProps {
  activeVoucher: Voucher;
  onShowDetail: () => void;
  onRemove: () => void;
}

export default function VoucherAppliedBanner({
  activeVoucher,
  onShowDetail,
  onRemove
}: VoucherAppliedBannerProps) {
  return (
    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex flex-col gap-3">
      {/* Top section: Icon and Title */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 p-1.5 rounded-lg shrink-0">
            <TagIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[12px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Makin Hemat</p>
            <p className="text-[14px] font-bold text-emerald-800 leading-tight">
              Voucher {activeVoucher.code} Aktif
            </p>
          </div>
        </div>
      </div>

      {/* Discount Info */}
      <p className="text-[13px] text-emerald-700 leading-snug">
        Kamu mendapat diskon {activeVoucher.discount_type === 'percentage' 
          ? `${activeVoucher.discount_value}%` 
          : `Rp ${activeVoucher.discount_value.toLocaleString('id-ID')}`} 
        untuk pesanan ini.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={onShowDetail}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white rounded-xl text-[13px] font-bold text-emerald-700 shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-colors"
        >
          <ExclamationCircleIcon className="w-4 h-4" />
          Detail
        </button>
        <button
          onClick={onRemove}
          className="flex items-center justify-center gap-1.5 py-2 px-4 bg-white rounded-xl text-[13px] font-bold text-red-600 shadow-sm border border-red-100 hover:bg-red-50 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          Hapus
        </button>
      </div>
    </div>
  );
}
