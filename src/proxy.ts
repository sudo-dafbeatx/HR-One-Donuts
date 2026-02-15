import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export default async function proxy(request: NextRequest) {
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
  
  // Skip auth check for public routes
  const isPublicRoute = pathname.startsWith('/login') || 
                         pathname.startsWith('/auth') || 
                         pathname.startsWith('/api') ||
                         pathname.startsWith('/license-expired');
  
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

    return supabaseResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
