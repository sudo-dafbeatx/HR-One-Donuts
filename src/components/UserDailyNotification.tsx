"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NotifData {
  title: string;
  message: string;
  type: 'BIRTHDAY' | 'FLASHSALE';
  link: string;
}

export default function UserDailyNotification() {
  const supabase = createClient();
  const router = useRouter();
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [modalData, setModalData] = useState<NotifData | null>(null);

  // Function to show the native notification
  const showNativeNotification = useCallback((data: NotifData) => {
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
      if (!user) return; 

      const today = new Date();
      const todayString = today.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const currentYear = today.getFullYear().toString();
      
      const dailyKey = `last_user_notif_date_${user.id}`;
      const birthdayYearKey = `last_birthday_notif_year_${user.id}`;
      
      const lastDailyDate = localStorage.getItem(dailyKey);
      const lastBirthdayYear = localStorage.getItem(birthdayYearKey);

      // 3. Fetch user profile for birth_date
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('birth_date, full_name')
        .eq('id', user.id)
        .maybeSingle();

      // 4. Check Birthday Exception first (Highest Priority)
      let isBirthdayToday = false;
      if (profile?.birth_date) {
        const birthDate = new Date(profile.birth_date);
        // Use UTC to avoid timezone shift errors
        if (
          birthDate.getUTCMonth() === today.getMonth() &&
          birthDate.getUTCDate() === today.getDate()
        ) {
          isBirthdayToday = true;
        }
      }

      // 5. Logic: Should we show ANYTHING today?
      const notificationsDisabled = localStorage.getItem('notifications_disabled') === 'true';
      if (notificationsDisabled) return;

      // 6. Birthday Trigger
      if (isBirthdayToday && lastBirthdayYear !== currentYear) {
        const firstName = profile?.full_name?.split(' ')[0] || 'Kak';
        const birthdayData: NotifData = {
          type: 'BIRTHDAY',
          title: `Selamat Ulang Tahun, ${firstName}! 🎂`,
          message: 'Semoga hari mu penuh kebahagiaan! Ada kado spesial untukmu hari ini. Cek sekarang!',
          link: '/promo/birthday',
        };
        
        // Show Modal + Native
        setModalData(birthdayData);
        setShowBirthdayModal(true);
        showNativeNotification(birthdayData);
        
        // Mark as shown for THIS YEAR
        localStorage.setItem(birthdayYearKey, currentYear);
        // Also skip daily marketing today if it's a birthday
        localStorage.setItem(dailyKey, todayString);
        return;
      }

      // 7. Regular Daily Marketing (Skip if already shown today)
      if (lastDailyDate === todayString) return;

      let marketingNotif: NotifData | null = null;
      const dayOfWeek = today.getDay();
      
      if (dayOfWeek === 2) { // Tuesday
        marketingNotif = {
          type: 'FLASHSALE',
          title: '🍩 Event SMS (Selasa Mega Sale)!',
          message: 'Promo spesial diskon besar hari ini sedang berlangsung. Jangan sampai kehabisan!',
          link: '/catalog?filter=promo',
        };
      } else if (dayOfWeek === 5) { // Friday
        marketingNotif = {
          type: 'FLASHSALE',
          title: '✨ Jum\'at Berkah!',
          message: 'Dapatkan promo spesial Jum\'at Berkah hari ini. Berbagi kebaikan dengan donat manis.',
          link: '/catalog?filter=promo',
        };
      } else {
        // Fallback for new products
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        try {
          const { data: newProduct } = await supabase
            .from('products')
            .select('name')
            .eq('is_active', true)
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (newProduct) {
            marketingNotif = {
              type: 'FLASHSALE',
              title: '🆕 Rasa Baru Telah Hadir!',
              message: `Cobain donat varian baru: ${newProduct.name}. Pesan sekarang sebelum kehabisan!`,
              link: '/catalog',
            };
          }
        } catch {}
      }

      if (marketingNotif) {
        showNativeNotification(marketingNotif);
        localStorage.setItem(dailyKey, todayString);
      }
    };

    const timeoutId = setTimeout(checkDailyNotifications, 3000);
    return () => clearTimeout(timeoutId);
  }, [supabase, showNativeNotification]);

  if (!showBirthdayModal || !modalData) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="relative max-w-[320px] sm:max-w-sm w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button 
          onClick={() => setShowBirthdayModal(false)}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur rounded-full text-slate-900 hover:bg-white hover:scale-110 transition-all shadow-lg border border-slate-100"
        >
          <XMarkIcon className="size-5" />
        </button>

        <div 
          onClick={() => {
            setShowBirthdayModal(false);
            router.push(modalData.link);
          }}
          className="relative cursor-pointer group"
        >
          <div className="relative aspect-4/5 sm:aspect-square">
            <Image 
              src="/images/Popup1.webp" 
              alt="Birthday Special" 
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                {modalData.title}
              </h2>
              <p className="text-white/90 text-sm font-bold mt-2 drop-shadow-sm">
                Ada kado spesial untukmu hari ini! ✨
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 text-center space-y-4">
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {modalData.message}
          </p>
          <button 
            onClick={() => {
              setShowBirthdayModal(false);
              router.push(modalData.link);
            }}
            className="w-full py-4 bg-primary text-white text-base font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
          >
            Buka Kado Kamu <span className="material-symbols-outlined">redeem</span>
          </button>
        </div>
      </div>
    </div>
  );
}
