'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PromoEvent } from '@/types/cms';
import { getEventTiming, formatCountdown } from '@/lib/date-utils';
import Link from 'next/link';
import Confetti from "@/components/animations/Confetti";

export default function PromoDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<PromoEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase
        .from('promo_events')
        .select('*')
        .eq('event_slug', slug)
        .eq('is_enabled', true)
        .maybeSingle();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setEvent(data as PromoEvent);
      setLoading(false);
    }

    fetchEvent();

    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [slug, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">event_busy</span>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Event Tidak Tersedia</h1>
        <p className="text-slate-500 mb-8">Maaf, event promo yang kamu cari sedang tidak aktif atau tidak ditemukan.</p>
        <Link href="/" className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const timing = getEventTiming(event.event_day, event.start_time, event.end_time, event.headline);

  return (
    <div className={`min-h-screen ${timing.isActive ? 'bg-primary/5' : 'bg-slate-100/30'}`}>
      {timing.isActive && <Confetti />}
      
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-16 text-center">
        {/* Navigation */}
        <div className="flex justify-start mb-8">
           <Link href="/" className="flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              Beranda
           </Link>
        </div>

        {/* Celebration Header */}
        <div className="relative mb-12">
          <div className={`absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none ${timing.isActive ? '' : 'grayscale'}`}>
            <div className={`w-64 h-64 ${timing.isActive ? 'bg-primary' : 'bg-slate-300'} rounded-full blur-3xl animate-pulse`} />
          </div>
          
          {timing.isActive ? (
            <div className="inline-block px-4 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4 animate-bounce">
              Sedang Berlangsung! 🔥
            </div>
          ) : (
            <div className="inline-block px-4 py-1 bg-slate-400 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              Tidak Aktif
            </div>
          )}

          <h1 className={`text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-sm transition-colors ${timing.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
            {timing.isActive ? event.headline : 'Event Tidak Sedang Berlangsung'} 
            {timing.isActive && <span className="inline-block animate-bounce">🎁</span>}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            {timing.isActive ? event.description : timing.message}
          </p>
        </div>

        {/* Promo Card */}
        <div className={`bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border relative overflow-hidden mb-12 transition-all ${timing.isActive ? 'shadow-primary/10 border-primary/10' : 'shadow-slate-200 border-slate-100 grayscale-[0.8]'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <span className="material-symbols-outlined text-[120px] text-primary">schedule</span>
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="text-left space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                Penawaran Mingguan
              </div>
              <h2 className={`text-3xl font-black leading-tight ${timing.isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                Diskon <span className="text-primary">{event.discount_percent}%</span> Untuk Semua Menu!
              </h2>
              
              {!timing.isActive && (
                <div className={`p-4 rounded-2xl flex items-start gap-3 ${timing.isExpired ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
                  <span className={`material-symbols-outlined mt-0.5 ${timing.isExpired ? 'text-red-500' : 'text-amber-500'}`}>
                    {timing.isExpired ? 'error' : 'info'}
                  </span>
                  <p className={`text-xs md:text-sm font-bold leading-relaxed ${timing.isExpired ? 'text-red-900' : 'text-amber-900'}`}>
                    {timing.message}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className={`font-bold flex items-center gap-2 ${timing.isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                  <span className="material-symbols-outlined text-primary">verified</span>
                  Syarat & Ketentuan:
                </h3>
                <ul className="space-y-3 text-slate-500">
                  <li className="flex gap-3 text-sm">
                    <span className={`font-bold ${timing.isActive ? 'text-primary' : 'text-slate-400'}`}>•</span>
                    Tersedia setiap hari <span className="font-black text-slate-800">{timing.activeDayName}</span>.
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className={`font-bold ${timing.isActive ? 'text-primary' : 'text-slate-400'}`}>•</span>
                    Klaim melalui WhatsApp Admin.
                  </li>
                </ul>
              </div>
            </div>

            {/* Countdown Box */}
            <div className={`rounded-3xl p-8 text-white text-center space-y-4 relative transition-colors ${timing.isActive ? 'bg-slate-900' : 'bg-slate-300'}`}>
              <p className={`font-black text-xs uppercase tracking-widest ${timing.isActive ? 'text-primary' : 'text-white/60'}`}>
                {timing.isActive ? 'Berakhir Dalam:' : 'Status Countdown'}
              </p>
              
              {timing.isActive ? (
                <div className="text-4xl md:text-5xl font-black font-mono tabular-nums">
                  {formatCountdown(timing.secondsUntilEnd)}
                </div>
              ) : (
                <div className="text-xl md:text-2xl font-black uppercase tracking-tight opacity-50">
                  Coming Soon
                </div>
              )}

              <p className="text-[10px] text-white/50 italic mt-4 border-t border-white/10 pt-4">
                {timing.isActive 
                  ? '*Segera klaim sebelum waktu habis!' 
                  : `Cek kembali hari ${timing.activeDayName}.`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-2xl mx-auto">
           <button 
             onClick={() => timing.isActive && router.push('/catalog?filter=promo')}
             disabled={!timing.isActive}
             className={`flex-1 px-8 py-5 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-3 ${
               timing.isActive 
                 ? 'bg-primary text-white shadow-xl shadow-primary/25 hover:scale-[1.02]' 
                 : 'bg-slate-200 text-slate-400 cursor-not-allowed'
             }`}
           >
             {timing.isActive ? 'Klaim Promo Sekarang' : 'Klaim Promo (Tidak Aktif)'}
             <span className="material-symbols-outlined">{timing.isActive ? 'bolt' : 'lock'}</span>
           </button>

           <Link 
              href="/" 
              className="px-8 py-5 bg-white border border-slate-200 text-slate-600 rounded-3xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center"
           >
             Ke Beranda
           </Link>
        </div>
      </main>
    </div>
  );
}
