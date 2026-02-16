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
    <section className="mb-4 md:mb-6 overflow-hidden bg-transparent">
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x px-4 lg:px-6">
        {/* Flash Sale Banner */}
        <div className="min-w-[280px] md:min-w-[320px] h-32 rounded-lg bg-primary relative overflow-hidden snap-start shrink-0">
          <div className="absolute inset-0 p-4 flex flex-col justify-center text-white z-10">
            <span className="text-[10px] font-bold uppercase mb-1 opacity-80">Flash Sale</span>
            <h4 className="font-bold text-lg leading-tight">Diskon s.d 50%<br/>Jam 14:00 - 16:00</h4>
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 size-24 opacity-40 relative">
            <Image
              src={imageUrl}
              alt="Flash Sale"
              fill
              className="object-contain"
              sizes="96px"
            />
          </div>
        </div>

        {/* Jumat Berkah Banner */}
        <div className="min-w-[280px] md:min-w-[320px] h-32 rounded-lg bg-blue-700 relative overflow-hidden snap-start shrink-0">
          <div className="absolute inset-0 p-4 flex flex-col justify-center text-white z-10">
            <span className="text-[10px] font-bold uppercase mb-1 opacity-80">Jumat Berkah</span>
            <h4 className="font-bold text-lg leading-tight">Beli 1 Lusin<br/>Gratis 2 Donat</h4>
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 size-24 opacity-40 relative">
            <Image
              src={imageUrl}
              alt="Jumat Berkah"
              fill
              className="object-contain"
              sizes="96px"
            />
          </div>
        </div>

        {/* Takjil Series Banner */}
        <div className="min-w-[280px] md:min-w-[320px] h-32 rounded-lg bg-blue-500 relative overflow-hidden snap-start shrink-0">
          <div className="absolute inset-0 p-4 flex flex-col justify-center text-white z-10">
            <span className="text-[10px] font-bold uppercase mb-1 opacity-80">Takjil Series</span>
            <h4 className="font-bold text-lg leading-tight">Menu Buka Puasa<br/>Mulai Rp 10rb</h4>
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 size-24 opacity-40 relative">
            <Image
              src={imageUrl}
              alt="Takjil Series"
              fill
              className="object-contain"
              sizes="96px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
