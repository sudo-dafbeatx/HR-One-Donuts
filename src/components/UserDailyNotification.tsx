'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { GiftIcon, BoltIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface NotifData {
  title: string;
  message: string;
  type: 'BIRTHDAY' | 'FLASHSALE';
  link: string;
}

export default function UserDailyNotification() {
  const [notification, setNotification] = useState<NotifData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const supabase = createClient();

  // Function to show the notification both in-app and native (if allowed)
  const showNotification = useCallback((data: NotifData) => {
    setNotification(data);
    setIsVisible(true);

    // Try native notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const nativeNotif = new Notification(data.title, {
          body: data.message,
          icon: '/images/favicon.ico',
          badge: '/images/favicon.ico',
          tag: `user-daily-${data.type}`,
        });
        nativeNotif.onclick = function() {
          window.focus();
          window.location.href = data.link;
          this.close();
        };
      } catch (e) {
        console.error('Failed to show native notification', e);
      }
    }
  }, []);

  useEffect(() => {
    const checkDailyNotifications = async () => {
      // 1. Check Auth 
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Only for logged-in users

      // 2. Check LocalStorage to ensure it only runs once per day
      const todayString = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const storageKey = `last_user_notif_date_${user.id}`;
      const lastNotifDate = localStorage.getItem(storageKey);

      if (lastNotifDate === todayString) {
        return; // Already notified today
      }

      // 3. Fetch user profile for birth_date
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('birth_date, full_name')
        .eq('id', user.id)
        .maybeSingle();

      const today = new Date();
      let notifToTrigger: NotifData | null = null;

      // 4. Check Birthday Priority
      if (profile?.birth_date) {
        const birthDate = new Date(profile.birth_date);
        // Compare Month and Date (ignoring year)
        if (
          birthDate.getUTCMonth() === today.getMonth() &&
          birthDate.getUTCDate() === today.getDate()
        ) {
          const firstName = profile.full_name?.split(' ')[0] || 'Kak';
          notifToTrigger = {
            type: 'BIRTHDAY',
            title: `Selamat Ulang Tahun, ${firstName}! 🎂`,
            message: 'Semoga hari mu penuh kebahagiaan! Ada kado spesial untukmu hari ini. Cek sekarang!',
            link: '/promo/birthday',
          };
        }
      }

      // 5. Check Flash Sale (Tuesday=2, Friday=5) if no Birthday notif
      if (!notifToTrigger) {
        const dayOfWeek = today.getDay();
        if (dayOfWeek === 2 || dayOfWeek === 5) {
          notifToTrigger = {
            type: 'FLASHSALE',
            title: '⚡ Waktunya Flash Sale!',
            message: 'Promo spesial diskon besar hari ini sedang berlangsung. Jangan sampai kehabisan!',
            link: '/catalog?filter=promo',
          };
        }
      }

      // 6. Trigger Notification if any
      if (notifToTrigger) {
        // Request permission if default to support future native pushes
        if ('Notification' in window && Notification.permission === 'default') {
          try {
            await Notification.requestPermission();
          } catch {
            // ignore
          }
        }
        
        showNotification(notifToTrigger);
        // Mark as notified today
        localStorage.setItem(storageKey, todayString);
        
        // Auto-hide in-app toast after 8 seconds
        setTimeout(() => setIsVisible(false), 8000);
      }
    };

    // Delay checking slightly to allow initial page render to settle
    const timeoutId = setTimeout(checkDailyNotifications, 2500);
    return () => clearTimeout(timeoutId);
  }, [supabase, showNotification]);

  if (!isVisible || !notification) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none animate-slide-in-bottom">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-full max-w-sm pointer-events-auto flex items-start gap-4 transition-all duration-300 transform">
        <div className={`mt-1 shrink-0 p-2.5 rounded-full ${notification.type === 'BIRTHDAY' ? 'bg-rose-100 text-rose-500' : 'bg-primary/10 text-primary'}`}>
          {notification.type === 'BIRTHDAY' ? (
            <GiftIcon className="size-6" />
          ) : (
            <BoltIcon className="size-6 animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <Link href={notification.link} onClick={() => setIsVisible(false)} className="block group">
            <h4 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
              {notification.title}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {notification.message}
            </p>
          </Link>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="shrink-0 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Tutup notifikasi"
        >
          <XMarkIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
