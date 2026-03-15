import { Voucher } from "@/app/actions/voucher-actions";
import { XMarkIcon } from "@heroicons/react/24/outline";
import VoucherCard from "./VoucherCard";
import VoucherRequirementMessage from "./VoucherRequirementMessage";
import { useState } from "react";

interface VoucherListModalProps {
  vouchers: Voucher[];
  subtotal: number;
  onClose: () => void;
  onApplyVoucher: (voucher: Voucher) => void;
}

export default function VoucherListModal({ vouchers, subtotal, onClose, onApplyVoucher }: VoucherListModalProps) {
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);

  const handleClaim = (voucher: Voucher) => {
    setSelectedVoucherId(voucher.id);
    if (subtotal >= voucher.min_purchase) {
      onApplyVoucher(voucher);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-120 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-[env(safe-area-inset-bottom)] sm:pb-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full sm:max-w-md bg-slate-50 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in sm:zoom-in-95 slide-in-from-bottom-full sm:slide-in-from-bottom-0 duration-300 flex flex-col h-[85vh] sm:h-[600px] max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white sticky top-0 z-10 shrink-0">
          <div>
            <h3 className="font-black text-[18px] text-slate-900 leading-tight">Voucher Tersedia</h3>
            <p className="text-[13px] text-slate-500 font-medium">Pilih promo untuk pesananmu</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {vouchers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">confirmation_number</span>
              <p className="font-medium text-sm">Tidak ada voucher tersedia saat ini.</p>
            </div>
          ) : (
            vouchers.map(voucher => {
              const shortfall = voucher.min_purchase - subtotal;
              const isSelectedAndShortfall = selectedVoucherId === voucher.id && shortfall > 0;

              return (
                <div key={voucher.id} className="flex flex-col gap-2">
                  <VoucherCard 
                    voucher={voucher} 
                    onClick={() => handleClaim(voucher)} 
                  />
                  {isSelectedAndShortfall && (
                    <VoucherRequirementMessage difference={shortfall} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
