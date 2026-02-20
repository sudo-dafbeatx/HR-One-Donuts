'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export default function DelayedCardPopup() {
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

  // Skip showing on admin/login pages
  const hidePaths = ['/onboarding', '/auth', '/login', '/admin'];
  const shouldHide = hidePaths.some(path => pathname?.startsWith(path));

  if (shouldHide || hasClosed || !render) return null;

  return (
    <div 
      className={`popup-overlay ${isVisible ? 'show' : ''}`}
      onClick={(e) => {
        // Close if clicking the dark overlay background
        if (e.target === e.currentTarget) closePopup();
      }}
    >
      <div className="card popup-card">
        <button className="popup-close-btn" onClick={closePopup}>&times;</button>
        <Image 
          src="/Popup.webp" 
          alt="Popup Promotion" 
          fill 
          className="popup-image cursor-pointer" 
          onClick={handleNavigate}
          priority
        />
      </div>
    </div>
  );
}
