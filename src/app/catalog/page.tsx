import CatalogNavbar from "@/components/catalog/Navbar";
import ProductCard from "@/components/catalog/ProductCard";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CatalogPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: dbProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const productsToDisplay = dbProducts || [];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <CatalogNavbar />
      <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-10 transition-colors duration-300">
        
        {productsToDisplay.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <p className="text-xl font-medium">Tidak ada produk yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
            {productsToDisplay.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                name={product.name}
                price={Number(product.price)}
                description={product.description || ''}
                image={product.image_url || ''}
                tag={product.tag}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
