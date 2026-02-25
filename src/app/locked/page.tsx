'use client';

import { useEffect, useState } from 'react';

export default function LockedPage() {
  const [isChecking, setIsChecking] = useState(false);

  // Still do one single optimistic check on mount just in case
  // But NEVER poll in the background forever.
  useEffect(() => {
    const checkLockOptimistically = async () => {
      try {
        const res = await fetch(`/api/site-lock?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (!data.locked) {
            // If they happen to mount the component while it's unlocked, hard refresh.
            // But we don't repeat this check.
            window.location.href = '/';
          }
        }
      } catch {
        // Ignore silent errors
      }
    };
    checkLockOptimistically();
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    // Hard refresh clears all Next.js router cache state and forces middleware to rerun
    // completely afresh.
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 z-99999 bg-linear-to-br from-red-950 via-red-900 to-black flex items-center justify-center p-6">
      {/* Background noise */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idHJhbnNwYXJlbnQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] bg-repeat" />
      
      <div className="relative max-w-lg w-full text-center space-y-8">
        {/* Warning Icon */}
        <div className="mx-auto w-24 h-24 bg-red-500/20 border-4 border-red-500/40 rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Error Code */}
        <div className="space-y-2">
          <p className="text-red-400/60 text-sm font-mono tracking-widest uppercase">Error 503</p>
          <div className="w-16 h-0.5 bg-red-500/30 mx-auto" />
        </div>

        {/* Main Message */}
        <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tight">
          WEBSITE ERROR, HARAP HUBUNGI DEVELOPER ! KEMUNGKINAN BELUM BAYAR PEMELIHARAAN
        </h1>

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-px bg-red-500/30" />
          <div className="w-2 h-2 bg-red-500/50 rounded-full" />
          <div className="w-12 h-px bg-red-500/30" />
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button 
            onClick={handleRetry}
            disabled={isChecking}
            className={`px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full tracking-wider transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2 mx-auto ${isChecking ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isChecking ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            COBA LAGI
          </button>
        </div>

        {/* Footer */}
        <p className="text-red-300/40 text-xs font-medium tracking-wider">
          Hubungi administrator untuk informasi lebih lanjut.
        </p>
      </div>
    </div>
  );
}
