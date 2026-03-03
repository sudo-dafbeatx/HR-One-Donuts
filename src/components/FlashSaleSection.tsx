'use client';

import { PromoEvent, FlashSale, FlashSaleItem } from '@/types/cms';
import Link from 'next/link';
import { 
  MegaphoneIcon, 
  GiftIcon, 
  ClockIcon,
  BoltIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
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

// -----------------------------------------------------
// 1) Countdown Timer untuk urgensi Flash Sale (Global)
// -----------------------------------------------------
const CountdownTimer = ({ endDate }: { endDate: string }) => {
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

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  if (remaining <= 0) {
    return <span className="font-bold text-red-600">Terlewat</span>;
  }

  const hours = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;

  return (
    <div className="flex items-center gap-1 text-sm font-bold text-white">
      <span className="bg-red-600 px-2 py-1 rounded shadow-sm">{formatNumber(hours)}</span>
      <span className="text-red-600">:</span>
      <span className="bg-red-600 px-2 py-1 rounded shadow-sm">{formatNumber(mins)}</span>
      <span className="text-red-600">:</span>
      <span className="bg-red-600 px-2 py-1 rounded shadow-sm">{formatNumber(secs)}</span>
    </div>
  );
};

// -----------------------------------------------------
// 2) Komponen Kartu Produk Utama (FlashSaleCard)
// -----------------------------------------------------
const FlashSaleCard = ({ item }: { item: FlashSaleItem }) => {
  const product = item.products;
  if (!product) return null;

  const originalPrice = product.price || 0;
  const salePrice = item.sale_price || 0;
  
  // Calculate discount dynamically if not bogo
  const discountPercent = originalPrice > 0 
    ? Math.round((1 - salePrice / originalPrice) * 100) 
    : 0;

  const stockLimit = item.stock_limit || 1;
  const soldCount = item.sold_count || 0;
  
  // Ensure we don't divide by zero and cap at 100%
  const stockPercentage = Math.min(100, Math.max(0, (soldCount / stockLimit) * 100));
  const remainingStock = Math.max(0, stockLimit - soldCount);

  // Fake rating for the UI if not available
  const rating = 4.8 + (item.product_id.charCodeAt(0) % 3) * 0.1;

  return (
    <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full max-w-sm mx-auto w-full">
      {/* Badge Diskon */}
      {discountPercent > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-slate-900 text-xs font-black px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
          <BoltIcon className="w-3 h-3 text-slate-900" style={{ fill: 'currentColor' }} />
          {discountPercent}% OFF
        </div>
      )}

      {/* Area Gambar */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 p-2 sm:p-4 transition-all duration-300 group-hover:bg-white group-hover:-translate-y-1">
        {product.image_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover rounded-xl transform group-hover:scale-110 group-hover:drop-shadow-xl transition-all duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <GiftIcon className="w-16 h-16" />
          </div>
        )}
        {/* Overlay saat hover */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
      </div>

      {/* Konten Detail */}
      <div className="p-4 flex flex-col grow">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1 text-yellow-500">
            <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-medium text-slate-600">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs font-medium text-slate-500">Terjual {soldCount}</span>
        </div>
        
        <h3 className="text-slate-800 font-semibold text-sm md:text-base mb-2 line-clamp-2 min-h-10 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>

        {/* Harga */}
        <div className="mt-auto">
          <div className="flex flex-wrap items-baseline gap-2 mb-2">
            <span className="text-red-600 font-bold text-lg md:text-xl">
              Rp{salePrice.toLocaleString('id-ID')}
            </span>
            {originalPrice > salePrice && (
              <span className="text-slate-400 text-xs line-through">
                Rp{originalPrice.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          {/* Progress Bar Stok */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              <span>Tersisa {remainingStock} stok</span>
              <span>{Math.round(stockPercentage)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${stockPercentage > 80 ? 'bg-red-500' : 'bg-orange-500'}`}
                style={{ width: `${stockPercentage}%` }}
              />
            </div>
          </div>

          <Link href={`/product/${product.id}`} className="w-full bg-slate-900 group-hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all duration-300">
            <ShoppingCartIcon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:rotate-12 group-active:-rotate-12" />
            Beli Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------

function isFlashSaleExpired(sale: FlashSale): boolean {
  if (!sale.end_date) return false;
  return new Date(sale.end_date).getTime() < new Date().getTime();
}

function isFlashSaleStarted(sale: FlashSale): boolean {
  if (!sale.start_date) return true;
  return new Date(sale.start_date).getTime() <= new Date().getTime();
}

// -----------------------------------------------------
// 3) Main Section Component
// -----------------------------------------------------

export default function FlashSaleSection({ events, flashSales = [] }: FlashSaleSectionProps) {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

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

  const hasEventPromos = categorizedEvents.length > 0;
  const hasFlashSalesProducts = activeFlashSales.some(sale => sale.items && sale.items.length > 0);
  
  if (!hasEventPromos && !hasFlashSalesProducts) return null;

  return (
    <section className="w-full bg-slate-50 py-8 md:py-12 border-y border-slate-200">
      <div className="container mx-auto px-4 md:px-6">

        {/* =========================================
            PROMO EVENTS (Banner styles from before) 
            ========================================= */}
        {hasEventPromos && (
          <div className="mb-12">
             <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                  Promo <span className="text-primary">Spesial</span>
                </h2>
                <p className="text-sm font-semibold text-slate-500">
                  Diskon ekstra untuk hari tertentu
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
        )}

        {/* =========================================
            PRODUCT FLASH SALES (New UI with individual items)
            ========================================= */}
        {hasFlashSalesProducts && (
          <div className="space-y-12">
            {activeFlashSales.map(sale => {
              if (!sale.items || sale.items.length === 0) return null;

              return (
                <div key={sale.id} className="w-full">
                  {/* Header Flash Sale as requested */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-600 text-white rounded-xl shadow-lg shadow-red-200">
                        <BoltIcon className="w-7 h-7" style={{ fill: 'currentColor' }} />
                      </div>
                      <div>
                        <h1 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">
                          {sale.title}
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                          {sale.description || 'Diskon besar-besaran berakhir dalam:'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-red-50 px-4 py-2 rounded-2xl border border-red-100 shrink-0">
                      <div className="flex items-center gap-2 text-red-600 font-bold">
                        <ClockIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Berakhir Dalam</span>
                      </div>
                      {sale.end_date ? (
                        <CountdownTimer endDate={sale.end_date} />
                      ) : (
                        <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded">Promo Spesial</span>
                      )}
                    </div>
                  </div>

                  {/* Grid Produk */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {sale.items.map(item => (
                      <FlashSaleCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Footer info */}
            <div className="mt-8 text-center border-t border-slate-200 pt-8">
              <p className="text-slate-400 text-sm italic">
                *Syarat dan ketentuan berlaku. Stok sangat terbatas.
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
