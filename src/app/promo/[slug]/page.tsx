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
        .from('events')
        .select('*')
        .eq('event_type', slug)
        .eq('is_active', true)
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">event_busy</span>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Event Tidak Ditemukan</h1>
        <p className="text-slate-500 mb-8">Maaf, event promo yang kamu cari tidak tersedia atau sudah berakhir.</p>
        <Link href="/" className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const timing = event.active_weekday 
    ? getEventTiming(event.active_weekday, event.start_time || '00:00', event.end_time || '23:59', event.title)
    : { 
        isActive: true, 
        message: '', 
        secondsUntilEnd: 0, 
        secondsUntilNext: 0, 
        activeDayName: 'Setiap Hari',
        nextOccurrence: new Date(),
      };

  return (
    <div className={`min-h-screen ${timing.isActive ? 'bg-primary/5' : 'bg-slate-50/50'}`}>
      {timing.isActive && <Confetti />}
      
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-16 text-center">
        {/* Navigation */}
        <div className="flex justify-start mb-8">
           <Link href="/" className="flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              Kembali
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
            <div className="inline-block px-4 py-1 bg-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              Event Tidak Aktif
            </div>
          )}

          <h1 className={`text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-sm ${timing.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
            {event.title} {timing.isActive && <span className="inline-block animate-bounce">🎁</span>}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            {event.description}
          </p>
        </div>

        {/* Promo Card */}
        <div className={`bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border relative overflow-hidden mb-12 ${timing.isActive ? 'shadow-primary/10 border-primary/10' : 'shadow-slate-200 border-slate-100 grayscale-[0.5]'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <span className="material-symbols-outlined text-[120px] text-primary">schedule</span>
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div className="text-left space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                Penawaran {event.event_type === 'seasonal' ? 'Spesial' : 'Mingguan'}
              </div>
              <h2 className={`text-3xl font-black leading-tight ${timing.isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                Diskon <span className="text-primary">{event.discount_percent}%</span> Untuk Semua Menu!
              </h2>
              
              {!timing.isActive && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>
                  <p className="text-xs md:text-sm font-bold text-amber-900 leading-relaxed">
                    {timing.message}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className={`font-bold flex items-center gap-2 ${timing.isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                  <span className="material-symbols-outlined text-primary">verified</span>
                  Status Event:
                </h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex gap-3 text-sm">
                    <span className={`font-bold ${timing.isActive ? 'text-primary' : 'text-slate-400'}`}>•</span>
                    Hanya tersedia setiap hari <span className="font-black text-slate-800">{timing.activeDayName}</span>.
                  </li>
                  <li className="flex gap-3 text-sm">
                    <span className={`font-bold ${timing.isActive ? 'text-primary' : 'text-slate-400'}`}>•</span>
                    Berlaku di seluruh outlet HR-One Donuts.
                  </li>
                </ul>
              </div>
            </div>

            {/* Countdown Box */}
            <div className={`rounded-3xl p-8 text-white text-center space-y-4 relative ${timing.isActive ? 'bg-slate-900' : 'bg-slate-400'}`}>
              <p className="text-primary font-black text-xs uppercase tracking-widest">
                {timing.isActive ? 'Sisa Waktu Klaim:' : 'Event Dimulai Dalam:'}
              </p>
              
              <div className="text-4xl md:text-5xl font-black font-mono tabular-nums">
                {formatCountdown(timing.isActive ? timing.secondsUntilEnd : timing.secondsUntilNext)}
              </div>

              <p className="text-[10px] text-white/50 italic mt-4 border-t border-white/10 pt-4">
                {timing.isActive 
                  ? '*Segera klaim sebelum waktu habis!' 
                  : `*Nantikan ${event.title} hari ${timing.activeDayName} depan.`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-2xl mx-auto">
           {timing.isActive ? (
              <button 
                onClick={() => router.push('/catalog?filter=promo')}
                className="flex-1 bg-primary text-white px-8 py-5 rounded-3xl shadow-xl shadow-primary/25 font-black text-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              >
                Klaim Promo Sekarang
                <span className="material-symbols-outlined">bolt</span>
              </button>
           ) : (
              <div className="flex-1 bg-slate-200 text-slate-400 px-8 py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 cursor-not-allowed">
                Klaim Promo (Hanya Hari {timing.activeDayName})
                <span className="material-symbols-outlined">lock</span>
              </div>
           )}

           <Link 
              href="/" 
              className="px-8 py-5 bg-white border border-slate-200 text-slate-600 rounded-3xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center"
           >
             Kembali ke Beranda
           </Link>
        </div>
      </main>
    </div>
  );
}
