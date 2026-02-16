import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Product, SiteSettings } from "@/types/cms";
import MarketplaceClient from "@/components/MarketplaceClient";
import Hero from "@/components/Hero";
import FlashSaleServer from "@/components/FlashSaleServer";
import FlashSaleSkeleton from "@/components/FlashSaleSkeleton";
import { Suspense } from "react";
import { getCopy } from "@/lib/theme";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const copy = await getCopy();
  
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

  // Fetch review stats
  const { data: reviewStats } = await supabase
    .from('product_review_stats')
    .select('*');

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
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-background-dark uiverse-bg">
      <Navbar siteSettings={siteSettings} copy={copy} />
      
      <main className="relative z-10 flex-1 max-w-[1440px] mx-auto w-full px-0 py-4">
        <Hero copy={copy} />

        <Suspense fallback={<FlashSaleSkeleton />}>
          <FlashSaleServer />
        </Suspense>

        <div className="px-4 lg:px-6 py-4 md:py-6">
          {!products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <p className="text-lg font-medium">{copy.empty_products}</p>
            </div>
          ) : (
            <MarketplaceClient 
              initialProducts={products as Product[]} 
              categories={categories || []} 
              copy={copy} 
              reviewStats={reviewStats || []}
            />
          )}
        </div>
      </main>
      
      <Footer siteSettings={siteSettings} copy={copy} />
    </div>
  );
}
