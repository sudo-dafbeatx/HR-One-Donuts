'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useErrorPopup } from '@/context/ErrorPopupContext';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { markOrderCompleted } from '@/app/actions/order-actions';

interface OrderCompleteButtonProps {
  orderId: string;
  className?: string;
  onSuccess?: () => void;
}

export default function OrderCompleteButton({ orderId, className, onSuccess }: OrderCompleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const { showError } = useErrorPopup();
  const router = useRouter();

  const handleComplete = async () => {
    // Confirm with user
    if (!confirm('Apakah pesanan Anda sudah diterima dengan baik? Aksi ini tidak dapat dibatalkan.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await markOrderCompleted(orderId);
      if (res.success) {
        if (onSuccess) onSuccess();
        router.refresh(); // Refresh the page to show review modal immediately (if applicable)
      } else {
        showError('Gagal Menyelesaikan Pesanan', res.error || 'Terjadi kesalahan tidak terduga.');
      }
    } catch (err: unknown) {
      showError('Gagal Menyelesaikan Pesanan', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className={`relative overflow-hidden group flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed ${className || ''}`}
    >
      {loading ? (
        <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      ) : (
        <CheckCircleIcon className="size-5 group-hover:scale-110 transition-transform" />
      )}
      <span className="whitespace-nowrap">Pesanan Selesai</span>
      
      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
    </button>
  );
}
