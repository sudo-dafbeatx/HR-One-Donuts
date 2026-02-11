"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { ShoppingBagIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-header-bg/80 backdrop-blur-xl px-6 md:px-20 lg:px-40 py-5 transition-all duration-300 border-b border-border">
      <div className="flex items-center justify-between whitespace-nowrap">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 text-primary group">
            <div className="size-10 group-hover:rotate-12 transition-transform duration-300">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-heading text-2xl font-black leading-tight tracking-tighter">
              HR-One<span className="text-primary">.</span>
            </h2>
          </Link>
          <nav className="hidden lg:flex items-center gap-10">
            {['Beranda', 'Menu', 'Tentang Kami', 'Cara Pesan'].map((item) => (
              <Link 
                key={item}
                href={item === 'Beranda' ? '/' : item === 'Menu' ? '/catalog' : `/#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-sm font-bold text-subheading hover:text-primary transition-all relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-3 md:gap-5">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center p-3 rounded-2xl bg-card-bg text-subheading border border-border hover:border-primary/50 hover:text-primary transition-all shadow-sm"
          >
            <ShoppingBagIcon className="w-6 h-6" />
            <span 
              className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-black text-white shadow-lg border-2 border-white transition-all duration-500 ${
                !mounted || totalItems === 0 ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
            >
              {mounted ? totalItems : 0}
            </span>
          </button>
          
          <Link
            href="/admin/login"
            className="flex items-center justify-center p-3 rounded-2xl bg-card-bg text-subheading border border-border hover:border-primary/50 hover:text-primary transition-all shadow-sm"
            title="Admin Login"
          >
            <UserCircleIcon className="w-6 h-6" />
          </Link>

          <button className="hidden md:flex items-center justify-center rounded-2xl h-12 px-7 bg-primary text-white text-sm font-black shadow-xl shadow-primary/25 hover:bg-primary hover:scale-105 active:scale-95 transition-all">
            Pesan via WhatsApp
          </button>
        </div>
      </div>
    </header>
  );
}
