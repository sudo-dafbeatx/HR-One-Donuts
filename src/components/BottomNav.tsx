"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeIconSolid, 
  ShoppingBagIcon as ShoppingBagIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from "@heroicons/react/24/solid";
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
    // 0. Listen for chatbot state
    const handleChatState = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsChatOpen(!!customEvent.detail?.isOpen);
    };
    window.addEventListener('chatbot_state_change', handleChatState);

    const supabase = createClient();
    let channel: RealtimeChannel;

    // 1. Initial Check
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

    // 2. Realtime subscription
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
      icon: HomeIcon, 
      activeIcon: HomeIconSolid 
    },
    { 
      label: "Menu", 
      href: "/catalog", 
      icon: ShoppingBagIcon, 
      activeIcon: ShoppingBagIconSolid 
    },
    { 
      label: "Keranjang", 
      href: "#cart", 
      icon: ShoppingCartIcon, 
      activeIcon: ShoppingCartIconSolid,
      isCart: true
    },
    { 
      label: "Cara Pesan", 
      href: "/cara-pesan", 
      icon: QuestionMarkCircleIcon, 
      activeIcon: QuestionMarkCircleIconSolid 
    },
    { 
      label: "Akun", 
      href: profileLink, 
      icon: UserCircleIcon, 
      activeIcon: UserCircleIconSolid,
      isProfile: true
    },
    { 
      label: "Pengaturan", 
      href: "/settings", 
      icon: Cog6ToothIcon, 
      activeIcon: Cog6ToothIconSolid 
    },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe-area-inset-bottom">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;

          const content = (
            <>
              <div className="relative">
                <Icon className="size-6" />
                {item.isCart && totalItems > 0 && (
                  <span key={totalItems} className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-cart-bounce">
                    {totalItems}
                  </span>
                )}
                {item.isProfile && hasActiveOrders && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 border-2 border-white animate-pulse" />
                )}
              </div>
              <span className="text-[10px] font-medium text-center px-1 truncate w-full">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 bg-primary rounded-full" />
              )}
            </>
          );

          if (item.isCart) {
            return (
              <button
                key={item.label}
                onClick={() => setIsCartOpen(true)}
                className={`relative flex flex-col items-center justify-center gap-1 w-full h-full transition-all text-slate-400`}
              >
                {content}
              </button>
            );
          }

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${
                isActive ? "text-primary" : "text-slate-400"
              }`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
