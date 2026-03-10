import { createClient } from '@supabase/supabase-js';
import { VALID_ORDER_STATUSES } from './telegramButtons';

export interface UpdateStatusResult {
  success: boolean;
  message: string;
  orderId?: string;
  newStatus?: string;
}

function getAdminSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('[OrderStatusUpdater] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return null;
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function updateOrderStatusInDb(
  orderIdSegment: string, 
  newStatus: string
): Promise<UpdateStatusResult> {
  const supabase = getAdminSupabase();

  if (!supabase) {
    return { success: false, message: '⚠️ Server configuration error: missing database credentials.' };
  }

  if (!VALID_ORDER_STATUSES.includes(newStatus)) {
    return { success: false, message: `❌ Invalid status: ${newStatus}` };
  }

  try {
    // Try exact match first (full UUID passed from callback_data)
    let order = null;

    const { data: exactMatch, error: exactErr } = await supabase
      .from('orders')
      .select('id, user_id, status')
      .eq('id', orderIdSegment)
      .maybeSingle();

    if (exactErr) {
      console.error('[OrderStatusUpdater] Exact query error:', exactErr);
    }

    order = exactMatch;

    // Fallback: partial match (for short ID segments)
    if (!order) {
      const { data: partialMatch, error: partialErr } = await supabase
        .from('orders')
        .select('id, user_id, status')
        .ilike('id::text', `%${orderIdSegment}%`)
        .limit(1)
        .maybeSingle();

      if (partialErr) {
        console.error('[OrderStatusUpdater] Partial query error:', partialErr);
      }

      order = partialMatch;
    }

    if (!order) {
      return { success: false, message: `❌ Pesanan "${orderIdSegment.slice(0, 8).toUpperCase()}" tidak ditemukan.` };
    }

    const fullOrderId = order.id;

    if (order.status === newStatus) {
      return { 
        success: false, 
        message: `ℹ️ Order #${fullOrderId.slice(0, 8).toUpperCase()} is already "${newStatus}".`,
        orderId: fullOrderId,
        newStatus: order.status
      };
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', fullOrderId);

    if (updateError) {
      console.error('[OrderStatusUpdater] Update error:', updateError);
      throw updateError;
    }

    sendUserNotification(supabase, order.user_id, fullOrderId, newStatus);

    return { 
      success: true, 
      message: `✅ Status updated!\n🆔 #${fullOrderId.slice(0, 8).toUpperCase()}\n📊 Status: ${newStatus.toUpperCase()}`,
      orderId: fullOrderId,
      newStatus: newStatus
    };

  } catch (error) {
    console.error('[OrderStatusUpdater] Error updating order status:', error);
    return { success: false, message: '⚠️ Gagal memperbarui status pesanan.' };
  }
}

import { SupabaseClient } from '@supabase/supabase-js';

async function sendUserNotification(supabase: SupabaseClient, userId: string | null, orderId: string, status: string) {
  if (!userId) return;

  const titles: Record<string, string> = {
    confirmed: 'Pesanan Dikonfirmasi',
    processing: 'Pesanan Diproses',
    shipping: 'Pesanan Sedang Dikirim',
    ready: 'Pesanan Siap Diambil',
    completed: 'Pesanan Selesai'
  };
  
  const messages: Record<string, string> = {
    confirmed: 'Pesanan Anda telah kami terima dan sedang menunggu proses.',
    processing: 'Donat Anda sedang dibuat dengan cinta. 🍩',
    shipping: 'Kurir kami sedang dalam perjalanan mengantar pesanan Anda. 🚚',
    ready: 'Pesanan Anda sudah siap diambil di outlet kami. 📦',
    completed: 'Pesanan selesai. Terima kasih sudah memesan! ✅'
  };

  if (titles[status]) {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: titles[status],
        message: messages[status],
        type: 'order_update',
        related_record_id: orderId
      });
    } catch (e) {
      console.error('[OrderStatusUpdater] Failed inserting user notification:', e);
    }
  }
}
