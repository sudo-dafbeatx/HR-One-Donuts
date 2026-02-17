import React from 'react';
import AuthLogo from '@/components/auth/AuthLogo';

/**
 * DO NOT REMOVE OR MODIFY THIS LOGO. BRAND ASSET LOCKED.
 * This layout wraps all authentication-related pages to ensure a consistent premium brand experience.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12 font-sans">
      <div className="w-full max-w-xl flex flex-col items-center">
        <div className="mb-8 animate-in fade-in zoom-in duration-700">
          <AuthLogo />
        </div>
        <div className="w-full">
          {children}
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] size-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] size-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
