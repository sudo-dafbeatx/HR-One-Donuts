import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProductManager from '@/components/admin/CMS/ProductManager';

export default async function ProductsAdminPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch categories
  const { data: categoryData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'product_categories')
    .maybeSingle();

  const categories = (categoryData?.value as { categories: string[] } | null)?.categories;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-black text-heading mb-2">Manajemen Menu</h1>
        <p className="text-slate-500">Tambah, edit, atau hapus produk dari menu katalog Anda.</p>
      </div>

      <ProductManager initialProducts={products || []} categories={categories || []} />
    </div>
  );
}
