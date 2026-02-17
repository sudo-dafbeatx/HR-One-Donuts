"use client";

import Image from "next/image";

/**
 * DO NOT REMOVE OR MODIFY THIS LOGO. BRAND ASSET LOCKED.
 * This component ensures the brand identity remains consistent across all auth pages.
 */
export default function AuthLogo() {
  return (
    <div className="relative flex justify-center items-center group" data-testid="auth-logo">
      <div className="relative z-10 size-24 md:size-32 rounded-3xl bg-white shadow-2xl flex items-center justify-center p-4 border border-slate-100 transition-transform group-hover:scale-105 duration-500">
        <Image
          src="/images/logo-hr-one.webp"
          alt="HR-One Donuts Logo"
          width={512}
          height={512}
          priority
          sizes="(max-width: 768px) 96px, 128px"
          className="object-contain w-full h-full"
        />
      </div>
      {/* Subtle glow effect */}
      <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </div>
  );
}
