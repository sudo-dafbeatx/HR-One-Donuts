'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function OrderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Order Detail Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-red-900/5 text-center border border-red-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        
        <div className="size-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon className="size-10 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 mb-2">Terjadi Kesalahan</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Maaf, kami tidak dapat memuat detail pesanan Anda saat ini. Silakan coba beberapa saat lagi.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl text-left text-xs font-mono mb-6 overflow-x-auto whitespace-pre-wrap">
            {error.message || 'Unknown error occurred.'}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full h-12 flex items-center justify-center bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
          >
            Coba Lagi
          </button>
          
          <Link 
            href="/profile"
            className="w-full h-12 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 active:scale-95 transition-transform"
          >
            <ArrowLeftIcon className="size-4" />
            Kembali ke Profil
          </Link>
        </div>
      </div>
    </div>
  );
}
