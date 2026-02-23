import { createServiceRoleClient } from '@/lib/supabase/server';
import SiteSettingsEditor from '@/components/admin/CMS/SiteSettingsEditor';
import CategoryManager from '@/components/admin/CMS/CategoryManager';
import EventManager from '@/components/admin/CMS/EventManager';
import FlashSaleManager from '@/components/admin/CMS/FlashSaleManager';
import { SiteSettings, Category, FlashSale } from '@/types/cms';

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const supabase = createServiceRoleClient();
  
  try {
    // Fetch site info, events, and categories in parallel
    const [siteInfoRes, categoryRes, eventsRes, flashSalesRes] = await Promise.all([
      supabase.from('settings').select('value').eq('key', 'site_info').maybeSingle(),
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('promo_events').select('*').order('created_at', { ascending: false }),
      supabase.from('flash_sales').select('*').order('created_at', { ascending: false }),
    ]);

    if (eventsRes.error) console.error('Error fetching events:', eventsRes.error);

    let categories: Category[] = [];
    if (categoryRes.error) {
      console.warn('⚠️ [ContentPage] Error fetching categories:', categoryRes.error);
    } else {
      categories = (categoryRes.data as Category[]) || [];
    }

    const siteSettings = siteInfoRes.data?.value as unknown as SiteSettings | undefined;
    const events = eventsRes.data || [];
    const flashSales = (flashSalesRes.data as FlashSale[]) || [];

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
          <FlashSaleManager initialData={flashSales} />
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">3. Promo & Event</h2>
          <EventManager initialEvents={events || []} />
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">3. Katalog & Kategori</h2>
          <CategoryManager initialCategories={categories} />
        </section>
      </div>
    );
  } catch (error) {
    console.error('CRITICAL: Error loading ContentPage:', error);
    throw error;
  }
}
