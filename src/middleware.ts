import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // =====================================================
  // PAYMENT PROTECTION SYSTEM
  // =====================================================
  
  // UNTUK DEVELOPER:
  // Setelah client bayar, update NEXT_PAYMENT_DUE ke bulan berikutnya
  // Format: YYYY-MM-DD
  // Contoh: Jika client bayar di Feb 2026, set ke "2026-03-14"
  
  const NEXT_PAYMENT_DUE = new Date('2026-02-14'); // 🔴 UPDATE TANGGAL INI SETELAH CLIENT BAYAR
  const currentDate = new Date();
  
  // Check apakah sudah melewati due date
  if (currentDate >= NEXT_PAYMENT_DUE) {
    // Redirect ke halaman license expired
    // KECUALI user sudah di halaman license-expired
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
