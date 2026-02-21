import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // Ensure Node.js runtime, not Edge

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, turnstileToken } = body;

    // 1. Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // 2. Verify Turnstile CAPTCHA
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Verifikasi CAPTCHA diperlukan.' },
          { status: 401 }
        );
      }

      try {
        const captchaRes = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              secret: turnstileSecret,
              response: turnstileToken,
            }),
          }
        );

        const captchaData = await captchaRes.json();
        if (!captchaData.success) {
          console.warn('[AdminLogin] CAPTCHA failed:', captchaData['error-codes']);
          return NextResponse.json(
            { error: 'Verifikasi CAPTCHA gagal. Silakan coba lagi.' },
            { status: 401 }
          );
        }
      } catch (captchaErr) {
        console.error('[AdminLogin] CAPTCHA verification network error:', captchaErr);
        // Allow login to continue if CAPTCHA service is down
      }
    }

    // 3. Query admin_users via service role (bypasses RLS)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      console.error('[AdminLogin] Missing SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json(
        { error: 'Konfigurasi server error: SUPABASE_URL tidak ditemukan.' },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      console.error('[AdminLogin] Missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { error: 'Konfigurasi server error: Service role key tidak ditemukan.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: adminUser, error: dbError } = await supabase
      .from('admin_users')
      .select('id, username, password_hash')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle();

    if (dbError) {
      console.error('[AdminLogin] DB error:', dbError.message, dbError.code);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // 4. Compare password with bcrypt
    const passwordMatch = await bcrypt.compare(password, adminUser.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // 5. Generate session token and set httpOnly cookie
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const maxAge = 2 * 60 * 60; // 2 hours

    const response = NextResponse.json({ success: true });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
      path: '/',
    });

    response.cookies.set('admin_user', adminUser.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[AdminLogin] Unexpected error:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}
