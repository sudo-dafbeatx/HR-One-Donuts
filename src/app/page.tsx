import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Product } from "@/types/cms";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  
  // Only fetch active products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {!products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="size-20 mb-4 opacity-20">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
              </svg>
            </div>
            <p className="text-xl font-medium text-center">Belum ada produk. Admin belum mengisi katalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(products as Product[]).map((product) => (
              <div 
                key={product.id} 
                className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                <Link href={`/catalog/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <span className="text-4xl mb-2">🍩</span>
                      <span className="text-xs font-medium">No Image</span>
                    </div>
                  )}
                </Link>
                
                <div className="p-3 md:p-4 flex-1 flex flex-col">
                  <div className="mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{product.category}</span>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  
                  <div className="mt-auto pt-4 space-y-3">
                    <p className="text-primary font-black text-base md:text-lg">
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                    <Link 
                      href={`/catalog/${product.id}`}
                      className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm md:text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      Beli
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
