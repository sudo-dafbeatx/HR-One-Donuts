import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // =====================================================
  // PAYMENT PROTECTION SYSTEM - Environment Variable
  // =====================================================
  
  // UNTUK DEVELOPER:
  // Control dari Vercel Environment Variables
  // LICENSE_STATUS: "ACTIVE" atau "EXPIRED"
  // Kalau EXPIRED, website langsung block
  
  const LICENSE_STATUS = process.env.LICENSE_STATUS || 'ACTIVE';
  
  // Check license status
  if (LICENSE_STATUS === 'EXPIRED') {
    // Website disabled, redirect ke halaman peringatan
    if (!request.nextUrl.pathname.startsWith('/license-expired')) {
      return NextResponse.redirect(new URL('/license-expired', request.url));
    }
  }
  
  return NextResponse.next();
}

// Protect all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
