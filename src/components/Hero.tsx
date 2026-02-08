"use client";

import Link from "next/link";
import { SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function Hero({ 
  title = "HR-One Donuts",
  subtitle = "Homemade & Freshly Baked",
  description = "Nikmati kelembutan donat ragi premium kami yang dibuat dengan resep rahasia keluarga. Tekstur yang lembut lumer di mulut dengan varian rasa mewah yang memanjakan lidah.",
  ctaText = "Lihat Menu",
  ctaLink = "/catalog"
}: HeroProps) {
  return (
    <section className="relative flex min-h-[85vh] w-full items-center justify-center bg-white px-6 py-20 lg:px-40 overflow-hidden">
      {/* Background Ornaments - Keeping them clean/flat */}
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary/5 rounded-full pointer-events-none" />
      <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-primary/5 rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-[900px]">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 animate-fade-in">
          <SparklesIcon className="w-4 h-4" />
          <span className="uppercase tracking-wider">{subtitle}</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-heading leading-[1.1] tracking-tight mb-8">
          {title}
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-prose mb-10">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href={ctaLink}
            className="group relative flex items-center justify-center gap-2 rounded-2xl h-16 px-10 bg-primary text-white text-lg font-bold hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/25"
          >
            {ctaText}
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="#how-to-order"
            className="flex items-center justify-center rounded-2xl h-16 px-10 border-2 border-slate-200 text-slate-700 text-lg font-bold hover:bg-slate-50 transition-all duration-300"
          >
            Pelajari Cara Pesan
          </Link>
        </div>
      </div>
    </section>
  );
}
