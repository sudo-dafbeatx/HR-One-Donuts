'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { addNotification } from './notification-actions';

/**
 * Claims account verification status if the profile is complete.
 * This sets is_verified to true in both profiles and user_profiles tables.
 */
export async function claimVerification() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Anda harus login untuk melakukan aksi ini.' };
    }

    // Update both tables
    const updateProfiles = supabase
      .from('profiles')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    const updateUserProfiles = supabase
      .from('user_profiles')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    const [profilesRes, userProfilesRes] = await Promise.all([updateProfiles, updateUserProfiles]);

    if (profilesRes.error) throw profilesRes.error;
    if (userProfilesRes.error) throw userProfilesRes.error;

    // Add notification
    await addNotification({
      userId: user.id,
      type: 'system',
      title: 'Akun Diverifikasi ✅',
      content: 'Selamat! Akun Anda telah berhasil diverifikasi. Lencana verifikasi kini aktif di profil Anda.',
    });

    revalidatePath('/profile');
    revalidatePath('/admin');
    
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error(' [claimVerification] Error:', err);
    return { success: false, error: err.message || 'Gagal melakukan verifikasi akun.' };
  }
}
