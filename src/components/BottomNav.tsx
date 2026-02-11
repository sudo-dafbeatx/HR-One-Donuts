"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  InformationCircleIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeIconSolid, 
  ShoppingBagIcon as ShoppingBagIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid
} from "@heroicons/react/24/solid";

export default function BottomNav() {
  const pathname = usePathname();

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
      label: "Tentang", 
      href: "#about", 
      icon: InformationCircleIcon, 
      activeIcon: InformationCircleIconSolid 
    },
    { 
      label: "Cara Pesan", 
      href: "#how-to-order", 
      icon: QuestionMarkCircleIcon, 
      activeIcon: QuestionMarkCircleIconSolid 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href.startsWith('#') && pathname === '/');
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${
                isActive ? "text-primary" : "text-slate-400"
              }`}
            >
              <Icon className="size-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 size-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
