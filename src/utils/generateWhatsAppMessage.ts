import { SiteSettings } from '@/types/cms';
import { Voucher } from '@/app/actions/voucher-actions';

export interface WhatsAppMessageProps {
  cart: { name: string; quantity: number; price: number; originalPrice?: number }[];
  profile: { full_name?: string | null; phone?: string | null };
  deliveryMethod: 'delivery' | 'pickup';
  shippingAddress: string;
  shippingNotes?: string;
  subtotal: number;
  promoDiscount: number;
  totalPrice: number;
  shippingFee: number;
  finalTotal: number;
  activeVoucher: Voucher | null;
  siteSettings?: SiteSettings | null;
  t: (key: string, values?: Record<string, any>) => string;
}

export function generateWhatsAppMessage({
  cart,
  profile,
  deliveryMethod,
  shippingAddress,
  shippingNotes,
  subtotal,
  promoDiscount,
  totalPrice,
  shippingFee,
  finalTotal,
  activeVoucher,
  siteSettings,
  t
}: WhatsAppMessageProps): string {
  let message = t('cart.whatsapp.greeting', { store_name: siteSettings?.store_name || "HR-One Donuts" }) + "\n\n";
  message += t('cart.whatsapp.new_order') + "\n";
  message += `-------------------\n`;
  message += t('cart.whatsapp.customer_data') + "\n";
  message += t('cart.whatsapp.name', { name: profile.full_name || "" }) + "\n";
  message += t('cart.whatsapp.wa', { phone: profile.phone || "" }) + "\n";
  
  if (deliveryMethod === 'delivery') {
    message += t('cart.whatsapp.address', { address: shippingAddress }) + "\n";
    if (shippingNotes) {
      message += `Catatan Alamat: ${shippingNotes}\n`;
    }
    message += "\n";
  } else {
    message += "\n";
  }

  message += t('cart.whatsapp.reception') + "\n";
  message += deliveryMethod === 'delivery' ? t('cart.whatsapp.delivery_method') + "\n" : t('cart.whatsapp.pickup_method') + "\n";
  message += `\n`;

  message += t('cart.whatsapp.detail') + "\n";
  
  cart.forEach((item) => {
    message += t('cart.whatsapp.item_line', {
      name: item.name,
      quantity: item.quantity,
      price: item.price.toLocaleString("id-ID"),
      total: (item.price * item.quantity).toLocaleString("id-ID")
    }) + "\n\n";
  });
  
  message += `-------------------\n`;
  
  if (activeVoucher && promoDiscount > 0) {
    message += `Voucher Dipakai: ${activeVoucher.code} (${activeVoucher.title})\n`;
    message += `Subtotal: Rp ${subtotal.toLocaleString("id-ID")}\n`;
    message += `Diskon Promo: -Rp ${promoDiscount.toLocaleString("id-ID")}\n`;
    message += `Total Bersih: Rp ${totalPrice.toLocaleString("id-ID")}\n`;
  } else if (promoDiscount > 0) {
    message += `Subtotal: Rp ${subtotal.toLocaleString("id-ID")}\n`;
    message += `Diskon Promo: -Rp ${promoDiscount.toLocaleString("id-ID")}\n`;
    message += `Total Bersih: Rp ${totalPrice.toLocaleString("id-ID")}\n`;
  } else {
    message += t('cart.whatsapp.subtotal', { amount: totalPrice.toLocaleString("id-ID") }) + "\n";
  }

  if (deliveryMethod === 'delivery') {
    message += t('cart.whatsapp.shipping', { amount: shippingFee.toLocaleString("id-ID") }) + "\n";
  }
  
  message += t('cart.whatsapp.total_payment', { amount: finalTotal.toLocaleString("id-ID") }) + "\n\n";
  message += t('cart.whatsapp.footer', { store_name: siteSettings?.store_name || "HR-One Donuts" });

  return message;
}
