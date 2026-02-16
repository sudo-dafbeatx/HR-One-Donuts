"use client";

import React from 'react';
import { Product } from '@/types/cms';
import { useCart } from "@/context/CartContext";
import { useLoading } from "@/context/LoadingContext";
import Link from 'next/link';
import Image from 'next/image';
import { isPromoActive, getEffectivePrice } from '@/lib/product-utils';

interface MarketplaceClientProps {
  initialProducts: Product[];
  categories?: string[];
}

export default function MarketplaceClient({ initialProducts, categories = [] }: MarketplaceClientProps) {
  const { addToCart } = useCart();
  const { setIsLoading } = useLoading();
  const [activeCategory, setActiveCategory] = React.useState<string>('Semua');
  
  // Sort products: focus on active promos first, then recent
  const sortedProducts = [...initialProducts].sort((a, b) => {
    const isAPromo = isPromoActive(a) ? 1 : 0;
    const isBPromo = isPromoActive(b) ? 1 : 0;
    if (isAPromo !== isBPromo) return isBPromo - isAPromo;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const filteredProducts = activeCategory === 'Semua' 
    ? sortedProducts 
    : sortedProducts.filter(p => p.category === activeCategory);

  const allCategories = ['Semua', ...categories];

  return (
    <div className="flex flex-col gap-8">
      {/* Category Filter Bar */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <p className="text-xl font-medium">Tidak ada produk di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
          {filteredProducts.map((product) => {
            const hasActivePromo = isPromoActive(product);
            const hasDiscount = hasActivePromo && product.discount_percent && product.discount_percent > 0;

            return (
              <div 
                key={product.id} 
                className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col relative"
              >
                {/* Image Container */}
                <div className="aspect-square relative overflow-hidden bg-slate-50">
                  {product.image_url ? (
                    <Image 
                      src={product.image_url} 
                      alt={product.name} 
                      fill 
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-4xl">🍩</div>
                  )}
                  
                  {/* Small Badges Overlay */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {hasDiscount && (
                      <div className="bg-red-500 text-white px-1.5 py-0.5 rounded font-bold text-[9px] shadow-sm">
                        -{product.discount_percent}%
                      </div>
                    )}
                  </div>

                  {product.tag && (
                    <div className="absolute bottom-2 left-2 bg-orange-500/90 text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider backdrop-blur-sm">
                      {product.tag}
                    </div>
                  )}
                </div>

                {/* Content - More Compact */}
                <div className="p-2.5 md:p-4 flex flex-col h-full gap-1 md:gap-2">
                  <Link href={`/catalog/${product.id}`} className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-xs md:text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex flex-col gap-0.5">
                    {hasDiscount && (
                      <span className="text-[9px] text-slate-400 line-through font-bold">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                    )}
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-primary font-bold text-sm md:text-lg tracking-tight">
                        Rp {getEffectivePrice(product).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                    <div className="text-[9px] font-medium text-slate-400">
                      Terjual {product.sold_count || 0}+
                    </div>
                    
                    <button 
                      onClick={async () => {
                        setIsLoading(true, 'Sabar ya...');
                        addToCart({ id: product.id, name: product.name, price: getEffectivePrice(product), image: product.image_url || '' }, 1);
                        await new Promise(r => setTimeout(r, 600));
                        setIsLoading(false);
                      }}
                      className="bg-primary text-white size-8 rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
