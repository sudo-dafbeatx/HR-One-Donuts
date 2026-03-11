'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BellIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_record_id: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    fetchNotifications();

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }

      const subscription = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(newNotif.title, {
                body: newNotif.message,
                icon: '/images/logo-hr-one.webp'
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    };

    const cleanup = setupRealtime();

    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = async () => {
    setIsOpen(!isOpen);
    
    if (!isOpen && unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

      const { data: { user } } = await supabase.auth.getUser();
      if (user && unreadIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', unreadIds);
      }
    }
  };

  const timeAgo = (dateString: string) => {
    const min = Math.round((new Date().getTime() - new Date(dateString).getTime()) / 60000);
    if (min < 60) return `${min}m yll`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}j yll`;
    return `${Math.floor(hrs / 24)}h yll`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex p-2.5 rounded-full hover:bg-slate-50 text-slate-700 transition-all relative group items-center justify-center min-h-[44px] min-w-[44px]"
        aria-label="View notifications"
      >
        <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 size-3.5 bg-primary text-white text-[8px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm animate-cart-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 top-[72px] sm:absolute sm:inset-auto sm:top-full sm:-right-8 sm:mt-3 w-auto sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-100 origin-top">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">mark_email_unread</span>
              Notifikasi
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase">
                {unreadCount} Baru
              </span>
            )}
          </div>
          
          <div className="max-h-[70vh] sm:max-h-[450px] overflow-y-auto w-full no-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center">
                 <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                   <BellIcon className="size-8 text-slate-200" />
                 </div>
                 <p className="text-xs font-bold text-slate-400">Belum ada kabar terbaru untukmu</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <Link 
                    key={notif.id}
                    href={notif.related_record_id ? `/profile/orders/${notif.related_record_id}` : '/profile'}
                    onClick={() => setIsOpen(false)}
                    className="p-5 flex gap-4 hover:bg-slate-50/80 transition-all active:bg-slate-100 group"
                  >
                    <div className="shrink-0 mt-1">
                       <span className={`size-2.5 rounded-full inline-block ${notif.is_read ? 'bg-slate-200' : 'bg-primary ring-4 ring-primary/10 animate-pulse'}`}></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {notif.type === 'order_update' ? 'Pesanan' : 'Sistem'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300">
                          {timeAgo(notif.created_at)}
                        </span>
                      </div>
                      <h4 className={`text-sm tracking-tight leading-tight mb-1 ${notif.is_read ? 'font-bold text-slate-600' : 'font-black text-slate-900'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 bg-slate-50/50">
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 bg-white border border-slate-200 text-[11px] font-black text-slate-600 hover:text-slate-900 rounded-2xl shadow-sm transition-all uppercase tracking-widest active:scale-[0.98]"
            >
              Tutup Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
