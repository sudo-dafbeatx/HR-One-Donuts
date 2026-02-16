"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteSettings } from "@/types/cms";
import { DEFAULT_COPY } from "@/lib/theme-defaults";
import EditableText from "@/components/cms/EditableText";
import { useEditMode } from "@/context/EditModeContext";

interface NavbarProps {
  siteSettings?: SiteSettings;
  copy?: Record<string, string>;
}

export default function Navbar({ siteSettings, copy: _copy }: NavbarProps) {
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
          .single();
        
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
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="size-8 md:size-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-lg md:text-2xl">donut_large</span>
          </div>
          <h1 className="font-display text-base md:text-lg font-black tracking-tight text-primary hidden sm:block">
            {siteSettings?.store_name || "HR-One Donuts"}
          </h1>
        </Link>

        {/* Search Bar - Centered */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input
              className="w-full bg-slate-50 border border-slate-100 rounded-full py-2 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 placeholder:text-slate-400 placeholder:font-medium transition-all text-sm outline-none"
              placeholder={copy.search_placeholder}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Utilities */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Mobile Search Icon - Only if we want to show it on mobile */}
          <button className="p-2 rounded-full hover:bg-slate-50 text-slate-500 md:hidden">
            <span className="material-symbols-outlined">search</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 rounded-full hover:bg-slate-50 text-slate-600 transition-all relative group"
            aria-label="View shopping cart"
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">shopping_bag</span>
            <span
              className={`absolute top-1 right-1 size-4 bg-primary text-white text-[9px] flex items-center justify-center rounded-full font-black border-2 border-white transition-all duration-300 ${
                !mounted || totalItems === 0 ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
            >
              {mounted ? totalItems : 0}
            </span>
          </button>

          {/* Account */}
          <Link
            href={profileLink}
            className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all bg-slate-50 overflow-hidden"
            title={profileLink === '/admin' ? 'Admin Dashboard' : (profileLink === '/profile' ? 'My Profile' : 'Login')}
          >
            <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-wider px-1 hidden lg:inline">
              <EditableText copyKey="nav_account" />
            </span>
            <div className="size-6 md:size-8 rounded-full bg-white shadow-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
