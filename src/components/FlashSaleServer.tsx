import { createServerSupabaseClient } from "@/lib/supabase/server";
import FlashSaleSection from "./FlashSaleSection";
import { PromoEvent, FlashSale } from "@/types/cms";

import { getCopy } from "@/lib/theme";

export default async function FlashSaleServer() {
  const supabase = await createServerSupabaseClient();
  const copy = await getCopy();
  
  const [eventsRes, flashSalesRes] = await Promise.all([
    supabase
      .from('promo_events')
      .select('*')
      .eq('is_enabled', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('flash_sales')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ]);

  const events = (eventsRes.data as PromoEvent[]) || [];
  const flashSales = (flashSalesRes.data as FlashSale[]) || [];

  if (events.length === 0 && flashSales.length === 0) return null;

  return <FlashSaleSection events={events} flashSales={flashSales} copy={copy} />;
}
