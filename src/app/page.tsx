import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Product, SiteSettings } from "@/types/cms";
import MarketplaceClient from "@/components/MarketplaceClient";
import Hero from "@/components/Hero";
import FlashSaleServer from "@/components/FlashSaleServer";
import FlashSaleSkeleton from "@/components/FlashSaleSkeleton";
import { Suspense } from "react";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  
  // Fetch site info
  const { data: siteInfoData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();

  // Only fetch active products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Fetch categories
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (categoryError) {
    console.warn('⚠️ [HomePage] Missing categories table:', categoryError);
  }

  const siteSettings = siteInfoData?.value as unknown as SiteSettings | undefined;
  const categories = categoryData?.map(c => c.name) || [];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      <Navbar siteSettings={siteSettings} />
      
      <main className="flex-1">
        <Hero 
          title={siteSettings?.store_name} 
          subtitle={siteSettings?.tagline}
        />

        <Suspense fallback={<FlashSaleSkeleton />}>
          <FlashSaleServer />
        </Suspense>

        <div className="max-w-[1440px] mx-auto px-4 py-6 md:py-10">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                Katalog Produk
              </h2>
              <div className="text-xs text-primary font-bold border-b border-primary/20 pb-0.5">Lihat Semua</div>
            </div>
            {!products || products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <p className="text-lg font-medium">Belum ada produk aktif.</p>
              </div>
            ) : (
              <MarketplaceClient initialProducts={products as Product[]} categories={categories || []} />
            )}
          </div>
        </div>
      </main>
      
      <Footer siteSettings={siteSettings} />
    </div>
  );
}
