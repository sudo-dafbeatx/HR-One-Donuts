"use client";

import Link from "next/link";
import Image from "next/image";

interface ProductProps {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  tag?: string;
}

import { useCart } from "@/context/CartContext";
import { PlusIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import React from "react";

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
      className="group flex flex-col gap-4 bg-card-bg p-3 rounded-xl shadow-sm hover:shadow-md transition-all border border-border hover:border-primary/20"
    >
      <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {tag && (
          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider z-10 ${
            tag === 'Best Seller' ? 'bg-white/90 dark:bg-slate-900/90 text-primary' : 
            tag === 'Premium' ? 'bg-primary text-white' : 'bg-orange-500 text-white'
          }`}>
            {tag}
          </span>
        )}
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 size-8 bg-white dark:bg-background-dark text-primary rounded-lg flex items-center justify-center shadow-lg transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white z-20"
        >
          <PlusIcon className="w-5 h-5 font-bold" />
        </button>
      </div>
      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-start gap-2">
          <p className="text-heading text-base font-bold leading-tight truncate">{name}</p>
          <p className="text-primary text-base font-extrabold shrink-0">Rp {price.toLocaleString("id-ID")}</p>
        </div>
        <p className="text-subheading text-xs line-clamp-2">
          {description}
        </p>
        <div className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg h-10 bg-primary/10 text-primary text-sm font-bold group-hover:bg-primary group-hover:text-white transition-all">
          <span>Lihat Detail</span>
          <ArrowRightIcon className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
