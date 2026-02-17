"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteSettings } from "@/types/cms";
import { DEFAULT_COPY } from "@/lib/theme-defaults";
import EditableText from "@/components/cms/EditableText";
import { useEditMode } from "@/context/EditModeContext";
import LogoBrand from "@/components/ui/LogoBrand";

interface NavbarProps {
  siteSettings?: SiteSettings;
  copy?: Record<string, string>;
  hideLogo?: boolean;
}

export default function Navbar({ siteSettings, copy: _copy, hideLogo }: NavbarProps) {
  const { copy: liveCopy } = useEditMode();
  const copy = liveCopy || _copy || DEFAULT_COPY;
  const { totalItems, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileLink, setProfileLink] = useState("/login");
  const supabase = createClient();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.role === 'admin') {
          setProfileLink('/admin');
        } else {
          setProfileLink('/profile');
        }
      } else {
        setProfileLink('/login');
      }
    };

    checkUser();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] supports-[backdrop-filter]:bg-white/60">
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

        {/* Search Bar - Centered */}
        <div className="flex-1 max-w-xl hidden md:block">
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

        {/* Utilities */}
        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
          {/* Mobile Search Icon */}
          <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 md:hidden transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-all relative group"
            aria-label="View shopping cart"
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">shopping_bag</span>
            <span
              className={`absolute top-1.5 right-1.5 size-4 bg-primary text-white text-[9px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm transition-all duration-300 ${
                !mounted || totalItems === 0 ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
            >
              {mounted ? totalItems : 0}
            </span>
          </button>

          {/* Account */}
          <Link
            href={profileLink}
            className="flex items-center gap-3 p-1.5 md:pl-4 md:pr-1.5 rounded-2xl border border-slate-200/60 hover:border-primary/30 hover:shadow-md transition-all bg-white/50 backdrop-blur-sm group"
            title={profileLink === '/admin' ? 'Admin Dashboard' : (profileLink === '/profile' ? 'My Profile' : 'Login')}
          >
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest hidden lg:inline-block group-hover:text-primary transition-colors">
              <EditableText copyKey="nav_account" />
            </span>
            <div className="size-8 md:size-10 rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-slate-500 group-hover:text-primary text-xl">person</span>
            </div>
          </Link>

          {/* Chat Admin */}
          <a 
            href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER || '6285810658117'}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 h-10 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-500/20 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            Chat Admin
          </a>
        </div>
      </div>
    </header>

  );
}
