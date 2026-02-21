import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/revoke-all-sessions
 *
 * Nuclear option: Revoke ALL sessions for ALL users.
 * Admin-only. Uses service role key server-side.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify the caller is an admin
    const supabase = await createServerSupabaseClient();
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser();

    if (authError || !caller) {
      return NextResponse.json(
        { success: false, error: 'Tidak terautentikasi.' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (profile?.role !== 'admin') {
      console.error(`[RevokeAll] Non-admin user ${caller.id} attempted revoke-all`);
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda bukan admin.' },
        { status: 403 }
      );
    }

    // 2. Get service role credentials
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[RevokeAll] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { success: false, error: 'Konfigurasi server belum lengkap.' },
        { status: 500 }
      );
    }

    // 3. Get all user IDs via admin API
    const usersResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1000`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
    });

    if (!usersResponse.ok) {
      const errorBody = await usersResponse.text();
      console.error('[RevokeAll] Failed to list users:', errorBody);
      return NextResponse.json(
        { success: false, error: 'Gagal mengambil daftar user.' },
        { status: 500 }
      );
    }

    const usersData = await usersResponse.json();
    const users = usersData.users || [];
    let revokedCount = 0;
    let failedCount = 0;

    // 4. Revoke each user's sessions
    for (const user of users) {
      // Skip the current admin to avoid locking themselves out
      if (user.id === caller.id) continue;

      const logoutRes = await fetch(
        `${supabaseUrl}/auth/v1/admin/users/${user.id}/logout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scope: 'global' }),
        }
      );

      if (logoutRes.ok) {
        revokedCount++;
      } else {
        failedCount++;
        console.warn(`[RevokeAll] Failed to revoke sessions for user ${user.id}`);
      }
    }

    // 5. Log the admin action
    try {
      await supabase.from('admin_activity_log').insert({
        admin_id: caller.id,
        action: 'revoke_all_sessions',
        target_type: 'system',
        target_id: null,
        details: { revoked: revokedCount, failed: failedCount, total: users.length },
      });
    } catch (logError) {
      console.warn('[RevokeAll] Failed to log admin activity:', logError);
    }

    // Also add to auth_logs
    try {
      const headerStore = request.headers;
      await supabase.from('auth_logs').insert({
        user_id: caller.id,
        event_type: 'revoke_all_sessions',
        ip_address: headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        user_agent: headerStore.get('user-agent') || 'unknown',
      });
    } catch {
      // Non-critical
    }

    console.log(`[RevokeAll] Admin ${caller.id} revoked ${revokedCount} sessions (${failedCount} failed)`);

    return NextResponse.json({
      success: true,
      revoked: revokedCount,
      failed: failedCount,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[RevokeAll] Unexpected error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
