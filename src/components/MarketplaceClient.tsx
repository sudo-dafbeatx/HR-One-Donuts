'use client';

import React from 'react';
import Image from 'next/image';
import { Product, ReviewStats } from '@/types/cms';
import { useCart } from '@/context/CartContext';
import { useLoading } from '@/context/LoadingContext';
import { useEditMode } from '@/context/EditModeContext';
import { DEFAULT_COPY } from '@/lib/theme-defaults';
import EditableProductField from '@/components/cms/EditableProductField';
import { useRouter } from 'next/navigation';

interface MarketplaceClientProps {
  initialProducts: Product[];
  categories: string[];
  copy?: Record<string, string>;
  reviewStats?: ReviewStats[];
}

export default function MarketplaceClient({ 
  initialProducts, 
  categories = [], 
  copy: _copy,
  reviewStats = [] 
}: MarketplaceClientProps) {
  const router = useRouter();
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

  const renderRating = (stats?: ReviewStats) => {
    const rating = stats?.average_rating || 0;
    const total = stats?.total_reviews || 0;

    return (
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {/* Desktop: 5 Stars */}
        <div className="hidden md:flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <span 
              key={s} 
              className={`material-symbols-outlined text-[11px] ${
                s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'
              }`}
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
            >
              star
            </span>
          ))}
          <span className="text-[9px] text-slate-400 font-bold ml-0.5">
            ({total})
          </span>
        </div>

        {/* Mobile: Compact Badge (1 Star + Num) */}
        <div className="flex md:hidden items-center bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 gap-1">
          <span 
            className="material-symbols-outlined text-[10px] text-amber-500"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
          >
            star
          </span>
          <span className="text-[9px] text-amber-900 font-black">
            {rating > 0 ? rating.toFixed(1) : 'new'}
          </span>
          <span className="text-[8px] text-amber-700/60 font-medium">
            ({total})
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveCategory('Semua')}
          className={`flex-shrink-0 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
            activeCategory === 'Semua'
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
          }`}
        >
          Semua
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-bold text-sm">Tidak ada produk di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {filteredProducts.map((product) => {
            const hasDiscount = isPromoActive(product) && (product.discount_percent ?? 0) > 0;
            const stats = reviewStats.find(s => s.product_id === product.id);
            
            return (
              <div 
                key={product.id} 
                className="card-effect cursor-pointer"
                onClick={() => router.push(`/catalog/${product.id}`)}
              >
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
                          <span className="px-1.5 py-0.5 bg-black/40 backdrop-blur-md text-white md:text-[8px] text-[7px] font-black uppercase tracking-wider rounded-md">
                            {product.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info Area */}
                    <div className="flex flex-col flex-1 min-h-0">
                      <div className="flex flex-col gap-1">
                        <EditableProductField 
                          value={product.name} 
                          onSave={(val: string) => {
                            updateProduct(product.id, { name: val });
                            setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, name: val } : p));
                          }}
                          className="card__title truncate"
                          productId={product.id}
                        />
                        
                        {/* Rating & Sold Row */}
                        <div className="flex items-center justify-between gap-1">
                          {renderRating(stats)}
                          
                          {/* Only show sold count on desktop */}
                          <span className="hidden md:block text-[9px] text-slate-400 font-black uppercase tracking-tight">
                            {product.sold_count || 0}+ Terjual
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto pt-2">
                        {/* Hide old price on mobile for ultra clean look */}
                        {hasDiscount && (
                          <div className="hidden md:block text-[9px] text-slate-400 line-through mb-0">
                            Rp {product.price.toLocaleString("id-ID")}
                          </div>
                        )}
                        
                        <div className="card__footer pt-0">
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
                            onClick={async (e) => {
                              e.stopPropagation();
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
                            <svg viewBox="0 0 24 24" width="16" height="16" className="text-white">
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
