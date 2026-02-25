import { NextRequest, NextResponse } from 'next/server';
import { createPublicServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/site-lock — Check if the site is currently locked.
 * Returns { locked: boolean, reason: string }
 */
export async function GET() {
  const locked = await isSiteLocked();
  return NextResponse.json(locked);
}

/**
 * POST /api/site-lock — Toggle site lock status (admin only).
 * Body: { locked: boolean }
 */
export async function POST(request: NextRequest) {
  // Verify admin session via cookie
  const adminSession = request.cookies.get('admin_session');
  if (!adminSession?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { locked } = body;

  const supabase = createPublicServerSupabaseClient();

  // Upsert the site_lock setting
  const { error } = await supabase
    .from('settings')
    .upsert(
      {
        key: 'site_lock',
        value: { manual_lock: !!locked, updated_at: new Date().toISOString() },
      },
      { onConflict: 'key' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, locked: !!locked });
}

/**
 * Shared lock check logic:
 * 1. If manual lock is set in DB → locked
 * 2. If today is the 25th (WIB timezone) AND no manual override to unlock → locked
 */
export async function isSiteLocked(): Promise<{ locked: boolean; reason: string }> {
  const supabase = createPublicServerSupabaseClient();

  // Get the manual lock setting from DB
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_lock')
    .maybeSingle();

  const lockSetting = data?.value as { manual_lock?: boolean; updated_at?: string } | null;

  // Check if it's the 25th in WIB (UTC+7)
  const now = new Date();
  const wibOffset = 7 * 60; // WIB = UTC+7 in minutes
  const wibDate = new Date(now.getTime() + wibOffset * 60 * 1000);
  const isThe25th = wibDate.getUTCDate() === 25;

  // If manual lock setting exists
  if (lockSetting) {
    // Manual lock = true → always locked
    if (lockSetting.manual_lock === true) {
      return { locked: true, reason: 'manual' };
    }
    // Manual lock = false → admin explicitly unlocked, override auto-lock
    if (lockSetting.manual_lock === false) {
      // Check if the override was set today (same day in WIB)
      if (lockSetting.updated_at) {
        const updatedDate = new Date(lockSetting.updated_at);
        const updatedWib = new Date(updatedDate.getTime() + wibOffset * 60 * 1000);
        const isSameDay = updatedWib.getUTCDate() === wibDate.getUTCDate() &&
                          updatedWib.getUTCMonth() === wibDate.getUTCMonth() &&
                          updatedWib.getUTCFullYear() === wibDate.getUTCFullYear();
        if (isSameDay) {
          // Admin unlocked today → NOT locked even on the 25th
          return { locked: false, reason: 'admin_override' };
        }
      }
    }
  }

  // Auto-lock on the 25th
  if (isThe25th) {
    return { locked: true, reason: 'auto_25th' };
  }

  return { locked: false, reason: 'none' };
}
