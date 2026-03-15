import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface VoucherRequirementMessageProps {
  difference: number;
}

export default function VoucherRequirementMessage({ difference }: VoucherRequirementMessageProps) {
  if (difference <= 0) return null;

  return (
    <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-amber-100 p-1.5 rounded-lg shrink-0">
        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <p className="text-[13px] font-bold text-amber-800 leading-tight mb-0.5">Voucher belum berlaku</p>
        <p className="text-[12px] text-amber-700 leading-snug">
          Tambahkan Rp {difference.toLocaleString('id-ID')} lagi untuk menggunakan voucher ini.
        </p>
      </div>
    </div>
  );
}
