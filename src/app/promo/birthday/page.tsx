'use client';

import { useState, useEffect } from 'react';
import Footer from "@/components/Footer";
import Link from 'next/link';

export default function BirthdayPromoPage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const difference = endOfDay.getTime() - now.getTime();
      
      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-rose-50/30">
      
      
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Celebration Header */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight drop-shadow-sm">
            Selamat Ulang Tahun! <span className="inline-block animate-bounce">🎁</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            Kado spesial dari <span className="text-primary font-bold">HR-One Donuts</span> untuk hari spesialmu! Nikmati kebahagiaan manis bersama kami.
          </p>
        </div>

        {/* Promo Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-rose-200/50 border border-rose-100 relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-8xl text-primary">cake</span>
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="text-left space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                Penawaran Spesial
              </div>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                Gratis <span className="text-primary">1 Box Donat</span> Spesial Untukmu!
              </h2>
              
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  Syarat & Ketentuan:
                </h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex gap-3 text-sm">
                    <span className="font-bold text-primary">1.</span>
                    Bawa Identitas Diri asli (KTP/Kartu Pelajar) sebagai bukti hari ulang tahunmu.
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="font-bold text-primary">2.</span>
                    Berlaku untuk pengambilan langsung di outlet kami.
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className="font-bold text-primary">3.</span>
                    Promo eksklusif ini hanya berlaku khusus di hari spesialmu.
                  </li>
                </ul>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white text-center space-y-4 relative">
              <p className="text-rose-400 font-black text-xs uppercase tracking-widest">Sisa Waktu Klaim:</p>
              <div className="flex justify-center gap-4">
                {[
                  { value: timeLeft.hours, label: 'Jam' },
                  { value: timeLeft.minutes, label: 'Menit' },
                  { value: timeLeft.seconds, label: 'Detik' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-4xl md:text-5xl font-black tabular-nums min-w-[3rem]">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 italic mt-4 border-t border-white/10 pt-4">
                *Promo akan hangus otomatis setelah hari berganti.
              </p>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-rose-50 flex items-center gap-5">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ayo Datang Ke:</p>
              <p className="font-black text-slate-800 text-lg">Outlet HR-One</p>
              <a 
                href="https://maps.app.goo.gl/4BLKib9cQhx6KKFNA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
              >
                Lihat di Google Maps
                <span className="material-symbols-outlined text-sm">north_east</span>
              </a>
            </div>
          </div>

          <Link 
            href="/" 
            className="bg-primary rounded-3xl p-6 shadow-xl shadow-primary/25 flex items-center justify-center gap-3 text-white font-black hover:scale-105 transition-all text-lg"
          >
            Lihat Menu Kami
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
