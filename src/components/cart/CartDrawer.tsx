'use client';

import { useCart } from "@/context/CartContext";
import { useLoading } from "@/context/LoadingContext";
import { useErrorPopup } from "@/context/ErrorPopupContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import { XMarkIcon, ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";

import { SiteSettings } from "@/types/cms";
import { getCurrentUserProfile, createOrder, getUserActiveAddress } from "@/app/actions/order-actions";
import { useRouter, usePathname } from "next/navigation";
import CheckoutAnimation from "./CheckoutAnimation";
import { useTranslation } from "@/context/LanguageContext";

interface CartProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  address_detail?: string | null;
  district_name?: string | null;
  city_name?: string | null;
  province_name?: string | null;
}

// Sub-component to handle quantity input localized state
function QuantityInput({ initialValue, onUpdate }: { initialValue: number, onUpdate: (val: number) => void }) {
  const [inputValue, setInputValue] = useState(initialValue.toString());

  // Sync when initialValue changes from outside (e.g. +/- buttons)
  useEffect(() => {
    setInputValue(initialValue.toString());
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Only update parent if it's a valid number > 0
    const parsed = parseInt(val);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdate(parsed);
    }
  };

  const handleBlur = () => {
    // On blur, if empty or invalid, reset to current cart value
    if (inputValue === "" || parseInt(inputValue) <= 0 || isNaN(parseInt(inputValue))) {
      setInputValue(initialValue.toString());
    }
  };

  return (
    <input 
      type="number" 
      min="1"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className="text-sm font-black w-12 text-center bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 p-0"
    />
  );
}

