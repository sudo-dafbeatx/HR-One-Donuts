import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Product } from "@/types/cms";
import MarketplaceClient from "@/components/MarketplaceClient";

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
            <p className="text-xl font-medium">Belum ada produk. Admin belum mengisi katalog.</p>
          </div>
        ) : (
          <MarketplaceClient initialProducts={products as Product[]} />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
