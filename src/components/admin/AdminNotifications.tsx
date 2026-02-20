'use client';

import { useState } from 'react';
import { BellIcon, EnvelopeOpenIcon, ShoppingBagIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import Link from 'next/link';

export default function AdminNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead, permission, requestPermission } = useAdminNotifications();

  // Membuka menu dan menonaktifkan titik merah (tanda terbaca semua)
  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={togglePanel}
        className="relative p-2 text-slate-800 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors focus:outline-none"
        aria-label="Toggles notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-sm shadow-red-200"></span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 top-[76px] sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-3 w-auto sm:w-96 max-h-[calc(100vh-90px)] sm:max-h-none bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-[100] sm:z-50 flex flex-col overflow-hidden text-left origin-top sm:origin-top-right animate-scale-in">
          {/* Header Panel */}
          <div className="shrink-0 px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-slate-800">Notifikasi Terbaru</h3>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {notifications.length} Total
            </span>
          </div>

          {/* Banner Peringatan Izin Browser */}
          {permission === 'default' && (
            <div className="shrink-0 mx-4 my-2 p-3 bg-blue-50 border border-blue-100 rounded-lg flex flex-col gap-2">
              <p className="text-xs text-blue-800">Izinkan notifikasi desktop/smartphone agar Anda tak tertinggal info order!</p>
              <button 
                onClick={requestPermission}
                className="w-full text-center text-xs font-semibold bg-white text-blue-600 py-1.5 rounded-md shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                Izinkan Sekarang
              </button>
            </div>
          )}
          {permission === 'denied' && (
            <div className="shrink-0 mx-4 my-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-800">
              Browser telah menolak izin Notifikasi Popup. Atur via ikon gembok Site Settings.
            </div>
          )}

          {/* List Pesan */}
          <div className="flex-1 overflow-y-auto max-h-[360px] sm:max-h-[420px] no-scrollbar scroll-smooth">
            {notifications.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-3">
                <EnvelopeOpenIcon className="w-10 h-10 text-slate-200" />
                <p className="text-sm text-slate-500">Belum ada aktivitas baru</p>
              </div>
            ) : (
              notifications.map((notif, idx) => (
                <div 
                  key={notif.id} 
                  className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-none flex gap-3 ${idx < unreadCount ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'NEW_ORDER' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {notif.type === 'NEW_ORDER' ? (
                      <ShoppingBagIcon className="w-4 h-4" />
                    ) : (
                      <UserPlusIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {notif.link ? (
                      <Link href={notif.link} onClick={() => setIsOpen(false)}>
                        <h4 className="text-sm font-semibold text-slate-800 truncate mb-0.5 hover:text-blue-600 transition-colors">
                          {notif.title}
                        </h4>
                      </Link>
                    ) : (
                      <h4 className="text-sm font-semibold text-slate-800 truncate mb-0.5">
                        {notif.title}
                      </h4>
                    )}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1.5 block font-medium">
                      {new Date(notif.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
