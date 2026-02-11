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
    <section className="bg-section-bg transition-colors duration-300 px-6 md:px-20 lg:px-40 py-24" id="top-picks">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl md:text-5xl font-black text-heading tracking-tight">Favorit Keluarga</h2>
          <p className="text-lg text-subheading leading-relaxed max-w-xl">Varian donat yang paling banyak dicari minggu ini oleh pelanggan kami.</p>
        </div>
        <Link href="/catalog" className="group text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
          Lihat Semua Menu
          <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </div>
      
      <div className="flex overflow-x-auto gap-8 pb-10 no-scrollbar snap-x -mx-6 px-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-none w-[300px] bg-card-bg rounded-[40px] shadow-sm border border-border overflow-hidden snap-start hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
          >
            <div className="aspect-[4/5] relative overflow-hidden">
              <Image
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                src={product.image}
                fill
                sizes="300px"
              />
              {product.bestSeller && (
                <span className="absolute top-5 right-5 bg-primary text-white backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg">
                  Terlaris
                </span>
              )}
            </div>
            
            <div className="p-8 flex flex-col gap-6">
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-heading group-hover:text-primary transition-colors">{product.name}</h4>
                <p className="text-primary font-black text-2xl">Rp {product.price.toLocaleString("id-ID")}</p>
              </div>
              
              <button 
                onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.image }, 1)}
                className="w-full py-4 bg-primary text-white font-extrabold rounded-2xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                Tambah Pesanan
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
