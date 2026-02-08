"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBagIcon, ChatBubbleLeftIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { CakeIcon } from "@heroicons/react/24/solid";

export default function CatalogNavbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const mounted = typeof window !== "undefined";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-solid border-[#e7edf3] dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-10 lg:px-40 py-3">
      <div className="flex items-center justify-between gap-8 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-primary group">
            <CakeIcon className="w-8 h-8 transition-transform group-hover:rotate-12" />
            <h2 className="text-heading dark:text-white text-lg font-extrabold leading-tight tracking-tight">
              Donat Keluarga
            </h2>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-heading dark:text-slate-300 text-sm font-semibold hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/catalog" className="text-primary text-sm font-bold border-b-2 border-primary pb-0.5">
              Catalog
            </Link>
            <Link href="/#about" className="text-heading dark:text-slate-300 text-sm font-semibold hover:text-primary transition-colors">
              About Us
            </Link>
            <Link href="/#how-to-order" className="text-heading dark:text-slate-300 text-sm font-semibold hover:text-primary transition-colors">
              How to Order
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-all"
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
              className="flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary transition-all"
              title="Admin Login"
            >
              <UserCircleIcon className="w-6 h-6" />
            </Link>
            <button className="hidden sm:flex items-center justify-center gap-2 rounded-xl h-10 px-5 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span className="truncate">Order via WhatsApp</span>
            </button>
          </div>
      </div>
    </header>
  );
}
