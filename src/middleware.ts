import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// =====================================================
// RATE LIMITING - In-memory store for login attempts
// Resets on server restart (sufficient for edge middleware)
// =====================================================
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}

// Periodic cleanup of expired entries (every 100 requests)
let requestCount = 0;
function cleanupRateLimitStore() {
  requestCount++;
  if (requestCount % 100 !== 0) return;
  const now = Date.now();
  for (const [key, entry] of loginAttempts) {
    if (now > entry.resetAt) loginAttempts.delete(key);
  }
}

export default async function proxy(request: NextRequest) {
  cleanupRateLimitStore();
  // =====================================================
  // PAYMENT PROTECTION SYSTEM - Environment Variable
  // =====================================================
  const LICENSE_STATUS = process.env.LICENSE_STATUS || 'ACTIVE';
  
  if (LICENSE_STATUS === 'EXPIRED') {
    if (!request.nextUrl.pathname.startsWith('/license-expired')) {
      return NextResponse.redirect(new URL('/license-expired', request.url));
    }
  }

  // =====================================================
  // SITE LOCK SYSTEM - Auto-lock on 25th & manual lock
  // Admin always bypasses. Uses WIB (UTC+7) timezone.
  // =====================================================
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isLockedPage = pathname === '/locked';
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/images') || !!pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/);
  const hasAdminSession = !!request.cookies.get('admin_session')?.value;

  if (!isAdminRoute && !isStaticAsset && !hasAdminSession) {
    // 1. Determine base date condition: is it the 25th in WIB timezone?
    const now = new Date();
    const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const isThe25th = wibTime.getUTCDate() === 25;

    let siteLocked = isThe25th; // Default to date-based lock

    // 2. Fetch overriding manual_lock setting from database
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const res = await fetch(
        `${supabaseUrl}/rest/v1/settings?key=eq.site_lock&select=value`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          cache: 'no-store',
        }
      );

      if (res.ok) {
        const rows = await res.json();
        if (rows.length > 0) {
          const lockSetting = rows[0].value;
          // Precedence Rules:
          if (lockSetting?.manual_lock === true) {
            // Rule A: Admin explicitly locked -> OVERRIDE ALL, ALWAYS SECURE
            siteLocked = true;
          } else if (lockSetting?.manual_lock === false) {
            // Rule B: Admin explicitly unlocked -> OVERRIDE ALL, ALWAYS OPEN
            siteLocked = false;
          } 
          // Rule C (implicit): If setting exists but no manual_lock property -> Fallback to date (isThe25th)
        }
      }
    } catch {
      // Rule D: If network fails, fail Open if already safely assumed unlocked by Date, else lock.
      // E.g., if it's not the 25th, stay open. If it is the 25th, stay locked.
      // This is the safest fallback without introducing a redirect loop for active users.
    }

    // 3. Routing Decisions based on the single truth
    if (siteLocked) {
      // If site is locked, and user is NOT on the locked page -> Redirect to /locked
      if (!isLockedPage) {
        return NextResponse.redirect(new URL('/locked', request.url));
      }
      // If user is already on /locked, do nothing (let them stay)
    } else {
      // If site is unlocked, and user IS on the locked page -> Redirect to /
      if (isLockedPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      // If user is on any other page, do nothing (let them browse)
    }
  }

  // =====================================================
  // AUTH PROTECTION - Redirect to login if not logged in
  // =====================================================
  
  // =====================================================
  // RATE LIMITING - Protect login endpoints
  // =====================================================
  const isLoginAttempt = request.method === 'POST' && 
    (pathname.startsWith('/login') || pathname.startsWith('/auth') || pathname === '/api/admin/login');
  
  if (isLoginAttempt) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const { allowed, retryAfterSeconds } = checkRateLimit(ip);
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan login. Coba lagi nanti.' },
        { 
          status: 429, 
          headers: { 'Retry-After': String(retryAfterSeconds) } 
        }
      );
    }
  }
  
  // Skip auth check for public routes
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/auth');
  // Storefront routes that are PUBLIC
  const isStorefrontRoute = pathname.startsWith('/catalog') ||
                             pathname.startsWith('/cara-pesan') ||
                             pathname.startsWith('/faq') ||
                             pathname.startsWith('/pengiriman') ||
                             pathname.startsWith('/kontak') ||
                             pathname.startsWith('/news') ||
                             pathname.startsWith('/promo') ||
                             pathname.startsWith('/cookies') ||
                             pathname.startsWith('/privacy') ||
                             pathname.startsWith('/terms') ||
                             pathname.startsWith('/onboarding');
  const isPublicRoute = isAuthPath || 
                         isStorefrontRoute ||
                         pathname.startsWith('/api') ||
                         pathname.startsWith('/license-expired') ||
                         pathname.startsWith('/_next') ||
                         pathname.startsWith('/images') ||
                         pathname.match(/\.(.*)$/);

  // =====================================================
  // ADMIN SESSION PROTECTION — cookie-based auth for admin
  // This replaces Supabase auth for /admin/* routes
  // =====================================================
  const isAdminPath = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminPath && !isAdminLoginPage && !isAdminApi) {
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Admin session is valid — allow through without Supabase auth
    return NextResponse.next();
  }
  
  if (!isPublicRoute) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    // =====================================================
    // ONBOARDING PROTECTION - Customer Profile Check
    // =====================================================
    const isOnboardingPath = pathname.startsWith('/onboarding');
    const isAdminPath = pathname.startsWith('/admin');

    if (!isOnboardingPath && !isAdminPath) {
      const profileCompleteCookie = request.cookies.get('hr_profile_complete');
      
      if (!profileCompleteCookie || profileCompleteCookie.value !== 'true') {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding/profile';
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
