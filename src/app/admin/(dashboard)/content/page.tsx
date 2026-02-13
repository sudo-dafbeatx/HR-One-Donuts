import { createServerSupabaseClient } from '@/lib/supabase/server';
import SiteSettingsEditor from '@/components/admin/CMS/SiteSettingsEditor';
import OrderStepsEditor from '@/components/admin/CMS/OrderStepsEditor';
import CategoryManager from '@/components/admin/CMS/CategoryManager';
import EventManager from '@/components/admin/CMS/EventManager';
import { SiteSettings, OrderStep } from '@/types/cms';

export default async function ContentPage() {
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

  // Fetch categories
  const { data: categoryData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'product_categories')
    .maybeSingle();

  // Fetch events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (eventsError) {
    console.error('Error fetching events:', eventsError);
  }

  const siteSettings = siteInfoData?.value as unknown as SiteSettings | undefined;
  const orderSteps = (orderStepsData?.value as unknown as { steps: OrderStep[] } | null)?.steps;
  const categories = (categoryData?.value as unknown as { categories: string[] } | null)?.categories;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-black text-heading mb-2">Manajemen Konten</h1>
        <p className="text-slate-500">Sesuaikan informasi toko dan konten utama website Anda.</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800">1. Pengaturan Toko</h2>
        <SiteSettingsEditor initialData={siteSettings} />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800">2. Promo & Event</h2>
        <EventManager initialEvents={events || []} />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800">3. Katalog & Kategori</h2>
        <CategoryManager initialCategories={categories || []} />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800">4. Alur Pemesanan</h2>
        <OrderStepsEditor initialSteps={orderSteps || []} />
      </section>
    </div>
  );
}
