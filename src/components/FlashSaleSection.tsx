'use client';

import { PromoEvent } from '@/types/cms';
import Image from 'next/image';
import Link from 'next/link';
import { BoltIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useEffect, useState, useRef } from 'react';
import { getEventTiming, formatCountdown } from '@/lib/date-utils';

export default function FlashSaleSection({ events }: { events: PromoEvent[] }) {
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0); 
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted || !events || events.length === 0) return null;

  // Find the active or next closest event for the header timer
  const activeEvents = events.map(e => ({
    ...e,
    timing: getEventTiming(e.event_day, e.start_time || '00:00', e.end_time || '23:59', e.headline)
  }));

  const globalTargetEvent = activeEvents
    .filter(e => e.timing.isActive)
    .sort((a, b) => a.timing.secondsUntilEnd - b.timing.secondsUntilEnd)[0];

  return (
    <section className="w-full bg-white py-8 border-b border-slate-100">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary group">
              <BoltIcon className="size-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight leading-none">
                  Flash <span className="text-primary">Sale</span>
                </h2>
                {globalTargetEvent?.timing?.isActive && (
                  <div className="flex items-center gap-1.5 bg-slate-100 text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg">
                    <ClockIcon className="size-3 text-red-500 animate-pulse" />
                    <span className="font-mono text-[11px] font-black tracking-tighter">
                      {formatCountdown(globalTargetEvent.timing.secondsUntilEnd)}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] font-medium text-slate-400 tracking-wide mt-1">Penawaran Terbatas</p>
            </div>
          </div>
          
          <Link 
            href="/catalog?filter=promo" 
            className="text-xs font-semibold text-primary hover:underline decoration-2 underline-offset-4 transition-all self-end sm:self-auto"
          >
            Lihat Semua
          </Link>
        </div>

        {/* Horizontal Carousel Wrapper */}
        <div className="relative group">
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activeEvents.map((event) => {
              const timing = event.timing;
              const statusLabel = timing.isActive 
                ? 'Sedang Berlangsung' 
                : timing.isExpired
                  ? 'Sudah Berakhir'
                  : `Hanya Hari ${timing.activeDayName}`;

              return (
                <div 
                  key={event.id}
                  className="flex-shrink-0 w-[46%] sm:w-[32%] lg:w-[280px] snap-start"
                >
                  <Link 
                    href={`/promo/${event.event_slug}`}
                    className="block h-full group/card"
                  >
                    <div className={`h-full bg-white border ${timing.isActive ? 'border-primary/20 shadow-primary/5' : 'border-slate-100'} rounded-2xl p-3 md:p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300`}>
                      {/* Top Row: Icon/Image & Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-shrink-0 size-8 md:size-10 rounded-xl bg-primary/5 flex items-center justify-center overflow-hidden border border-primary/5">
                          {event.banner_image_url ? (
                            <div className="relative size-full">
                              <Image 
                                src={event.banner_image_url} 
                                alt={event.headline} 
                                fill 
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <BoltIcon className="size-5 md:size-6 text-primary" />
                          )}
                        </div>
                        
                        <div className={`flex-shrink-0 ${timing.isActive ? 'bg-primary' : 'bg-slate-400'} text-white px-2 py-0.5 md:py-1 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-wider shadow-sm transition-colors`}>
                          {event.discount_percent ? `${event.discount_percent}% OFF` : 'PROMO'}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-slate-900 font-bold text-[11px] md:text-sm leading-tight line-clamp-1 mb-0.5 group-hover/card:text-primary transition-colors">
                          {event.headline}
                        </h3>
                        <p className="text-slate-400 text-[9px] md:text-[10px] leading-snug line-clamp-2 md:line-clamp-1 font-medium">
                          {event.description || 'Penawaran terbatas, cek sekarang!'}
                        </p>
                      </div>

                      {/* Bottom: Status Badge */}
                      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-50">
                        <ClockIcon className={`size-3 ${timing.isActive ? 'text-primary' : 'text-slate-300'}`} />
                        <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-tighter ${timing.isActive ? 'text-primary' : 'text-slate-400'}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
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
