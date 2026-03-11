'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  ChevronLeftIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  StarIcon,
  GiftIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { getUserNotifications, markAsRead } from '@/app/actions/notification-actions';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface UserNotification {
  id: string;
  type: 'login' | 'order' | 'review' | 'event' | 'points';
  title: string;
  content: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getUserNotifications();
      setNotifications(data as UserNotification[]);
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  const handleRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await markAsRead(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'login': return <ShieldCheckIcon className="size-6 text-blue-500" />;
      case 'order': return <ShoppingBagIcon className="size-6 text-emerald-500" />;
      case 'review': return <StarIcon className="size-6 text-amber-500" />;
      case 'points': return <GiftIcon className="size-6 text-primary" />;
      case 'event': return <BellIcon className="size-6 text-indigo-500" />;
      default: return <BellIcon className="size-6 text-slate-400" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'login': return 'bg-blue-50';
      case 'order': return 'bg-emerald-50';
      case 'review': return 'bg-amber-50';
      case 'points': return 'bg-primary/5';
      case 'event': return 'bg-indigo-50';
      default: return 'bg-slate-50';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-6 sticky top-0 z-50 border-b border-slate-100 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <ChevronLeftIcon className="size-6 text-slate-600" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Notifikasi</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat Notifikasi...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <div className="size-20 bg-white rounded-3xl shadow-sm flex items-center justify-center border border-slate-100">
              <BellIcon className="size-10 text-slate-200" />
            </div>
            <div>
              <p className="font-black text-lg text-slate-800">Belum Ada Notifikasi</p>
              <p className="text-sm text-slate-500 font-medium">Aktifitas terbaru kamu akan muncul di sini.</p>
            </div>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => handleRead(notif.id)}
              className={`bg-white rounded-4xl p-5 shadow-sm border transition-all active:scale-[0.98] cursor-pointer ${notif.is_read ? 'border-slate-100 grayscale-[0.3] opacity-80' : 'border-primary/10 shadow-md ring-1 ring-primary/5'}`}
            >
              <div className="flex gap-4">
                <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${getBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-black text-sm md:text-base leading-tight ${notif.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="size-2 bg-primary rounded-full shrink-0 mt-1.5 ring-4 ring-primary/10"></span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed mb-3">
                    {notif.content}
                  </p>
                  
                  {/* Detailed Data if 'login' */}
                  {notif.type === 'login' && notif.data?.ip_address && (
                    <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100 flex items-center gap-3">
                      <MapPinIcon className="size-4 text-slate-400" />
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                        IP: {notif.data.ip_address as string}
                        {notif.data.location && <span className="ml-2">• {notif.data.location as string}</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                    </span>
                    {notif.is_read && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                        <CheckCircleIcon className="size-3" />
                        Dibaca
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
