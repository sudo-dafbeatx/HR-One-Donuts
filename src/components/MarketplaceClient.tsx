"use client";

import React from 'react';
import { Product } from '@/types/cms';
import { useCart } from "@/context/CartContext";
import Link from 'next/link';
import Image from 'next/image';
import { isPromoActive, getEffectivePrice } from '@/lib/product-utils';


interface MarketplaceClientProps {
  initialProducts: Product[];
  categories?: string[];
}

export default function MarketplaceClient({ initialProducts, categories = [] }: MarketplaceClientProps) {
  const { addToCart } = useCart();
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
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => {
            const hasActivePromo = isPromoActive(product);
            const hasDiscount = hasActivePromo && product.discount_percent && product.discount_percent > 0;

            return (
              <div 
                key={product.id} 
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col relative"
              >
                {/* Image Container */}
                <div className="aspect-square relative overflow-hidden bg-slate-50 border-b border-slate-50">
                  {product.image_url ? (
                    <Image 
                      src={product.image_url} 
                      alt={product.name} 
                      fill 
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-5xl">🍩</div>
                  )}
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.tag && (
                      <div className="bg-orange-500 text-white px-2 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest shadow-lg">
                        {product.tag}
                      </div>
                    )}
                    {hasActivePromo && (
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg ${
                        product.sale_type === 'flash_sale' ? 'bg-primary text-white' : 
                        product.sale_type === 'jumat_berkah' ? 'bg-green-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {product.sale_type === 'flash_sale' && <span className="text-sm">🔥</span>}
                        {product.sale_type.replace('_', ' ')}
                      </div>
                    )}
                    {hasDiscount && (
                      <div className="bg-red-500 text-white px-2 py-1 rounded font-black text-[10px] shadow-lg">
                        -{product.discount_percent}%
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 text-[8px] font-black rounded uppercase tracking-wider shadow-md ${
                      product.package_type === 'box' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-white'
                    }`}>
                      {product.package_type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col h-full gap-3">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex justify-between items-start gap-2">
                      <Link href={`/catalog/${product.id}`} className="flex-1">
                        <h3 className="font-black text-slate-800 text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded">
                        Terjual {product.sold_count || 0}+
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed opacity-80">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto pt-4 flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        {hasDiscount && (
                          <span className="text-[10px] text-slate-400 line-through font-bold">
                            Rp {product.price.toLocaleString("id-ID")}
                          </span>
                        )}
                        <p className="text-primary font-black text-xl tracking-tight">
                          Rp {getEffectivePrice(product).toLocaleString("id-ID")}
                        </p>
                      </div>
                      
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                       <Link 
                        href={`/catalog/${product.id}`}
                        className="bg-slate-50 text-slate-500 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                      >
                        Detail
                      </Link>
                      <button 
                        onClick={() => addToCart({ id: product.id, name: product.name, price: getEffectivePrice(product), image: product.image_url || '' }, 1)}
                        className="bg-primary text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                      >
                        Beli
                      </button>
                    </div>
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
