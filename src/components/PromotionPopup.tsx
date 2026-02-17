'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function PromotionPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Check if popup was already closed in this session
    const isClosed = sessionStorage.getItem('birthday_promo_closed');
    if (isClosed) return;

    // 2. Set timer for 30 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    sessionStorage.setItem('birthday_promo_closed', 'true');
  };

  const handleNavigate = () => {
    setIsVisible(false);
    sessionStorage.setItem('birthday_promo_closed', 'true');
    router.push('/promo/birthday');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="relative max-w-[300px] sm:max-w-sm md:max-w-md w-full bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-1.5 md:p-2 bg-white/80 backdrop-blur rounded-full text-slate-900 hover:bg-white hover:scale-110 transition-all shadow-lg border border-slate-100"
          aria-label="Close popup"
        >
          <XMarkIcon className="size-5 md:size-6" />
        </button>

        {/* Content - Clickable Image */}
        <div 
          onClick={handleNavigate}
          className="relative cursor-pointer group"
        >
          <div className="relative aspect-[2/3]">
            <Image 
              src="/images/Popup1.webp" 
              alt="Promo Spesial Ulang Tahun HR-One Donuts" 
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
            {/* Visual Hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="px-6 py-3 bg-white/90 backdrop-blur shadow-xl rounded-2xl font-black text-primary text-sm opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                Klaim Kado Kamu! ✨
              </div>
            </div>
          </div>
        </div>

        {/* Info Area */}
        <div className="p-5 md:p-8 text-center space-y-3 md:space-y-4">
          <div className="inline-block px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
            Limited Time Offer
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
            Hari Ini Spesial Buat Pelanggan Setia!
          </h3>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Ada kejutan manis menantimu di outlet HR-One. Klik gambar untuk detail kado kamu.
          </p>
          <button 
            onClick={handleNavigate}
            className="w-full py-3 md:py-4 bg-primary text-white text-sm md:text-base font-black rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            Buka Kado Kamu
            <span className="material-symbols-outlined text-lg md:text-xl">redeem</span>
          </button>
        </div>
      </div>
    </div>
  );
}
