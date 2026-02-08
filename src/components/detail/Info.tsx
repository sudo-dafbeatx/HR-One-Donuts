"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface ProductInfoProps {
  id: string;
  name: string;
  price: number;
  description: string;
  reviews: number;
  image: string;
}

export default function ProductInfo({ id, name, price, description, reviews, image }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ id, name, price, image }, quantity);
  };

  return (
    <div className="flex flex-col gap-6 lg:pt-4 w-full">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            Freshly Baked Today
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-heading dark:text-white leading-[1.1] tracking-tight">
          {name}
        </h1>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-3xl font-bold text-primary">Rp {price.toLocaleString("id-ID")}</p>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="material-symbols-outlined text-yellow-400 fill-current text-xl">
                star
              </span>
            ))}
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium ml-1">
              ({reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-heading dark:text-white mb-2">Description</h3>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-prose">
          {description}
        </p>
      </div>

      {/* Order Options */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Quantity</label>
          <div className="flex items-center w-32 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex items-center justify-center size-10 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <input
              className="w-full text-center bg-transparent border-none font-bold text-heading dark:text-white focus:ring-0 text-lg"
              readOnly
              type="number"
              value={quantity}
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="flex items-center justify-center size-10 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-primary text-white font-bold py-4 px-8 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined">add_shopping_cart</span>
            Tambah ke Pesanan
          </button>
          <button className="flex items-center justify-center p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <span className="material-symbols-outlined">favorite</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Notice */}
      <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl border border-primary/20">
        <span className="material-symbols-outlined text-primary">chat</span>
        <div>
          <p className="text-sm font-bold text-primary">Ordering with a Personal Touch</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Orders are finalized via WhatsApp to ensure your treats are ready exactly when you need them. Local pickup only.
          </p>
        </div>
      </div>
    </div>
  );
}
