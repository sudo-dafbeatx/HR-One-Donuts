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

    if (productsRes.error) {
      console.error('❌ [ProductsPage] Error fetching products:', productsRes.error);
      throw productsRes.error;
    }

    let categories: Category[] = [];
    if (categoriesRes.error) {
      console.warn('⚠️ [ProductsPage] Error fetching categories (maybe table not created yet?):', categoriesRes.error);
      // Don't throw if it's just categories missing, just show empty or default
      if (categoriesRes.error.code === '42P01' || categoriesRes.error.message?.includes('does not exist')) {
        console.error('💡 TIP: Run the SQL migration in supabase/migrations/20260213_create_categories_table.sql');
      }
    } else {
      categories = (categoriesRes.data as Category[]) || [];
    }

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-heading mb-2">Manajemen Menu</h1>
          <p className="text-slate-500">Tambah, edit, atau hapus produk dari menu katalog Anda.</p>
        </div>

        <ProductManager 
          initialProducts={(productsRes.data as Product[]) || []} 
          categories={categories} 
        />
      </div>
    );
  } catch (error) {
    console.error('CRITICAL: Error loading ProductsAdminPage:', error);
    // This will be caught by the error.tsx boundary
    throw error;
  }
}
