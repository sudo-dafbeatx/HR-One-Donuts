import { createServiceRoleClient } from '@/lib/supabase/server';
import { VALID_ORDER_STATUSES } from './telegramButtons';

export interface UpdateStatusResult {
  success: boolean;
  message: string;
  orderId?: string;
  newStatus?: string;
}

/**
 * Updates an order's status in the database and triggers user notifications.
 */
export async function updateOrderStatusInDb(
  orderIdSegment: string, 
  newStatus: string
): Promise<UpdateStatusResult> {
  const supabase = createServiceRoleClient();

  // 1. Validate status
  if (!VALID_ORDER_STATUSES.includes(newStatus)) {
    return { success: false, message: `❌ Invalid status: ${newStatus}` };
  }

  try {
    // 2. Find matching order (since orderIdSegment might just be the first 6-8 chars)
    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id, status')
      .ilike('id', `%${orderIdSegment}%`)
      .limit(1)
      .maybeSingle();

    if (!order) {
      return { success: false, message: `❌ Order containing "${orderIdSegment}" not found.` };
    }

    const fullOrderId = order.id;

    // Prevent duplicate updates if it's already in this status
    if (order.status === newStatus) {
       return { 
         success: false, 
         message: `ℹ️ Order #${fullOrderId.slice(0, 8).toUpperCase()} is already "${newStatus}".`,
         orderId: fullOrderId,
         newStatus: order.status
       };
    }

    // 3. Update status in Database
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', fullOrderId);

    if (updateError) throw updateError;

    // 4. Send Notification to the User (Optional but good UX)
    sendUserNotification(supabase, order.user_id, fullOrderId, newStatus);

    return { 
      success: true, 
      message: `✅ Status updated!\n🆔 #${fullOrderId.slice(0, 8).toUpperCase()}\n📊 Status: ${newStatus.toUpperCase()}`,
      orderId: fullOrderId,
      newStatus: newStatus
    };

  } catch (error) {
    console.error('[Telegram] Error updating order status:', error);
    return { success: false, message: '⚠️ Failed to update order status in database.' };
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
    processing: 'Donat Anda sedang dibuat dengan cinta.',
    shipping: 'Kurir kami sedang dalam perjalanan mengantar pesanan Anda.',
    ready: 'Pesanan Anda sudah siap diambil di outlet kami.',
    completed: 'Pesanan selesai. Jangan lupa berikan ulasan Anda!'
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
      console.error('[Telegram] Failed inserting user notification:', e);
    }
  }
}
