"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeIconSolid, 
  ShoppingBagIcon as ShoppingBagIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BottomNav() {
  const pathname = usePathname();
  const [profileLink, setProfileLink] = useState("/login");
  const supabase = createClient();

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
      href: "/#about", 
      icon: InformationCircleIcon, 
      activeIcon: InformationCircleIconSolid 
    },
    { 
      label: "Cara Pesan", 
      href: "/#how-to-order", 
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe-area-inset-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href.startsWith('#') && pathname === '/');
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${
                isActive ? "text-primary" : "text-slate-400"
              }`}
            >
              <Icon className="size-6" />
              <span className="text-[10px] font-bold uppercase tracking-tight text-center px-1 truncate w-full">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
