import CatalogNavbar from "@/components/catalog/Navbar";
import CatalogHero from "@/components/catalog/Hero";
import CatalogFilters from "@/components/catalog/Filters";
import ProductCard from "@/components/catalog/ProductCard";
import CatalogCTA from "@/components/catalog/CTA";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CatalogPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: dbProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const fallbackProducts = [
    {
      id: "classic-glazed",
      name: "Glazed Klasik",
      price: 12000,
      description: "Favorit sepanjang masa, adonan lembut sempurna dengan lapisan madu khas.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0wiT6qFEqug77pjnddnAne8HeuukD0QKQPYpLrrYzgiAD4eeHfeVUXVsLMR3gOJBaPHEFrxsTVM9RDr4yuZlcPfXBEhtQz4XJnQ8lXrLZktcqZNDkHBkokHPBU9AdFvo6wEiEH5uZpNBn0HWwHB6MKcIp796GQALpJY6KyCPvc-tsqTY6EARbg_TzgbWWAE27bhWBtiQ7m-qjMr0QEgxbr5UWuJ9PrYX5bvjRbON66lewM-WnxrmIafCvxAgJM8SF_YGxq3x4Nh5v",
      tag: "Terlaris",
    },
    {
      id: "chocolate-dream",
      name: "Cokelat Impian",
      price: 15000,
      description: "Ganache cokelat hitam mewah dengan taburan serutan cokelat Belgia.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAvhBgVo2CSujDOE--X4SqRz1zqunePaFhkFLk0t7pwzuDsaoO7B79bl4f0UTPBwCRiR2F4_2oqLAIt5enNT-z5kcnyy5obi6-AWQxN7Mfa4_pGkbiepFH2lIgrG3WzB7uLwma0puGIhInZN2fLVUwW-uE5jPg5Dw1VzhwfrDHiZBll3EKE5QgezTvLrkxuV3Y8EbhHzsdJk3jKmlfYkjdY5Rwl9UxyI7L1MMPHjRFtAXLO4o_BjI_hXHCusMmGXoMeRzO76q8s9Up",
    }
    // ... other fallbacks can be simplified for code brevety as we have real data now
  ];

  const productsToDisplay = dbProducts && dbProducts.length > 0 ? dbProducts : fallbackProducts;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <CatalogNavbar />
      <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-10 transition-colors duration-300">
        <CatalogHero />
        <CatalogFilters />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
          {productsToDisplay.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              price={Number(product.price)}
              description={product.description || ''}
              image={product.image_url || product.image || ''}
              tag={product.tag}
            />
          ))}
        </div>
        
        <CatalogCTA />
      </main>
      <Footer />
    </div>
  );
}
