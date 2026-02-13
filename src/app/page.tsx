import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Product, PromoEvent, SiteSettings, OrderStep } from "@/types/cms";
import MarketplaceClient from "@/components/MarketplaceClient";
import PromoBanner from "@/components/PromoBanner";
import OrderSteps from "@/components/OrderSteps";
import Hero from "@/components/Hero";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  
  // Fetch site info
  const { data: siteInfoData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();

  // Fetch order steps
  const { data: orderStepsData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'order_steps')
    .maybeSingle();

  // Only fetch active products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Fetch active events
  const { data: events } = await supabase
    .from('events')
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
  const orderSteps = (orderStepsData?.value as { steps: OrderStep[] } | null)?.steps;
  const categories = categoryData?.map(c => c.name) || [];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      <Navbar siteSettings={siteSettings} />
      
      <main className="flex-1">
        <Hero 
          title={siteSettings?.store_name} 
          subtitle={siteSettings?.tagline}
        />

        <div className="container mx-auto px-4 py-12">
          {events && events.length > 0 && (
            <div className="mb-16">
              <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                 <span className="w-8 h-1 bg-primary rounded-full"></span>
                 Promo Terkini
              </h2>
              <PromoBanner events={events as PromoEvent[]} />
            </div>
          )}

          <div className="mb-16">
            <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-wider flex items-center gap-2">
               <span className="w-8 h-1 bg-primary rounded-full"></span>
               Katalog Produk
            </h2>
            {!products || products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="size-20 mb-4 opacity-20">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
                  </svg>
                </div>
                <p className="text-xl font-medium">Belum ada produk aktif.</p>
              </div>
            ) : (
              <MarketplaceClient initialProducts={products as Product[]} categories={categories || []} />
            )}
          </div>

          <OrderSteps steps={orderSteps} />
        </div>
      </main>
      
      <Footer siteSettings={siteSettings} />
    </div>
  );
}
