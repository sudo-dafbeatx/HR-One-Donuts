'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { SiteSettings } from '@/types/cms';

export default function DelayedCardPopup({ siteSettings }: { siteSettings?: SiteSettings }) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);
  const [render, setRender] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Mark first visit if it doesn't exist.
    if (!localStorage.getItem('first_visit_done')) {
      localStorage.setItem('first_visit_done', 'true');
      return; // Never show on very first visit
    }

    // 2. Logic to SHOW popup on return load
    // If 'left_at' exists, it means the user closed the tab or backgrounded the app previously
    // and is now returning.
    const leftAt = localStorage.getItem('left_at');
    const isClosedInSession = sessionStorage.getItem('delayed_card_closed');

    if (leftAt && !isClosedInSession) {
      // Clear the 'left_at' flag so it doesn't trigger repeatedly on simple reloads
      localStorage.removeItem('left_at'); 
      
      // Trigger the popup immediately
      setTimeout(() => setRender(true), 0);
      setTimeout(() => {
        setIsVisible(true);
        document.body.classList.add('popup-open');
      }, 50);
    }

    // 3. Logic to SET 'left_at' when user leaves
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.setItem('left_at', Date.now().toString());
      }
    };

    const handlePageHide = () => {
      localStorage.setItem('left_at', Date.now().toString());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  const closePopup = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsVisible(false);
    setHasClosed(true);
    sessionStorage.setItem('delayed_card_closed', 'true');
    document.body.classList.remove('popup-open');
    setTimeout(() => setRender(false), 400);
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setHasClosed(true);
    sessionStorage.setItem('delayed_card_closed', 'true');
    document.body.classList.remove('popup-open');
    setTimeout(() => {
      setRender(false);
      router.push('/promo/birthday');
    }, 400);
  };

  // Skip showing on admin/login pages or if disabled
  const hidePaths = ['/onboarding', '/auth', '/login', '/admin'];
  const shouldHide = hidePaths.some(path => pathname?.startsWith(path)) || siteSettings?.is_popup_enabled === false;

  if (shouldHide || hasClosed || !render) return null;

  return (
    <div 
      className={`fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={(e) => {
        // Close if clicking the dark overlay background
        if (e.target === e.currentTarget) closePopup();
      }}
    >
      <div 
        className={`relative max-w-[300px] sm:max-w-sm md:max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <button 
          className="absolute top-2 right-2 md:top-4 md:right-4 z-20 size-8 flex items-center justify-center bg-white/80 backdrop-blur rounded-full text-slate-900 hover:bg-white hover:scale-110 transition-all shadow-lg border border-slate-100" 
          onClick={closePopup}
          aria-label="Tutup promo"
        >
          &times;
        </button>
        <Image 
          src="/Popup.webp" 
          alt="Popup Promotion" 
          width={400}
          height={535}
          className="w-full h-auto object-cover cursor-pointer" 
          onClick={handleNavigate}
          priority
        />
      </div>
    </div>
  );
}
