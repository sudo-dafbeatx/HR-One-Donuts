"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { ShoppingBagIcon, UserCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";

import { SiteSettings } from "@/types/cms";

export default function Navbar({ siteSettings }: { siteSettings?: SiteSettings }) {
  const { totalItems, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileLink, setProfileLink] = useState("/login");
  const supabase = createClient();

  useEffect(() => {
    // Defer setting mounted to avoid synchronous cascading renders
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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 px-4 md:px-8 py-3 md:py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4 md:gap-8">
        {/* Brand & Tagline */}
        <Link href="/" className="flex flex-col shrink-0">
          <h1 className="text-primary text-xl md:text-2xl font-black leading-tight tracking-tighter">
            {siteSettings?.store_name || "HR-One Donuts"}
          </h1>
          <p className="text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest -mt-1 group-hover:text-primary/70 transition-colors">
            {siteSettings?.tagline || "Fresh and Smooth"}
          </p>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/" className="text-sm font-bold text-slate-600 hover:text-primary transition-all">Beranda</Link>
          <Link href="/catalog" className="text-sm font-bold text-slate-600 hover:text-primary transition-all">Menu</Link>
          <Link href="/#about" className="text-sm font-bold text-slate-600 hover:text-primary transition-all">Tentang Kami</Link>
          <Link href="/#how-to-order" className="text-sm font-bold text-slate-600 hover:text-primary transition-all">Cara Pesan</Link>
        </nav>

        {/* Search Bar - Hidden on Mobile, shown in second row below */}
        <div className="hidden md:flex flex-1 max-w-sm relative">
          <input
            type="text"
            placeholder="Cari donat..."
            className="w-full h-11 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="group relative p-2.5 rounded-xl text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
          >
            <ShoppingBagIcon className="size-6" />
            <span 
              className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-lg border-2 border-white transition-all duration-300 ${
                !mounted || totalItems === 0 ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
            >
              {mounted ? totalItems : 0}
            </span>
          </button>
          
          <Link
            href={profileLink}
            className="p-2.5 rounded-xl text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
            title={profileLink === '/admin' ? 'Admin Dashboard' : (profileLink === '/profile' ? 'My Profile' : 'Login')}
          >
            <UserCircleIcon className="size-6" />
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar - Visible only on Mobile */}
      <div className="md:hidden relative">
        <input
          type="text"
          placeholder="Cari donat favoritmu..."
          className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
      </div>
    </header>
  );
}
