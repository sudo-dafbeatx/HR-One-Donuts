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
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-background-dark">
      <Navbar siteSettings={siteSettings} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-0 py-4">
        {/* Marketplace Banners */}
        <Hero 
          title={siteSettings?.store_name} 
          subtitle={siteSettings?.tagline}
        />

        {/* Flash Sale */}
        <Suspense fallback={<FlashSaleSkeleton />}>
          <FlashSaleServer />
        </Suspense>

        {/* Product Catalog */}
        <div className="px-4 lg:px-6 py-4 md:py-6">
          {!products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <p className="text-lg font-medium">Belum ada produk aktif.</p>
            </div>
          ) : (
            <MarketplaceClient initialProducts={products as Product[]} categories={categories || []} />
          )}
        </div>
      </main>
      
      <Footer siteSettings={siteSettings} />
    </div>
  );
}
