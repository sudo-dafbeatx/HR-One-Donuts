"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logTraffic } from "@/app/actions/traffic-actions";
import { 
  MinusIcon, 
  PlusIcon, 
  ShoppingBagIcon, 
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";

interface ProductInfoProps {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  variants: {
    name: string;
    price_adjustment: number;
  }[];
  discount_percent?: number;
  sale_type: string;
}

export default function ProductInfo({ 
  id, name, price, description, image, stock, variants, 
  discount_percent, sale_type 
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<{ name: string, price_adjustment: number } | null>(
    variants.length > 0 ? variants[0] : null
  );
  const { addToCart } = useCart();
  const router = useRouter();
  const supabase = createClient();

  const hasDiscount = !!(discount_percent && discount_percent > 0);
  const basePriceWithVariant = price + (selectedVariant?.price_adjustment || 0);
  const currentPrice = hasDiscount 
    ? basePriceWithVariant * (1 - (discount_percent || 0) / 100)
    : basePriceWithVariant;

  const handleAddToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Log click_buy event regardless of login status
    await logTraffic({
      event_type: 'click_buy',
      path: window.location.pathname,
      user_id: user?.id
    });

    if (!user) {
      // Redirect to login with current path as next
      const currentPath = window.location.pathname;
      router.push(`/login?next=${currentPath}`);
      return;
    }

    const itemToAdd = {
      id,
      name: selectedVariant ? `${name} (${selectedVariant.name})` : name,
      price: currentPrice,
      image
    };
    addToCart(itemToAdd, quantity);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
            Freshly Baked
          </span>
          {sale_type !== 'normal' && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
              {sale_type?.replace('_', ' ') || 'PROMO'}
            </span>
          )}
          {stock <= 5 && stock > 0 && (
            <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
              Stok Terbatas
            </span>
          )}
          {stock === 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
              Stok Habis
            </span>
          )}
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 leading-tight">
          {name}
        </h1>
        
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-bold text-primary">
            Rp {currentPrice.toLocaleString("id-ID")}
          </p>
          {(hasDiscount || (selectedVariant && selectedVariant.price_adjustment > 0)) && (
            <p className="text-sm md:text-base font-medium text-slate-400 line-through">
              Rp {basePriceWithVariant.toLocaleString("id-ID")}
            </p>
          )}
          {hasDiscount && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">
              Hemat {discount_percent}%
            </span>
          )}
        </div>
      </div>

      <div className="prose prose-slate prose-sm text-slate-600 leading-relaxed">
        <p>{description}</p>
      </div>

      {/* Variants Selection */}
      {variants.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Pilih Varian</label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.name}
                onClick={() => setSelectedVariant(variant)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                  selectedVariant?.name === variant.name
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                }`}
              >
                {variant.name}
                {variant.price_adjustment > 0 && ` (+Rp ${variant.price_adjustment.toLocaleString()})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Order Options */}
      <div className="flex flex-col gap-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Jumlah</label>
            <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-1 w-fit border border-slate-100">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="size-10 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 hover:text-primary transition-all active:scale-90"
              >
                <MinusIcon className="size-6 font-black" />
              </button>
              <span className="w-8 text-center font-bold text-slate-800 text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="size-10 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 hover:text-primary transition-all active:scale-90"
              >
                <PlusIcon className="size-6 font-black" />
              </button>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <label className="text-xs font-medium text-slate-500">Total</label>
            <p className="text-2xl font-bold text-slate-800">
              Rp {(currentPrice * quantity).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <button 
          onClick={handleAddToCart}
          disabled={stock === 0}
          className={`w-full py-4 px-8 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${
            stock === 0 
              ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
              : "bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 shadow-primary/20 active:translate-y-0"
          }`}
        >
          <ShoppingBagIcon className="size-6 font-black" />
          Beli Sekarang
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
          <ShieldCheckIcon className="size-6" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-800">Garansi Kualitas</p>
          <p className="text-[10px] text-slate-500 font-medium">Bahan premium, dipanggang segar setiap hari.</p>
        </div>
      </div>
    </div>
  );
}
