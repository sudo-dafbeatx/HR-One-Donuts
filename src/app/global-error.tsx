'use client';

import { useEffect } from 'react';
import { reportGlobalError } from '@/app/actions/bot-actions';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error caught:', error);

    const reportError = async () => {
      try {
        await reportGlobalError(error.message, error.stack, error.digest);
      } catch (e) {
        console.error('Gagal mengirim laporan error ke Telegram', e);
      }
    };

    reportError();
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-800">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Terjadi Kesalahan Tidak Terduga</h2>
          <p className="text-slate-600 mb-6 text-center">
            Kami mohon maaf atas ketidaknyamanan ini. Tim teknis kami telah diberitahu.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
