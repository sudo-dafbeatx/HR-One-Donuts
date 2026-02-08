"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { ShoppingBagIcon, ChatBubbleLeftIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { CakeIcon } from "@heroicons/react/24/solid";

export default function CatalogNavbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-header-bg backdrop-blur-md px-6 md:px-10 lg:px-40 py-3 transition-colors duration-300">
      <div className="flex items-center justify-between gap-8 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-primary group">
            <CakeIcon className="w-8 h-8 transition-transform group-hover:rotate-12" />
            <h2 className="text-heading text-lg font-extrabold leading-tight tracking-tight">
              Donat Keluarga
            </h2>
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
              href="/login"
              className="flex items-center justify-center p-2 rounded-xl bg-card-bg text-subheading border border-border hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
              title="Admin Login"
            >
              <UserCircleIcon className="w-6 h-6" />
            </Link>
            <button className="hidden sm:flex items-center justify-center gap-2 rounded-xl h-10 px-5 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span className="truncate">Pesan via WhatsApp</span>
            </button>
          </div>
      </div>
    </header>
  );
}
