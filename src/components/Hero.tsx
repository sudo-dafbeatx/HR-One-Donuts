"use client";

import Image from "next/image";

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
}

export default function Hero({ 
  imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAXIR0NVLdHD_MI5GKsJ_lHQ6WvlKEcvsmFg4qrbYJYAwgXD5sPT2msVMxBIdCIiSZ02NSsPtSwhyDmDiCiyn-8HSERoHwWitavGEyzCSrvjkPwk6UnA7gyaY6Wc-z_oZFMyMTaaMSR81uooBmN61Q4p8TH3bSSuJEsapzRyrQLcQete1XFZFv7sLUtJ1A4CNQCr_Pa6JGtC9d3uIAScGkAxRxLF9R1PVvgYUg9cYK5X4N8cxqnuFxHFQubWdihBeoksviXVH1Fjg"
}: HeroProps) {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-4 overflow-hidden">
      <div className="relative w-full aspect-[21/9] lg:aspect-[4/1] rounded-2xl overflow-hidden bg-slate-100 group shadow-sm border border-slate-100">
        {/* Banner Images (Slider Mockup) */}
        <div className="absolute inset-0">
          <Image 
            src={imageUrl}
            alt="Promo Banner"
            fill
            className="w-full h-full object-cover"
            priority
            sizes="100vw"
          />
        </div>

        {/* Minimalist Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>

        {/* Navigation Dots (Shopee Style) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 bg-black/10 backdrop-blur-sm px-2 py-1.5 rounded-full">
          <div className="size-1.5 rounded-full bg-primary ring-2 ring-primary/20"></div>
          <div className="size-1.5 rounded-full bg-white/60"></div>
          <div className="size-1.5 rounded-full bg-white/60"></div>
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
