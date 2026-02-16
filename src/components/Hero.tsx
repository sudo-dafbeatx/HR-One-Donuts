"use client";

import Image from "next/image";
import { DEFAULT_COPY } from "@/lib/theme-defaults";
import EditableText from "@/components/cms/EditableText";
import { useEditMode } from "@/context/EditModeContext";
import { SiteSettings } from "@/types/cms";

interface HeroProps {
  copy?: Record<string, string>;
  siteSettings?: SiteSettings;
  imageUrl?: string;
}

export default function Hero({ 
  copy: _copy,
  siteSettings,
  imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAXIR0NVLdHD_MI5GKsJ_lHQ6WvlKEcvsmFg4qrbYJYAwgXD5sPT2msVMxBIdCIiSZ02NSsPtSwhyDmDiCiyn-8HSERoHwWitavGEyzCSrvjkPwk6UnA7gyaY6Wc-z_oZFMyMTaaMSR81uooBmN61Q4p8TH3bSSuJEsapzRyrQLcQete1XFZFv7sLUtJ1A4CNQCr_Pa6JGtC9d3uIAScGkAxRxLF9R1PVvgYUg9cYK5X4N8cxqnuFxHFQubWdihBeoksviXVH1Fjg"
}: HeroProps) {
  const { copy: liveCopy } = useEditMode();
  const copy = liveCopy || _copy || DEFAULT_COPY;
  
  return (
    <section className="w-full px-4 md:px-6 mb-8 mt-2 space-y-4">
      {/* 1. Featured Long Banner (from CMS Image) */}
      <div className="w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl bg-slate-100 overflow-hidden relative shadow-sm group">
        {siteSettings?.hero_banner_image ? (
          <Image 
            src={siteSettings.hero_banner_image} 
            alt="Hero Featured Banner" 
            fill 
            priority
            className="object-cover group-hover:scale-[1.02] transition-transform duration-700" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
            <div className="text-center max-w-xl">
               <h2 className="text-2xl md:text-4xl font-black text-primary mb-2 tracking-tight">
                 {siteSettings?.store_name || copy.hero_title}
               </h2>
               <p className="text-sm md:text-base text-slate-500 font-medium">
                 {siteSettings?.tagline || copy.hero_subtitle}
               </p>
            </div>
            <div className="absolute right-0 bottom-0 w-32 md:w-48 h-32 md:h-48 opacity-10 grayscale">
              <Image src={imageUrl} alt="Donut decoration" fill className="object-contain" />
            </div>
          </div>
        )}
      </div>

      {/* 2. Secondary Promotion Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Banner 1 - Promo Highlight */}
        <div className="h-32 rounded-2xl bg-primary relative overflow-hidden shadow-sm group hover:-translate-y-0.5 transition-transform">
          <div className="absolute inset-0 p-5 flex flex-col justify-center text-white z-10">
            <EditableText copyKey="banner_1_label" className="text-[10px] font-bold uppercase mb-1 opacity-80 tracking-widest" />
            <h4 className="font-bold text-xl leading-tight">
              <EditableText copyKey="banner_1_title" />
              <span className="block text-white/80"><EditableText copyKey="banner_1_subtitle" /></span>
            </h4>
          </div>
          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 size-24 opacity-20 scale-125 group-hover:rotate-12 transition-transform">
            <Image src={imageUrl} alt="Promo" fill className="object-contain" sizes="96px" />
          </div>
        </div>

        {/* Banner 2 - Special Offer */}
        <div className="h-32 rounded-2xl bg-secondary relative overflow-hidden shadow-sm group hover:-translate-y-0.5 transition-transform">
          <div className="absolute inset-0 p-5 flex flex-col justify-center text-white z-10">
            <EditableText copyKey="banner_2_label" className="text-[10px] font-bold uppercase mb-1 opacity-80 tracking-widest" />
            <h4 className="font-bold text-xl leading-tight">
              <EditableText copyKey="banner_2_title" />
              <span className="block text-white/80"><EditableText copyKey="banner_2_subtitle" /></span>
            </h4>
          </div>
          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 size-24 opacity-20 scale-125 group-hover:rotate-12 transition-transform">
            <Image src={imageUrl} alt="Offer" fill className="object-contain" sizes="96px" />
          </div>
        </div>
      </div>
    </section>
  );
}