export default function CartDrawer({ siteSettings }: { siteSettings?: SiteSettings }) {
  const { cart, updateQuantity, setCartQuantity, totalPrice, totalDonuts, isCartOpen, setIsCartOpen, removeFromCart, clearCart, getEffectiveItemPrice, priceTiers } = useCart();
  const { setIsLoading } = useLoading();
  const { showError } = useErrorPopup();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showCheckoutAnim, setShowCheckoutAnim] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');

  const shippingFee = (deliveryMethod === 'delivery' && totalDonuts <= 36) ? (siteSettings?.shipping_fee || 0) : 0;
  const finalTotal = totalPrice + shippingFee;

  // We use totalDonuts from useCart for pricing logic and order records
  // totalItems from useCart can be used for the physical item count if needed

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Handle Back Button for Drawer (Mobile focus) without cascading state renders
  useEffect(() => {
    if (!mounted) return;

    const handlePopState = () => {
      // Direct DOM/state manipulation outside of React's render cycle
      if (document.body.style.overflow === 'hidden') {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      window.history.pushState({ drawer: 'cart' }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Fallback cleanup if unmounted while open
      if (isCartOpen && window.history.state?.drawer === 'cart') {
        window.history.back();
      }
    };
  }, [isCartOpen, setIsCartOpen, mounted]);

  if (!mounted) return null;

  const handleWhatsAppOrder = async () => {
    setIsLoading(true, t('cart.processing'));
    
    try {
      // 1. Check Auth & Get Profile (auto-creates if missing)
      const profile = await getCurrentUserProfile() as CartProfile | null;
      
      if (!profile) {
        setIsLoading(false);
        setIsCartOpen(false);
        router.push("/login?redirect=/");
        return;
      }

      // Pre-calculate full address from profile as legacy/backup
      const province = profile.province_name || "";
      const city = profile.city_name || "";
      const district = profile.district_name || "";
      const detail = profile.address_detail || profile.address || "";
      const profileAddressStr = [detail, district, city, province].filter(Boolean).join(", ");

      let finalShippingAddress = undefined;
      let finalShippingNotes = undefined;

      if (deliveryMethod === 'delivery') {
        const activeAddress = await getUserActiveAddress();
        
        if (!activeAddress) {
          setIsLoading(false);
          setShowProfileAlert(true);
          return;
        }

        finalShippingNotes = activeAddress.additional_details;

        // Construct full address from user_addresses table structure - detailed version
        finalShippingAddress = [
          activeAddress.building_name,
          activeAddress.street_name + (activeAddress.house_no ? ` No. ${activeAddress.house_no}` : ""),
          activeAddress.district,
          activeAddress.city,
          activeAddress.province,
          activeAddress.postal_code
        ].filter(Boolean).map(s => s.trim()).filter(s => s !== "" && s !== ",").join(", ");
      }

      // 3. Save Order to Database
      await createOrder({
        total_amount: finalTotal,
        total_items: totalDonuts,
        delivery_method: deliveryMethod,
        shipping_fee: shippingFee,
        shipping_address: finalShippingAddress,
        shipping_address_notes: finalShippingNotes,
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          price: getEffectiveItemPrice(item),
          quantity: item.quantity,
          image: item.image
        }))
      });

      // Update fullAddress for WA message
      const fullAddressForWA = finalShippingAddress || profileAddressStr;

      // 4. Generate WhatsApp Message
      const rawPhone = siteSettings?.whatsapp_number || process.env.NEXT_PUBLIC_CONTACT_WA_NUMBER || "6285810658117";
      const phone = rawPhone.replace(/\D/g, ""); // Ensure digits only
      
      let message = t('cart.whatsapp.greeting', { store_name: siteSettings?.store_name || "HR-One Donuts" }) + "\n\n";
      message += t('cart.whatsapp.new_order') + "\n";
      message += `-------------------\n`;
      message += t('cart.whatsapp.customer_data') + "\n";
      message += t('cart.whatsapp.name', { name: profile.full_name || "" }) + "\n";
      message += t('cart.whatsapp.wa', { phone: profile.phone || "" }) + "\n";
      
      if (deliveryMethod === 'delivery') {
        message += t('cart.whatsapp.address', { address: fullAddressForWA }) + "\n";
        if (finalShippingNotes) {
          message += `Catatan Alamat: ${finalShippingNotes}\n`;
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
        const effectivePrice = getEffectiveItemPrice(item);
        message += t('cart.whatsapp.item_line', {
          name: item.name,
          quantity: item.quantity,
          price: effectivePrice.toLocaleString("id-ID"),
          total: (effectivePrice * item.quantity).toLocaleString("id-ID")
        }) + "\n\n";
      });
      
      message += `-------------------\n`;
      
      const rawSubtotal = cart.reduce((sum, item) => sum + getEffectiveItemPrice(item) * item.quantity, 0);
      const promoDiscount = rawSubtotal - totalPrice;

      if (promoDiscount > 0) {
        message += `Subtotal: Rp ${rawSubtotal.toLocaleString("id-ID")}\n`;
        message += `Diskon Promo: -Rp ${promoDiscount.toLocaleString("id-ID")}\n`;
        message += `Total Bersih: Rp ${totalPrice.toLocaleString("id-ID")}\n`;
      } else {
        message += t('cart.whatsapp.subtotal', { amount: totalPrice.toLocaleString("id-ID") }) + "\n";
      }
      if (deliveryMethod === 'delivery') {
        message += t('cart.whatsapp.shipping', { amount: shippingFee.toLocaleString("id-ID") }) + "\n";
      }
      message += t('cart.whatsapp.total_payment', { amount: finalTotal.toLocaleString("id-ID") }) + "\n\n";
      
      // Add OFF-HOURS NOTE if outside of Senin-Sabtu, 08:00-17:00 WIB
      const wibOptions = { timeZone: 'Asia/Jakarta' };
      const now = new Date();
      
      const currentDay = now.getDay(); 
      const wibHourString = now.toLocaleTimeString('en-US', { ...wibOptions, hour12: false, hour: '2-digit' });
      const currentHour = parseInt(wibHourString.split(':')[0], 10);
      
      const isOffHours = currentDay === 0 || currentHour < 8 || currentHour >= 17;
      
      if (isOffHours) {
        message += "*Catatan:* Pesanan diterima di luar jam operasional. Kami akan memproses pesanan Anda pada jam kerja berikutnya (Senin - Sabtu, 08.00 - 17.00 WIB).\n\n";
      }

      message += t('cart.whatsapp.footer');
      
      const encodedMessage = encodeURIComponent(message);
      
      setIsLoading(false); 
      setShowCheckoutAnim(true); 
      
      await new Promise(r => setTimeout(r, 2000)); 
      
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
      
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = whatsappUrl;
      } else {
        window.open(whatsappUrl, "_blank");
      }
      
      setShowCheckoutAnim(false);
      clearCart();
      setIsCartOpen(false);

    } catch (error: unknown) {
      console.error('Order error:', error);
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : t('cart.error_generic');
      showError('Checkout Gagal', errorMessage);
    }
  };

  if (pathname && (pathname.startsWith('/terms') || pathname.startsWith('/privacy') || pathname.startsWith('/cookies'))) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-60 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <aside 
        className={`fixed right-0 top-0 h-dvh w-full max-w-md bg-background text-foreground shadow-2xl z-70 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
              <div className="relative size-8">
                <Image 
                  src="/images/logo-hr-one.webp"
                  alt="HR-One Donuts"
                  fill
                  className="object-contain"
                />
              </div>
              {t('cart.title')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('cart.subtitle')}</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
              <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <ShoppingCartIcon className="w-10 h-10 text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">{t('cart.empty_title')}</p>
                <p className="text-sm text-slate-500 mt-1">{t('cart.empty_subtitle')}</p>
              </div>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  window.location.href = "/catalog";
                }}
                className="mt-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all"
              >
                {t('cart.view_catalog')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => {
                const effectiveItemPrice = getEffectiveItemPrice(item);
                const hasDiscount = effectiveItemPrice < item.price;
                
                return (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="relative w-20 h-20 rounded-lg border border-slate-100 dark:border-slate-800 shrink-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-bold text-foreground wrap-break-word leading-tight">{item.name}</p>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium tracking-tight">
                        {hasDiscount ? (
                          <>
                            <span className="line-through text-slate-400 mr-1 text-[10px]">Rp {item.price.toLocaleString("id-ID")}</span>
                            <span className="text-green-600 font-bold">Rp {effectiveItemPrice.toLocaleString("id-ID")} / pcs</span>
                          </>
                        ) : (
                          <>Rp {item.price.toLocaleString("id-ID")} / pcs</>
                        )}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-primary font-bold hover:bg-primary/10 rounded-md transition-colors"
                          >
                            -
                          </button>
                          <QuantityInput 
                            initialValue={item.quantity} 
                            onUpdate={(val) => setCartQuantity(item.id, val)} 
                          />
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-primary font-bold hover:bg-primary/10 rounded-md transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Rp {(effectiveItemPrice * item.quantity).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bulk Discount Tiers / Info Banner (High Contrast) */}
          {cart.length > 0 && (
            <div className="rounded-3xl p-5 bg-slate-900 dark:bg-slate-800 text-white shadow-2xl space-y-4 border-2 border-primary/30">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="text-2xl">💰</span>
                <p className="text-xs font-black uppercase tracking-widest text-primary-light">Daftar Harga Grosir</p>
              </div>
              <div className="grid grid-cols-1 gap-2.5 text-xs font-bold font-mono">
                {priceTiers.map((tier, idx) => {
                  const isActive = totalDonuts >= tier.min && (!tier.max || totalDonuts <= tier.max);
                  return (
                    <div key={idx} className={`flex justify-between items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive ? 'bg-primary text-[#111827] scale-[1.03] shadow-lg shadow-primary/40 ring-2 ring-white/20' : 'bg-white/5 text-slate-400'
                    }`}>
                      <span className="flex items-center gap-2">
                        {isActive && <span className="w-2 h-2 rounded-full bg-[#111827] animate-pulse" />}
                        {tier.max ? `${tier.min} - ${tier.max} Pcs` : `> ${tier.min - 1} Pcs`}
                      </span>
                      <span className={isActive ? 'text-[#111827] text-lg font-black' : 'text-amber-500/70'}>
                        Rp {tier.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
                ☕ *Harga di atas berlaku untuk pembelian donat eceran. Sistem otomatis menghitung harga terbaik untuk Anda.
              </p>
            </div>
          )}

          {/* Delivery Method Selection */}
          {cart.length > 0 && (
            <div className="pt-2 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('cart.delivery_method_title')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1.5 ${
                    deliveryMethod === 'delivery' 
                    ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                    : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">local_shipping</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('cart.delivery')}</span>
                </button>
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1.5 ${
                    deliveryMethod === 'pickup' 
                    ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                    : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">storefront</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('cart.pickup')}</span>
                </button>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="bg-slate-800 dark:bg-slate-900 p-3 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-white italic text-center leading-relaxed">
                    {t('cart.shipping_note')}
                  </p>
                </div>
              )}
              {deliveryMethod === 'pickup' && (
                <div className="bg-slate-800 dark:bg-slate-900 p-3 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-white italic text-center leading-relaxed whitespace-pre-line">
                    {t('cart.pickup_note')}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Bottom spacer to prevent content from being hidden by sticky footer */}
          {cart.length > 0 && <div className="h-40 md:h-20" />}
        </div>

        {/* Compact Sticky Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/10 shadow-[0_-15px_30px_-10px_rgba(0,0,0,0.15)] mt-auto sticky bottom-0 z-30">
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-medium">{t('cart.subtotal')}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-medium">{t('cart.shipping_fee')}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Rp {shippingFee.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-black text-black dark:text-white uppercase tracking-tight">{t('cart.total_estimate')}</span>
                <span className="text-xl font-black text-black dark:text-white">Rp {finalTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button 
              onClick={handleWhatsAppOrder}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-[#111827] rounded-xl py-3.5 flex flex-col items-center justify-center gap-0.5 transition-all shadow-lg shadow-[#25D366]/20 active:scale-[0.97]"
            >
              <div className="flex items-center gap-2 font-black text-base uppercase tracking-tight text-[#111827]">
                <svg className="w-5 h-5 fill-[#111827]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793 0-.852.448-1.271.607-1.445.159-.173.346-.217.462-.217h.332c.101 0 .23.036.332.274.116.273.39.954.423 1.025.033.072.054.156.007.251-.047.094-.072.156-.144.239-.072.083-.151.185-.216.249-.072.072-.147.151-.063.294.083.144.368.607.789.982.541.483 1.002.632 1.144.704.144.072.23.063.315-.033.085-.097.368-.427.466-.572.101-.144.202-.123.332-.076.13.047.823.39.966.462.144.072.239.108.274.17.036.062.036.357-.108.762zM12 1a10.89 10.89 0 00-11 11c0 2.187.625 4.22 1.707 5.956L1 23l5.241-1.374A10.84 10.84 0 0012 23c6.075 0 11-4.925 11-11S18.075 1 12 1z"/>
                </svg>
                {t('cart.whatsapp_cta')}
              </div>
              <span className="text-[9px] tracking-widest uppercase opacity-90 font-black text-[#1F2937]">{t('cart.whatsapp_note')}</span>
            </button>
            <p className="mt-2 text-[9px] text-center text-slate-400 dark:text-slate-500 font-medium">
              {t('cart.service_area')}
            </p>
          </div>
        )}
      </aside>

      {/* Checkout Animation Overlay */}
      {showCheckoutAnim && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-white/95 backdrop-blur-sm animate-fade-in">
          <CheckoutAnimation />
        </div>
      )}

      {/* Profile Completeness Alert Overlay */}
      {showProfileAlert && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col scale-in-95 animate-in zoom-in-95 duration-200">
            <div className="bg-amber-500/10 p-8 flex flex-col items-center justify-center text-center">
              <div className="size-20 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-500/40">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Alamat Belum Lengkap</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Untuk jasa pengiriman, mohon lengkapi alamat detail Anda di profil agar kurir kami tidak bingung.
              </p>
            </div>
            
            <div className="p-8 space-y-4 bg-white dark:bg-slate-900">
              <button
                onClick={() => {
                  window.location.href = "/settings/address";
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
              >
                <span>Lengkapi Sekarang</span>
                <svg className="w-5 h-5 font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              
              <button
                onClick={() => setShowProfileAlert(false)}
                className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 font-bold py-3.5 rounded-xl transition-colors uppercase tracking-widest text-[10px]"
              >
                Kembali ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
