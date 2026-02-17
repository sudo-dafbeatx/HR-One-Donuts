'use client';

import { useState } from 'react';
import NextImage from 'next/image';
interface LogoBrandProps {
  logoUrl?: string;
  storeName?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function LogoBrand({ 
  logoUrl, 
  storeName = 'HR-One Donuts', 
  className,
  imageClassName,
  priority = false,
  size = 'md'
}: LogoBrandProps) {
  
  const sizeClasses = {
    sm: 'h-8 w-8 md:h-10 md:w-10',
    md: 'h-12 w-12 md:h-14 md:w-14',
    lg: 'h-20 w-20 md:h-24 md:w-24',
    xl: 'h-28 w-28 md:h-32 md:w-32'
  };

  const [hasError, setHasError] = useState(false);
  const finalLogoUrl = logoUrl || "/images/logo-hr-one.webp";
  
  const containerClasses = `relative flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-1 transition-all ${sizeClasses[size]} ${className || ''}`;

  if (!hasError && finalLogoUrl) {
    return (
      <div className={containerClasses}>
        <NextImage
          src={finalLogoUrl}
          alt={storeName}
          fill
          priority={priority}
          sizes="(max-width: 768px) 80px, 128px"
          className={`object-contain p-1.5 ${imageClassName || ''}`}
          unoptimized={finalLogoUrl.startsWith('http') || finalLogoUrl.includes('supabase.co')}
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Fallback if image fails or no URL provided
  return (
    <div className={`${containerClasses} bg-primary rounded-xl shadow-lg shadow-primary/20 hover:scale-105`}>
      <span className={`material-symbols-outlined text-white font-bold ${
        size === 'sm' ? 'text-lg md:text-xl' : 
        size === 'md' ? 'text-2xl md:text-3xl' :
        size === 'lg' ? 'text-4xl md:text-5xl' : 'text-6xl'
      }`}>
        donut_large
      </span>
    </div>
  );
}
