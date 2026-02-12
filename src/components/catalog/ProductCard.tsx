"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { PlusIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import React from "react";

interface ProductProps {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  tag?: string;
}


export default function ProductCard({ id, name, price, description, image, tag }: ProductProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, name, price, image }, 1);
  };

  return (
    <Link 
      href={`/catalog/${id}`}
      className="group flex flex-col gap-4 bg-card-bg p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-border hover:border-primary/20 min-h-[160px] justify-between relative overflow-hidden"
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-3">
          <div className="flex flex-col gap-1 w-full">
            {tag && (
              <span className={`w-fit text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest mb-1 ${
                tag === 'Terlaris' ? 'bg-primary/10 text-primary' : 
                tag === 'Premium' ? 'bg-orange-500/10 text-orange-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {tag}
              </span>
            )}
            <h3 className="text-heading text-lg font-black leading-tight group-hover:text-primary transition-colors">{name}</h3>
          </div>
        </div>
        <p className="text-subheading text-xs line-clamp-3 leading-relaxed opacity-80">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga</span>
            <p className="text-primary text-xl font-black tracking-tight">Rp {price.toLocaleString("id-ID")}</p>
          </div>
          <button 
            onClick={handleAddToCart}
            className="size-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95 group/btn"
            title="Tambah ke Keranjang"
          >
            <PlusIcon className="w-6 h-6 font-bold" />
          </button>
        </div>
        
        <div className="w-full flex items-center justify-center gap-2 rounded-xl h-10 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
          <span>Lihat Detail</span>
          <ArrowRightIcon className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}
