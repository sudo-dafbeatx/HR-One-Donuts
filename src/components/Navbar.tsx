"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { SiteSettings } from "@/types/cms";
import { DEFAULT_COPY } from "@/lib/theme-defaults";
import { useEditMode } from "@/context/EditModeContext";
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

interface NavbarProps {
  siteSettings?: SiteSettings;
  copy?: Record<string, string>;
  hideLogo?: boolean;
}

export default function Navbar({ siteSettings, copy: _copy, hideLogo }: NavbarProps) {
  const pathname = usePathname();
  const { copy: liveCopy } = useEditMode();
  const copy = liveCopy || _copy || DEFAULT_COPY;
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
    }

    if (mounted) fetchUserData();
    return () => clearTimeout(timer);
  }, [mounted, supabase]);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] supports-backdrop-filter:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-20 flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        {!hideLogo && (
          <Link href="/" className="flex items-center gap-3 shrink-0 group transition-transform hover:scale-[1.02] active:scale-95">
            <div className="relative">
              <LogoBrand 
                logoUrl={siteSettings?.logo_url} 
                storeName={siteSettings?.store_name} 
                size="sm"
                className="group-hover:rotate-6 transition-transform duration-300"
              />
              <div className="absolute -inset-1.5 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              {!siteSettings?.logo_url && (
                <h1 className="font-display text-base md:text-xl font-black tracking-tight text-slate-900 leading-none">
                  {siteSettings?.store_name || "HR-One"}
                  <span className="text-primary ml-1">Donuts</span>
                </h1>
              )}
              <p className="text-[10px] md:text-xs text-slate-500 font-bold hidden md:block leading-none mt-1 uppercase tracking-wider">
                {siteSettings?.tagline || "Freshly Baked Every Day"}
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
            {copy.nav_menu}
          </Link>
          <Link 
            href="/cara-pesan" 
            className={`text-sm font-bold uppercase tracking-wider transition-all hover:text-primary ${
              pathname === '/cara-pesan' ? 'text-primary' : 'text-slate-600'
            }`}
          >
            {copy.nav_how_to_order}
          </Link>
        </nav>

        {/* Search Bar - Centered (Hidden on Homepage) */}
        {!pathname || pathname !== '/' ? (
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">search</span>
              </div>
              <input
                className="w-full bg-slate-100/50 border border-transparent rounded-2xl py-2.5 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/20 placeholder:text-slate-400 placeholder:font-medium transition-all text-sm outline-none shadow-sm"
                placeholder={copy.search_placeholder}
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
        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
          {/* Mobile Search Icon (Hidden on Homepage) */}
          {(!pathname || pathname !== '/') && (
            <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 md:hidden transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
          )}

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-all relative group"
            aria-label="View shopping cart"
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">shopping_bag</span>
            {mounted && totalItems > 0 && (
              <span
                key={totalItems}
                className="absolute top-1.5 right-1.5 size-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm animate-cart-bounce"
              >
                {totalItems}
              </span>
            )}
          </button>

          {/* Account */}
          <div className="relative">
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center gap-2 p-1.5 md:pl-4 md:pr-1.5 rounded-2xl border border-slate-200/60 hover:border-primary/30 hover:shadow-md transition-all bg-white/50 backdrop-blur-sm group"
            >
              <div className="size-8 md:size-10 rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors overflow-hidden relative">
                {userData?.profile?.avatar_url ? (
                  <Image src={userData.profile.avatar_url} alt="Avatar" fill className="object-cover" />
                ) : (
                  <UserCircleIcon className="size-6 text-slate-400" />
                )}
              </div>
              <ChevronDownIcon className={`size-4 text-slate-400 group-hover:text-primary transition-transform ${isAccountOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Account Dropdown */}
            {isAccountOpen && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-300 z-50 overflow-hidden">
                {userData ? (
                  <div className="flex flex-col">
                    {/* Header Summary */}
                    <div className="p-4 bg-slate-50/50 rounded-2xl mb-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ringkasan Aktivitas</p>
                       <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-3 rounded-xl border border-slate-100">
                             <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Pengeluaran</p>
                             <p className="text-sm font-black text-slate-800">Rp {userData.totalSpent.toLocaleString('id-ID')}</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-100">
                             <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Ulasan</p>
                             <p className="text-sm font-black text-slate-800">{userData.reviewCount} ulasan</p>
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
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Pesanan Terbaru</p>
                       <div className="space-y-2">
                          {userData.orders.length > 0 ? userData.orders.map(order => (
                            <div key={order.id} className="flex items-center justify-between text-[11px] font-semibold">
                               <span className="text-slate-600">#{order.id.slice(0, 6).toUpperCase()}</span>
                               <span className="text-slate-800">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                            </div>
                          )) : (
                            <p className="text-[11px] text-slate-400 italic">Belum ada pesanan</p>
                          )}
                       </div>
                    </div>

                    {/* Quick Menu */}
                    <div className="grid grid-cols-2 gap-1 p-1 border-t border-slate-50 mt-2">
                       <Link href="/profile" className="flex items-center gap-2 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                          <ShoppingBagIcon className="size-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">Aktivitas</span>
                       </Link>
                       <Link href="/settings" className="flex items-center gap-2 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                          <Cog6ToothIcon className="size-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">Setelan</span>
                       </Link>
                    </div>

                    <button 
                      onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/';
                      }}
                      className="w-full mt-1 p-3 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                       <ArrowRightOnRectangleIcon className="size-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-4">
                    <p className="text-sm font-bold text-slate-600">Opps! Kamu belum masuk.</p>
                    <Link href="/login" className="block w-full py-3 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-widest">
                       Login Sekarang
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>

  );
}
