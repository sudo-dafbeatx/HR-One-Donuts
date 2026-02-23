'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NotifData {
  title: string;
  message: string;
  type: 'BIRTHDAY' | 'FLASHSALE';
  link: string;
}

export default function UserDailyNotification() {
  const supabase = createClient();

  // Function to show the native notification
  const showNotification = useCallback((data: NotifData) => {
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

      // 4. Check Global Push Preference First
      const notificationsDisabled = localStorage.getItem('notifications_disabled') === 'true';
      if (notificationsDisabled) return;

      const today = new Date();
      let notifToTrigger: NotifData | null = null;

      // 5. Check Birthday Priority
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

      // 6. Check Custom Events if no Birthday
      if (!notifToTrigger) {
        const dayOfWeek = today.getDay();
        
        // Tuesday (Selasa Mega Sale)
        if (dayOfWeek === 2) {
           notifToTrigger = {
             type: 'FLASHSALE',
             title: '🍩 Event SMS (Selasa Mega Sale)!',
             message: 'Promo spesial diskon besar hari ini sedang berlangsung. Jangan sampai kehabisan!',
             link: '/catalog?filter=promo',
           };
        } 
        // Friday (Jum'at Berkah)
        else if (dayOfWeek === 5) {
           notifToTrigger = {
             type: 'FLASHSALE',
             title: '✨ Jum\'at Berkah!',
             message: 'Dapatkan promo spesial Jum\'at Berkah hari ini. Berbagi kebaikan dengan donat manis.',
             link: '/catalog?filter=promo',
           };
        } 
        // Any other day: Check for New Donut
        else {
           // Fetch the newest product created within the last 7 days
           const sevenDaysAgo = new Date();
           sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
           
           const { data: newProduct } = await supabase
             .from('products')
             .select('name, created_at')
             .eq('status', 'active')
             .gte('created_at', sevenDaysAgo.toISOString())
             .order('created_at', { ascending: false })
             .limit(1)
             .maybeSingle();
             
           if (newProduct) {
             notifToTrigger = {
               type: 'FLASHSALE', // Reuse type for icon rendering context
               title: '🆕 Rasa Baru Telah Hadir!',
               message: `Cobain donat varian baru: ${newProduct.name}. Pesan sekarang sebelum kehabisan!`,
               link: '/catalog',
             };
           }
        }
      }

      // 7. Trigger Notification if any
      if (notifToTrigger) {
        let hasPermission = false;
        
        if ('Notification' in window) {
          if (Notification.permission === 'granted') {
            hasPermission = true;
          } else if (Notification.permission === 'default') {
            try {
              const perm = await Notification.requestPermission();
              hasPermission = perm === 'granted';
            } catch {
              // ignore
            }
          }
        }

        if (hasPermission) {
          showNotification(notifToTrigger);
          // Only mark as notified if we successfully showed the native notification
          localStorage.setItem(storageKey, todayString);
        }
      }
    };

    // Delay checking slightly to allow initial page render to settle
    const timeoutId = setTimeout(checkDailyNotifications, 2500);
    return () => clearTimeout(timeoutId);
  }, [supabase, showNotification]);

  return null; // UI is completely Native OS-based now.
}
