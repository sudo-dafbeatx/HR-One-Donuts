"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { SiteSettings } from "@/types/cms";
import LogoBrand from "@/components/ui/LogoBrand";
import { 
  UserCircleIcon, 
  ChevronDownIcon,
  MapPinIcon
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
  const [userData, setUserData] = useState<{
    profile: {
      avatar_url: string | null;
      district_name: string | null;
      city_name: string | null;
      privacy_location: boolean;
    } | null;
  } | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle();

      setUserData({
        profile
      });

      if (pathname === '/' && localStorage.getItem('audioAllowed') === 'true') {
        const playPromise = playNotificationSound('/sounds/selamat-datang-full.mp3');
        if (playPromise) {
          playPromise.catch(() => {
            const handleInteraction = () => {
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
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          
          {/* Left Side: Logo */}
          {!hideLogo && (
            <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0 group">
              <LogoBrand 
                logoUrl={siteSettings?.logo_url} 
                storeName={siteSettings?.store_name} 
                size="md"
                className="scale-110 border-none! shadow-none! bg-transparent!"
              />
              <div className="flex flex-col">
                <h1 className="font-display text-sm md:text-xl font-black tracking-tight text-slate-900 leading-none group-hover:text-primary transition-colors">
                  {siteSettings?.store_name || "HR-One"}
                  <span className="text-primary ml-1">Donuts</span>
                </h1>
                <p className="text-[10px] md:text-xs text-slate-400 font-bold hidden xs:block leading-none mt-1 uppercase tracking-widest">
                  {siteSettings?.tagline || t('hero.subtitle')}
                </p>
              </div>
            </Link>
          )}

          {/* Center: Location Selector (Mobile friendly) */}
          <div className="flex-1 flex justify-center max-w-[140px] xs:max-w-none">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-primary/20 transition-all max-w-full group/loc">
              <MapPinIcon className="size-4 text-primary shrink-0 group-hover/loc:scale-110 transition-transform" />
              <span className="text-[11px] md:text-xs font-bold truncate">
                {userData?.profile?.district_name || "Cibungbulang"}
              </span>
              <ChevronDownIcon className="size-3 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Search Icon (New for better reach) */}
            <Link href="/catalog" className="flex p-2.5 rounded-full hover:bg-slate-50 text-slate-700 transition-all active:scale-90 items-center justify-center min-h-[44px] min-w-[44px]">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </Link>

            {/* Notifications */}
            <div className="bg-white rounded-full">
              <NotificationBell />
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex p-2.5 rounded-full hover:bg-slate-50 text-slate-700 transition-all group min-h-[44px] min-w-[44px] items-center justify-center active:scale-95"
              aria-label="View shopping cart"
            >
              <span className="material-symbols-outlined text-[24px] text-primary group-hover:scale-110 transition-transform">shopping_bag</span>
              {mounted && totalItems > 0 && (
                <span
                  key={totalItems}
                  className="absolute top-1.5 right-1.5 size-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm animate-cart-bounce"
                >
                  {totalItems}
                </span>
              )}
            </button>

            {/* Account / Profile Avatar */}
            <Link 
              href="/profile"
              className="flex items-center justify-center p-0.5 rounded-full border-2 border-slate-100 hover:border-primary/50 transition-all overflow-hidden bg-slate-50 active:scale-95"
            >
              <div className="size-8 md:size-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden relative">
                {userData?.profile?.avatar_url ? (
                  <Image src={userData.profile.avatar_url} alt="Avatar" fill className="object-cover" />
                ) : (
                  <UserCircleIcon className="size-6 text-slate-400" />
                )}
              </div>
            </Link>
            
            <div className="hidden lg:block ml-1">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
