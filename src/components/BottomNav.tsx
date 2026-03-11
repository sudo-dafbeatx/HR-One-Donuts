"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export default function BottomNav() {
  const pathname = usePathname();
  const profileLink = "/profile";
  const { totalItems, setIsCartOpen } = useCart();
  const [hasActiveOrders, setHasActiveOrders] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleChatState = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsChatOpen(!!customEvent.detail?.isOpen);
    };
    window.addEventListener('chatbot_state_change', handleChatState);

    const supabase = createClient();
    let channel: RealtimeChannel;

    const checkActiveOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['pending', 'shipping', 'ready']);
      
      setHasActiveOrders(count ? count > 0 : false);
    };

    checkActiveOrders();

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('active_orders_nav')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            checkActiveOrders();
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('chatbot_state_change', handleChatState);
    };
  }, []);

  if (pathname && (pathname.startsWith('/terms') || pathname.startsWith('/privacy') || pathname.startsWith('/cookies'))) return null;

  const navItems = [
    { 
      label: "Beranda", 
      href: "/", 
      icon: "home"
    },
    { 
      label: "Menu", 
      href: "/catalog", 
      icon: "fastfood"
    },
    { 
      label: "Keranjang", 
      href: "#cart", 
      icon: "shopping_bag",
      isCart: true
    },
    { 
      label: "Cara Pesan", 
      href: "/cara-pesan", 
      icon: "menu_book"
    },
    { 
      label: "Akun", 
      href: profileLink, 
      icon: "person",
      isProfile: true
    }
  ];

  if (
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/onboarding') || 
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/promo') ||
    pathname === '/settings/help/chat' ||
    isChatOpen
  ) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-slate-100 pb-safe-area-inset-bottom shadow-[0_-2px_15px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-5 h-[64px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          const content = (
            <div className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${isActive ? "text-primary" : "text-slate-400 font-medium"}`}>
              <div className="relative flex items-center justify-center h-6 w-6">
                <span className={`material-symbols-outlined text-[26px] ${isActive ? 'fill-1' : ''}`}>
                  {item.icon}
                </span>
                {item.isCart && totalItems > 0 && (
                  <span key={totalItems} className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border-2 border-white animate-cart-bounce">
                    {totalItems}
                  </span>
                )}
                {item.isProfile && hasActiveOrders && (
                  <span className="absolute top-0 right-0 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 border-2 border-white" />
                )}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-extrabold ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          );

          if (item.isCart) {
            return (
              <button
                key={item.label}
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center w-full h-full active:scale-90 transition-transform"
              >
                {content}
              </button>
            );
          }

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className="relative flex items-center justify-center w-full h-full active:scale-90 transition-transform"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
