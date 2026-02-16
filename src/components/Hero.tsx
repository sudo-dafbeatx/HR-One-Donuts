"use client";

import Image from "next/image";
import { DEFAULT_COPY } from "@/lib/theme-defaults";
import EditableText from "@/components/cms/EditableText";
import { useEditMode } from "@/context/EditModeContext";

interface HeroProps {
  copy?: Record<string, string>;
  imageUrl?: string;
}

export default function Hero({ 
  copy: _copy,
  imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAXIR0NVLdHD_MI5GKsJ_lHQ6WvlKEcvsmFg4qrbYJYAwgXD5sPT2msVMxBIdCIiSZ02NSsPtSwhyDmDiCiyn-8HSERoHwWitavGEyzCSrvjkPwk6UnA7gyaY6Wc-z_oZFMyMTaaMSR81uooBmN61Q4p8TH3bSSuJEsapzRyrQLcQete1XFZFv7sLUtJ1A4CNQCr_Pa6JGtC9d3uIAScGkAxRxLF9R1PVvgYUg9cYK5X4N8cxqnuFxHFQubWdihBeoksviXVH1Fjg"
}: HeroProps) {
  const { copy: liveCopy } = useEditMode();
  const copy = liveCopy || _copy || DEFAULT_COPY;
  
  return (
    <section className="mb-4 md:mb-6 overflow-hidden bg-transparent">
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x px-4 lg:px-6">
        {/* Banner 1 */}
        <div className="min-w-[280px] md:min-w-[320px] h-32 rounded-lg bg-primary relative overflow-hidden snap-start shrink-0">
          <div className="absolute inset-0 p-4 flex flex-col justify-center text-white z-10">
            <EditableText copyKey="banner_1_label" className="text-[10px] font-bold uppercase mb-1 opacity-80" />
            <h4 className="font-bold text-lg leading-tight">
              <EditableText copyKey="banner_1_title" /><br/>
              <EditableText copyKey="banner_1_subtitle" />
            </h4>
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 size-24 opacity-40 relative">
            <Image src={imageUrl} alt={copy.banner_1_label} fill className="object-contain" sizes="96px" />
          </div>
        </div>

        {/* Banner 2 */}
        <div className="min-w-[280px] md:min-w-[320px] h-32 rounded-lg bg-secondary relative overflow-hidden snap-start shrink-0">
          <div className="absolute inset-0 p-4 flex flex-col justify-center text-white z-10">
            <EditableText copyKey="banner_2_label" className="text-[10px] font-bold uppercase mb-1 opacity-80" />
            <h4 className="font-bold text-lg leading-tight">
              <EditableText copyKey="banner_2_title" /><br/>
              <EditableText copyKey="banner_2_subtitle" />
            </h4>
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 size-24 opacity-40 relative">
            <Image src={imageUrl} alt={copy.banner_2_label} fill className="object-contain" sizes="96px" />
          </div>
        </div>

        {/* Banner 3 */}
        <div className="min-w-[280px] md:min-w-[320px] h-32 rounded-lg bg-primary relative overflow-hidden snap-start shrink-0" style={{ filter: 'brightness(1.15)' }}>
          <div className="absolute inset-0 p-4 flex flex-col justify-center text-white z-10" style={{ filter: 'brightness(0.87)' }}>
            <EditableText copyKey="banner_3_label" className="text-[10px] font-bold uppercase mb-1 opacity-80" />
            <h4 className="font-bold text-lg leading-tight">
              <EditableText copyKey="banner_3_title" /><br/>
              <EditableText copyKey="banner_3_subtitle" />
            </h4>
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 size-24 opacity-40 relative" style={{ filter: 'brightness(0.87)' }}>
            <Image src={imageUrl} alt={copy.banner_3_label} fill className="object-contain" sizes="96px" />
          </div>
        </div>
      </div>
    </section>
  );
}
