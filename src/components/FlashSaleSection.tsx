'use client';

import { PromoEvent } from '@/types/cms';
import Image from 'next/image';
import Link from 'next/link';
import { BoltIcon, FireIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useEffect, useState, useRef } from 'react';

export default function FlashSaleSection({ events }: { events: PromoEvent[] }) {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !events || events.length === 0) return null;

  return (
    <section className="w-full bg-white py-8 border-b border-slate-100">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary group">
              <BoltIcon className="size-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">
                Flash <span className="text-primary">Sale</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Penawaran Terbatas</p>
            </div>
          </div>
          
          <Link 
            href="/catalog?filter=promo" 
            className="text-xs font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all"
          >
            Lihat Semua
          </Link>
        </div>

        {/* Horizontal Carousel Wrapper */}
        <div className="relative group">
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {events.map((event) => (
              <div 
                key={event.id}
                className="flex-shrink-0 w-[85%] sm:w-[50%] lg:w-[32%] snap-center"
              >
                <div className="relative aspect-[21/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm group/card hover:shadow-md transition-shadow">
                  {/* Banner Image */}
                  {event.banner_image_url ? (
                    <Image 
                      src={event.banner_image_url} 
                      alt={event.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                      <BoltIcon className="size-12 text-slate-300" />
                    </div>
                  )}

                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                        <FireIcon className="size-3" />
                        Flash Sale
                      </div>
                      {event.discount_percent && (
                        <div className="bg-white text-red-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                          -{event.discount_percent}%
                        </div>
                      )}
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-lg font-black uppercase tracking-tight leading-tight truncate mb-1">
                          {event.title}
                        </h3>
                        {event.end_at && (
                          <div className="flex items-center gap-1.5 text-white/80">
                            <ClockIcon className="size-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                              Terbatas
                            </span>
                          </div>
                        )}
                      </div>

                      <Link 
                        href="/catalog?filter=promo"
                        className="flex-shrink-0 bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-all shadow-lg active:scale-95"
                      >
                        Lihat Promo
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Hints - Only visible on desktop if many items */}
          {events.length > 3 && (
            <>
              <div className="hidden lg:block absolute -left-4 top-1/2 -translate-y-1/2">
                <div className="size-10 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="material-symbols-outlined text-sm">arrow_back_ios_new</span>
                </div>
              </div>
              <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2">
                <div className="size-10 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
