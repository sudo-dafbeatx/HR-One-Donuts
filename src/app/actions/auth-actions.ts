'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { addNotification } from './notification-actions';

export async function updatePassword(newPassword: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Sesi telah berakhir. Silakan login kembali.' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('[AuthActions] Password update failed:', error.message);
      return { success: false, error: error.message };
    }

    // Add Notification
    await addNotification({
      userId: user.id,
      type: 'login', // Security related
      title: 'Password Diubah',
      content: 'Password akun Anda baru saja diperbarui. Jika ini bukan Anda, segera hubungi admin.',
      data: { activity: 'password_change', timestamp: new Date().toISOString() }
    });

    return { success: true };
  } catch (err) {
    console.error('[AuthActions] Unexpected error:', err);
    return { success: false, error: 'Terjadi kesalahan sistem.' };
  }
}
