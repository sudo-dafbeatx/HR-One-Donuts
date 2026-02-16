import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProductGallery from "@/components/detail/Gallery";
import ProductInfo from "@/components/detail/Info";
import ProductReviews from "@/components/detail/ProductReviews";
import Footer from "@/components/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

// Use dynamic rendering to ensure we always get the latest data
export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !product) {
    return notFound();
  }

  // Fallback for missing image
  const displayImages = product.image_url ? [product.image_url] : [];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-8">
        <div className="max-w-[1200px] w-full">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
            <Link href="/" className="text-slate-500 hover:text-primary transition-colors">
              Beranda
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-400 text-[10px]">{product.category}</span>
            <span className="text-slate-400">/</span>
            <span className="text-primary font-bold truncate max-w-[200px]">{product.name}</span>
          </nav>
 
          {/* Product Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <ProductGallery images={displayImages} />
            <ProductInfo 
              id={product.id}
              name={product.name} 
              price={product.price} 
              description={product.description || ""} 
              image={product.image_url || ""}
              stock={product.stock}
              variants={product.variants || []}
              discount_percent={product.discount_percent}
              sale_type={product.sale_type}
            />
          </div>

          {/* Product Reviews Section */}
          <div className="mt-16">
            <ProductReviews productId={product.id} />
          </div>
        </div>
      </main>

      {/* Floating WhatsApp Action */}
      <a
        href={`https://wa.me/628123456789?text=Halo ${product.store_name || "HR-One Donuts"}, saya tertarik dengan ${product.name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform"
      >
        <span className="font-bold flex items-center gap-2">
           <svg className="size-5 fill-current" viewBox="0 0 24 24">
             <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
           </svg>
           Chat untuk Pesan
        </span>
      </a>

      <Footer />
    </div>
  );
}
