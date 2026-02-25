'use client';

import { useEffect } from 'react';

type ErrorCardProps = {
  title?: string;
  message?: string;
  onClose?: () => void;
};

export default function ErrorCard({
  title = 'Terjadi Kesalahan',
  message = 'Silakan coba lagi.',
  onClose,
}: ErrorCardProps) {
  // Auto-dismiss after 5s
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-9999 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
      <div className="relative w-[330px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-[0_8px_32px_rgba(255,0,0,0.18)] border border-red-100 overflow-hidden flex items-center gap-3 px-4 py-3">
        {/* Decorative wave */}
        <svg
          className="absolute left-[-30px] top-[30px] w-[80px] rotate-90 opacity-30"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,256L1440,64L1440,320L0,320Z" fill="#ff4d4f" />
        </svg>

        {/* Icon */}
        <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center text-lg shrink-0 shadow-md shadow-red-200">
          ✕
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-red-700 text-[15px] leading-tight truncate">{title}</p>
          <p className="text-[12px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{message}</p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 shrink-0"
          aria-label="Tutup"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
