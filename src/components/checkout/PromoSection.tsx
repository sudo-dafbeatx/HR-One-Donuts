import { Voucher } from "@/app/actions/voucher-actions";
import VoucherCard from "../voucher/VoucherCard";

interface PromoSectionProps {
  voucherInput: string;
  setVoucherInput: (val: string) => void;
  onApplyCode: () => void;
  isVoucherLoading: boolean;
  voucherError: string | null;
  publicVouchers: Voucher[];
  onOpenVoucherList: () => void;
}

export default function PromoSection({
  voucherInput,
  setVoucherInput,
  onApplyCode,
  isVoucherLoading,
  voucherError,
  publicVouchers,
  onOpenVoucherList
}: PromoSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* List Voucher Highlight */}
      {publicVouchers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[14px] font-bold text-slate-800">Makin hemat pakai promo!</h4>
            {publicVouchers.length > 1 && (
              <button 
                onClick={onOpenVoucherList}
                className="text-[13px] font-bold text-primary hover:text-primary/80"
              >
                Lihat Semua
              </button>
            )}
          </div>
          
          {/* Tampilkan 1 voucher teratas sebagai Highlight */}
          <VoucherCard 
            voucher={publicVouchers[0]} 
            onClick={onOpenVoucherList}
            compact 
          />
        </div>
      )}

      {/* Manual Code Input */}
      <div className="space-y-2">
        {publicVouchers.length === 0 && (
          <h4 className="text-[14px] font-bold text-slate-800">Punya kode promo?</h4>
        )}
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            value={voucherInput}
            onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
            placeholder="Masukkan kode promo"
            className="w-full bg-[#f5f7fb] border border-gray-200 text-[#1a1a1a] text-[15px] font-medium rounded-2xl px-5 py-3.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none uppercase placeholder:normal-case placeholder:text-gray-400 placeholder:font-normal transition-all"
            onKeyDown={(e) => e.key === 'Enter' && onApplyCode()}
          />
          <button 
            onClick={onApplyCode}
            disabled={!voucherInput.trim() || isVoucherLoading}
            className="w-full bg-[#1a1a1a] text-white rounded-2xl h-[48px] text-[15px] font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
          >
            {isVoucherLoading ? 'Memeriksa...' : 'Terapkan Voucher'}
          </button>
        </div>
        {voucherError && (
          <p className="text-[13px] text-red-500 font-medium px-1 flex items-center gap-1.5 mt-2 animate-fade-in">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {voucherError}
          </p>
        )}
      </div>
    </div>
  );
}
