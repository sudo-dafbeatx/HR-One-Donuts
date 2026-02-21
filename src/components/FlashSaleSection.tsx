'use client';

import { PromoEvent } from '@/types/cms';
import Link from 'next/link';
import { 
  MegaphoneIcon, 
  GiftIcon, 
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { getEventTiming } from '@/lib/date-utils';

export default function FlashSaleSection({ events, copy }: { events: PromoEvent[], copy?: Record<string, string> }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  if (!mounted || !events || events.length === 0) return null;

  // Enhance events with timing details
  const categorizedEvents = events.map(e => ({
    ...e,
    timing: getEventTiming(e.event_day, e.start_time || '00:00', e.end_time || '23:59', e.headline),
    isJumat: e.headline.toLowerCase().includes('jum\'at') || e.headline.toLowerCase().includes('jumat')
  }));

  return (
    <section className="w-full bg-white py-8 md:py-12 border-b border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--color-primary, #1152d4)' }}>
              Promo <span style={{ color: 'var(--color-text, #1e293b)' }}>Spesial</span>
            </h2>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-muted, #94a3b8)' }}>
              {copy?.section_flash_sale_subtitle || 'Penawaran terbatas untukmu hari ini'}
            </p>
          </div>
          
          <Link 
            href="/catalog?filter=promo" 
            className="group flex items-center gap-1.5 text-sm font-bold transition-all sm:pb-1"
            style={{ color: 'var(--color-primary, #1152d4)' }}
          >
            <span>{copy?.cta_view_all || 'Lihat Semua Promo'}</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Promo Grid (UIverse Style Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {categorizedEvents.map((event) => {
            const timing = event.timing;
            const statusLabel = timing.isActive 
              ? 'Terbatas Hari Ini' 
              : timing.isExpired
                ? 'Sudah Berakhir'
                : `Dimulai Hari ${timing.activeDayName}`;
            
            const IconComponent = event.isJumat ? GiftIcon : MegaphoneIcon;

            return (
              <div 
                key={event.id}
                className="relative overflow-hidden group w-full rounded-[20px] p-[1.5px] transition-all duration-300 sm:hover:scale-[1.02] sm:hover:-translate-y-1 shadow-sm hover:shadow-xl"
                style={{ 
                  background: `linear-gradient(to right, var(--color-primary, #1152d4), var(--color-secondary, #3b82f6))`
                }}
              >
                {/* 
                  Inner Wrapper: Creates the gradient border effect by masking the background
                  If you want a solid gradient card, adjust child bg. Here we use solid gradient.
                */}
                <div 
                  className="relative w-full h-full rounded-[18px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden z-10"
                  style={{ 
                    background: `linear-gradient(135deg, var(--color-primary, #1152d4) 0%, var(--color-secondary, #3b82f6) 100%)`,
                    color: 'var(--color-text-on-primary, #ffffff)'
                  }}
                >
                  {/* Glass Shimmer Decorative */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mx-10 -my-10 pointer-events-none" />
                  
                  {/* Top Layer: Icon & Status */}
                  <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {event.discount_percent && timing.isActive && (
                        <div className="px-3 py-1 bg-white text-slate-900 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
                          {event.discount_percent}% OFF
                        </div>
                      )}
                      {!timing.isActive && (
                         <div className="px-3 py-1 bg-black/40 text-white backdrop-blur-sm rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-sm">
                          Tidak Aktif
                         </div>
                      )}
                    </div>
                  </div>

                  {/* Main Copy Layer */}
                  <div className="relative z-10 flex-1 flex flex-col justify-center gap-2 mb-8">
                    <h3 className="text-2xl md:text-3xl font-black leading-tight drop-shadow-sm text-balance">
                      {event.headline}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm font-medium line-clamp-2 md:line-clamp-3 w-5/6">
                      {event.description || 'Penawaran promo spesial terbatas. Jangan sampai kelewatan periode promonya dan nikmati diskon khusus belanja hari ini!'}
                    </p>
                  </div>

                  {/* Bottom Action Layer */}
                  <div className="relative z-10 flex items-center justify-between mt-auto border-t border-white/20 pt-4">
                    <div className="flex items-center gap-1.5 opacity-90">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider">
                        {statusLabel}
                      </span>
                    </div>

                    <Link 
                      href={`/promo/${event.event_slug}`} 
                      className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md text-[11px] sm:text-xs font-black transition-all shadow-sm flex items-center gap-2 active:scale-95"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
