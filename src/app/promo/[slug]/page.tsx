'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PromoEvent } from '@/types/cms';
import { getEventTiming, formatCountdown } from '@/lib/date-utils';
import Link from 'next/link';
import Image from 'next/image';
import Confetti from "@/components/animations/Confetti";
import { useCart } from '@/context/CartContext';
import { showCartToast } from '@/components/cart/CartToast';
import ShareButton from '@/components/ui/ShareButton';

export default function PromoDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { claimPromo } = useCart();
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
    <div className={`min-h-screen relative overflow-hidden bg-slate-50`}>
      {timing.isActive && <Confetti />}

      {/* Dot Pattern Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "28px 28px" }} 
      />

      <main className="relative z-10 max-w-lg md:max-w-5xl mx-auto px-4 py-6 md:py-12 min-h-screen flex flex-col">
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
           <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold transition-all bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 hover:shadow-md">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Beranda
           </Link>
           {event && (
             <ShareButton
               title={event.headline}
               text={`${event.headline} — Diskon ${event.discount_percent}% di HR-One Donuts! 🍩`}
               variant="card"
             />
           )}
        </div>

        {/* Mobile/All-Device Friendly Layout */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10 pb-28 lg:pb-0">
          
          {/* Left/Top Content: Image & Headline */}
          <div className="space-y-6 flex-1 w-full relative z-10">
            {/* Banner Image as a Card */}
            {hasImage && (
              <div className="w-full aspect-4/3 sm:aspect-video lg:aspect-3/2 relative rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                <Image 
                  src={event.banner_image_url!} 
                  alt={event.headline}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div className="space-y-3 px-1 sm:px-0 text-center lg:text-left">
              {timing.isActive ? (
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 border border-green-200 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                   <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                   Waktu Terbatas! 🔥
                 </div>
              ) : (
                 <div className="inline-flex px-4 py-1.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-300">
                   Promo Berakhir
                 </div>
              )}

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
                {event.headline}
              </h1>
            </div>

            {/* Copywriting Card */}
            <div className="p-6 bg-white border border-primary/10 rounded-3xl shadow-xl shadow-primary/5 relative overflow-hidden group text-center lg:text-left">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 blur-2xl rounded-full" />
              
              <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-3 leading-tight relative z-10">
                Diskon Spesial <span className="text-primary">{event.discount_percent}%</span> Khusus Pembelian Box!
              </h2>
              <p className="text-slate-500 font-medium text-sm leading-relaxed relative z-10">
                Pesta donat jadi lebih hemat! Nikmati potongan spesial ini untuk setiap pembelian donat dalam kemasan Box. Bawa pulang kebahagiaan untuk orang tersayang hari ini juga.
              </p>
              {event.description && (
                <p className="text-slate-400 text-xs mt-4 pt-4 border-t border-slate-100 italic relative z-10">
                  {event.description}
                </p>
              )}
            </div>
          </div>

          {/* Right/Bottom Content: Countdown & Terms */}
          <div className="space-y-6 flex-[0.8] w-full lg:max-w-md relative z-10">
            
            {/* Countdown Box */}
            <div className={`rounded-3xl p-6 md:p-8 text-center relative overflow-hidden border transition-colors shadow-lg ${
              timing.isActive ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}>
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <span className="material-symbols-outlined text-[100px] text-white">schedule</span>
              </div>

              <div className="relative z-10 space-y-3">
                <p className={`font-black text-[10px] md:text-xs uppercase tracking-widest ${timing.isActive ? 'text-primary' : 'text-slate-400'}`}>
                  {timing.isActive ? 'Berakhir Dalam:' : 'Jadwal Promo:'}
                </p>
                
                {timing.isActive ? (
                  <div className="text-3xl sm:text-4xl lg:text-4xl font-black font-mono tabular-nums text-white">
                    {formatCountdown(timing.secondsUntilEnd)}
                  </div>
                ) : (
                  <div className="text-xl md:text-2xl font-black text-slate-500 pb-1">
                    Setiap Hari {timing.activeDayName}
                  </div>
                )}

                <p className={`text-[9px] md:text-[10px] font-medium uppercase tracking-widest mt-3 pt-3 border-t ${
                  timing.isActive ? 'text-white/50 border-white/10' : 'text-slate-400 border-slate-200'
                }`}>
                  {timing.isActive 
                    ? '* Jangan sampai kelewatan!' 
                    : `Promo aktif pk ${event.start_time} - ${event.end_time}`}
                </p>
              </div>
            </div>

            {/* Syarat & Ketentuan */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-left">
              <h3 className="font-bold flex items-center gap-2 text-slate-800 mb-4 text-sm md:text-base">
                <span className="material-symbols-outlined text-primary text-xl">verified</span>
                Syarat & Ketentuan
              </h3>
              <ul className="space-y-2.5 text-xs md:text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Otomatis aktif setiap <span className="font-black text-slate-800">{timing.activeDayName}</span>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Eksklusif untuk pembelian kemasan <strong>Box/Dus</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-400 font-bold">×</span>
                  <span className="text-slate-400 line-through decoration-slate-300">Pesanan satuan (eceran)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Diskon otomatis dikalkulasi saat Checkout.</span>
                </li>
              </ul>
            </div>
            
            {!timing.isActive && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5 text-amber-500 text-sm">info</span>
                <p className="text-xs font-medium text-amber-700 leading-relaxed">
                  {timing.message}
                </p>
              </div>
            )}

            {/* Sticky Action Button for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 lg:relative lg:bg-transparent lg:backdrop-blur-none lg:border-none lg:p-0 z-50">
               <button 
                 onClick={() => {
                   if (timing.isActive) {
                     claimPromo(event.discount_percent);
                     showCartToast(`🎁 Promo Berhasil Diklaim! Diskon ${event.discount_percent}% otomatis aktif.`);
                     router.push('/catalog?filter=promo');
                   }
                 }}
                 disabled={!timing.isActive}
                 className={`w-full px-6 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg transition-all flex items-center justify-center gap-3 ${
                   timing.isActive 
                     ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]' 
                     : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                 }`}
               >
                 {timing.isActive ? 'Klaim Promo Sekarang' : 'Promo Tidak Aktif'}
                 <span className="material-symbols-outlined">{timing.isActive ? 'bolt' : 'lock'}</span>
               </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
