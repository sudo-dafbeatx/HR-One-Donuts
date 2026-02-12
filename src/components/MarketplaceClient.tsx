"use client";

import React from 'react';
import { Product } from '@/types/cms';
import { useCart } from "@/context/CartContext";
import Link from 'next/link';
import { isPromoActive, getEffectivePrice } from '@/lib/product-utils';


interface MarketplaceClientProps {
  initialProducts: Product[];
}

export default function MarketplaceClient({ initialProducts }: MarketplaceClientProps) {
  const { addToCart } = useCart();
  const filteredProducts = initialProducts;

  return (
    <div className="flex flex-col">
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <p className="text-xl font-medium">Tidak ada produk yang tersedia saat ini.</p>
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
                {/* Content */}
                <div className="p-6 flex flex-col h-full gap-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {hasActivePromo && (
                          <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {product.sale_type.replace('_', ' ')}
                          </span>
                        )}
                        {product.package_type === 'box' && (
                          <span className="bg-orange-500/10 text-orange-600 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Box
                          </span>
                        )}
                        {product.package_type === 'satuan' && product.sale_type === 'normal' && (
                          <span className="bg-blue-500/10 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Satuan
                          </span>
                        )}
                      </div>
                      <Link href={`/catalog/${product.id}`}>
                        <h3 className="font-black text-slate-800 text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors uppercase">
                          {product.name}
                        </h3>
                      </Link>
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
