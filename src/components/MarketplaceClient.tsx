'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/cms';
import { useCart } from '@/context/CartContext';
import { useLoading } from '@/context/LoadingContext';
import { useEditMode } from '@/context/EditModeContext';
import { DEFAULT_COPY } from '@/lib/theme-defaults';
import EditableProductField from '@/components/cms/EditableProductField';

interface MarketplaceClientProps {
  initialProducts: Product[];
  categories: { id: string; name: string }[];
  copy?: Record<string, string>;
}

export default function MarketplaceClient({ initialProducts, categories = [], copy: _copy }: MarketplaceClientProps) {
  const { copy: liveCopy, updateProduct } = useEditMode();
  const copy = liveCopy || _copy || DEFAULT_COPY;
  const { addToCart } = useCart();
  const { setIsLoading } = useLoading();
  const [activeCategory, setActiveCategory] = React.useState<string>('Semua');

  const [localProducts, setLocalProducts] = React.useState<Product[]>(initialProducts);

  const sortedProducts = [...localProducts].sort((a, b) => {
    const isAPromo = isPromoActive(a) ? 1 : 0;
    const isBPromo = isPromoActive(b) ? 1 : 0;
    if (isAPromo !== isBPromo) return isBPromo - isAPromo;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const filteredProducts = activeCategory === 'Semua' 
    ? sortedProducts 
    : sortedProducts.filter(p => p.category === activeCategory);

  function isPromoActive(p: Product) {
    if (p.sale_type === 'normal') return false;
    const now = new Date();
    if (p.promo_start && new Date(p.promo_start) > now) return false;
    if (p.promo_end && new Date(p.promo_end) < now) return false;
    return true;
  }

  function getEffectivePrice(p: Product) {
    if (isPromoActive(p) && (p.discount_percent ?? 0) > 0) {
      return p.price * (1 - (p.discount_percent ?? 0) / 100);
    }
    return p.price;
  }

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {/* Categories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveCategory('Semua')}
          className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black transition-all ${
            activeCategory === 'Semua'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          Semua
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.name)}
            className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black transition-all ${
              activeCategory === cat.name
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-bold text-sm">Tidak ada produk di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
          {filteredProducts.map((product) => {
            const hasDiscount = isPromoActive(product) && (product.discount_percent ?? 0) > 0;
            return (
              <div key={product.id} className="card-effect">
                <div className="card-inner">
                  <div className="card__liquid"></div>
                  <div className="card__shine"></div>
                  <div className="card__glow"></div>
                  
                  <div className="card__content">
                    {/* Badge */}
                    {hasDiscount && (
                      <div className="card__badge">
                        {copy.badge_promo}
                      </div>
                    )}
                    
                    {/* Image Area */}
                    <div className="card__image-container">
                      {product.image_url ? (
                        <Image 
                          src={product.image_url} 
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <span className="material-symbols-outlined text-4xl">image</span>
                        </div>
                      )}
                      
                      {/* Tags */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                        {product.tag && (
                          <span className="px-2 py-0.5 bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-md">
                            {product.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info Area */}
                    <div className="flex flex-col flex-1">
                      <Link href={`/catalog/${product.id}`} className="hover:no-underline">
                        <EditableProductField 
                          value={product.name} 
                          onSave={(val: string) => {
                            updateProduct(product.id, { name: val });
                            setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, name: val } : p));
                          }}
                          className="card__title"
                          productId={product.id}
                        />
                      </Link>

                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          {copy.sold_label} {product.sold_count || 0}+
                        </span>
                      </div>

                      <div className="mt-auto">
                        {hasDiscount && (
                          <div className="text-[10px] text-slate-400 line-through mb-0.5">
                            Rp {product.price.toLocaleString("id-ID")}
                          </div>
                        )}
                        
                        <div className="card__footer">
                          <div className="card__price whitespace-nowrap">
                            <EditableProductField 
                              value={String(getEffectivePrice(product))}
                              type="number"
                              onSave={(val: string) => {
                                const price = parseInt(val);
                                updateProduct(product.id, { price });
                                setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, price } : p));
                              }}
                              className="card__price"
                              prefix="Rp "
                              productId={product.id}
                            />
                          </div>

                          <button
                            onClick={async () => {
                              setIsLoading(true, 'Sabar ya...');
                              addToCart({
                                id: product.id,
                                name: product.name,
                                price: getEffectivePrice(product),
                                image: product.image_url || ''
                              }, 1);
                              await new Promise(r => setTimeout(r, 600));
                              setIsLoading(false);
                            }}
                            className="card__button editor-control border-none"
                            aria-label="Add to cart"
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" className="text-white">
                              <path
                                fill="currentColor"
                                d="M5 12H19M12 5V19"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
