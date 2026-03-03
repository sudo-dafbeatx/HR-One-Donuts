import { createServiceRoleClient } from '@/lib/supabase/server';
import SiteSettingsEditor from '@/components/admin/CMS/SiteSettingsEditor';
import CategoryManager from '@/components/admin/CMS/CategoryManager';
import EventManager from '@/components/admin/CMS/EventManager';
import FlashSaleManager from '@/components/admin/CMS/FlashSaleManager';
import { SiteSettings, Category, FlashSale, FlashSaleItem, Product } from '@/types/cms';

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const supabase = createServiceRoleClient();
  
  try {
    // Fetch site info, events, categories, flash sales, items, and products in parallel
    const [siteInfoRes, categoryRes, eventsRes, flashSalesRes, flashSaleItemsRes, productsRes] = await Promise.all([
      supabase.from('settings').select('value').eq('key', 'site_info').maybeSingle(),
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('promo_events').select('*').order('created_at', { ascending: false }),
      supabase.from('flash_sales').select('*').order('created_at', { ascending: false }),
      supabase.from('flash_sale_items').select('*, products(id, name, price, image_url, category, is_active)').order('created_at', { ascending: false }),
      supabase.from('products').select('*').eq('is_active', true).order('name', { ascending: true }),
    ]);

    if (eventsRes.error) console.error('Error fetching events:', eventsRes.error);
    if (flashSaleItemsRes.error) console.error('Error fetching flash sale items:', flashSaleItemsRes.error);

    let categories: Category[] = [];
    if (categoryRes.error) {
      console.warn('⚠️ [ContentPage] Error fetching categories:', categoryRes.error);
    } else {
      categories = (categoryRes.data as Category[]) || [];
    }

    const siteSettings = siteInfoRes.data?.value as unknown as SiteSettings | undefined;
    const events = eventsRes.data || [];
    const products = (productsRes.data as Product[]) || [];
    const flashSaleItems = (flashSaleItemsRes.data as FlashSaleItem[]) || [];

    // Join items into their parent flash sales
    const flashSales = ((flashSalesRes.data as FlashSale[]) || []).map(sale => ({
      ...sale,
      items: flashSaleItems.filter(item => item.flash_sale_id === sale.id),
    }));

    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-heading mb-2">Manajemen Konten</h1>
          <p className="text-slate-500">Sesuaikan informasi toko dan konten utama website Anda.</p>
        </div>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">1. Pengaturan Toko</h2>
          <SiteSettingsEditor initialData={siteSettings} />
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">2. Flash Sale</h2>
          <FlashSaleManager initialData={flashSales} products={products} />
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">3. Promo & Event</h2>
          <EventManager initialEvents={events || []} />
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">4. Katalog & Kategori</h2>
          <CategoryManager initialCategories={categories} />
        </section>
      </div>
    );
  } catch (error) {
    console.error('CRITICAL: Error loading ContentPage:', error);
    throw error;
  }
}
