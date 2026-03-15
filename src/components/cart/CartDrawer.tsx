'use client';

import { useCart } from "@/context/CartContext";
import { useLoading } from "@/context/LoadingContext";
import { useErrorPopup } from "@/context/ErrorPopupContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import { XMarkIcon, ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";

import { SiteSettings } from "@/types/cms";
import { getCurrentUserProfile, createOrder, getUserActiveAddress } from "@/app/actions/order-actions";
import { validateVoucher } from "@/app/actions/voucher-actions";
import { useRouter, usePathname } from "next/navigation";
import CheckoutAnimation from "./CheckoutAnimation";
import { useTranslation } from "@/context/LanguageContext";
import CartAddressForm from "./CartAddressForm";

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
      className="text-base font-black w-12 text-center bg-transparent border-none focus:ring-0 text-slate-900! p-0"
    />
  );
}

export default function CartDrawer({ siteSettings }: { siteSettings?: SiteSettings }) {
  const { cart, updateQuantity, setCartQuantity, totalPrice, totalDonuts, isCartOpen, setIsCartOpen, removeFromCart, clearCart, getEffectiveItemPrice, priceTiers, activeVoucher, applyVoucher } = useCart();
  const { setIsLoading } = useLoading();
  const { showError } = useErrorPopup();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showCheckoutAnim, setShowCheckoutAnim] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [activeAddressStr, setActiveAddressStr] = useState<string | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isCheckingOutAddress, setIsCheckingOutAddress] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  // Voucher state
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isVoucherLoading, setIsVoucherLoading] = useState(false);

  const shippingFee = (deliveryMethod === 'delivery' && totalDonuts <= 36) ? (siteSettings?.shipping_fee || 0) : 0;
  const finalTotal = totalPrice + shippingFee;

  // We use totalDonuts from useCart for pricing logic and order records
  // totalItems from useCart can be used for the physical item count if needed

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Load Address effect
  useEffect(() => {
    async function loadAddress() {
      if (isCartOpen && deliveryMethod === 'delivery') {
        setIsAddressLoading(true);
        try {
          const profile = await getCurrentUserProfile() as CartProfile | null;
          let addressStr = null;

          if (profile) {
            const activeAddress = await getUserActiveAddress();
            if (activeAddress) {
              const streetWithNo = [
                activeAddress.street_name,
                activeAddress.house_no ? `No. ${activeAddress.house_no}` : null
              ].filter(Boolean).join(' ');

              addressStr = [
                activeAddress.building_name || null,
                streetWithNo || null,
                activeAddress.district || null,
                activeAddress.city || null,
                activeAddress.province || null,
                activeAddress.postal_code || null
              ].filter(Boolean).map(s => (s as string).trim()).filter(s => s !== "").join(", ");
            } else if (profile.address) {
              const province = profile.province_name || "";
              const city = profile.city_name || "";
              const district = profile.district_name || "";
              const detail = profile.address_detail || profile.address || "";
              addressStr = [detail, district, city, province].filter(Boolean).join(", ");
            }
          }
          setActiveAddressStr(addressStr);
        } catch (e) {
          console.error(e);
        } finally {
          setIsAddressLoading(false);
        }
      }
    }
    loadAddress();
  }, [isCartOpen, deliveryMethod]);

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

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    setIsVoucherLoading(true);
    setVoucherError(null);
    try {
      const rawSubtotal = cart.reduce((sum, item) => sum + getEffectiveItemPrice(item) * item.quantity, 0);
      const res = await validateVoucher(voucherInput.trim(), rawSubtotal);
      if (res.isValid && res.data) {
        applyVoucher(res.data);
        setVoucherInput("");
      } else {
        setVoucherError(res.message || "Voucher tidak valid");
      }
    } catch (e: unknown) {
      const err = e as Error;
      setVoucherError(err.message || "Gagal memvalidasi voucher");
    } finally {
      setIsVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    applyVoucher(null);
    setVoucherError(null);
  };

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
      setActiveUserId(profile.id);

      // 2. Check Profile Completeness (Name & Phone are critical for WA)
      const isMissingBasicInfo = !profile.full_name || !profile.phone;
      
      // Pre-calculate full address from profile as legacy/backup
      const province = profile.province_name || "";
      const city = profile.city_name || "";
      const district = profile.district_name || "";
      const detail = profile.address_detail || profile.address || "";
      const profileAddressStr = [detail, district, city, province].filter(Boolean).join(", ");

      if (isMissingBasicInfo || (deliveryMethod === 'delivery' && !profileAddressStr)) {
        setIsLoading(false);
        setIsCheckingOutAddress(true);
        return;
      }

      let finalShippingAddress = undefined;
      let finalShippingNotes = undefined;

      if (deliveryMethod === 'delivery') {
        const activeAddress = await getUserActiveAddress();
        
        // If they have profile address but no detailed address record, we can still proceed 
        // but if BOTH are missing, we block.
        // Actually, let's be strict: for delivery, we want a detailed address record if possible.
        if (!activeAddress && !profileAddressStr) {
          setIsLoading(false);
          setIsCheckingOutAddress(true);
          return;
        }

        if (activeAddress) {
          finalShippingNotes = activeAddress.additional_details || undefined;

          // Construct full address from user_addresses table structure - detailed version
          const streetWithNo = [
            activeAddress.street_name,
            activeAddress.house_no ? `No. ${activeAddress.house_no}` : null
          ].filter(Boolean).join(' ');

          finalShippingAddress = [
            activeAddress.building_name || null,
            streetWithNo || null,
            activeAddress.district || null,
            activeAddress.city || null,
            activeAddress.province || null,
            activeAddress.postal_code || null
          ].filter(Boolean).map(s => (s as string).trim()).filter(s => s !== "").join(", ");
        }
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
        })),
        voucher_id: activeVoucher ? activeVoucher.id : undefined
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

      if (activeVoucher && promoDiscount > 0) {
        message += `Voucher Dipakai: ${activeVoucher.code} (${activeVoucher.title})\n`;
        message += `Subtotal: Rp ${rawSubtotal.toLocaleString("id-ID")}\n`;
        message += `Diskon Promo: -Rp ${promoDiscount.toLocaleString("id-ID")}\n`;
        message += `Total Bersih: Rp ${totalPrice.toLocaleString("id-ID")}\n`;
      } else if (promoDiscount > 0) {
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
        className={`fixed right-0 top-0 h-dvh w-full max-w-md bg-[#f5f7fb] text-[#1a1a1a] shadow-2xl z-70 flex flex-col transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative z-10 p-4 bg-white flex items-center justify-between shadow-[0_4px_10px_rgba(0,0,0,0.05)] rounded-b-[16px]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCartOpen(false)}
              className="w-10 h-10 flex items-center justify-center bg-[#f5f7fb] hover:bg-gray-200 rounded-full transition-all"
            >
              <XMarkIcon className="w-6 h-6 text-[#1a1a1a]" />
            </button>
            <h2 className="text-[24px] font-bold text-[#1a1a1a] leading-none">
              {t('cart.title')}
            </h2>
          </div>
        </div>

        {/* Dynamic Display based on isCheckingOutAddress */}
        {isCheckingOutAddress && activeUserId ? (
          <CartAddressForm 
            userId={activeUserId} 
            onCancel={() => setIsCheckingOutAddress(false)} 
            onSuccess={() => {
              setIsCheckingOutAddress(false);
              // Retry checkout after address save
              handleWhatsAppOrder();
            }} 
          />
        ) : (
          <>
            {/* List Content */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-6 bg-white rounded-[16px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] p-6">
              <div className="size-20 bg-[#f5f7fb] rounded-full flex items-center justify-center">
                <ShoppingCartIcon className="w-10 h-10 text-gray-400" />
              </div>
              <div className="space-y-2">
                <p className="text-[18px] font-semibold text-[#1a1a1a]">{t('cart.empty_title')}</p>
                <p className="text-[14px] font-normal text-gray-400 max-w-[200px] mx-auto leading-relaxed">{t('cart.empty_subtitle')}</p>
              </div>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  window.location.href = "/catalog";
                }}
                className="mt-4 bg-primary text-white px-8 py-3 rounded-[12px] text-[14px] font-bold transition-all"
              >
                {t('cart.view_catalog')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Delivery Method + Address — TOP of checkout */}
              <div className="bg-white p-4 rounded-[16px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] space-y-4">
                <h3 className="text-[18px] font-semibold text-[#1a1a1a]">{t('cart.delivery_method_title')}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-[12px] border-2 transition-all gap-2 ${
                      deliveryMethod === 'delivery' 
                      ? 'border-primary bg-[#eef2ff] text-primary' 
                      : 'border-gray-100 bg-white text-gray-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                    <span className="text-[14px] font-medium">{t('cart.delivery')}</span>
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-[12px] border-2 transition-all gap-2 ${
                      deliveryMethod === 'pickup' 
                      ? 'border-primary bg-[#eef2ff] text-primary' 
                      : 'border-gray-100 bg-white text-gray-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">storefront</span>
                    <span className="text-[14px] font-medium">{t('cart.pickup')}</span>
                  </button>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div className="mt-2 p-4 rounded-[12px] border border-gray-100 bg-[#f5f7fb] flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <span className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Alamat Pengiriman</span>
                      {activeAddressStr && (
                        <button onClick={() => window.location.href = "/settings/address"} className="text-[12px] text-primary font-bold hover:underline">UBAH</button>
                      )}
                    </div>
                    {isAddressLoading ? (
                      <div className="h-10 animate-pulse bg-gray-200 rounded-lg w-full mt-2"></div>
                    ) : activeAddressStr ? (
                      <div className="flex gap-2 items-start mt-2">
                        <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">location_on</span>
                        <p className="text-[14px] text-[#1a1a1a] font-normal leading-relaxed">{activeAddressStr}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 mt-2 items-start">
                        <p className="text-[12px] text-amber-700 font-medium bg-amber-50 px-3 py-2 rounded-lg w-full flex items-center gap-2 border border-amber-100">
                          <span className="material-symbols-outlined text-[14px]">warning</span> Belum ada alamat
                        </p>
                        <button 
                          onClick={() => {
                            setIsCartOpen(false);
                            window.location.href = "/settings/address";
                          }}
                          className="w-full text-center bg-white text-[#1a1a1a] border border-gray-300 font-bold py-2 rounded-lg text-[14px] shadow-sm hover:bg-gray-50 transition-colors"
                        >
                          Tambah Alamat
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Product Items */}
              {cart.map((item) => {
                const effectiveItemPrice = getEffectiveItemPrice(item);
                const hasDiscount = effectiveItemPrice < item.price;
                
                return (
                  <div key={item.id} className="bg-white p-4 rounded-[16px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] flex gap-3">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 rounded-[12px] overflow-hidden shrink-0 border border-gray-100">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    {/* Info & Quantity */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      {/* Row 1: Name + Price aligned horizontally */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[14px] font-semibold text-[#1a1a1a] leading-tight truncate">
                          {item.name}
                        </h3>
                        <span className="text-[14px] font-bold text-[#1a1a1a] shrink-0 whitespace-nowrap">
                          Rp {(effectiveItemPrice * item.quantity).toLocaleString("id-ID")}
                        </span>
                      </div>

                      {hasDiscount && (
                        <p className="text-[11px] font-medium text-gray-400 line-through">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </p>
                      )}

                      {/* Row 2: Quantity selector + delete */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1 bg-[#f5f7fb] rounded-lg p-0.5 border border-gray-100">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-primary font-bold hover:bg-white rounded-md transition-all text-[14px]"
                          >
                            −
                          </button>
                          <QuantityInput 
                            initialValue={item.quantity} 
                            onUpdate={(val) => setCartQuantity(item.id, val)} 
                          />
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-primary font-bold hover:bg-white rounded-md transition-all text-[14px]"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Wholesale Info */}
              <div className="bg-white p-4 rounded-[16px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">sell</span>
                  <h3 className="text-[14px] font-bold text-[#1a1a1a]">Daftar Harga Grosir</h3>
                </div>

                <div className="space-y-3">
                  {priceTiers.map((tier, idx) => {
                    const isActive = totalDonuts >= tier.min && (!tier.max || totalDonuts <= tier.max);
                    return (
                      <div key={idx} className={`flex justify-between items-center p-3 rounded-[12px] transition-all ${
                        isActive 
                        ? 'bg-[#eef2ff] border border-primary/20' 
                        : 'bg-[#f5f7fb] border border-transparent'
                      }`}>
                        <span className="flex items-center gap-2 text-[14px] font-normal text-[#1a1a1a]">
                          {isActive && <span className="w-2 h-2 rounded-full bg-primary" />}
                          {tier.max ? `${tier.min} - ${tier.max} Pcs` : `> ${tier.min - 1} Pcs`}
                        </span>
                        <span className={`text-[14px] font-bold ${isActive ? 'text-primary' : 'text-[#1a1a1a]'}`}>
                          Rp {tier.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Voucher Input */}
              <div className="bg-white p-4 rounded-[16px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 border-b border-gray-100 w-full pb-3">
                    <span className="material-symbols-outlined text-primary text-[20px]">confirmation_number</span>
                    <h3 className="text-[14px] font-bold text-[#1a1a1a]">Makin hemat pakai promo!</h3>
                  </div>
                </div>

                {activeVoucher ? (
                  <div className="bg-[#eef2ff] border border-primary/20 rounded-xl p-3 flex items-center justify-between animate-fade-in">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-primary uppercase tracking-wider">{activeVoucher.code}</span>
                      <span className="text-[13px] text-primary">{activeVoucher.title}</span>
                    </div>
                    <button 
                      onClick={handleRemoveVoucher}
                      className="text-[12px] font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                        placeholder="Masukkan kode promo"
                        className="flex-1 bg-[#f5f7fb] border border-gray-100 text-[#1a1a1a] text-[14px] rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase placeholder:normal-case placeholder:text-gray-400"
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                      />
                      <button 
                        onClick={handleApplyVoucher}
                        disabled={!voucherInput.trim() || isVoucherLoading}
                        className="bg-[#1a1a1a] text-white px-4 py-2.5 rounded-xl text-[14px] font-bold hover:bg-black transition-colors disabled:opacity-50 min-w-[90px]"
                      >
                        {isVoucherLoading ? 'Cek...' : 'Terapkan'}
                      </button>
                    </div>
                    {voucherError && (
                      <p className="text-[12px] text-red-500 font-medium px-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {voucherError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="h-6" />
            </div>
          )}
        </div>

        {/* Sticky Order Summary Footer */}
        {cart.length > 0 && (
          <div className="sticky bottom-0 z-20 bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] rounded-t-[24px] border-t border-gray-100">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-normal text-gray-500">{t('cart.subtotal')}</span>
                <span className="text-[14px] font-medium text-[#1a1a1a]">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] font-normal text-gray-500">{t('cart.shipping_fee')} <span className="text-[12px] italic text-gray-400">({deliveryMethod === 'delivery' ? 'Antar' : 'Ambil'})</span></span>
                <span className="text-[14px] font-medium text-[#1a1a1a]">Rp {shippingFee.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-gray-100 mt-2">
                <span className="text-[18px] font-semibold text-[#1a1a1a]">Total Tagihan</span>
                <span className="text-[20px] font-bold text-primary">
                  Rp {finalTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <button 
              onClick={handleWhatsAppOrder}
              className="w-full bg-primary hover:bg-blue-600 text-white rounded-[12px] h-[48px] flex items-center justify-center gap-2 font-bold text-[16px] transition-colors shadow-md"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793 0-.852.448-1.271.607-1.445.159-.173.346-.217.462-.217h.332c.101 0 .23.036.332.274.116.273.39.954.423 1.025.033.072.054.156.007.251-.047.094-.072.156-.144.239-.072.083-.151.185-.216.249-.072.072-.147.151-.063.294.083.144.368.607.789.982.541.483 1.002.632 1.144.704.144.072.23.063.315-.033.085-.097.368-.427.466-.572.101-.144.202-.123.332-.076.13.047.823.39.966.462.144.072.239.108.274.17.036.062.036.357-.108.762zM12 1a10.89 10.89 0 00-11 11c0 2.187.625 4.22 1.707 5.956L1 23l5.241-1.374A10.84 10.84 0 0012 23c6.075 0 11-4.925 11-11S18.075 1 12 1z"/>
              </svg>
              {t('cart.whatsapp_cta')}
            </button>
          </div>
        )}
          </>
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
            <div className="bg-amber-500/5 p-8 sm:p-10 flex flex-col items-center justify-center text-center">
              <div className="size-20 sm:size-24 bg-amber-500 text-slate-900 rounded-4xl flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/40 rotate-3">
                <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 tracking-tight px-4">Data Belum Lengkap</h3>
              <p className="text-[13px] sm:text-sm text-slate-500 font-bold leading-relaxed px-4">
                Mohon lengkapi data profil dan alamat Anda terlebih dahulu agar pesanan dapat kami proses dengan lancar. 🍩
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
