'use client';

import { ExclamationTriangleIcon, InformationCircleIcon, BoltSlashIcon } from '@heroicons/react/24/outline';

interface SystemAlertsWidgetProps {
  dbError: boolean;
  hasProducts: boolean;
  isFlashSaleDay: boolean;
  activeEventsCount: number;
}

export default function SystemAlertsWidget({ dbError, hasProducts, isFlashSaleDay, activeEventsCount }: SystemAlertsWidgetProps) {
  const alerts = [];

  if (dbError) {
    alerts.push({
      id: 'db-error',
      type: 'error',
      icon: ExclamationTriangleIcon,
      title: 'Koneksi Database Bermasalah',
      message: 'Gagal terhubung ke Supabase. Pastikan tabel dan kebijakan RLS sudah dikonfigurasi dengan benar.',
      color: 'bg-red-50 text-red-800 border-red-100',
      iconColor: 'text-red-500'
    });
  }

  if (!hasProducts) {
    alerts.push({
      id: 'no-products',
      type: 'warning',
      icon: InformationCircleIcon,
      title: 'Data Produk Kosong',
      message: 'Belum ada produk yang terdaftar. Tambahkan produk agar katalog tampil di halaman utama.',
      color: 'bg-amber-50 text-amber-800 border-amber-100',
      iconColor: 'text-amber-500'
    });
  }

  if (isFlashSaleDay && activeEventsCount === 0) {
    alerts.push({
      id: 'flash-sale-missing',
      type: 'info',
      icon: BoltSlashIcon,
      title: 'Hari Flash Sale: Event Kosong',
      message: 'Hari ini adalah jadwal Flash Sale (Selasa/Jumat), tetapi tidak ada event aktif di sistem.',
      color: 'bg-blue-50 text-blue-800 border-blue-100',
      iconColor: 'text-blue-500'
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => (
        <div key={alert.id} className={`${alert.color} border p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300`}>
          <alert.icon className={`w-5 h-5 shrink-0 mt-0.5 ${alert.iconColor}`} />
          <div className="flex-1">
            <h5 className="font-bold text-sm">{alert.title}</h5>
            <p className="text-xs mt-1 opacity-90 leading-relaxed font-medium">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
