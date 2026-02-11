"use client";

import React, { useRef, useMemo } from 'react';
import { Product } from '@/types/cms';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { isPromoActive } from '@/lib/product-utils';

interface PromotionsProps {
  products: Product[];
  onSelectSaleType: (type: 'flash_sale' | 'jumat_berkah' | 'takjil') => void;
}

export default function Promotions({ products, onSelectSaleType }: PromotionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const promoProducts = useMemo(() => {
    return products.filter(p => isPromoActive(p));
  }, [products]);

  // Group products by sale_type to identify active events
  const activeEvents = [
    { type: 'flash_sale', title: 'Flash Sale Special', icon: '⚡' },
    { type: 'jumat_berkah', title: 'Jumat Berkah', icon: '🙏' },
    { type: 'takjil', title: 'Menu Takjil Ramadan', icon: '🌙' },
  ].filter(event => 
    promoProducts.some(p => p.sale_type === event.type)
  );

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (activeEvents.length === 0) {
    return (
      <div className="mb-6 py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum ada promo aktif hari ini</p>
      </div>
    );
  }

  return (
    <div className="relative mb-8 group">
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory"
      >
        {activeEvents.map((event) => {
          const eventProducts = products.filter(p => p.sale_type === event.type);
          const maxDiscount = Math.max(...eventProducts.map(p => p.discount_percent || 0));

          return (
            <div 
              key={event.type}
              className="flex-shrink-0 w-full md:w-[450px] bg-primary rounded-3xl p-6 md:p-8 text-white snap-start relative overflow-hidden"
            >
              {/* Abstract background shapes */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 size-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 size-48 bg-white/5 rounded-full blur-2xl"></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl md:text-4xl">{event.icon}</span>
                  {maxDiscount > 0 && (
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/20">
                      Diskon Up to {maxDiscount}%
                    </span>
                  )}
                </div>

                <h2 className="text-2xl md:text-3xl font-black mb-2">{event.title}</h2>
                <p className="text-white/80 text-sm font-medium mb-6 max-w-[280px]"> Nikmati penawaran spesial {event.title} hanya untuk waktu terbatas!</p>

                <button
                  key={event.type}
                  onClick={() => onSelectSaleType(event.type as 'flash_sale' | 'jumat_berkah' | 'takjil')}
                  className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-sm transition-colors backdrop-blur-sm border border-white/30 active:scale-95"
                >
                  Lihat Promo
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeEvents.length > 1 && (
        <>
          <button 
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 size-10 bg-white rounded-full shadow-lg flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 size-10 bg-white rounded-full shadow-lg flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}
