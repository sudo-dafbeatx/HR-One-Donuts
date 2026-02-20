'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function forceLogoutUser(userId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Verify admin access first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error("Pembaruan ditolak: Anda bukan admin.");
    }

    // Force sign out the target user globally (revokes all active sessions/tokens)
    const { error: signOutError } = await supabase.auth.admin.signOut(userId, 'global');
    
    if (signOutError) {
      console.error('Failed to revoke tokens:', signOutError);
      throw new Error(`Gagal memaksa logout: ${signOutError.message}`);
    }

    // Optionally update their active status or last sign out in db if needed, but signing out is enough
    
    revalidatePath('/admin/users');
    return { success: true };
    
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[AdminActions] forceLogoutUser error:', err);
    return { success: false, error: err.message || "Terjadi kesalahan server." };
  }
}
