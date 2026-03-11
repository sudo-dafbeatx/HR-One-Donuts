'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { sendAdminNotification } from '@/lib/telegram';
import { addNotification } from './notification-actions';

/**
 * Log an authentication event (login, logout, etc.) to the auth_logs table.
 * Must be called from server context only.
 */
export async function logAuthEvent(
  userId: string,
  eventType: 'login' | 'logout' | 'signup' | 'otp_login' | 'google_login' | 'force_logout' = 'login'
) {
  try {
    const supabase = await createServerSupabaseClient();
    const headerStore = await headers();

    const ipAddress =
      headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerStore.get('x-real-ip') ||
      'unknown';
    const userAgent = headerStore.get('user-agent') || 'unknown';

    const { error } = await supabase.from('auth_logs').insert({
      user_id: userId,
      event_type: eventType,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      // Non-critical: don't throw, just log
      console.error('[AuthLog] Failed to insert auth log:', error.message);
    }

    // Send Telegram Notification
    try {
      let message = '';
      
      // Fetch user profile info if available
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', userId)
        .maybeSingle();

      const userName = profile?.full_name || 'Pengguna';
      const userPhone = profile?.phone || '-';
      const userEmail = profile?.email || '-';

      if (eventType === 'signup') {
        message = `
🎉 <b>Pengguna Baru Terdaftar!</b>
---------------------------
👤 <b>Nama:</b> ${userName}
📱 <b>HP:</b> ${userPhone}
✉️ <b>Email:</b> ${userEmail}
🖥️ <b>IP/Device:</b> ${ipAddress}

<i>Selamat datang di HR-One Donuts! 🍩</i>`;
      } else if (eventType === 'login' || eventType === 'otp_login' || eventType === 'google_login') {
        message = `
🔐 <b>Login Berhasil</b>
---------------------------
👤 <b>Aktivitas:</b> ${userName} baru saja masuk.
🔑 <b>Metode:</b> ${eventType.replace('_', ' ').toUpperCase()}
🖥️ <b>IP:</b> ${ipAddress}
`;
      } 
      // Only send if there is a message defined
      if (message) {
        await sendAdminNotification(message);
      }

      // Add User Notification for Logins
      if (eventType === 'login' || eventType === 'otp_login' || eventType === 'google_login') {
        await addNotification({
          userId,
          type: 'login',
          title: 'Login Berhasil',
          content: `Anda baru saja masuk dari perangkat baru. (${ipAddress})`,
          data: { ip_address: ipAddress, user_agent: userAgent }
        });
      }
    } catch (tgError) {
      console.error('[AuthLog] Failed to send Telegram notification:', tgError);
    }
  } catch (err) {
    console.error('[AuthLog] Unexpected error:', err);
  }
}
