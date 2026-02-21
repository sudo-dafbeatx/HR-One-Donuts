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
  // AUTH PROTECTION - Redirect to login if not logged in
  // =====================================================
  const pathname = request.nextUrl.pathname;
  
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
  const isPublicRoute = isAuthPath || 
                         pathname.startsWith('/api') ||
                         pathname.startsWith('/license-expired') ||
                         pathname.startsWith('/_next') ||
                         pathname.startsWith('/images') ||
                         pathname.match(/\.(.*)$/);

  // =====================================================
  // ADMIN SESSION PROTECTION — cookie-based second layer
  // =====================================================
  const isAdminPath = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminPath && !isAdminLoginPage && !isAdminApi) {
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
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
