import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizePhoneToID } from '@/lib/phone';

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone');

  if (!phone || phone.length < 8) {
    return NextResponse.json({ exists: false });
  }

  const normalized = normalizePhoneToID(phone);

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ exists: false, error: 'config' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone', normalized)
    .maybeSingle();

  if (error) {
    console.error('[check-phone] DB error:', error);
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({ exists: !!data });
}
