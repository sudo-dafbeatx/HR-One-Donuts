import { createServerSupabaseClient } from "@/lib/supabase/server";
import FlashSaleSection from "./FlashSaleSection";
import { PromoEvent, FlashSale, FlashSaleItem } from "@/types/cms";

export default async function FlashSaleServer() {
  const supabase = await createServerSupabaseClient();
  
  const [eventsRes, flashSalesRes, flashSaleItemsRes] = await Promise.all([
    supabase
      .from('promo_events')
      .select('*')
      .in('event_slug', ['selasa_mega_sale', 'jumat_berkah'])
      .order('created_at', { ascending: false }),
    supabase
      .from('flash_sales')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('flash_sale_items')
      .select('*, products(id, name, price, image_url, category, is_active)')
      .order('created_at', { ascending: false }),
  ]);

  const events = (eventsRes.data as PromoEvent[]) || [];
  const allFlashSaleItems = (flashSaleItemsRes.data as FlashSaleItem[]) || [];

  let flashSales = ((flashSalesRes.data as FlashSale[]) || []).map(sale => ({
    ...sale,
    items: allFlashSaleItems.filter(item => item.flash_sale_id === sale.id),
  }));

  // Server-side day calculation using Asia/Jakarta
  const serverNow = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
  });
  const todayName = formatter.format(serverNow);

  const isTuesday = todayName === 'Tuesday';
  const isFriday = todayName === 'Friday';

  // Attach server-side active flags
  const processedEvents = events.map(evt => {
    let serverIsActive = false;
    let serverActiveDayName = '';

    if (evt.event_slug === 'selasa_mega_sale') {
      serverIsActive = isTuesday;
      serverActiveDayName = 'Tuesday';
    } else if (evt.event_slug === 'jumat_berkah') {
      serverIsActive = isFriday;
      serverActiveDayName = 'Friday';
    }

    return {
      ...evt,
      serverIsActive,
      serverActiveDayName
    };
  });

  // Filter day-specific flash sales (those tied to Selasa/Jumat by title)
  // Flash sales WITHOUT day-specific titles are shown every day (general flash sales)
  const daySpecificSales = flashSales.filter(fs => {
    const titleLower = fs.title.toLowerCase();
    const isSelasa = titleLower.includes('selasa');
    const isJumat = titleLower.includes('jumat') || titleLower.includes("jum'at");
    
    if (isSelasa) return isTuesday;
    if (isJumat) return isFriday;
    return true; // General flash sales (not day-specific) always show
  });

  // Prevent duplication: if promo_event already covers Selasa/Jumat, remove matching flash_sale
  const activePromoSlugs = processedEvents.filter(e => e.serverIsActive).map(e => e.event_slug);
  flashSales = daySpecificSales.filter(fs => {
    const titleLower = fs.title.toLowerCase();
    if (activePromoSlugs.includes('selasa_mega_sale') && titleLower.includes('selasa')) return false;
    if (activePromoSlugs.includes('jumat_berkah') && (titleLower.includes('jumat') || titleLower.includes("jum'at"))) return false;
    return true;
  });

  if (processedEvents.length === 0 && flashSales.length === 0) return null;

  return <FlashSaleSection events={processedEvents as unknown as PromoEvent[]} flashSales={flashSales} />;
}
