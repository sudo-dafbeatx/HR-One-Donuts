'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function DelayedCardPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show popup after 10 seconds
    const timer = setTimeout(() => {
      // Don't show if already closed in this session
      const isClosed = sessionStorage.getItem('delayed_card_closed');
      if (!isClosed) {
        setIsVisible(true);
        document.body.classList.add('popup-open');
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const closePopup = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsVisible(false);
    setHasClosed(true);
    sessionStorage.setItem('delayed_card_closed', 'true');
    document.body.classList.remove('popup-open');
  };

  // Skip showing on admin/login pages
  const hidePaths = ['/onboarding', '/auth', '/login', '/admin'];
  const shouldHide = hidePaths.some(path => pathname?.startsWith(path));

  if (shouldHide || hasClosed) return null;

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
        <Image src="/images/Popup.webp" alt="Popup Promotion" fill className="popup-image" />
      </div>
    </div>
  );
}
