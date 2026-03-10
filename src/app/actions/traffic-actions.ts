'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { sendAdminNotification } from '@/lib/telegram';

export type TrafficEventType = 'page_view' | 'click_buy' | 'login_view' | 'login_success';

interface LogTrafficParams {
  event_type: TrafficEventType;
  path: string;
  user_id?: string | null;
  user_agent?: string;
  referrer?: string;
}

export async function logTraffic({
  event_type,
  path,
  user_id,
  user_agent,
  referrer,
}: LogTrafficParams) {
  try {
    const supabase = await createServerSupabaseClient();
    const headerList = await headers();
    
    // Fallback for user_agent if not provided
    const ua = user_agent || headerList.get('user-agent') || 'unknown';
    const ref = referrer || headerList.get('referer') || 'direct';

    const { error } = await supabase
      .from('traffic_logs')
      .insert({
        event_type,
        path,
        user_id: user_id || null, // Ensure null if undefined
        user_agent: ua,
        referrer: ref,
      });

    if (error) {
      console.error('Error logging traffic to Supabase:', error.message);
      // We don't throw here to prevent blocking the UI
    }

    // --- TELEGRAM NOTIFICATIONS FOR TRAFFIC ---
    // Only notify for specific high-value actions to avoid spam
    if (event_type === 'click_buy') {
      try {
        let userName = 'Anonim';
        if (user_id) {
           const { data: profile } = await supabase
             .from('profiles')
             .select('full_name')
             .eq('id', user_id)
             .maybeSingle();
           if (profile?.full_name) userName = profile.full_name;
        }

        const message = `
🛍️ <b>Aktivitas Pembelian</b>
---------------------------
👤 <b>User:</b> ${userName}
📍 <b>Aksi:</b> Klik Tombol Beli / Lihat Keranjang
🔗 <b>Path:</b> ${path}
🖥️ <b>User Agent:</b> ${ua.substring(0, 30)}...
`;
        await sendAdminNotification(message);
      } catch (tgErr) {
        console.error('[TrafficActions] Failed to send Telegram notification:', tgErr);
      }
    }
  } catch (err) {
    console.error('Unexpected error in logTraffic server action:', err);
  }
}
