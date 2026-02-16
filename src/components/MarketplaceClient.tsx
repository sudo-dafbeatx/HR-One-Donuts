'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/cms';
import { useCart } from '@/context/CartContext';
import { useLoading } from '@/context/LoadingContext';
import { useEditMode } from '@/context/EditModeContext';
import { DEFAULT_COPY } from '@/lib/theme-defaults';
import EditableText from '@/components/cms/EditableText';

interface MarketplaceClientProps {
  initialProducts: Product[];
  categories: { id: string; name: string }[];
  copy?: Record<string, string>;
}

export default function MarketplaceClient({ initialProducts, categories = [], copy: _copy }: MarketplaceClientProps) {
  const { isEditMode, copy: liveCopy, updateProduct } = useEditMode();
  const copy = liveCopy || _copy || DEFAULT_COPY;
  const { addToCart } = useCart();
  const { setIsLoading } = useLoading();
  const [activeCategory, setActiveCategory] = React.useState<string>('Semua');

  const [localProducts, setLocalProducts] = React.useState<Product[]>(initialProducts);

  const sortedProducts = React.useMemo(() => {
    return [...localProducts].sort((a, b) => {
      const isAPromo = isPromoActive(a) ? 1 : 0;
      const isBPromo = isPromoActive(b) ? 1 : 0;
      if (isAPromo !== isBPromo) return isBPromo - isAPromo;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [localProducts]);

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {filteredProducts.map((product) => {
            const hasDiscount = isPromoActive(product) && (product.discount_percent ?? 0) > 0;
            return (
              <div 
                key={product.id} 
                className="group bg-white dark:bg-slate-900 rounded-[var(--theme-card-radius)] overflow-hidden border border-[var(--theme-card-border)] hover:border-primary/30 transition-all duration-300 flex flex-col h-full hover:shadow-xl group"
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden bg-slate-50 shrink-0">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <span className="material-symbols-outlined text-4xl">image</span>
                    </div>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm z-10">
                      {copy.badge_promo}
                    </span>
                  )}
                  {/* Tags */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                    {product.tag && (
                      <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-md">
                        {product.tag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 md:p-4 flex flex-col flex-1">
                  <Link href={`/catalog/${product.id}`}>
                    <EditableProductField 
                      productId={product.id} 
                      value={product.name} 
                      onSave={(val) => {
                        updateProduct(product.id, { name: val });
                        setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, name: val } : p));
                      }}
                      className="font-display font-black text-sm md:text-base text-slate-800 leading-tight mb-1 line-clamp-2"
                    />
                  </Link>

                  <div className="mt-auto">
                    {hasDiscount && (
                      <div className="text-[9px] text-slate-400 line-through">
                        Rp {product.price.toLocaleString("id-ID")}
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 mb-3">
                      <EditableProductField 
                        productId={product.id} 
                        value={String(getEffectivePrice(product))}
                        type="number"
                        onSave={(val) => {
                          const price = parseInt(val);
                          updateProduct(product.id, { price });
                          setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, price } : p));
                        }}
                        className="text-primary font-black text-sm md:text-lg"
                        prefix="Rp "
                      />
                    </div>
                    
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                        {copy.sold_label} {product.sold_count || 0}+
                      </span>
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
                      className="w-full py-1.5 rounded-md bg-primary text-white text-[10px] font-bold hover:bg-primary/90 active:scale-95 transition-all editor-control"
                    >
                      <EditableText copyKey="cta_add_cart" />
                    </button>
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

function EditableProductField({ 
  value, 
  onSave, 
  className, 
  type = 'text',
  prefix = ''
}: { 
  productId: string; 
  value: string; 
  onSave: (val: string) => void; 
  className: string;
  type?: 'text' | 'number';
  prefix?: string;
}) {
  const { isEditMode } = useEditMode();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== value && editValue.trim()) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  if (!isEditMode) {
    return (
      <div className={className}>
        {prefix}{type === 'number' ? Number(value).toLocaleString('id-ID') : value}
      </div>
    );
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className={`${className} bg-white/95 backdrop-blur-sm text-slate-900 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40 rounded-lg px-2 outline-none w-full editor-control`}
      />
    );
  }

  return (
    <div 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditValue(value);
        setIsEditing(true);
      }}
      className={`${className} cursor-pointer transition-all duration-200 editor-control`}
      style={{
        outline: '1.5px dashed rgba(59, 130, 246, 0.35)',
        outlineOffset: '2px',
        borderRadius: '4px',
      }}
    >
      {prefix}{type === 'number' ? Number(value).toLocaleString('id-ID') : value}
    </div>
  );
}
