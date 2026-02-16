'use client';

import React from 'react';

interface GlobalLoadingProps {
  isVisible: boolean;
  message?: string;
}

export default function GlobalLoading({ isVisible, message = 'Please wait ...' }: GlobalLoadingProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center justify-center gap-8 animate-fade-in">
        {/* New Uiverse Loader */}
        <div className="loader-uiverse"></div>
        
        {/* Loading Message */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-slate-900 font-display font-black text-2xl tracking-tight text-center">
            {message}
          </p>
          <div className="flex gap-1.5">
            <div className="size-1.5 bg-primary/40 rounded-full animate-pulse"></div>
            <div className="size-1.5 bg-primary/40 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="size-1.5 bg-primary/40 rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
