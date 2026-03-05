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
      className="text-sm font-black w-12 text-center bg-transparent border-none focus:ring-0 text-slate-900! p-0"
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
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60 transition-opacity duration-500 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <aside 
        className={`fixed right-0 top-0 h-dvh w-full max-w-md bg-slate-50 text-slate-900 shadow-2xl z-70 flex flex-col transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Dot Pattern Background */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "28px 28px" }} 
        />

        {/* Header - Refined */}
        <div className="relative z-10 px-6 py-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative size-10 bg-slate-50 rounded-2xl p-2 border border-slate-100 shadow-inner">
              <Image 
                src="/images/logo-hr-one.webp"
                alt="HR-One Donuts"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                {t('cart.title')}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{t('cart.subtitle')}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200 group active:scale-90"
          >
            <XMarkIcon className="w-6 h-6 text-slate-500 group-hover:text-slate-900 transition-colors" />
          </button>
        </div>

        {/* List Content */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-6">
              <div className="size-24 bg-white rounded-4xl shadow-xl shadow-slate-200 flex items-center justify-center border border-slate-100 animate-pulse">
                <ShoppingCartIcon className="w-12 h-12 text-slate-300" />
              </div>
              <div className="space-y-2">
                <p className="font-black text-xl text-slate-900">{t('cart.empty_title')}</p>
                <p className="text-sm font-medium text-slate-400 max-w-[200px] mx-auto leading-relaxed">{t('cart.empty_subtitle')}</p>
              </div>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  window.location.href = "/catalog";
                }}
                className="mt-4 bg-primary text-white px-8 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
              >
                {t('cart.view_catalog')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const effectiveItemPrice = getEffectiveItemPrice(item);
                const hasDiscount = effectiveItemPrice < item.price;
                
                return (
                  <div key={item.id} className="relative group bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 rounded-2xl border border-slate-100 shrink-0 overflow-hidden bg-slate-50 shadow-inner">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          sizes="80px"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Info & Quantity */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-black text-slate-900 text-sm md:text-base leading-tight truncate pr-2">
                              {item.name}
                            </h3>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[10px] md:text-xs font-bold mt-1 inline-flex items-center gap-2">
                            {hasDiscount ? (
                              <>
                                <span className="line-through text-slate-300">Rp {item.price.toLocaleString("id-ID")}</span>
                                <span className="text-green-600 px-2 py-0.5 bg-green-50 rounded-full border border-green-100">Sale</span>
                              </>
                            ) : (
                              <span className="text-slate-500">Harga Satuan: Rp {item.price.toLocaleString("id-ID")}</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Modern Quantity Selector */}
                          <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center text-primary font-black hover:bg-white hover:shadow-sm rounded-lg transition-all"
                            >
                              −
                            </button>
                            <QuantityInput 
                              initialValue={item.quantity} 
                              onUpdate={(val) => setCartQuantity(item.id, val)} 
                            />
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center text-primary font-black hover:bg-white hover:shadow-sm rounded-lg transition-all"
                            >
                              +
                            </button>
                          </div>

                          {/* Price Stack */}
                          <div className="flex flex-col items-end leading-none">
                            {hasDiscount ? (
                              <>
                                <span className="text-[10px] font-bold text-slate-300 line-through mb-1">
                                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                                </span>
                                <span className="text-sm md:text-base font-black text-slate-900">
                                  Rp {(effectiveItemPrice * item.quantity).toLocaleString("id-ID")}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm md:text-base font-black text-slate-900">
                                Rp {(effectiveItemPrice * item.quantity).toLocaleString("id-ID")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* High Contrast Wholesale Info */}
              <div className="mt-8 rounded-[2.5rem] p-6 bg-slate-900 text-white shadow-2xl space-y-5 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-[100px] text-white">loyalty</span>
                </div>
                
                <div className="flex items-center gap-3 border-b border-white/10 pb-4 relative z-10">
                  <div className="size-8 bg-primary rounded-xl flex items-center justify-center rotate-3">
                    <span className="text-slate-900 font-black text-lg">%</span>
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-primary-light">Daftar Harga Grosir</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 relative z-10">
                  {priceTiers.map((tier, idx) => {
                    const isActive = totalDonuts >= tier.min && (!tier.max || totalDonuts <= tier.max);
                    return (
                      <div key={idx} className={`flex justify-between items-center px-5 py-3.5 rounded-2xl transition-all duration-500 ${
                        isActive 
                        ? 'bg-primary text-slate-900 scale-[1.02] shadow-xl shadow-primary/20 ring-1 ring-white/30' 
                        : 'bg-white/5 text-slate-400 border border-white/5'
                      }`}>
                        <span className="flex items-center gap-3 text-xs font-bold leading-none">
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" />}
                          {tier.max ? `${tier.min} - ${tier.max} Pcs` : `> ${tier.min - 1} Pcs`}
                        </span>
                        <span className={`text-sm font-black ${isActive ? 'text-slate-900' : 'text-slate-200'}`}>
                          Rp {tier.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 text-center font-medium leading-relaxed italic relative z-10">
                  * Sistem otomatis menarik harga terbaik sesuai jumlah pesanan Anda.
                </p>
              </div>

              {/* Delivery Method */}
              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <span className="material-symbols-outlined text-primary text-lg">local_shipping</span>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('cart.delivery_method_title')}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-300 gap-2 relative overflow-hidden ${
                      deliveryMethod === 'delivery' 
                      ? 'border-primary bg-white text-primary shadow-lg shadow-primary/5' 
                      : 'border-white bg-white/50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {deliveryMethod === 'delivery' && (
                      <div className="absolute top-2 right-2 size-2 bg-primary rounded-full" />
                    )}
                    <span className="material-symbols-outlined text-3xl">local_shipping</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('cart.delivery')}</span>
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-300 gap-2 relative overflow-hidden ${
                      deliveryMethod === 'pickup' 
                      ? 'border-primary bg-white text-primary shadow-lg shadow-primary/5' 
                      : 'border-white bg-white/50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {deliveryMethod === 'pickup' && (
                      <div className="absolute top-2 right-2 size-2 bg-primary rounded-full" />
                    )}
                    <span className="material-symbols-outlined text-3xl">storefront</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('cart.pickup')}</span>
                  </button>
                </div>

              </div>

              <div className="h-6" />
            </div>
          )}
        </div>

        {/* Compact Sticky Footer - Refined */}
        {cart.length > 0 && (
          <div className="relative z-20 p-6 bg-white border-t border-slate-100 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.1)]">
            <div className="space-y-2 mb-6 px-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-widest">{t('cart.subtotal')}</span>
                <span className="text-sm font-black text-slate-900">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
                <div className="flex flex-col items-end gap-1 mb-2">
                  <div className="flex justify-between items-center text-slate-400 w-full">
                    <span className="text-xs font-bold uppercase tracking-widest">{t('cart.shipping_fee')}</span>
                    <span className="text-sm font-black text-slate-900">Rp {shippingFee.toLocaleString("id-ID")}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold italic text-right leading-tight">
                    {deliveryMethod === 'delivery' ? t('cart.shipping_note') : t('cart.pickup_note')}
                  </p>
                </div>
              <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">ESTIMASI TOTAL</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                    Rp {finalTotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 mb-0.5">TOTAL ITEM</span>
                  <span className="text-sm font-black text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{totalDonuts} Pcs</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleWhatsAppOrder}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-[#111827] rounded-3xl py-4 flex flex-col items-center justify-center gap-0.5 transition-all shadow-xl shadow-[#25D366]/30 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              
              <div className="flex items-center gap-3 font-black text-lg uppercase tracking-tight text-[#111827] relative z-10">
                <svg className="w-6 h-6 fill-[#111827]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793 0-.852.448-1.271.607-1.445.159-.173.346-.217.462-.217h.332c.101 0 .23.036.332.274.116.273.39.954.423 1.025.033.072.054.156.007.251-.047.094-.072.156-.144.239-.072.083-.151.185-.216.249-.072.072-.147.151-.063.294.083.144.368.607.789.982.541.483 1.002.632 1.144.704.144.072.23.063.315-.033.085-.097.368-.427.466-.572.101-.144.202-.123.332-.076.13.047.823.39.966.462.144.072.239.108.274.17.036.062.036.357-.108.762zM12 1a10.89 10.89 0 00-11 11c0 2.187.625 4.22 1.707 5.956L1 23l5.241-1.374A10.84 10.84 0 0012 23c6.075 0 11-4.925 11-11S18.075 1 12 1z"/>
                </svg>
                {t('cart.whatsapp_cta')}
              </div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-black text-slate-800/60 relative z-10 transition-opacity">
                {t('cart.whatsapp_note')}
              </span>
            </button>
            <p className="mt-4 text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest px-8 leading-relaxed">
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col scale-in-95 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="bg-amber-500/5 p-10 flex flex-col items-center justify-center text-center">
              <div className="size-24 bg-amber-500 text-slate-900 rounded-4xl flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/40 rotate-3">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Alamat Belum Lengkap</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed">
                Untuk jasa pengiriman, mohon lengkapi alamat detail Anda di profil agar kurir kami tidak bingung. 🍩
              </p>
            </div>
            
            <div className="p-8 space-y-4 bg-white">
              <button
                onClick={() => {
                  window.location.href = "/settings/address";
                }}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                <span>Lengkapi Sekarang</span>
                <span className="material-symbols-outlined font-black">arrow_forward</span>
              </button>
              
              <button
                onClick={() => setShowProfileAlert(false)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-400 font-black py-4 rounded-2xl transition-colors uppercase tracking-[0.2em] text-[10px]"
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
