'use client';

import React from 'react';

interface GlobalLoadingProps {
  isVisible: boolean;
  message?: string;
}

export default function GlobalLoading({ isVisible, message = 'Please wait ...' }: GlobalLoadingProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
      <div className="relative">
        {/* Spinning Donut Animation */}
        <div className="size-24 border-[8px] border-primary/10 border-t-primary rounded-full animate-spin"></div>
        
        {/* Donut Icon in the middle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-4xl animate-pulse">donut_large</span>
        </div>
      </div>
      
      {/* Loading Message */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-primary font-bold text-xl tracking-tight animate-bounce">{message}</p>
        <div className="flex gap-1">
          <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="size-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
