'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function forceLogoutUser(userId: string) {
  try {
    const supabaseUserClient = await createServerSupabaseClient();
    
    // Verify admin access first using the user's session
    const { data: { user } } = await supabaseUserClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabaseUserClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error("Pembaruan ditolak: Anda bukan admin.");
    }

    // Instantiate Admin Client using Service Role Key to revoke sessions
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );

    // Force sign out the target user globally (revokes all active sessions/tokens)
    const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(userId, 'global');
    
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
