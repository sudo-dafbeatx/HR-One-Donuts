import { Voucher } from "@/app/actions/voucher-actions";

interface OrderSummaryProps {
  subtotal: number;
  promoDiscount: number;
  totalPrice: number;
  shippingFee: number;
  finalTotal: number;
  deliveryMethod: 'delivery' | 'pickup';
  activeVoucher: Voucher | null;
  t: (key: string, values?: Record<string, any>) => string;
}

export default function OrderSummary({
  subtotal,
  promoDiscount,
  totalPrice,
  shippingFee,
  finalTotal,
  deliveryMethod,
  activeVoucher,
  t
}: OrderSummaryProps) {
  return (
    <div className="space-y-3">
      {/* Subtotal */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center">
          <span className="text-[14px] font-normal text-gray-500">{t('cart.subtotal')}</span>
          <div className="flex items-center gap-2">
            {promoDiscount > 0 && (
              <span className="text-[12px] text-gray-400 line-through">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            )}
            <span className={`text-[14px] font-medium ${promoDiscount > 0 ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]'}`}>
              Rp {promoDiscount > 0 ? totalPrice.toLocaleString("id-ID") : subtotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* Diskon Voucher */}
      {promoDiscount > 0 && activeVoucher && (
        <div className="flex justify-between items-center">
          <span className="text-[14px] font-medium text-emerald-600">
            Diskon Voucher <span className="text-emerald-500 font-bold ml-1 text-[12px]">({activeVoucher.code})</span>
          </span>
          <span className="text-[14px] font-bold text-emerald-600">
            - Rp {promoDiscount.toLocaleString("id-ID")}
          </span>
        </div>
      )}

      {/* Ongkir */}
      <div className="flex justify-between items-center">
        <span className="text-[14px] font-normal text-gray-500">
          {t('cart.shipping_fee')} <span className="text-[12px] italic text-gray-400">({deliveryMethod === 'delivery' ? 'Antar' : 'Ambil'})</span>
        </span>
        <span className="text-[14px] font-medium text-[#1a1a1a]">Rp {shippingFee.toLocaleString("id-ID")}</span>
      </div>

      <div className="mx-[-16px] my-3 border-t border-gray-100 border-dashed" />

      {/* Total */}
      <div className="flex justify-between items-end">
        <span className="text-[18px] font-semibold text-[#1a1a1a]">Total Bayar</span>
        <span className="text-[20px] font-black text-primary">
          Rp {finalTotal.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}
