"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeIconSolid, 
  ShoppingBagIcon as ShoppingBagIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from "@heroicons/react/24/solid";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function BottomNav() {
  const pathname = usePathname();
  const profileLink = "/login";
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    // Session state check removed to satisfy "no auth calls on public pages" requirement.
    // Real session state is handled at /profile or middleware.
  }, []);

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
      activeIcon: UserCircleIconSolid 
    },
  ];

  if (
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/onboarding') || 
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/promo')
  ) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe-area-inset-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;

          const content = (
            <>
              <div className="relative">
                <Icon className="size-6" />
                {item.isCart && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-scale-in">
                    {totalItems}
                  </span>
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
