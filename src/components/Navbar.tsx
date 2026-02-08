"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { ShoppingBagIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const [mounted] = useState(() => typeof window !== "undefined");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-solid border-[#e7edf3] dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 md:px-20 lg:px-40 py-3">
      <div className="flex items-center justify-between whitespace-nowrap">
        <div className="flex items-center gap-3 text-primary">
          <div className="size-8">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 className="text-heading dark:text-white text-xl font-extrabold leading-tight tracking-tight">
            Donat Keluarga
          </h2>
        </div>
        <div className="hidden md:flex flex-1 justify-center gap-8">
          <Link href="#" className="text-sm font-semibold hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/catalog" className="text-sm font-semibold hover:text-primary transition-colors">
            Menu
          </Link>
          <Link href="#top-picks" className="text-sm font-semibold hover:text-primary transition-colors">
            Top Picks
          </Link>
          <Link href="#about" className="text-sm font-semibold hover:text-primary transition-colors">
            About
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-all"
          >
            <ShoppingBagIcon className="w-6 h-6" />
            {/* Always render badge with same structure to avoid hydration mismatch */}
            <span 
              className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm transition-all ${
                !mounted || totalItems === 0 ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'
              }`}
            >
              {mounted ? totalItems : 0}
            </span>
          </button>
          <Link
            href="/admin/login"
            className="flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-all"
            title="Admin Login"
          >
            <UserCircleIcon className="w-6 h-6" />
          </Link>
          <button className="hidden sm:flex min-w-[140px] cursor-pointer items-center justify-center rounded-xl h-10 px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <span>Order via WhatsApp</span>
          </button>
        </div>
      </div>
    </header>
  );
}
