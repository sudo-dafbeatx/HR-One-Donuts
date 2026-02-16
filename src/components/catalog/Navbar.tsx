"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { ShoppingBagIcon, ChatBubbleLeftIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";

import { SiteSettings } from "@/types/cms";
import LogoBrand from "@/components/ui/LogoBrand";

export default function CatalogNavbar({ siteSettings }: { siteSettings?: SiteSettings }) {
  const { totalItems, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const [profileLink, setProfileLink] = useState("/login");
  const supabase = createClient();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    
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
    return () => clearTimeout(timer);
  }, [supabase]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-header-bg backdrop-blur-md px-6 md:px-10 lg:px-40 py-3 transition-colors duration-300">
      <div className="flex items-center justify-between gap-8 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 text-primary group">
            <LogoBrand 
              logoUrl={siteSettings?.logo_url} 
              storeName={siteSettings?.store_name} 
              size="sm"
              className="group-hover:scale-105 transition-transform"
            />
          </Link>
          <nav className="hidden sm:flex items-center gap-8">
            <Link href="/" className="text-subheading text-sm font-semibold hover:text-primary transition-colors">
              Beranda
            </Link>
            <Link href="/catalog" className="text-primary text-sm font-bold border-b-2 border-primary pb-0.5">
              Menu
            </Link>
            <Link href="/#about" className="text-subheading text-sm font-semibold hover:text-primary transition-colors">
              Tentang Kami
            </Link>
            <Link href="/#how-to-order" className="text-subheading text-sm font-semibold hover:text-primary transition-colors">
              Cara Pesan
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2 rounded-xl bg-card-bg text-subheading border border-border hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
            >
              <ShoppingBagIcon className="w-6 h-6" />
              {/* Only render badge after mount to avoid hydration mismatch */}
              {mounted && totalItems > 0 && (
                <span 
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm"
                >
                  {totalItems}
                </span>
              )}
            </button>
            <Link
              href={profileLink}
              className="flex items-center justify-center p-2 rounded-xl bg-card-bg text-subheading border border-border hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
              title={profileLink === '/admin' ? 'Admin Dashboard' : (profileLink === '/profile' ? 'My Profile' : 'Login')}
            >
              <UserCircleIcon className="w-6 h-6" />
            </Link>
            <a 
              href={`https://wa.me/${siteSettings?.whatsapp_number || '6281234567890'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center justify-center gap-2 rounded-xl h-10 px-5 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span className="truncate">Pesan via WhatsApp</span>
            </a>
          </div>
      </div>
    </header>
  );
}
