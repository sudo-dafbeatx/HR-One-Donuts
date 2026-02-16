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
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-background-dark uiverse-bg overflow-hidden">
      <Navbar siteSettings={siteSettings} copy={copy} />
      
      <main className="flex-1 w-full flex flex-col items-center">
        {/* Hero Section - Full width but content constrained */}
        <section className="w-full">
          <Hero copy={copy} />
        </section>

        {/* Constrained Content Container */}
        <div className="w-full max-w-7xl px-4 md:px-6 flex flex-col gap-8 md:gap-12 py-8 md:py-12">
          {/* Promo Section */}
          <Suspense fallback={<FlashSaleSkeleton />}>
            <FlashSaleServer />
          </Suspense>

          {/* Product Marketplace Section */}
          <section className="w-full">
            {!products || products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-4">inventory_2</span>
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
          </section>
        </div>
      </main>
      
      <Footer siteSettings={siteSettings} copy={copy} />
    </div>
  );
}
