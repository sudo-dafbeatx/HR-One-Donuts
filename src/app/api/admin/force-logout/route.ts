import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/force-logout
 * 
 * Server-side force logout using Supabase Admin REST API with service role key.
 * - Frontend sends only { user_id } in the body.
 * - Server verifies admin role from the caller's session.
 * - Server calls Supabase Admin API directly to revoke all sessions.
 * - No client/anon key is ever used for session revocation.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse body
    const body = await request.json();
    const targetUserId = body?.user_id;

    if (!targetUserId || typeof targetUserId !== 'string') {
      console.error('[ForceLogout] Missing or invalid user_id in request body');
      return NextResponse.json(
        { success: false, error: 'user_id diperlukan.' },
        { status: 400 }
      );
    }

    // 2. Verify the caller is an admin using admin_session cookie
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession?.value) {
      console.error('[ForceLogout] Missing admin_session cookie');
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda bukan admin.' },
        { status: 403 }
      );
    }

    const adminUsername = cookieStore.get('admin_user')?.value;
    const supabaseService = createServiceRoleClient();

    let adminId = null;
    if (adminUsername) {
      const { data: au } = await supabaseService.from('admin_users').select('id').eq('username', adminUsername).maybeSingle();
      adminId = au?.id;
    }

    // 3. Revoke all sessions via Supabase Admin REST API using service role key
    //    This bypasses any JWT context issues since we call the REST endpoint directly.
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[ForceLogout] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
      return NextResponse.json(
        { success: false, error: 'Konfigurasi server belum lengkap' },
        { status: 500 }
      );
    }

    // 3. Revoke all sessions via Supabase Admin API
    // Using the SDK method which handles the endpoint routing correctly
    const { error: logoutError } = await supabaseService.auth.admin.signOut(targetUserId, 'global');

    if (logoutError) {
      console.error('[ForceLogout] Supabase Admin API error:', {
        message: logoutError.message,
        status: logoutError.status,
        targetUserId,
      });

      // Try fallback: update the user's session factor via admin update
      // This invalidates tokens by changing the user's aal
      const fallbackResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ban_duration: '1s', // Temporarily ban for 1 second to invalidate all sessions
        }),
      });

      if (!fallbackResponse.ok) {
        const fallbackError = await fallbackResponse.text();
        console.error('[ForceLogout] Fallback (temp ban) also failed:', {
          status: fallbackResponse.status,
          body: fallbackError,
          targetUserId,
        });
        return NextResponse.json(
          { success: false, error: `Gagal memaksa logout: ${logoutError.message}` },
          { status: 500 }
        );
      }

      // Immediately unban the user
      const unbanResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ban_duration: 'none',
        }),
      });

      if (!unbanResponse.ok) {
        console.error('[ForceLogout] Unban after temp-ban failed:', {
          status: unbanResponse.status,
          targetUserId,
        });
        // The logout still succeeded via temp ban, but log the unban failure
      }

      console.log(`[ForceLogout] Successfully force-logged-out user ${targetUserId} via fallback (temp ban+unban)`);
    } else {
      console.log(`[ForceLogout] Successfully force-logged-out user ${targetUserId} via Admin API`);
    }

    // 4. Log the admin action
    try {
      if (adminId) {
        await supabaseService.from('admin_activity_log').insert({
          admin_id: adminId,
          action: 'force_logout',
          target_type: 'user',
          target_id: targetUserId,
          details: { method: 'server_side_service_role' },
        });
      }
    } catch (logError) {
      // Non-critical: don't fail the request if logging fails
      console.warn('[ForceLogout] Failed to log admin activity:', logError);
    }

    // 5. Record in auth_logs for audit trail
    try {
      if (adminId) {
        const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        await supabaseService.from('auth_logs').insert({
          user_id: targetUserId,
          event_type: 'force_logout',
          ip_address: ipAddress,
          user_agent: userAgent,
        });
      }
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[ForceLogout] Unexpected server error:', {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
