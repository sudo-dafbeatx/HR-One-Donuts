import { NextRequest, NextResponse } from 'next/server';
import { createPublicServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/site-lock — Check if the site is currently locked.
 * Returns { locked: boolean, reason: string }
 */
export async function GET() {
  const locked = await isSiteLocked();
  return NextResponse.json(locked, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function POST(request: NextRequest) {
  // Verify admin session via cookie
  const adminSession = request.cookies.get('admin_session');
  if (!adminSession?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { locked } = body;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Prefer service role key for write operations (bypasses RLS)
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const newValue = { manual_lock: !!locked, updated_at: new Date().toISOString() };

  try {
    // First try to update existing row
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/settings?key=eq.site_lock`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ value: newValue }),
        cache: 'no-store',
      }
    );

    if (!updateRes.ok) {
      // If update fails, try insert
      const insertRes = await fetch(
        `${supabaseUrl}/rest/v1/settings`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates,return=minimal',
          },
          body: JSON.stringify({ key: 'site_lock', value: newValue }),
          cache: 'no-store',
        }
      );

      if (!insertRes.ok) {
        const errText = await insertRes.text();
        console.error('[site-lock] Insert failed:', insertRes.status, errText);
        return NextResponse.json({ error: `DB write failed: ${errText}` }, { status: 500 });
      }
    }
  } catch (err) {
    console.error('[site-lock] Network error:', err);
    return NextResponse.json({ error: 'Network error writing to DB' }, { status: 500 });
  }

  return NextResponse.json({ success: true, locked: !!locked }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
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
    // Manual lock = false → admin explicitly unlocked, always override auto-lock
    if (lockSetting.manual_lock === false) {
      return { locked: false, reason: 'admin_override' };
    }
  }

  // Auto-lock on the 25th
  if (isThe25th) {
    return { locked: true, reason: 'auto_25th' };
  }

  return { locked: false, reason: 'none' };
}
