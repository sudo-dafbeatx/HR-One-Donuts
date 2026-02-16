"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { SiteSettings } from "@/types/cms";
import { DEFAULT_COPY } from "@/lib/theme-defaults";
import EditableText from "@/components/cms/EditableText";

interface NavbarProps {
  siteSettings?: SiteSettings;
  copy?: Record<string, string>;
}

export default function Navbar({ siteSettings, copy: _copy }: NavbarProps) {
  const copy = _copy || DEFAULT_COPY;
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
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-14 md:h-16 flex items-center justify-between gap-3 md:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="size-9 md:size-10 bg-primary rounded-full flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl md:text-2xl">donut_large</span>
          </div>
          <h1 className="font-display text-lg md:text-xl font-extrabold tracking-tight text-primary hidden sm:block">
            {siteSettings?.store_name || copy.hero_title}
          </h1>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <div 
              className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none transition-colors"
              style={{ color: 'var(--theme-search-text)' }}
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input
              className="w-full border-none rounded-full py-2.5 md:py-3 pl-10 md:pl-12 pr-4 focus:ring-2 focus:ring-primary/20 placeholder:opacity-60 transition-all text-sm"
              style={{ 
                backgroundColor: 'var(--theme-search-bg)',
                color: 'var(--theme-search-text)'
              }}
              placeholder={copy.search_placeholder}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Utilities */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-6 mr-4 text-sm font-semibold">
            <Link className="text-primary border-b-2 border-primary pb-1" href="/">
              <EditableText copyKey="nav_home" />
            </Link>
            <Link className="text-slate-600 hover:text-primary transition-colors" href="/catalog">
              <EditableText copyKey="nav_menu" />
            </Link>
          </nav>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 md:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 transition-all relative"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span
              className={`absolute top-0.5 right-0.5 size-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white transition-all duration-300 ${
                !mounted || totalItems === 0 ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
            >
              {mounted ? totalItems : 0}
            </span>
          </button>

          {/* Notifications */}
          <button className="p-2 md:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 transition-all hidden md:flex">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          {/* Divider */}
          <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>

          {/* Account */}
          <Link
            href={profileLink}
            className="flex items-center gap-2 pl-1 md:pl-2 pr-1 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-all shadow-sm"
            style={{ 
              backgroundColor: 'var(--theme-account-bg)',
              color: 'var(--theme-account-text)'
            }}
            title={profileLink === '/admin' ? 'Admin Dashboard' : (profileLink === '/profile' ? 'My Profile' : 'Login')}
          >
            <span className="text-sm font-bold px-1.5 hidden lg:inline">
              <EditableText copyKey="nav_account" />
            </span>
            <div className="size-7 md:size-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-500 text-lg">person</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
