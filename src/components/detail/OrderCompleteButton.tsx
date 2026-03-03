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
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showError } = useErrorPopup();
  const router = useRouter();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await markOrderCompleted(orderId);
      if (res.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
        // Wait 3 seconds then close and refresh
        setTimeout(() => {
          setShowConfirm(false);
          setIsSuccess(false);
          router.refresh(); 
        }, 3000);
      } else {
        showError('Gagal Menyelesaikan Pesanan', res.error || 'Terjadi kesalahan tidak terduga.');
        setShowConfirm(false);
      }
    } catch (err: unknown) {
      showError('Gagal Menyelesaikan Pesanan', err instanceof Error ? err.message : 'Unknown error');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className={`relative overflow-hidden group flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed ${className || ''}`}
      >
        <CheckCircleIcon className="size-5 group-hover:scale-110 transition-transform" />
        <span className="whitespace-nowrap">Pesanan Selesai</span>
        
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !loading && !isSuccess && setShowConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in duration-300">
            {isSuccess ? (
              <div className="text-center py-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-6 animate-bounce">
                  <CheckCircleIcon className="h-12 w-12 text-emerald-600" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">Terima Kasih!</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Pesanan Anda telah diselesaikan. Selamat menikmati donat lezat kami! 🍩✨
                </p>
                <div className="mt-8">
                  <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">Sedang Memproses...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-6">
                  <CheckCircleIcon className="h-10 w-10 text-emerald-600" aria-hidden="true" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Konfirmasi Pesanan</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                    Apakah pesanan Anda sudah diterima dengan baik? Aksi ini tidak dapat dibatalkan.
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      'Ya, Pesanan Diterima'
                    )}
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                  >
                    Batal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
