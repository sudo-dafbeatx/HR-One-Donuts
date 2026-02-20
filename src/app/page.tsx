import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Product, SiteSettings, ReviewStats } from "@/types/cms";
import MarketplaceClient from "@/components/MarketplaceClient";
import Hero from "@/components/Hero";
import FlashSaleServer from "@/components/FlashSaleServer";
import FlashSaleSkeleton from "@/components/FlashSaleSkeleton";
import { Suspense } from "react";
import { getCopy } from "@/lib/theme";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const copy = await getCopy();
  
  let siteSettings: SiteSettings | undefined;
  let products: Product[] = [];
  let reviewStats: ReviewStats[] = [];
  let categories: string[] = [];

  try {
    // 1. Fetch site info
    const { data: siteInfoData, error: siteInfoError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'site_info')
      .maybeSingle();
    
    if (siteInfoError) console.error(' [HomePage] Settings error:', siteInfoError);
    siteSettings = siteInfoData?.value as unknown as SiteSettings | undefined;

    // 2. Fetch active products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (productsError) console.error(' [HomePage] Products error:', productsError);
    products = (productsData as Product[]) || [];

    // 3. Fetch review stats
    const { data: reviewData, error: reviewError } = await supabase
      .from('product_review_stats')
      .select('*');
    
    if (reviewError) console.error(' [HomePage] Review stats error:', reviewError);
    reviewStats = reviewData || [];

    // 4. Fetch categories
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (categoryError) {
      console.warn(' [HomePage] Categories error:', categoryError);
    }
    categories = categoryData?.map(c => c.name) || [];

  } catch (err) {
    console.error(' [HomePage] Severe fetch error:', err);
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-background-dark uiverse-bg overflow-hidden">
      <Navbar siteSettings={siteSettings} copy={copy} />
      
      <main className="flex-1 w-full flex flex-col items-center">
        {/* Hero Section - Full width but content constrained */}
        <section className="w-full">
          <Hero siteSettings={siteSettings} copy={copy} />
        </section>

        {/* Constrained Content Container */}
        <div className="w-full max-w-7xl px-4 md:px-6 flex flex-col gap-8 md:gap-12 py-8 md:py-12">
          {/* Promo Section */}
          <Suspense fallback={<FlashSaleSkeleton />}>
            <FlashSaleServer />
          </Suspense>

          {/* Product Marketplace Section - Always render to show Search Bar */}
          <section className="w-full">
            <MarketplaceClient 
              initialProducts={products as Product[]} 
              categories={categories || []} 
              copy={copy} 
              reviewStats={reviewStats || []}
            />
          </section>
        </div>
      </main>
      
      <Footer siteSettings={siteSettings} copy={copy} />
    </div>
  );
}
