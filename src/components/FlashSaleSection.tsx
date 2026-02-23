'use client';

import { PromoEvent, FlashSale } from '@/types/cms';
import Link from 'next/link';
import { 
  MegaphoneIcon, 
  GiftIcon, 
  ClockIcon,
  ArrowRightIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState, useCallback } from 'react';
import { getEventTiming, type EventTiming } from '@/lib/date-utils';
import { useTranslation } from '@/context/LanguageContext';

interface ProcessedPromoEvent extends PromoEvent {
  serverIsActive?: boolean;
  serverActiveDayName?: string;
  timing?: EventTiming;
  isJumat?: boolean;
}

interface FlashSaleSectionProps {
  events: ProcessedPromoEvent[];
  flashSales?: FlashSale[];
  copy?: Record<string, string>;
}

function FlashSaleCountdown({ endDate }: { endDate: string }) {
  const { t } = useTranslation();
  const calcRemaining = useCallback(() => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    return Math.max(0, Math.floor((end - now) / 1000));
  }, [endDate]);

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (r <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [calcRemaining]);

  if (remaining <= 0) return <span>{t('promo.expired')}</span>;

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;

  if (days > 0) {
    return <span>{days}d {hours}h {mins}m</span>;
  }
  return (
    <span className="tabular-nums">
      {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

function isFlashSaleExpired(sale: FlashSale): boolean {
  if (!sale.end_date) return false;
  return new Date(sale.end_date).getTime() < new Date().getTime();
}

function isFlashSaleStarted(sale: FlashSale): boolean {
  if (!sale.start_date) return true;
  return new Date(sale.start_date).getTime() <= new Date().getTime();
}

export default function FlashSaleSection({ events, flashSales = [] }: FlashSaleSectionProps) {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  const getDiscountLabel = useCallback((sale: FlashSale): string => {
    if (sale.discount_type === 'bogo') return t('promo.bogo');
    return t('promo.discount', { percent: sale.discount_value || 0 });
  }, [t]);

  const getDiscountBadge = useCallback((sale: FlashSale): string => {
    if (sale.discount_type === 'bogo') return 'BOGO';
    return `${sale.discount_value || 0}% OFF`;
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  if (!mounted) return null;

  // Filter flash sales: active, started, not expired
  const activeFlashSales = flashSales.filter(sale => 
    sale.is_active && isFlashSaleStarted(sale) && !isFlashSaleExpired(sale)
  );

  // Enhance events with timing details
  const categorizedEvents = events.map(e => ({
    ...e,
    timing: getEventTiming(e.event_day, e.start_time || '00:00', e.end_time || '23:59', e.headline),
    isJumat: e.headline.toLowerCase().includes('jum\'at') || e.headline.toLowerCase().includes('jumat')
  }));

  const hasContent = categorizedEvents.length > 0 || activeFlashSales.length > 0;
  if (!hasContent) return null;

  return (
    <section className="w-full bg-white py-8 md:py-12 border-b border-slate-100">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--color-primary, #1152d4)' }}>
              {t('promo.title').split(' ')[0]} <span style={{ color: 'var(--color-text, #1e293b)' }}>{t('promo.title').split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-muted, #94a3b8)' }}>
              {t('promo.subtitle')}
            </p>
          </div>
          
          <Link 
            href="/catalog?filter=promo" 
            className="group flex items-center gap-1.5 text-sm font-bold transition-all sm:pb-1"
            style={{ color: 'var(--color-primary, #1152d4)' }}
          >
            <span>{t('promo.view_all')}</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          {/* CMS Flash Sales (from flash_sales table) */}
          {activeFlashSales.map((sale) => {
            const IconComponent = sale.discount_type === 'bogo' ? GiftIcon : BoltIcon;

            return (
              <div 
                key={sale.id}
                className="relative overflow-hidden group w-full rounded-[20px] p-[1.5px] transition-all duration-300 sm:hover:scale-[1.02] sm:hover:-translate-y-1 shadow-sm hover:shadow-xl"
                style={{ 
                  background: `linear-gradient(to right, var(--color-primary, #1152d4), var(--color-secondary, #3b82f6))`
                }}
              >
                <div 
                  className="relative w-full h-full rounded-[18px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden z-10"
                  style={{ 
                    background: `linear-gradient(135deg, var(--color-primary, #1152d4) 0%, var(--color-secondary, #3b82f6) 100%)`,
                    color: 'var(--color-text-on-primary, #ffffff)'
                  }}
                >
                  {/* Glass Shimmer */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mx-10 -my-10 pointer-events-none" />
                  
                  {/* Top: Icon & Badge */}
                  <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="px-3 py-1 bg-white text-slate-900 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
                        {getDiscountBadge(sale)}
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="relative z-10 flex-1 flex flex-col justify-center gap-2 mb-8">
                    <h3 className="text-2xl md:text-3xl font-black leading-tight drop-shadow-sm text-balance">
                      {sale.title}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm font-medium line-clamp-2 md:line-clamp-3 w-5/6">
                      {sale.description || getDiscountLabel(sale)}
                    </p>
                  </div>

                  {/* Bottom: Countdown */}
                  <div className="relative z-10 flex items-center justify-between mt-auto border-t border-white/20 pt-4">
                    <div className="flex items-center gap-1.5 opacity-90">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider">
                        {sale.end_date ? (
                          <FlashSaleCountdown endDate={sale.end_date} />
                        ) : (
                          t('promo.now')
                        )}
                      </span>
                    </div>

                    <Link 
                      href="/catalog?filter=promo"
                      className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md text-[11px] sm:text-xs font-black transition-all shadow-sm flex items-center gap-2 active:scale-95"
                    >
                      {t('promo.shop_now')}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Event-based Promos (from promo_events table) */}
          {categorizedEvents.map((event) => {
            const serverIsActive = event.serverIsActive;
            const serverActiveDayName = event.serverActiveDayName;

            const statusLabel = serverIsActive 
              ? t('promo.limited_today') 
              : t('promo.starts_at', { day: t(`days.${serverActiveDayName}`) });
            
            const IconComponent = event.isJumat ? GiftIcon : MegaphoneIcon;

            return (
              <div 
                key={event.id}
                className="relative overflow-hidden group w-full rounded-[20px] p-[1.5px] transition-all duration-300 sm:hover:scale-[1.02] sm:hover:-translate-y-1 shadow-sm hover:shadow-xl"
                style={{ 
                  background: `linear-gradient(to right, var(--color-primary, #1152d4), var(--color-secondary, #3b82f6))`
                }}
              >
                <div 
                  className="relative w-full h-full rounded-[18px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden z-10"
                  style={{ 
                    background: `linear-gradient(135deg, var(--color-primary, #1152d4) 0%, var(--color-secondary, #3b82f6) 100%)`,
                    color: 'var(--color-text-on-primary, #ffffff)'
                  }}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mx-10 -my-10 pointer-events-none" />
                  
                  <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {event.discount_percent && serverIsActive && (
                        <div className="px-3 py-1 bg-white text-slate-900 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg">
                          {event.discount_percent}% OFF
                        </div>
                      )}
                      {!serverIsActive && (
                         <div className="px-3 py-1 bg-black/40 text-white backdrop-blur-sm rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-sm">
                          {t('promo.not_active')}
                         </div>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col justify-center gap-2 mb-8">
                    <h3 className="text-2xl md:text-3xl font-black leading-tight drop-shadow-sm text-balance">
                      {event.headline}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm font-medium line-clamp-2 md:line-clamp-3 w-5/6">
                      {event.description || 'Penawaran promo spesial terbatas. Jangan sampai kelewatan periode promonya dan nikmati diskon khusus belanja hari ini!'}
                    </p>
                  </div>

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
                      {t('promo.view_details')}
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
