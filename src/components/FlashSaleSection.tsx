'use client';

import { PromoEvent } from '@/types/cms';
import Image from 'next/image';
import Link from 'next/link';
import { FireIcon, SparklesIcon, BoltIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const eventIcons = {
  flash_sale: BoltIcon,
  jumat_berkah: SparklesIcon,
  takjil: ClockIcon,
  seasonal: SparklesIcon,
};

export default function FlashSaleSection({ events }: { events: PromoEvent[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer setting mounted to avoid synchronous cascading renders
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !events || events.length === 0) return null;

  return (
    <section className="relative w-full py-16 lg:py-24 overflow-hidden bg-[#0d141b]">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] -z-0 opacity-40 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] -z-0 opacity-30 -translate-x-1/4 translate-y-1/4" />
      
      <div className="container relative z-10 mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 mb-2">
              <FireIcon className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-red-500">Limited Time Offers</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
              Special <span className="text-primary not-italic">Flash</span> Sales
            </h2>
            <p className="text-slate-400 font-bold text-sm md:text-base max-w-md">
              Jangan lewatkan penawaran spesial minggu ini. Stok terbatas, kebahagiaan tak terbatas.
            </p>
          </div>
          
          <Link 
            href="/catalog?filter=promo" 
            className="group flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest hover:text-primary transition-colors"
          >
            Lihat Semua Promo
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
              <BoltIcon className="w-4 h-4" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.slice(0, 2).map((event, index) => {
            const Icon = eventIcons[event.event_type] || SparklesIcon;
            
            return (
              <div 
                key={event.id}
                className={`group relative aspect-[21/10] md:aspect-[21/9] rounded-[40px] overflow-hidden bg-slate-800 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-primary/20 ${index === 0 ? 'lg:translate-y-4' : ''}`}
              >
                {/* Image Treatment */}
                {event.banner_image_url ? (
                  <>
                    <Image 
                      src={event.banner_image_url} 
                      alt={event.title} 
                      fill 
                      className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0d141b] via-[#0d141b]/60 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-slate-900" />
                )}

                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center">
                  <div className="space-y-4 max-w-[70%]">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/30">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">
                        {event.event_type.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight leading-[1.1] group-hover:text-primary transition-colors duration-300">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Potongan</span>
                        <span className="text-3xl md:text-4xl font-black text-red-500 whitespace-nowrap">
                          {event.discount_percent}% <span className="text-xs text-white uppercase ml-1">OFF</span>
                        </span>
                      </div>
                      <div className="h-10 w-[1px] bg-white/10 mx-2" />
                      <Link 
                        href="/catalog?filter=promo"
                        className="h-12 px-6 rounded-2xl bg-white text-[#0d141b] flex items-center justify-center font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                      >
                        Claim Now
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Corner Decoration */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-700" />
              </div>
            );
          })}
        </div>

        {/* Floating Accent */}
        <div className="mt-16 flex justify-center opacity-20 hidden lg:flex">
          <div className="text-[120px] font-black text-white/5 uppercase tracking-tighter select-none pointer-events-none italic">
            HR-ONE DONUTS EXCLUSIVE
          </div>
        </div>
      </div>

      <style jsx>{`
        .italic { font-style: italic; }
      `}</style>
    </section>
  );
}
