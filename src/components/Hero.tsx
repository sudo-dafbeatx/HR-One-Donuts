"use client";

import Link from "next/link";
import Image from "next/image";
import { SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
}

export default function Hero({ 
  title = "HR-One Donuts",
  subtitle = "Seasonal Special",
  description = "Experience the world's softest artisan donuts, freshly glazed every hour with premium ingredients.",
  ctaText = "Explore Collection",
  ctaLink = "/catalog",
  imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAXIR0NVLdHD_MI5GKsJ_lHQ6WvlKEcvsmFg4qrbYJYAwgXD5sPT2msVMxBIdCIiSZ02NSsPtSwhyDmDiCiyn-8HSERoHwWitavGEyzCSrvjkPwk6UnA7gyaY6Wc-z_oZFMyMTaaMSR81uooBmN61Q4p8TH3bSSuJEsapzRyrQLcQete1XFZFv7sLUtJ1A4CNQCr_Pa6JGtC9d3uIAScGkAxRxLF9R1PVvgYUg9cYK5X4N8cxqnuFxHFQubWdihBeoksviXVH1Fjg"
}: HeroProps) {
  return (
    <section className="mb-12 w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8 overflow-hidden">
      <div className="relative w-full aspect-[21/9] lg:aspect-[3/1] rounded-lg overflow-hidden bg-slate-200 group shadow-2xl">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-10 transition-opacity duration-500 group-hover:from-black/80"></div>
        
        {/* Banner Image */}
        <div className="absolute inset-0">
          <Image 
            src={imageUrl}
            alt="Hero Banner"
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            priority
            sizes="100vw"
          />
        </div>

        {/* Text Content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 text-white max-w-4xl">
          <span className="bg-primary px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 w-fit animate-fade-in shadow-lg">
            {subtitle}
          </span>
          
          <h2 className="font-display text-3xl md:text-5xl lg:text-7xl font-black mb-4 leading-[1.1] animate-slide-up drop-shadow-lg">
            {title === "HR-One Donuts" ? (
              <>Indulge in <br/>Every Byte</>
            ) : title}
          </h2>
          
          <p className="text-sm md:text-lg lg:text-xl text-slate-100 max-w-lg mb-8 opacity-90 leading-relaxed font-medium animate-slide-up-delayed drop-shadow-md">
            {description}
          </p>
          
          <Link 
            href={ctaLink}
            className="bg-white text-primary hover:bg-primary hover:text-white transition-all duration-300 font-bold py-3 md:py-4 px-8 md:px-10 rounded-full w-fit flex items-center gap-2 shadow-xl hover:-translate-y-1 active:scale-95 animate-fade-in-delayed"
          >
            {ctaText} 
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </Link>
        </div>

        {/* Navigation Dots (Visual Only for now) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          <div className="size-2.5 rounded-full bg-white shadow-sm ring-4 ring-white/20"></div>
          <div className="size-2.5 rounded-full bg-white/40 hover:bg-white/60 transition-colors cursor-pointer"></div>
          <div className="size-2.5 rounded-full bg-white/40 hover:bg-white/60 transition-colors cursor-pointer"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-fade-in-delayed { animation: fade-in 0.8s ease-out 0.6s both; }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-slide-up-delayed { animation: slide-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s both; }
      `}</style>
    </section>
  );
}
