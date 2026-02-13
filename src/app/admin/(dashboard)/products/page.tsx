import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProductManager from '@/components/admin/CMS/ProductManager';
import { Product, Category } from '@/types/cms';

export default async function ProductsAdminPage() {
  const supabase = await createServerSupabaseClient();
  
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
    ]);

    if (productsRes.error) throw productsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-heading mb-2">Manajemen Menu</h1>
          <p className="text-slate-500">Tambah, edit, atau hapus produk dari menu katalog Anda.</p>
        </div>

        <ProductManager 
          initialProducts={(productsRes.data as Product[]) || []} 
          categories={(categoriesRes.data as Category[]) || []} 
        />
      </div>
    );
  } catch (error) {
    console.error('CRITICAL: Error loading ProductsAdminPage:', error);
    // This will be caught by the error.tsx boundary
    throw error;
  }
}
