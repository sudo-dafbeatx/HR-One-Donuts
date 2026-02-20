'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export type AdminNotificationType = 'NEW_USER' | 'NEW_ORDER';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  link?: string;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const supabase = createClient();

  // Meminta Izin Browser Notification saat Admin pertama kali masuk
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Browser ini tidak mendukung Push Notification komputer/smartphone.');
      return;
    }
    const currentPerm = Notification.permission;
    if (currentPerm === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
    } else {
      setPermission(currentPerm);
    }
  }, []);

  // Fungsi Pemicu Notifikasi Bunyi/PopUp HP Desktop
  const sendPushNotification = useCallback((title: string, body: string, urlPath?: string) => {
    if (permission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        body,
        icon: '/images/favicon.ico', // Gambar App
        badge: '/images/favicon.ico',
        tag: 'hr-one-admin-alert'
      });

      if (urlPath) {
        notification.onclick = function() {
          window.focus(); // Fokus tab kembali
          window.location.href = urlPath;
          this.close();
        };
      }
    }
  }, [permission]);

  useEffect(() => {
    // Jalankan permintaan izin pop-up secara diam-diam
    requestPermission();

    // 1. Berlangganan (Subscribe) ke Tabel `profiles` untuk Pendaftaran Baru
    const userSubscription = supabase
      .channel('public:profiles_notify')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          const newProfile = payload.new;
          const notif: AdminNotification = {
            id: `user-${newProfile.id}-${Date.now()}`,
            type: 'NEW_USER',
            title: 'Pengguna Baru Mendaftar!',
            message: `${newProfile.full_name || 'Seseorang'} telah bergabung sebagai ${newProfile.role || 'user'}.`,
            created_at: new Date().toISOString(),
            read: false,
            link: '/admin/users'
          };

          setNotifications(prev => [notif, ...prev]);
          setUnreadCount(prev => prev + 1);
          sendPushNotification(notif.title, notif.message, notif.link);
        }
      )
      .subscribe();

    // 2. Berlangganan (Subscribe) ke Tabel `orders` untuk Transaksi Baru
    const orderSubscription = supabase
      .channel('public:orders_notify')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new;
          const totalRp = Number(newOrder.total_amount).toLocaleString('id-ID');
          const notif: AdminNotification = {
            id: `order-${newOrder.id}-${Date.now()}`,
            type: 'NEW_ORDER',
            title: '🎉 Pesanan Baru Tiba!',
            message: `Order #${newOrder.id.slice(0, 5).toUpperCase()} senilai Rp ${totalRp} telah masuk.`,
            created_at: new Date().toISOString(),
            read: false,
            link: '/admin' // Arahkan ke dashboard untuk melihat chart
          };

          setNotifications(prev => [notif, ...prev]);
          setUnreadCount(prev => prev + 1);
          sendPushNotification(notif.title, notif.message, notif.link);
        }
      )
      .subscribe();

    return () => {
      // Bersihkan koneksi Web Socket kalau admin cabut dari halaman
      userSubscription.unsubscribe();
      orderSubscription.unsubscribe();
    };
  }, [supabase, requestPermission, sendPushNotification]);

  // Handler Lonceng Header diklik -> Tandai Dibaca
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    requestPermission,
    permission
  };
}
