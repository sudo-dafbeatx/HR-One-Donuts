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

  // Map category names to material icons
  const categoryIcons: Record<string, string> = {
    'Semua': 'apps',
    'Glazed': 'donut_large',
    'Savory': 'restaurant',
    'Box Sets': 'inventory_2',
    'Limited': 'new_releases',
    'Drinks': 'local_cafe',
    'Donat': 'donut_large',
    'Minuman': 'local_cafe',
    'Paket': 'inventory_2',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Icon-based Category Navigation */}
      {categories.length > 0 && (
        <div className="flex justify-start gap-4 overflow-x-auto pb-2 no-scrollbar">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex flex-col items-center gap-1.5 min-w-[60px] md:min-w-[70px] cursor-pointer group"
            >
              <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${
                activeCategory === cat 
                  ? 'bg-primary/15 ring-2 ring-primary/30' 
                  : 'bg-primary/5 group-hover:bg-primary/10'
              }`}>
                <span className={`material-symbols-outlined text-2xl transition-colors ${
                  activeCategory === cat ? 'text-primary' : 'text-slate-500'
                }`}>
                  {categoryIcons[cat] || 'category'}
                </span>
              </div>
              <span className={`text-[11px] font-semibold transition-colors ${
                activeCategory === cat ? 'text-primary' : 'text-slate-600'
              }`}>
                {cat}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Product Grid Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-xl md:text-2xl font-bold">Pilihan Terbaik</h3>
          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
          <p className="text-slate-500 text-xs hidden sm:block">Recommended daily delights for you</p>
        </div>
        <div className="flex gap-2">
          <button className="size-9 md:size-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white transition-all text-slate-400 hover:text-primary">
            <span className="material-symbols-outlined text-xl">filter_list</span>
          </button>
          <button className="size-9 md:size-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white transition-all text-slate-400 hover:text-primary">
            <span className="material-symbols-outlined text-xl">sort</span>
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <p className="text-xl font-medium">Tidak ada produk di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredProducts.map((product) => {
            const hasActivePromo = isPromoActive(product);
            const hasDiscount = hasActivePromo && product.discount_percent && product.discount_percent > 0;

            return (
              <div 
                key={product.id} 
                className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200/80 dark:border-slate-700 flex flex-col shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden bg-white">
                  {product.image_url ? (
                    <Image 
                      src={product.image_url} 
                      alt={product.name} 
                      fill 
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover" 
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-4xl bg-slate-50">🍩</div>
                  )}
                  
                  {/* Badge */}
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                      PROMO
                    </span>
                  )}
                  {product.tag && !hasDiscount && (
                    <span className="absolute top-2 left-2 bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                      {product.tag.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-2.5 flex flex-col flex-1 bg-white dark:bg-slate-900">
                  <Link href={`/catalog/${product.id}`}>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mb-1 hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                  </Link>
                  <div className="mt-auto">
                    {hasDiscount && (
                      <div className="text-[9px] text-slate-400 line-through">
                        Rp {product.price.toLocaleString("id-ID")}
                      </div>
                    )}
                    <div className="text-sm font-extrabold text-primary">
                      Rp {getEffectivePrice(product).toLocaleString("id-ID")}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400">
                        Terjual {product.sold_count || 0}+
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        setIsLoading(true, 'Sabar ya...');
                        addToCart({ id: product.id, name: product.name, price: getEffectivePrice(product), image: product.image_url || '' }, 1);
                        await new Promise(r => setTimeout(r, 600));
                        setIsLoading(false);
                      }}
                      className="w-full mt-2 py-1.5 rounded-md bg-primary text-white text-[10px] font-bold hover:bg-primary/90 active:scale-95 transition-all"
                    >
                      + Keranjang
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
