'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendAdminNotification } from '@/lib/telegram';
import { getOrderStatusKeyboard } from '@/lib/telegram/telegramButtons';
import { addNotification } from './notification-actions';
import { incrementVoucherUsage, recordVoucherUsage } from './voucher-actions';

export async function getCurrentUserProfile() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // 1. Try to fetch existing profile (merge legacy and new detailed metadata)
    const { data: legacyProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const { data: detailProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (legacyProfile || detailProfile) {
      return {
        ...legacyProfile,
        ...detailProfile
      };
    }

    // 2. Fallback: Auto-create profile if missing (safety net for failed triggers)
    console.warn(` [getCurrentUserProfile] Profile missing for user ${user.id}, performing auto-create...`);
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        role: 'user'
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error(' [getCurrentUserProfile] Auto-create failed:', insertError);
      return null;
    }

    return newProfile;
  } catch (err) {
    console.error(' [getCurrentUserProfile] Unexpected crash:', err);
    return null;
  }
}

export async function getUserActiveAddress() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: address, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .maybeSingle();

    if (error) {
      console.error(' [getUserActiveAddress] Supabase error:', error);
      return null;
    }

    return address;
  } catch (err) {
    console.error(' [getUserActiveAddress] Unexpected crash:', err);
    return null;
  }
}

export async function createOrder(data: {
  total_amount: number;
  total_items: number;
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  session_id?: string;
  delivery_method?: string;
  shipping_fee?: number;
  shipping_address?: string;
  shipping_address_notes?: string;
  voucher_id?: string;
  voucher_code?: string;
  voucher_discount?: number;
  device_id?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Anda harus login untuk membuat pesanan');
    // Normalize data (ensure proper types even if passed from client haphazardly)
    const finalMethod = data.delivery_method || 'delivery';
    const finalFee = finalMethod === 'pickup' ? 0 : (data.shipping_fee || 0);

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: data.total_amount,
        total_items: data.total_items,
        items: data.items,
        session_id: data.session_id,
        delivery_method: finalMethod,
        shipping_fee: finalFee,
        shipping_address: data.shipping_address || null,
        shipping_address_notes: data.shipping_address_notes || null,
        status: 'pending'
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase error creating order:', error);
      throw new Error(`Gagal menyimpan pesanan: ${error.message}`);
    }

    if (data.voucher_id) {
      try {
        await incrementVoucherUsage(data.voucher_code || data.voucher_id);
        await recordVoucherUsage({
          voucherId: data.voucher_id,
          voucherCode: data.voucher_code || '',
          discountValue: data.voucher_discount || 0,
          orderId: order?.id,
          deviceId: data.device_id,
        });
      } catch (e) {
        console.warn('Failed to track voucher usage:', e);
      }
    }

    // Attempt to track sales volume as well
    try {
      for (const item of data.items) {
        await supabase.rpc('increment_product_sold', { product_id: item.product_id });
      }
    } catch (e) {
      console.warn('RPC volume track failed:', e);
    }

    revalidatePath('/profile');
    revalidatePath('/admin');

    // Send Telegram notification to admin
    try {
      // Fetch customer details from multiple sources for complete data
      const [profileRes, userProfileRes, addressRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
        supabase.from('user_profiles').select('full_name, phone').eq('id', user.id).maybeSingle(),
        supabase.from('user_addresses').select('full_name, phone').eq('user_id', user.id).eq('is_default', true).maybeSingle()
      ]);

      const customerName = userProfileRes.data?.full_name || profileRes.data?.full_name || user.user_metadata?.full_name || 'Pelanggan';
      const customerPhone = userProfileRes.data?.phone || addressRes.data?.phone || user.user_metadata?.phone || 'Tidak ada nomor';

      const itemsList = data.items.map(i => `  • ${i.name} x${i.quantity}`).join('\n');
      await sendAdminNotification(
        `🍩 <b>Pesanan Baru!</b>\n\n` +
        `🆔 #${order?.id?.slice(0, 8).toUpperCase() || 'N/A'}\n` +
        `👤 <b>Customer:</b> ${customerName}\n` +
        `📱 <b>WhatsApp:</b> ${customerPhone}\n` +
        `💰 Total: Rp ${data.total_amount.toLocaleString('id-ID')}\n` +
        `📦 ${data.total_items} item\n` +
        `🚗 ${finalMethod === 'pickup' ? 'Ambil di Toko' : 'Delivery'}\n\n` +
        `<b>Item:</b>\n${itemsList}`,
        getOrderStatusKeyboard(order!.id, 'pending')
      );
    } catch (tgErr) {
      console.warn('[Telegram] Failed to notify admin:', tgErr);
    }

    // Add User Notification for Orders
    await addNotification({
      userId: user.id,
      type: 'order',
      title: 'Pesanan Diterima',
      content: `Pesanan #${order?.id?.slice(0, 8).toUpperCase()} seharga Rp ${data.total_amount.toLocaleString('id-ID')} telah berhasil dibuat.`,
      data: { order_id: order?.id, total_amount: data.total_amount }
    });
    
    return { success: true, order };
  } catch (error: unknown) {
    console.error('CreateOrder server error:', error);
    const message = error instanceof Error ? error.message : 'Gagal memproses pesanan di server';
    throw new Error(message);
  }
}

export async function markOrderCompleted(orderId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Anda harus login' };
    }

    const { data: order, error: checkError } = await supabase
      .from('orders')
      .select('id, status, user_id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (checkError) throw checkError;
    if (!order) return { success: false, error: 'Pesanan tidak ditemukan' };
    
    // Check if the order status is eligible to be marked completed by the user
    // Generally 'ready' (for pickup) or 'shipping'/'delivering' (for delivery)
    if (order.status !== 'ready' && order.status !== 'shipping') {
      return { success: false, error: `Pesanan belum siap atau sedang diantar (status: ${order.status})` };
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    revalidatePath('/profile');
    revalidatePath(`/profile/orders/${orderId}`);
    revalidatePath('/admin');
    revalidatePath('/admin/orders-status');
    
    return { success: true };
  } catch (error: unknown) {
    console.error(' [markOrderCompleted] Database error:', error);
    const message = error instanceof Error ? error.message : 'Gagal menyelesaikan pesanan';
    return { success: false, error: message };
  }
}
