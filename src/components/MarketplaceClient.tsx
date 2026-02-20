'use client';

import React from 'react';
import Image from 'next/image';
import { Product, ReviewStats } from '@/types/cms';
import { useCart } from '@/context/CartContext';
import { useLoading } from '@/context/LoadingContext';
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
  copy,
  reviewStats = [] 
}: MarketplaceClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { setIsLoading } = useLoading();
  const [localProducts] = React.useState<Product[]>(initialProducts);
  const [activeCategory, setActiveCategory] = React.useState<string>(copy?.category_all || 'Semua');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const sortedProducts = [...localProducts].sort((a, b) => {
    const isAPromo = isPromoActive(a) ? 1 : 0;
    const isBPromo = isPromoActive(b) ? 1 : 0;
    if (isAPromo !== isBPromo) return isBPromo - isAPromo;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const filteredProducts = sortedProducts.filter(p => {
    const matchesCategory = activeCategory === (copy?.category_all || 'Semua') || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    <div className="w-full flex flex-col gap-6 md:gap-8">
      {/* Search Bar Section */}
      <div className="w-full max-w-md mx-auto px-4 md:px-0 mb-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">search</span>
          </div>
          <input 
            type="text" 
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-28 focus:ring-4 focus:ring-primary/10 focus:border-primary/20 placeholder:text-slate-400 font-medium transition-all text-sm outline-none shadow-sm" 
            placeholder={copy?.search_placeholder || "Cari donat..."} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            onClick={() => {/* search is handled by state filter */}}
          >
            {copy?.cta_search || "Search"}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveCategory(copy?.category_all || 'Semua')}
          className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-wider transition-all ${
            activeCategory === (copy?.category_all || 'Semua')
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {copy?.category_all || 'Semua'}
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-wider transition-all ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
          }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200">
           <p className="text-slate-400 font-bold text-sm">
             {searchQuery ? `Tidak ada produk yang cocok dengan "${searchQuery}"` : (copy?.empty_products || "Tidak ada produk di kategori ini.")}
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
          {filteredProducts.map((product) => {
            const hasDiscount = isPromoActive(product) && (product.discount_percent ?? 0) > 0;
            const stats = reviewStats.find(s => s.product_id === product.id);
            
            return (
              <div 
                key={product.id} 
                className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col active:scale-[0.98] cursor-pointer"
                onClick={() => router.push(`/catalog/${product.id}`)}
              >
                {/* Badge */}
                {hasDiscount && (
                  <div className="absolute top-2 left-2 z-20 bg-primary text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                    {copy?.badge_promo || 'PROMO'}
                  </div>
                )}
                
                {/* Image Area - Fixed 1:1 Aspect Ratio */}
                <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                  {product.image_url ? (
                    <Image 
                      src={product.image_url} 
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <span className="material-symbols-outlined text-4xl">image</span>
                    </div>
                  )}
                  
                  {/* Tag Overlay */}
                  {product.tag && (
                    <div className="absolute bottom-2 right-2 z-10">
                      <span className="px-2 py-0.5 bg-black/40 backdrop-blur-md text-white text-[7px] md:text-[8px] font-black uppercase tracking-wider rounded-md">
                        {product.tag}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-3 md:p-4 flex flex-col flex-1 gap-2">
                  <div className="flex-1">
                    <h3 className="text-slate-900 font-bold text-xs md:text-sm leading-tight line-clamp-2 min-h-[2.5em] mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Rating & Sold Row */}
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      {renderRating(stats)}
                      <span className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                        {product.sold_count || 0}+ {copy?.sold_label || 'Terjual'}
                      </span>
                    </div>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-end justify-between gap-2 mt-1">
                    <div className="flex flex-col">
                      {hasDiscount && (
                        <span className="text-[9px] md:text-[10px] text-slate-400 line-through">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                      )}
                      <span className="text-primary font-bold text-sm md:text-base leading-none">
                        Rp {getEffectivePrice(product).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        setIsLoading(true, copy?.loading_add_cart || 'Sabar ya...');
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: getEffectivePrice(product),
                          image: product.image_url || ''
                        }, 1);
                        await new Promise(r => setTimeout(r, 600));
                        setIsLoading(false);
                      }}
                      className="size-8 md:size-9 rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all active:scale-90"
                      aria-label="Add to cart"
                    >
                      <span className="material-symbols-outlined text-sm md:text-base transition-transform group-active:translate-y-px">add_shopping_cart</span>
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
