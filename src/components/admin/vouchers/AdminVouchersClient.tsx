'use client';

import { useState } from 'react';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Voucher, createVoucher, updateVoucher, deleteVoucher, toggleVoucherStatus } from '@/app/actions/voucher-actions';

export default function AdminVouchersClient({ initialVouchers }: { initialVouchers: Voucher[] }) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Voucher>>({
    code: '',
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase: 0,
    max_discount: null,
    usage_limit: null,
    start_date: '',
    end_date: '',
    status: true
  });

  const showMessage = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(msg);
      setSuccessMsg(null);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const handleOpenModal = (voucher?: Voucher) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        ...voucher,
        start_date: voucher.start_date ? new Date(voucher.start_date).toISOString().slice(0, 16) : '',
        end_date: voucher.end_date ? new Date(voucher.end_date).toISOString().slice(0, 16) : '',
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: '',
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_purchase: 0,
        max_discount: null,
        usage_limit: null,
        start_date: '',
        end_date: '',
        status: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Clean up empty strings for dates/nullables
    const payload = {
      ...formData,
      max_discount: formData.max_discount || null,
      usage_limit: formData.usage_limit || null,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    };

    try {
      if (editingVoucher) {
        const res = await updateVoucher(editingVoucher.id, payload);
        if (res.success) {
          setVouchers(vouchers.map(v => v.id === editingVoucher.id ? { ...v, ...payload } as Voucher : v));
          showMessage('Voucher berhasil diperbarui', 'success');
          setIsModalOpen(false);
        } else {
          showMessage(res.error || 'Gagal memperbarui voucher', 'error');
        }
      } else {
        const res = await createVoucher(payload);
        if (res.success) {
          // In a real app we might fetch the new list, or just reload the page.
          // For simplicity we will reload to get the new ID and accurate sorting.
          window.location.reload();
        } else {
          showMessage(res.error || 'Gagal membuat voucher', 'error');
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      showMessage(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus voucher ini?')) return;
    setIsLoading(true);
    const res = await deleteVoucher(id);
    if (res.success) {
      setVouchers(vouchers.filter(v => v.id !== id));
      showMessage('Voucher berhasil dihapus', 'success');
    } else {
      showMessage(res.error || 'Gagal menghapus voucher', 'error');
    }
    setIsLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsLoading(true);
    const res = await toggleVoucherStatus(id, currentStatus);
    if (res.success) {
      setVouchers(vouchers.map(v => v.id === id ? { ...v, status: !currentStatus } : v));
      showMessage(`Voucher ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`, 'success');
    } else {
      showMessage(res.error || 'Gagal mengubah status', 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Daftar Voucher ({vouchers.length})</h3>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Tambah Voucher
        </button>
      </div>

      {(errorMsg || successMsg) && (
        <div className="px-6 py-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center gap-2 border border-red-200">
              <ExclamationCircleIcon className="w-5 h-5 shrink-0" /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-md flex items-center gap-2 border border-emerald-200">
              <CheckCircleIcon className="w-5 h-5 shrink-0" /> {successMsg}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Kode & Info</th>
              <th className="px-6 py-4 font-semibold">Diskon</th>
              <th className="px-6 py-4 font-semibold text-center">Penggunaan</th>
              <th className="px-6 py-4 font-semibold">Masa Berlaku</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vouchers.length === 0 ? (
               <tr><td colSpan={6} className="py-8 text-center text-slate-500">Belum ada voucher.</td></tr>
            ) : vouchers.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-black text-indigo-700 text-base">{v.code}</span>
                    <span className="font-semibold text-slate-700 mt-1">{v.title}</span>
                    {v.description && <span className="text-xs text-slate-500 mt-0.5 line-clamp-1" title={v.description}>{v.description}</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-emerald-600">
                      {v.discount_type === 'percentage' 
                        ? `${v.discount_value}%` 
                        : `Rp ${v.discount_value.toLocaleString('id-ID')}`}
                    </span>
                    <span className="text-xs text-slate-500">Min. Beli: Rp {v.min_purchase.toLocaleString('id-ID')}</span>
                    {v.max_discount && <span className="text-[10px] text-slate-400">Maks. Rp {v.max_discount.toLocaleString('id-ID')}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-700">{v.used_count}</span>
                    <span className="text-[10px] text-slate-400">dari {v.usage_limit || '∞'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-xs">
                    {v.start_date || v.end_date ? (
                      <>
                        {v.start_date && <span className="text-slate-600">Mulai: {new Date(v.start_date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>}
                        {v.end_date && <span className="text-slate-600">Sampai: {new Date(v.end_date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>}
                      </>
                    ) : (
                      <span className="text-slate-500">Selamanya</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleStatus(v.id, v.status)}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      v.status 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                    } transition-colors disabled:opacity-50`}
                  >
                    {v.status ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(v)}
                      disabled={isLoading}
                      className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors disabled:opacity-50"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      disabled={isLoading}
                      className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-slate-800">
                {editingVoucher ? 'Edit Voucher' : 'Tambah Voucher Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="voucherForm" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Kode Voucher *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                      placeholder="Contoh: PROMO10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Judul Promo *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Contoh: Diskon Kemerdekaan 10%"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Deskripsi</label>
                  <textarea 
                    value={formData.description || ''} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={2}
                    className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Syarat dan ketentuan singkat (opsional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Tipe Diskon *</label>
                    <select 
                      value={formData.discount_type} 
                      onChange={e => setFormData({...formData, discount_type: e.target.value as 'percentage' | 'fixed'})}
                      className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="percentage">Persentase (%)</option>
                      <option value="fixed">Nominal Rupiah (Rp)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">
                      Nilai Diskon ({formData.discount_type === 'percentage' ? '%' : 'Rp'}) *
                    </label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      value={formData.discount_value || ''} 
                      onChange={e => setFormData({...formData, discount_value: parseInt(e.target.value) || 0})}
                      className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Minimal Pembelian (Rp) *</label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      value={formData.min_purchase === 0 ? '0' : (formData.min_purchase || '')} 
                      onChange={e => setFormData({...formData, min_purchase: parseInt(e.target.value) || 0})}
                      className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 block">Maksimal Diskon (Rp) <span className="text-slate-400 font-normal">(opsional)</span></label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.max_discount || ''} 
                      onChange={e => setFormData({...formData, max_discount: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Kosongkan jika tanpa batas"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Batas Kuota <span className="text-slate-400 font-normal">(opsional)</span></label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.usage_limit || ''} 
                      onChange={e => setFormData({...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Contoh: 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Tanggal Mulai <span className="text-slate-400 font-normal">(opsional)</span></label>
                    <input 
                      type="datetime-local" 
                      value={formData.start_date || ''} 
                      onChange={e => setFormData({...formData, start_date: e.target.value})}
                      className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">Tanggal Berakhir <span className="text-slate-400 font-normal">(opsional)</span></label>
                    <input 
                      type="datetime-local" 
                      value={formData.end_date || ''} 
                      onChange={e => setFormData({...formData, end_date: e.target.value})}
                      className="w-full border-slate-300 rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <input 
                    type="checkbox" 
                    id="statusCheckbox"
                    checked={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.checked})}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="statusCheckbox" className="text-sm font-semibold text-slate-700 cursor-pointer">
                    Voucher Aktif
                  </label>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50 rounded-b-xl">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Batal
              </button>
              <button 
                type="submit"
                form="voucherForm"
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-200"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Voucher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
