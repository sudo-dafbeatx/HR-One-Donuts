interface HeroProps {
  siteSettings?: SiteSettings;
  imageUrl?: string;
}

export default function Hero({ 
  siteSettings,
  imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAXIR0NVLdHD_MI5GKsJ_lHQ6WvlKEcvsmFg4qrbYJYAwgXD5sPT2msVMxBIdCIiSZ02NSsPtSwhyDmDiCiyn-8HSERoHwWitavGEyzCSrvjkPwk6UnA7gyaY6Wc-z_oZFMyMTaaMSR81uooBmN61Q4p8TH3bSSuJEsapzRyrQLcQete1XFZFv7sLUtJ1A4CNQCr_Pa6JGtC9d3uIAScGkAxRxLF9R1PVvgYUg9cYK5X4N8cxqnuFxHFQubWdihBeoksviXVH1Fjg"
}: HeroProps) {
  
  return (
    <section className="w-full px-4 md:px-6 mb-6 mt-4">
      <div className="w-full relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm bg-slate-100 group">
        {/* Aspect Ratio Container: Mobile 16:9, Desktop 21:9 */}
        <div className="aspect-video md:aspect-[21/9] w-full relative">
           {/* Mobile Image (Visible on < md) */}
           <div className="block md:hidden absolute inset-0">
             {siteSettings?.hero_banner_mobile_image || siteSettings?.hero_banner_image ? (
               <Image 
                 src={siteSettings?.hero_banner_mobile_image || siteSettings?.hero_banner_image || imageUrl} 
                 alt={siteSettings?.store_name || "Hero Banner"} 
                 fill 
                 priority
                 className="object-cover" 
               />
             ) : (
               <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                 <span className="text-xs">No Mobile Banner</span>
               </div>
             )}
           </div>

           {/* Desktop Image (Visible on >= md) */}
           <div className="hidden md:block absolute inset-0">
             {siteSettings?.hero_banner_image ? (
               <Image 
                 src={siteSettings.hero_banner_image} 
                 alt={siteSettings?.store_name || "Hero Banner"} 
                 fill 
                 priority
                 className="object-cover group-hover:scale-[1.01] transition-transform duration-700" 
               />
             ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                 <span className="text-sm">No Desktop Banner</span>
               </div>
             )}
           </div>
        </div>
      </div>
    </section>
  );
}
