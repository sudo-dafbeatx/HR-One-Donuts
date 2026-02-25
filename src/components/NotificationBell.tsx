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
    // 1. Initial Fetch
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

    // 2. Setup Realtime Subscription
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

  // Handle closing dropdown when clicking outside
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
    
    // Mark as read when opening
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
        className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-all relative group"
        aria-label="View notifications"
      >
        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-4 bg-primary text-white text-[9px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm animate-cart-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-black tracking-tight text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">mark_email_unread</span>
              Notifikasi
            </h3>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto w-full">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center opacity-60">
                 <BellIcon className="size-8 text-slate-300 mb-2" />
                 <p className="text-xs font-bold text-slate-400">Belum ada notifikasi</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <Link 
                    key={notif.id}
                    href={notif.related_record_id ? `/profile/orders/${notif.related_record_id}` : '/profile'}
                    onClick={() => setIsOpen(false)}
                    className={`p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer w-full text-left ${notif.is_read ? 'opacity-70' : ''}`}
                  >
                    <div className="shrink-0 mt-1">
                       <span className={`size-2 rounded-full inline-block ${notif.is_read ? 'bg-transparent' : 'bg-primary animate-pulse'}`}></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                        <span>{notif.type === 'order_update' ? 'Pesanan' : 'Sistem'}</span>
                        <span>{timeAgo(notif.created_at)}</span>
                      </p>
                      <h4 className={`text-sm tracking-tight ${notif.is_read ? 'font-bold text-slate-700' : 'font-black text-slate-800'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-slate-50 bg-slate-50/30">
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
