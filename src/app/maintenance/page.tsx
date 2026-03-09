'use client';

import React from 'react';
import LogoBrand from '@/components/ui/LogoBrand';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f6f7f8] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-xl w-full relative z-10 text-center space-y-8">
        {/* Logo Section */}
        <div className="flex justify-center mb-8 transform hover:scale-105 transition-transform duration-500">
           <LogoBrand 
            logoUrl="/images/logo-hr-one.webp" 
            storeName="HR-One Donuts" 
            size="lg"
          />
        </div>

        {/* Illustration or Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-ping" />
          <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-slate-100 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="material-symbols-outlined text-6xl text-primary leading-none">
              engineering
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Sedang Dalam Pemeliharaan
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-1 w-8 bg-primary rounded-full" />
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">
              Meningkatkan Kelezatan
            </p>
            <div className="h-1 w-8 bg-primary rounded-full" />
          </div>
          <p className="text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
            Halo Teman Donat! Kami sedang melakukan pembaruan sistem untuk memberikan pengalaman belanja yang lebih lancar dan manis.
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-4xl border border-white shadow-lg space-y-4">
          <div className="flex items-center justify-between text-sm font-bold text-slate-700 px-2">
            <span>Progress Optimasi</span>
            <span className="text-primary font-black">90%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div 
              className="h-full bg-linear-to-r from-primary to-blue-400 rounded-full shadow-sm animate-progress"
              style={{ width: '90%' }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
            Estimasi Selesai: Segera Hadir
          </p>
        </div>

        {/* Social / Contact */}
        <div className="pt-4 flex flex-col items-center gap-4">
          <p className="text-slate-400 text-sm font-medium">Butuh pesanan mendesak?</p>
          <a 
            href="https://wa.me/6285810658117" 
            className="inline-flex items-center gap-3 px-8 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black rounded-2xl shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span>Hubungi WhatsApp</span>
          </a>
        </div>

        <footer className="pt-12">
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">
            © 2026 HR-One Donuts Artisan
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-progress {
          background-size: 200% 200%;
          animation: progress 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
