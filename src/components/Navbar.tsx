"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { SiteSettings } from "@/types/cms";
import LogoBrand from "@/components/ui/LogoBrand";
import { 
  UserCircleIcon, 
  ShoppingBagIcon, 
  MapPinIcon, 
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import NotificationBell from "@/components/NotificationBell";
import { playNotificationSound } from "@/lib/audio-utils";
import AudioPermissionToast from "@/components/ui/AudioPermissionToast";
interface NavbarProps {
  siteSettings?: SiteSettings;
  hideLogo?: boolean;
}

export default function Navbar({ siteSettings, hideLogo }: NavbarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { totalItems, setIsCartOpen } = useCart();
  
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [userData, setUserData] = useState<{
    profile: {
      avatar_url: string | null;
      district_name: string | null;
      city_name: string | null;
      privacy_location: boolean;
    } | null;
    orders: Array<{
      id: string;
      total_amount: number;
    }>;
    totalSpent: number;
    reviewCount: number;
  } | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, ordersRes, reviewsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('product_reviews').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]);

      const allOrders = await supabase.from('orders').select('total_amount').eq('user_id', user.id);
      const totalSpent = allOrders.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      setUserData({
        profile: profileRes.data,
        orders: ordersRes.data || [],
        totalSpent,
        reviewCount: reviewsRes.count || 0
      });

      // Play welcome sound EVERY time the home page is visited (or refreshed)
      // ONLY if they have already granted audio permission!
      if (pathname === '/' && localStorage.getItem('audioAllowed') === 'true') {
        const playPromise = playNotificationSound('/sounds/selamat-datang-full.mp3');
        if (playPromise) {
          playPromise.catch(() => {
            // Autoplay diblokir browser. Tunggu interaksi pertama kali.
            const handleInteraction = () => {
              // Hapus listener agar tidak berulang
              document.removeEventListener('click', handleInteraction);
              document.removeEventListener('keydown', handleInteraction);
              document.removeEventListener('touchstart', handleInteraction);
              playNotificationSound('/sounds/selamat-datang-full.mp3');
            };
            
            document.addEventListener('click', handleInteraction);
            document.addEventListener('keydown', handleInteraction);
            document.addEventListener('touchstart', handleInteraction);
          });
        }
      }
    }

    if (mounted) fetchUserData();
    return () => clearTimeout(timer);
  }, [mounted, pathname, supabase]);

  if (pathname && (pathname.startsWith('/terms') || pathname.startsWith('/privacy') || pathname.startsWith('/cookies'))) {
    return null;
  }

  return (
    <>
      <AudioPermissionToast />
      <header className="sticky top-0 z-50 w-full transition-all duration-500 bg-white/75 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_2px_15px_rgba(0,0,0,0.02)] supports-backdrop-filter:bg-white/70">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-4 md:gap-8 transition-all duration-300">
        {/* Logo */}
        {!hideLogo && (
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group transition-transform hover:scale-[1.02] active:scale-95">
            <div className="relative">
              <LogoBrand 
                logoUrl={siteSettings?.logo_url} 
                storeName={siteSettings?.store_name} 
                size="md"
                className="group-hover:rotate-6 transition-transform duration-300 scale-90 sm:scale-100 origin-left"
              />
              <div className="absolute -inset-1.5 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              {!siteSettings?.logo_url && (
                <h1 className="font-display text-sm sm:text-base md:text-xl font-black tracking-tight text-slate-900 leading-none">
                  {siteSettings?.store_name || "HR-One"}
                  <span className="text-primary ml-1 block sm:inline">Donuts</span>
                </h1>
              )}
              <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 font-bold hidden xs:block leading-none mt-1 uppercase tracking-wider">
                {siteSettings?.tagline || t('hero.subtitle')}
              </p>
            </div>
          </Link>
        )}

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-6 shrink-0 mr-4">
          <Link 
            href="/catalog" 
            className={`text-sm font-bold uppercase tracking-wider transition-all hover:text-primary ${
              pathname === '/catalog' ? 'text-primary' : 'text-slate-600'
            }`}
          >
            {t('nav.catalog')}
          </Link>
          <Link 
            href="/cara-pesan" 
            className={`text-sm font-bold uppercase tracking-wider transition-all hover:text-primary ${
              pathname === '/cara-pesan' ? 'text-primary' : 'text-slate-600'
            }`}
          >
            {t('nav.how_to_order')}
          </Link>
        </nav>

        {/* Search Bar - Centered (Hidden on Homepage) */}
        {!pathname || pathname !== '/' ? (
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">search</span>
              </div>
              <input
                className="w-full bg-slate-100/50 border border-transparent rounded-2xl py-2.5 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/20 placeholder:text-slate-400 placeholder:font-medium transition-all text-sm outline-none shadow-sm text-ellipsis overflow-hidden whitespace-nowrap"
                placeholder={t('search.placeholder')}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Utilities */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0 transition-opacity duration-500">
          <div className="block scale-[0.85] sm:scale-100 origin-right">
            <LanguageSwitcher />
          </div>
          {/* Search Mobile */}
          {(!pathname || pathname !== '/') && (
            <Link href="/catalog" className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl text-slate-500 hover:bg-slate-100/80 active:bg-slate-200/50 active:scale-90 lg:hidden transition-all min-h-[38px] min-w-[38px] md:min-h-[44px] md:min-w-[44px]">
              <span className="material-symbols-outlined text-[20px] md:text-[22px]">search</span>
            </Link>
          )}

          {/* Notifications */}
          <div className="scale-[0.9] md:scale-100">
            <NotificationBell />
          </div>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex p-1.5 md:p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-all relative group min-h-[38px] min-w-[38px] md:min-h-[44px] md:min-w-[44px] items-center justify-center"
            aria-label="View shopping cart"
          >
            <span className="material-symbols-outlined text-[20px] md:text-[24px] group-hover:scale-110 transition-transform">shopping_bag</span>
            {mounted && totalItems > 0 && (
              <span
                key={totalItems}
                className="absolute top-1 right-1 md:top-1.5 md:right-1.5 size-3.5 md:size-4 bg-red-500 text-white text-[8px] md:text-[9px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm animate-cart-bounce"
              >
                {totalItems}
              </span>
            )}
          </button>

          {/* Account */}
          <div className="relative block">
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-1 sm:gap-2 p-1 md:p-1.5 md:pl-4 md:pr-1.5 rounded-[12px] md:rounded-2xl border border-slate-200/60 hover:border-primary/30 hover:shadow-md transition-all bg-white/50 backdrop-blur-sm group"
            >
              <div className="size-7 sm:size-8 md:size-10 rounded-lg md:rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors overflow-hidden relative">
                {userData?.profile?.avatar_url ? (
                  <Image src={userData.profile.avatar_url} alt="Avatar" fill className="object-cover" />
                ) : (
                  <UserCircleIcon className="size-5 md:size-6 text-slate-400" />
                )}
              </div>
              <ChevronDownIcon className={`hidden sm:block size-3 md:size-4 text-slate-400 group-hover:text-primary transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Account Dropdown */}
            {isAccountOpen && (
              <div className="absolute top-full -right-2 sm:right-0 mt-3 w-[280px] sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-300 z-50 overflow-hidden">
                {userData ? (
                  <div className="flex flex-col">
                    {/* Header Summary */}
                    <div className="p-4 bg-slate-50/50 rounded-2xl mb-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('account.summary')}</p>
                       <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-3 rounded-xl border border-slate-100">
                             <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{t('account.spending')}</p>
                             <p className="text-sm font-black text-slate-800">Rp {userData.totalSpent.toLocaleString('id-ID')}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-100">
                             <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{t('account.reviews')}</p>
                             <p className="text-sm font-black text-slate-800">{userData.reviewCount} {t('account.reviews').toLowerCase()}</p>
                          </div>
                       </div>
                    </div>

                    {/* Location Summary (Conditional) */}
                    {userData.profile?.privacy_location && (userData.profile?.district_name || userData.profile?.city_name) && (
                      <div className="px-4 py-3 flex items-center gap-3 text-slate-600">
                        <MapPinIcon className="size-4 text-primary" />
                        <span className="text-xs font-bold truncate">
                          {userData.profile.district_name || userData.profile.city_name}
                        </span>
                      </div>
                    )}

                    {/* Recent Orders */}
                    <div className="px-4 py-3 border-t border-slate-50">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t('account.recent_orders')}</p>
                       <div className="space-y-2">
                          {userData.orders.length > 0 ? userData.orders.map(order => (
                            <div key={order.id} className="flex items-center justify-between text-[11px] font-semibold">
                               <span className="text-slate-600">#{order.id.slice(0, 6).toUpperCase()}</span>
                               <span className="text-slate-800">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                            </div>
                          )) : (
                            <p className="text-[11px] text-slate-400 italic">{t('account.no_orders')}</p>
                          )}
                       </div>
                    </div>

                    {/* Quick Menu */}
                    <div className="grid grid-cols-2 gap-1 p-1 border-t border-slate-50 mt-2">
                       <Link href="/profile" className="flex items-center gap-2 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                          <ShoppingBagIcon className="size-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">{t('account.activity')}</span>
                       </Link>
                       <Link href="/settings" className="flex items-center gap-2 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                          <Cog6ToothIcon className="size-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">{t('account.settings')}</span>
                       </Link>
                    </div>

                    <button 
                      onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/';
                      }}
                      className="w-full mt-1 p-3 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                       <ArrowRightOnRectangleIcon className="size-4" /> {t('account.sign_out')}
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <p className="text-sm font-bold text-slate-600">Opps! Kamu belum masuk.</p>
                    <Link href="/login" className="block w-full py-3 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-widest">
                       {t('account.login_now')}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  </>
  );
}
