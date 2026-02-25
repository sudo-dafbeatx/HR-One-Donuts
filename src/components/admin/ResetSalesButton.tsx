'use client';

import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { resetSalesData } from '@/app/admin/actions';
import { useErrorPopup } from '@/context/ErrorPopupContext';

export default function ResetSalesButton() {
  const [loading, setLoading] = useState(false);
  const { showError } = useErrorPopup();

  const handleReset = async () => {
    // Double confirmation
    const firstConfirm = window.confirm('⚠ PERINGATAN! Anda akan menghapus SEMUA data pesanan dan mereset statistik penjualan menjadi 0. Tindakan ini tidak dapat dibatalkan. Lanjutkan?');
    
    if (!firstConfirm) return;
    
    const secondConfirm = window.confirm('KONFIRMASI TERAKHIR: Anda BENAR-BENAR yakin ingin menghapus semua data pendapatan? (Feature ini hanya untuk tahap pengembangan)');
    
    if (!secondConfirm) return;

    setLoading(true);
    try {
      const result = await resetSalesData();
      if (!result.success) {
        throw new Error(result.error || 'Terjadi kesalahan tidak diketahui di server.');
      }
      alert('✅ Data pendapatan telah berhasil direset.');
    } catch (error) {
      showError('Gagal Mereset Data', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm
        ${loading 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
          : 'bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
        }
      `}
      title="Hapus semua data pesanan & statistik penjualan"
    >
      <ArrowPathIcon className={`size-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Mereset...' : 'Reset Pendapatan'}
    </button>
  );
}
