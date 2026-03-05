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
  const hasImage = !!event.banner_image_url;

  return (
    <div className={`min-h-screen relative overflow-hidden ${timing.isActive ? 'bg-slate-900' : 'bg-slate-100'}`}>
      {timing.isActive && <Confetti />}

      {/* Hero Background */}
      {hasImage ? (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={event.banner_image_url} 
            alt={event.headline} 
            className="w-full h-full object-cover sm:object-center brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-slate-900 to-slate-900" />
      )}

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-16 text-center lg:text-left min-h-screen flex flex-col justify-center">
        
        {/* Navigation */}
        <div className="flex justify-start mb-8 lg:absolute lg:top-8 lg:left-4">
           <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white font-bold backdrop-blur-md bg-white/10 px-5 py-2.5 rounded-full transition-all border border-white/10 hover:bg-white/20">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Beranda
           </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center mt-12 lg:mt-0">
          {/* Left Column: Copywriting & Actions */}
          <div className="space-y-8">
            <div className="space-y-4">
              {timing.isActive ? (
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse">
                   <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                   Waktu Terbatas! 🔥
                 </div>
              ) : (
                 <div className="inline-flex px-4 py-1.5 bg-white/10 text-white/60 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">
                   Promo Berakhir
                 </div>
              )}

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg leading-[1.1]">
                {event.headline}
              </h1>
              
              <div className="p-5 md:p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors" />
                
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                  Diskon Spesial <span className="text-primary">{event.discount_percent}%</span> Khusus Pembelian Box!
                </h2>
                <p className="text-white/70 font-medium text-sm md:text-base leading-relaxed">
                  Pesta donat jadi lebih hemat! Nikmati potongan spesial ini untuk setiap pembelian donat dalam kemasan Box. Bawa pulang kebahagiaan untuk orang tersayang hari ini juga.
                </p>
                {event.description && (
                  <p className="text-white/50 text-xs mt-4 mt-pt-4 border-t border-white/5 italic">
                    {event.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
               <button 
                 onClick={() => timing.isActive && router.push('/catalog?filter=promo')}
                 disabled={!timing.isActive}
                 className={`flex-1 sm:flex-none px-10 py-4 md:py-5 rounded-full font-black text-lg transition-all flex items-center justify-center gap-3 ${
                   timing.isActive 
                     ? 'bg-primary text-white shadow-[0_8px_30px_rgba(var(--color-primary),0.4)] hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(var(--color-primary),0.6)]' 
                     : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5'
                 }`}
               >
                 {timing.isActive ? 'Klaim Promo Sekarang' : 'Klaim Promo (Tidak Aktif)'}
                 <span className="material-symbols-outlined">{timing.isActive ? 'bolt' : 'lock'}</span>
               </button>
            </div>
          </div>

          {/* Right Column: Countdown & Terms */}
          <div className="space-y-6 lg:pl-8">
            {/* Glass Countdown Box */}
            <div className={`rounded-[2.5rem] p-8 md:p-10 text-center relative overflow-hidden backdrop-blur-2xl border transition-colors ${
              timing.isActive ? 'bg-white/10 border-white/20 shadow-2xl shadow-primary/10' : 'bg-slate-800/80 border-slate-700/50'
            }`}>
              <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                <span className="material-symbols-outlined text-[120px] text-white">schedule</span>
              </div>

              <div className="relative z-10 space-y-4">
                <p className={`font-black text-xs uppercase tracking-widest ${timing.isActive ? 'text-primary' : 'text-slate-500'}`}>
                  {timing.isActive ? 'Berakhir Dalam:' : 'Jadwal Promo:'}
                </p>
                
                {timing.isActive ? (
                  <div className="text-4xl md:text-6xl font-black font-mono tabular-nums text-white drop-shadow-md">
                    {formatCountdown(timing.secondsUntilEnd)}
                  </div>
                ) : (
                  <div className="text-2xl md:text-3xl font-black text-white/50 drop-shadow-md pb-2">
                    Setiap Hari {timing.activeDayName}
                  </div>
                )}

                <p className={`text-[10px] md:text-xs font-medium uppercase tracking-widest mt-4 pt-4 border-t ${
                  timing.isActive ? 'text-white/60 border-white/10' : 'text-slate-500 border-slate-700'
                }`}>
                  {timing.isActive 
                    ? '* Jangan sampai kelewatan!' 
                    : `Promo ini hanya aktif pada jam ${event.start_time} - ${event.end_time}`}
                </p>
              </div>
            </div>

            {/* Syarat & Ketentuan */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/5 text-left">
              <h3 className="font-bold flex items-center gap-2 text-white mb-4">
                <span className="material-symbols-outlined text-primary">verified</span>
                Syarat & Ketentuan:
              </h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Tersedia secara otomatis setiap hari <span className="font-black text-white">{timing.activeDayName}</span>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Promo eksklusif hanya berlaku untuk pembelian kemasan <strong>Box / Dus</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-400 font-bold">×</span>
                  <span className="text-white/60">Tidak berlaku untuk pesanan satuan (eceran).</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Diskon otomatis dikalkulasi di keranjang saat Checkout.</span>
                </li>
              </ul>
            </div>
            
            {!timing.isActive && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3 backdrop-blur-md">
                <span className="material-symbols-outlined mt-0.5 text-amber-500 text-sm">info</span>
                <p className="text-xs md:text-sm font-medium text-amber-200/90 leading-relaxed">
                  {timing.message}
                </p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
