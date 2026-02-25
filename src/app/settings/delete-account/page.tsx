'use client';

import { useState } from 'react';
import { TrashIcon, ExclamationTriangleIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useErrorPopup } from '@/context/ErrorPopupContext';

export default function DeleteAccountPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { showError } = useErrorPopup();

  return (
    <div className="space-y-12 px-4 py-12 pb-32">
      <div className="bg-red-50 rounded-4xl p-10 border border-red-100 text-center">
        <div className="size-20 bg-red-100/50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
           <ExclamationTriangleIcon className="size-10" />
        </div>
        <h2 className="text-xl font-black text-red-600 mb-4">Penghapusan Akun</h2>
        <p className="text-sm text-red-500/80 font-medium leading-relaxed">
          Kami sedih melihat Anda pergi. Harap dicatat bahwa tindakan ini bersifat permanen dan tidak dapat dibatalkan.
        </p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => setShowConfirm(true)}
          className="w-full py-5 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all"
        >
          Hapus Akun Saya
        </button>
        <button 
          onClick={() => router.back()}
          className="w-full py-5 bg-white border border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeftIcon className="size-4" />
          Batal & Kembali
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-6">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowConfirm(false)} />
           <div className="relative bg-white rounded-4xl p-8 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-black text-slate-800 mb-4">Konfirmasi Penghapusan</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                Mohon perhatikan setelah Anda menghapus Akun, Anda tidak akan bisa memulihkan kembali. Lanjutkan?
              </p>
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => setShowConfirm(false)}
                   className="py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                 >
                   Batal
                 </button>
                 <button 
                   onClick={() => {
                      showError('Permintaan Dikirim', 'Fitur penghapusan akun akan diproses secara manual oleh admin dalam 3x24 jam.');
                     router.push('/');
                   }}
                   className="py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                 >
                   OK
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
