'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

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
  } catch (err) {
    console.error('[AuthLog] Unexpected error:', err);
  }
}
