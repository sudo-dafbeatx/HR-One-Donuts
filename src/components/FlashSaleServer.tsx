import { createServerSupabaseClient } from "@/lib/supabase/server";
import FlashSaleSection from "./FlashSaleSection";
import { PromoEvent, FlashSale } from "@/types/cms";

export default async function FlashSaleServer() {
  const supabase = await createServerSupabaseClient();
  
  const [eventsRes, flashSalesRes] = await Promise.all([
    supabase
      .from('promo_events')
      .select('*')
      .in('event_slug', ['selasa_mega_sale', 'jumat_berkah'])
      .order('created_at', { ascending: false }),
    supabase
      .from('flash_sales')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  const events = (eventsRes.data as PromoEvent[]) || [];
  // We only want to support BOGO (Jumat Berkah equivalents) and Percentage Discounts (SMS equivalents) if they are explicitly SMS/JumatBerkah related.
  // Instead of guessing which flash sale applies to what event based on slug, the USER EXPLICITLY REQUESTED to ONLY render 2 event cards ever:
  // "Selasa Mega Sale (SMS)" and "Jum'at Berkah".
  // Therefore, ALL flash sales that are NOT Tuesday or Friday related should be dropped, and even those shouldn't render if it is not the correct day.
  // To strictly enforce 2 cards max without touching the DB, we will completely set flashSales to empty [],
  // or handle them as duplicates of the event logic. The easiest is to just clear them out if it's not their day.
  let flashSales = (flashSalesRes.data as FlashSale[]) || [];

  // Server-side day calculation using Asia/Jakarta
  const serverNow = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
  });
  const todayName = formatter.format(serverNow); // e.g., "Tuesday", "Friday"

  const isTuesday = todayName === 'Tuesday';
  const isFriday = todayName === 'Friday';

  // Attach server-side active flags, completely overriding CMS `is_enabled` and device times.
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

  // Filter out flash sales to strictly enforce exactly 2 cards logic.
  // If it's not Tuesday or Friday, there are 0 flash sales.
  // If it is Tuesday, only keep flash sales with 'Selasa' in title.
  // If it is Friday, only keep flash sales with 'Jumat' or 'Jum\'at' in title.
  if (!isTuesday && !isFriday) {
     flashSales = [];
  } else if (isTuesday) {
     flashSales = flashSales.filter(fs => fs.title.toLowerCase().includes('selasa'));
  } else if (isFriday) {
     flashSales = flashSales.filter(fs => fs.title.toLowerCase().includes('jumat') || fs.title.toLowerCase().includes('jum\'at'));
  }

  // To prevent the 3 cards scenario entirely, if we already have the event version, we can just drop the flash_sale version. 
  // Let's limit the flashSales array to only items that DO NOT have a matching promo_event to strictly enforce 'at most 2 cards'.
  const activePromoSlugs = processedEvents.filter(e => e.serverIsActive).map(e => e.event_slug);
  if (activePromoSlugs.includes('selasa_mega_sale')) {
     flashSales = flashSales.filter(fs => !fs.title.toLowerCase().includes('selasa'));
  }
  if (activePromoSlugs.includes('jumat_berkah')) {
     flashSales = flashSales.filter(fs => !(fs.title.toLowerCase().includes('jumat') || fs.title.toLowerCase().includes('jum\'at')));
  }

  // Only pass these processed events if either promo has any value (to not break the UI if array is completely empty)
  if (processedEvents.length === 0 && flashSales.length === 0) return null;

  return <FlashSaleSection events={processedEvents as unknown as PromoEvent[]} flashSales={flashSales} />;
}
