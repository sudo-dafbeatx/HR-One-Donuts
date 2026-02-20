import { createServerSupabaseClient } from "@/lib/supabase/server";
import FlashSaleSection from "./FlashSaleSection";
import { PromoEvent } from "@/types/cms";

import { getCopy } from "@/lib/theme";

export default async function FlashSaleServer() {
  const supabase = await createServerSupabaseClient();
  const copy = await getCopy();
  
  const { data: events } = await supabase
    .from('promo_events')
    .select('*')
    .eq('is_enabled', true)
    .order('created_at', { ascending: false });

  if (!events || events.length === 0) return null;

  return <FlashSaleSection events={events as PromoEvent[]} copy={copy} />;
}
