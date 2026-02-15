import MarketplaceClient from "@/components/MarketplaceClient";
import CatalogNavbar from "@/components/catalog/Navbar";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SiteSettings, Product } from "@/types/cms";

export default async function CatalogPage() {
  const supabase = await createServerSupabaseClient();
  
  // Fetch site info
  const { data: settingsData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();

  // Fetch categories
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('name')
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  if (categoryError) {
    console.warn('⚠️ [CatalogPage] Missing categories table:', categoryError);
  }

  const siteSettings = settingsData?.value as unknown as SiteSettings | undefined;
  const categories = categoryData?.map(c => c.name) || [];

  const { data: dbProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const productsToDisplay = (dbProducts || []) as Product[];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <CatalogNavbar siteSettings={siteSettings} />
      <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-10 transition-colors duration-300">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-heading mb-2">Menu Katalog</h1>
          <p className="text-subheading opacity-70">Pilih donat favoritmu dari koleksi terbaik kami.</p>
        </div>
        <MarketplaceClient initialProducts={productsToDisplay} categories={categories || []} />
      </main>
      <Footer siteSettings={siteSettings} />
    </div>
  );
}
