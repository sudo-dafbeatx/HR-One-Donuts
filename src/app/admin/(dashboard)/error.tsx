'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Server Component Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="size-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
        <ExclamationTriangleIcon className="size-10" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Gagal Memuat Data</h2>
      <p className="text-slate-500 max-w-md mb-8">
        Terjadi kesalahan saat memproses data di server. Ini mungkin karena masalah koneksi atau data yang tidak valid.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <ArrowPathIcon className="size-5" />
          Coba Refresh Halaman
        </button>
        <button
          onClick={() => window.location.href = '/admin'}
          className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
        >
          Kembali ke Dashboard
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-12 p-4 bg-slate-100 rounded-xl text-left text-xs overflow-auto max-w-full text-slate-600 border border-slate-200">
          {error.message}
          {error.digest && `\nDigest: ${error.digest}`}
        </pre>
      )}
    </div>
  );
}
