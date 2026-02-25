'use client';

export default function LockedPage() {
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

        {/* Footer */}
        <p className="text-red-300/40 text-xs font-medium tracking-wider">
          Hubungi administrator untuk informasi lebih lanjut.
        </p>
      </div>
    </div>
  );
}
