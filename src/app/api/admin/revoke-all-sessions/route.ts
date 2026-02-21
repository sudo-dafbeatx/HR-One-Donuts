import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/revoke-all-sessions
 *
 * Nuclear option: Revoke ALL sessions for ALL users.
 * Admin-only. Uses service role key server-side.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify the caller is an admin using admin_session cookie
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession?.value) {
      console.error('[RevokeAll] Missing admin_session cookie');
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda bukan admin.' },
        { status: 403 }
      );
    }

    const adminUsername = cookieStore.get('admin_user')?.value;
    const supabase = createServiceRoleClient();

    let adminId = null;
    let authUserId = null; // We might need this to avoid locking ourselves out, but admin might not have one. 
                           // If admin doesn't have an auth.users ID, we just don't skip them, OR we can query it.
    
    if (adminUsername) {
      const { data: au } = await supabase.from('admin_users').select('id, user_id').eq('username', adminUsername).maybeSingle();
      adminId = au?.id;
      authUserId = au?.user_id;
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
      // Skip the current admin's linked Auth user (if any) to avoid logging out their customer account
      if (authUserId && user.id === authUserId) continue;

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
      if (adminId) {
        await supabase.from('admin_activity_log').insert({
          admin_id: adminId,
          action: 'revoke_all_sessions',
          target_type: 'system',
          target_id: null,
          details: { revoked: revokedCount, failed: failedCount, total: users.length },
        });
      }
    } catch (logError) {
      console.warn('[RevokeAll] Failed to log admin activity:', logError);
    }

    // Also add to auth_logs if we have an auth user id for the admin
    try {
      if (authUserId) {
        const headerStore = request.headers;
        await supabase.from('auth_logs').insert({
          user_id: authUserId,
          event_type: 'revoke_all_sessions',
          ip_address: headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
          user_agent: headerStore.get('user-agent') || 'unknown',
        });
      }
    } catch {
      // Non-critical
    }

    console.log(`[RevokeAll] Admin ${adminUsername || 'Unknown'} revoked ${revokedCount} sessions (${failedCount} failed)`);

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
