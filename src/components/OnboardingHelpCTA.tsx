"use client";

import { usePathname } from "next/navigation";

export default function OnboardingHelpCTA() {
  const pathname = usePathname();
  
  // Only show on onboarding pages
  if (!pathname || !pathname.startsWith('/onboarding')) {
    return null;
  }

  const waNumber = process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER || '6285810658117';

  return (
    <div className="fixed bottom-24 right-6 z-[60] md:bottom-10 md:right-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <a 
        href={`https://wa.me/${waNumber}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all active:scale-95 group"
      >
        <div className="size-8 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-base">chat</span>
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Bantuan</span>
          <span className="text-sm font-black text-slate-800">Chat Admin</span>
        </div>
      </a>
    </div>
  );
}
