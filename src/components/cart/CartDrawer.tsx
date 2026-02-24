'use client';

import { useCart } from "@/context/CartContext";
import { useLoading } from "@/context/LoadingContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import { XMarkIcon, ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";

import { SiteSettings } from "@/types/cms";
import { getCurrentUserProfile, createOrder } from "@/app/actions/order-actions";
import { useRouter } from "next/navigation";
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

export default function CartDrawer({ siteSettings }: { siteSettings?: SiteSettings }) {
  const { cart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen, removeFromCart, clearCart } = useCart();
  const { setIsLoading } = useLoading();
  const { t } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showCheckoutAnim, setShowCheckoutAnim] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');

  const shippingFee = deliveryMethod === 'delivery' ? (siteSettings?.shipping_fee || 0) : 0;
  const finalTotal = totalPrice + shippingFee;

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

      // 2. Validate Profile Completeness
      const address = profile.address_detail || profile.address;
      const isProfileComplete = profile.full_name && profile.phone && address;
      
      if (!isProfileComplete) {
        setIsLoading(false);
        setShowProfileAlert(true);
        return;
      }

      // 3. Save Order to Database (this also tracks sales volume internally)
      await createOrder({
        total_amount: finalTotal,
        total_items: cart.reduce((sum, item) => sum + item.quantity, 0),
        delivery_method: deliveryMethod,
        shipping_fee: shippingFee,
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      });

      // 4. Generate WhatsApp Message
      const rawPhone = siteSettings?.whatsapp_number || process.env.NEXT_PUBLIC_CONTACT_WA_NUMBER || "62895351251395";
      const phone = rawPhone.replace(/\D/g, ""); // Ensure digits only
      
      let message = t('cart.whatsapp.greeting', { store_name: siteSettings?.store_name || "HR-One Donuts" }) + "\n\n";
      message += t('cart.whatsapp.new_order') + "\n";
      message += `-------------------\n`;
      message += t('cart.whatsapp.customer_data') + "\n";
      message += t('cart.whatsapp.name', { name: profile.full_name || "" }) + "\n";
      message += t('cart.whatsapp.wa', { phone: profile.phone || "" }) + "\n";
      
      // Complete address handling
      const province = profile.province_name || "";
      const city = profile.city_name || "";
      const district = profile.district_name || "";
      const detail = profile.address_detail || profile.address || "";
      
      const fullAddress = [detail, district, city, province].filter(Boolean).join(", ");
      message += t('cart.whatsapp.address', { address: fullAddress }) + "\n\n";

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
      message += t('cart.whatsapp.subtotal', { amount: totalPrice.toLocaleString("id-ID") }) + "\n";
      if (deliveryMethod === 'delivery') {
        message += t('cart.whatsapp.shipping', { amount: shippingFee.toLocaleString("id-ID") }) + "\n";
      }
      message += t('cart.whatsapp.total_payment', { amount: finalTotal.toLocaleString("id-ID") }) + "\n\n";
      
      // Add OFF-HOURS NOTE if outside of Senin-Sabtu, 08:00-17:00 WIB
      const wibOptions = { timeZone: 'Asia/Jakarta' };
      const now = new Date();
      
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc. locally. We assume local time aligns with WIB roughly, or use accurate WIB check:
      const wibHourString = now.toLocaleTimeString('en-US', { ...wibOptions, hour12: false, hour: '2-digit' });
      const currentHour = parseInt(wibHourString.split(':')[0], 10);
      
      // if Sunday (0) or before 8 or after 17
      const isOffHours = currentDay === 0 || currentHour < 8 || currentHour >= 17;
      
      if (isOffHours) {
        message += "*Catatan:* Pesanan diterima di luar jam operasional. Kami akan memproses pesanan Anda pada jam kerja berikutnya (Senin - Sabtu, 08.00 - 17.00 WIB).\n\n";
      }

      message += t('cart.whatsapp.footer');
      
      const encodedMessage = encodeURIComponent(message);
      
      // Brief delay for nice UX and Show Animation
      setIsLoading(false); // Stop global loader
      setShowCheckoutAnim(true); // Start local animation
      
      await new Promise(r => setTimeout(r, 2000)); // Show animation for enough time
      
      // Open WhatsApp - Mobile-first approach
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
      
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Direct redirection for mobile apps
        window.location.href = whatsappUrl;
      } else {
        // Fallback for desktop
        window.open(whatsappUrl, "_blank");
      }
      
      // Cleanup
      setShowCheckoutAnim(false);
      clearCart();
      setIsCartOpen(false);

    } catch (error: unknown) {
      console.error('Order error:', error);
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : t('cart.error_generic');
      alert(errorMessage);
    }
  };

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
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-background text-foreground shadow-2xl z-70 flex flex-col transform transition-transform duration-300 ease-in-out ${
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
                onClick={() => setIsCartOpen(false)}
                className="mt-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all"
              >
                {t('cart.view_catalog')}
              </button>
            </div>
          ) : (
            cart.map((item) => (
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
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium tracking-tight">Rp {item.price.toLocaleString("id-ID")} / pcs</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-primary font-bold hover:bg-primary/20 rounded-md transition-colors"
                      >
                        -
                      </button>
                      <span className="text-sm font-black w-6 text-center text-slate-900 dark:text-slate-100">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-primary font-bold hover:bg-primary/20 rounded-md transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Delivery Method Selection */}
          {cart.length > 0 && (
            <div className="pt-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('cart.delivery_method_title')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${
                    deliveryMethod === 'delivery' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined">local_shipping</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t('cart.delivery')}</span>
                </button>
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${
                    deliveryMethod === 'pickup' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined">storefront</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t('cart.pickup')}</span>
                </button>
              </div>
              {deliveryMethod === 'delivery' && (
                <p className="text-[10px] text-slate-400 italic text-center">
                  {t('cart.shipping_note')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 bg-background border-t border-slate-100 dark:border-white/10">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="text-sm font-medium">{t('cart.subtotal')}</span>
                <span className="text-sm font-bold">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-sm font-medium">{t('cart.shipping_fee')}</span>
                  <span className="text-sm font-bold">Rp {shippingFee.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-lg font-bold text-primary dark:text-primary-light">{t('cart.total_estimate')}</span>
                <span className="text-2xl font-extrabold text-primary">Rp {finalTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button 
              onClick={handleWhatsAppOrder}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl py-4 flex flex-col items-center justify-center gap-1 transition-all shadow-lg shadow-[#25D366]/20 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 font-bold text-lg">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793 0-.852.448-1.271.607-1.445.159-.173.346-.217.462-.217h.332c.101 0 .23.036.332.274.116.273.39.954.423 1.025.033.072.054.156.007.251-.047.094-.072.156-.144.239-.072.083-.151.185-.216.249-.072.072-.147.151-.063.294.083.144.368.607.789.982.541.483 1.002.632 1.144.704.144.072.23.063.315-.033.085-.097.368-.427.466-.572.101-.144.202-.123.332-.076.13.047.823.39.966.462.144.072.239.108.274.17.036.062.036.357-.108.762zM12 1a10.89 10.89 0 00-11 11c0 2.187.625 4.22 1.707 5.956L1 23l5.241-1.374A10.84 10.84 0 0012 23c6.075 0 11-4.925 11-11S18.075 1 12 1z"/>
                </svg>
                {t('cart.whatsapp_cta')}
              </div>
              <span className="text-[10px] tracking-wide opacity-90 font-medium">{t('cart.whatsapp_note')}</span>
            </button>
            <p className="mt-4 text-[10px] text-center text-slate-500 dark:text-slate-400 leading-relaxed">
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
          <div className="bg-background rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col scale-in-95 animate-in zoom-in-95 duration-200">
            <div className="bg-amber-500/10 p-6 flex flex-col items-center justify-center text-center">
              <div className="size-16 bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{t('cart.alert_title')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('cart.alert_subtitle')}
              </p>
            </div>
            
            <div className="p-6 space-y-3 bg-card">
              <button
                onClick={() => {
                  setShowProfileAlert(false);
                  setIsCartOpen(false);
                  router.push('/profile');
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-primary/25 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{t('cart.alert_cta')}</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              
              <button
                onClick={() => setShowProfileAlert(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3.5 rounded-xl transition-colors"
              >
                {t('cart.alert_back')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
