'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(' [Global Error boundary]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="size-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
      </div>
      
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Oops! Terjadi kesalahan</h1>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        Kami mengalami masalah saat memuat halaman ini. Jangan khawatir, tim kami sudah mendapat laporannya.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          Coba Lagi
        </button>
        
        <Link
          href="/"
          className="px-8 py-3 bg-white text-slate-600 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
        >
          Kembali ke Beranda
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-red-100 text-red-800 text-xs text-left rounded-lg max-w-full overflow-auto font-mono">
          {error.message}
          <div className="mt-2 opacity-60">Digest: {error.digest}</div>
        </div>
      )}
    </div>
  );
}
