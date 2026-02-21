import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

    // 2. Verify the caller is authenticated and is an admin
    const supabaseUser = await createServerSupabaseClient();
    const { data: { user: caller }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !caller) {
      console.error('[ForceLogout] Auth error:', authError?.message || 'No user session');
      return NextResponse.json(
        { success: false, error: 'Tidak terautentikasi.' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (profile?.role !== 'admin') {
      console.error(`[ForceLogout] Non-admin user ${caller.id} attempted force logout`);
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda bukan admin.' },
        { status: 403 }
      );
    }

    // 3. Revoke all sessions via Supabase Admin REST API using service role key
    //    This bypasses any JWT context issues since we call the REST endpoint directly.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[ForceLogout] Missing SUPABASE_URL or SERVICE_ROLE_KEY env vars');
      return NextResponse.json(
        { success: false, error: 'Konfigurasi server tidak lengkap.' },
        { status: 500 }
      );
    }

    // Call the Admin API: POST /auth/v1/logout with scope=global
    // Using the service role key as the Bearer token and specifying the target user
    const logoutResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUserId}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scope: 'global' }),
    });

    if (!logoutResponse.ok) {
      const errorBody = await logoutResponse.text();
      console.error('[ForceLogout] Supabase Admin API error:', {
        status: logoutResponse.status,
        statusText: logoutResponse.statusText,
        body: errorBody,
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
          { success: false, error: `Gagal memaksa logout: ${logoutResponse.statusText}` },
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
      await supabaseUser.from('admin_activity_log').insert({
        admin_id: caller.id,
        action: 'force_logout',
        target_type: 'user',
        target_id: targetUserId,
        details: { method: 'server_side_service_role' },
      });
    } catch (logError) {
      // Non-critical: don't fail the request if logging fails
      console.warn('[ForceLogout] Failed to log admin activity:', logError);
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
