"use client";

import React, { useState, useMemo } from 'react';
import { Product } from '@/types/cms';
import Promotions from './Promotions';
import CategoryFilter, { FilterValue } from './CategoryFilter';
import Image from 'next/image';
import Link from 'next/link';

interface MarketplaceClientProps {
  initialProducts: Product[];
}

export default function MarketplaceClient({ initialProducts }: MarketplaceClientProps) {
  const [filter, setFilter] = useState<FilterValue>({ type: 'all', value: null });

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];
    
    if (filter.type === 'sale_type' && filter.value) {
      result = result.filter(p => p.sale_type === filter.value);
      // Flash sale products at the top
      if (filter.value === 'flash_sale') {
        result.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
      }
    } else if (filter.type === 'package_type' && filter.value) {
      result = result.filter(p => p.package_type === filter.value);
    }
    
    return result;
  }, [initialProducts, filter]);

  return (
    <div className="flex flex-col">
      <Promotions 
        products={initialProducts} 
        onSelectSaleType={(type) => setFilter({ type: 'sale_type', value: type })} 
      />
      
      <CategoryFilter 
        currentFilter={filter} 
        onFilterChange={setFilter} 
      />

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <p className="text-xl font-medium">Tidak ada produk yang sesuai dengan filter ini.</p>
          <button 
            onClick={() => setFilter({ type: 'all', value: null })}
            className="mt-4 text-primary font-black hover:underline"
          >
            Bersihkan Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => {
            const hasDiscount = product.discount_percent && product.discount_percent > 0;
            const discountedPrice = hasDiscount 
              ? product.price * (1 - (product.discount_percent || 0) / 100) 
              : product.price;

            return (
              <div 
                key={product.id} 
                className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col relative"
              >
                {/* Badges */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                  {product.sale_type !== 'normal' && (
                    <span className="bg-primary text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                      {product.sale_type.replace('_', ' ')}
                    </span>
                  )}
                  {product.package_type === 'box' && (
                    <span className="bg-orange-500 text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                      Box
                    </span>
                  )}
                  {product.package_type === 'satuan' && product.sale_type === 'normal' && (
                    <span className="bg-blue-500 text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                      Satuan
                    </span>
                  )}
                </div>

                {hasDiscount && (
                  <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[10px] md:text-xs font-black px-2 py-1 rounded-lg shadow-lg">
                    -{product.discount_percent}%
                  </div>
                )}

                <Link href={`/catalog/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <span className="text-4xl mb-2">🍩</span>
                      <span className="text-xs font-medium text-center">No Image</span>
                    </div>
                  )}
                </Link>
                
                <div className="p-3 md:p-4 flex-1 flex flex-col">
                  <div className="mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{product.category}</span>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  
                  <div className="mt-auto pt-4 space-y-2">
                    <div className="flex flex-col">
                      {hasDiscount && (
                        <span className="text-[10px] md:text-xs text-slate-400 line-through font-bold">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                      )}
                      <p className="text-primary font-black text-base md:text-lg">
                        Rp {discountedPrice.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Link 
                      href={`/catalog/${product.id}`}
                      className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm md:text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      Beli
                    </Link>
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
