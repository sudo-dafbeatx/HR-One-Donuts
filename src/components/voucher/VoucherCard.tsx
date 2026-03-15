import { Voucher } from "@/app/actions/voucher-actions";
import { TagIcon } from "@heroicons/react/24/outline";

interface VoucherCardProps {
  voucher: Voucher;
  onClick: () => void;
  compact?: boolean;
}

export default function VoucherCard({ voucher, onClick, compact = false }: VoucherCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border ${compact ? 'border-primary/20 bg-primary/5' : 'border-slate-200'} rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-primary/40 hover:shadow-md transition-all cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
          <TagIcon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-primary uppercase tracking-wider mb-0.5 line-clamp-1">{voucher.code}</p>
          <h4 className="text-[15px] font-bold text-slate-800 leading-tight mb-1 line-clamp-2">
            {voucher.title}
          </h4>
          <p className="text-[13px] text-slate-500 font-medium">
            Diskon {voucher.discount_type === 'percentage' 
              ? `${voucher.discount_value}%` 
              : `Rp ${voucher.discount_value.toLocaleString('id-ID')}`}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Min. Pembelian</span>
          <span className="text-[13px] font-bold text-slate-700">Rp {voucher.min_purchase.toLocaleString('id-ID')}</span>
        </div>
        {!compact && (
          <button className="bg-slate-900 text-white text-[12px] font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Gunakan
          </button>
        )}
      </div>
    </div>
  );
}
