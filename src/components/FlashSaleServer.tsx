import { createServerSupabaseClient } from "@/lib/supabase/server";
import FlashSaleSection from "./FlashSaleSection";
import { PromoEvent } from "@/types/cms";

export default async function FlashSaleServer() {
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .lte('start_at', now)
    .gte('end_at', now)
    .order('created_at', { ascending: false });

  if (!events || events.length === 0) return null;

  return <FlashSaleSection events={events as PromoEvent[]} />;
}
