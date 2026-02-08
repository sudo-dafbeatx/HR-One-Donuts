"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ArrowRightIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

export default function TopPicks() {
  const { addToCart } = useCart();
  
  const products = [
    {
      id: "classic-glazed-pick",
      name: "Classic Glaze",
      price: 10000,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCAo9IJwO4YRvfrPq_dBT_21RXA8mHrdXRyWtqLKmmu-lSfl2cpqlCV2FVqspiZWW3tkCPjnb6egKCdK8X4z84bLeKv3GJ8O74ZqE0eZ3TakTHWju6tYmAxZ2pyA0Cj3iwNuGHAVgGKzjv3pLfL8DHYek5G5ZI64N9jgTKOkXVcS8m14HhkOOmstzCjCjRT0ZvthID-bwRRQLENBHODcEYsQ_DUFZVEfRMhDOK6IY3TESx7IdlDuqOmvQXLUN8SSlvv5Ad8v7O8iF-X",
      bestSeller: true,
    },
    {
      id: "choco-peanut-pick",
      name: "Choco Peanut",
      price: 12000,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC5CMK3ikGiqX7EJGlDfUln-UXVLViD6dfQa6yrdhzR8TXgaAlHh70AgjoTT_Kv0RqWJJMjqHfscmptbJys0u4K-NFYG0wi37anAe9nEopCgjPZVkXPcK7yAID2qZfvPbAH1EMkv8SAZEuecsDeMt09AxPF_gANJTsl0uTo716vcjBc_40C8ZGASQmyk1CTV4C67GA3EpIvBEn96ZHEzEsWh0Ox5-oExLh9Ge91dvPYZxALD3HFDmxoU0bVrdwolBlZmroxXcgGgMpK",
    },
    {
      id: "strawberry-sprinkles-pick",
      name: "Strawberry Sprinkles",
      price: 12000,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAPJrWsNn04jiH9nfhdN5zTjxk69E_zPoY86oNA1MehAyUrmH8b_iPL_G1p5NafOU-ad6xBcpYU147WggUWmI4QKic8iddWBgqqXv0GeVblA5AcOrqkLXjfY7REHRLUCe9kT7_t8Tu8EKmYugvxSaB7ZWVo0Jz6IgRplPdaPUTQIB8-C3vuZXHzHvAmIsoX1beIfW3hu7i7RPUiYoYeiZPxLOX17bK5rORi5Y4L9UkekVnBzyxYxksCmE9eyVBYubZuufRu3DMZ4jKa",
    },
    {
      id: "matcha-delight-pick",
      name: "Matcha Delight",
      price: 15000,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD5lAGl8zkaX-M0C7D5GnlADD_83ZTgJlFJnSCX1f4EENQKHpSRtPa09-K81GAWivIu2eiKhYs-9HnOSHg5P7V8E195qyQ7-7NO0SjVwlQjyfbH99UZzi8sYg0oNicP4BTLoDHXUVZJgcHAH4RGRRjca_otm8TS9OJlCVqQqbQqzOIcv8MReZqfJ5e_lUSteFGo7AwEZg7TLEv2sy1UwrPtgKIStZ4TLIpasTmwkQzoTswesos3pVDbYLGDVmeRZHTj3CaP7JQv_uwC",
    },
  ];

  return (
    <section className="bg-section-bg transition-colors duration-300 px-4 md:px-20 lg:px-40 py-16" id="top-picks">
      <div className="flex items-end justify-between mb-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-heading">Favorit Keluarga</h2>
          <p className="text-lg text-subheading leading-relaxed">Varian donat yang paling banyak dicari minggu ini.</p>
        </div>
        <Link href="/catalog" className="text-primary font-bold flex items-center gap-2 hover:underline">
          Lihat Semua Menu
          <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </div>
      <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-none w-[280px] bg-card-bg rounded-2xl shadow-sm border border-border overflow-hidden snap-start hover:shadow-xl transition-all duration-300 group"
          >
            <div className="aspect-square bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
              <Image
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={product.image}
                width={300}
                height={300}
              />
              {product.bestSeller && (
                <span className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-primary">
                  Terlaris
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <h4 className="text-lg font-bold truncate text-heading">{product.name}</h4>
                <p className="text-primary font-extrabold text-xl">Rp {product.price.toLocaleString("id-ID")}</p>
              </div>
              <button 
                onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.image }, 1)}
                className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                Tambah ke Pesanan
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
