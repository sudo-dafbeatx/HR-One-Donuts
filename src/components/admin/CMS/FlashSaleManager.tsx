'use client';

import { useState } from 'react';
import { FlashSale } from '@/types/cms';
import { AdminInput, AdminSelect, AdminButton, AdminCard } from './Shared';
import { saveFlashSale, deleteFlashSale } from '@/app/admin/actions';
import { TrashIcon, PencilIcon, PlusIcon, BoltIcon } from '@heroicons/react/24/outline';

export default function FlashSaleManager({ initialData }: { initialData: FlashSale[] }) {
  const [sales, setSales] = useState<FlashSale[]>(initialData);
  const [editing, setEditing] = useState<Partial<FlashSale> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setLoading(true);
    try {
      await saveFlashSale(editing);
      window.location.reload();
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus flash sale ini?')) return;
    try {
      await deleteFlashSale(id);
      setSales(sales.filter(s => s.id !== id));
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const toLocalDatetime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-heading flex items-center gap-2">
          <BoltIcon className="w-6 h-6 text-primary" />
          Flash Sale
        </h2>
        <AdminButton onClick={() => setEditing({
          title: '', slug: '', discount_type: 'percentage', discount_value: 50, is_active: true
        })}>
          <PlusIcon className="w-5 h-5" />
          Tambah Flash Sale
        </AdminButton>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sales.map((sale) => (
          <div key={sale.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
            <div
              className="p-6 relative"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary, #1152d4) 0%, var(--color-secondary, #3b82f6) 100%)',
              }}
            >
              <div className="flex items-start justify-between text-white">
                <div>
                  <h3 className="text-xl font-black">{sale.title}</h3>
                  <p className="text-white/70 text-sm mt-1">{sale.description || '—'}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  {sale.discount_type === 'percentage' ? (
                    <div className="bg-white text-slate-900 px-3 py-1 rounded-full text-sm font-black">
                      {sale.discount_value}% OFF
                    </div>
                  ) : (
                    <div className="bg-white text-slate-900 px-3 py-1 rounded-full text-sm font-black">
                      BOGO
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {sale.slug}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    sale.is_active
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-400 bg-slate-100'
                  }`}>
                    {sale.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {formatDate(sale.start_date)} — {formatDate(sale.end_date)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(sale)}
                  className="p-2 rounded-xl bg-slate-50 text-primary hover:bg-primary/10 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(sale.id)}
                  className="p-2 rounded-xl bg-slate-50 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sales.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <BoltIcon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400 font-medium italic">Belum ada flash sale. Buat yang pertama!</p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editing && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="my-auto w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden scale-in-center text-left">
            <div className="px-5 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg sm:text-xl font-black text-heading">
                {editing.id ? 'Edit Flash Sale' : 'Tambah Flash Sale Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <AdminInput
                    label="Judul *"
                    value={editing.title || ''}
                    onChange={e => setEditing({ ...editing, title: e.target.value })}
                    placeholder="contoh: Selasa Mega Sale"
                    required
                  />
                  <AdminInput
                    label="Slug (URL-friendly) *"
                    value={editing.slug || ''}
                    onChange={e => setEditing({ ...editing, slug: e.target.value })}
                    placeholder="contoh: selasa-mega-sale"
                    required
                  />
                  <AdminSelect
                    label="Tipe Diskon"
                    value={editing.discount_type || 'percentage'}
                    onChange={e => setEditing({ ...editing, discount_type: e.target.value as 'percentage' | 'bogo' })}
                    options={[
                      { label: 'Persentase (%)', value: 'percentage' },
                      { label: 'Beli 1 Gratis 1 (BOGO)', value: 'bogo' },
                    ]}
                  />
                  {editing.discount_type === 'percentage' && (
                    <AdminInput
                      label="Nilai Diskon (%)"
                      type="number"
                      min={1}
                      max={100}
                      value={editing.discount_value ?? ''}
                      onChange={e => setEditing({ ...editing, discount_value: Number(e.target.value) })}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <AdminCard title="Status & Jadwal">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-slate-700 text-left">Aktif</span>
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, is_active: !editing.is_active })}
                        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${editing.is_active ? 'bg-primary' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${editing.is_active ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <AdminInput
                        label="Mulai (opsional)"
                        type="datetime-local"
                        value={toLocalDatetime(editing.start_date)}
                        onChange={e => setEditing({ ...editing, start_date: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      />
                      <AdminInput
                        label="Berakhir (opsional)"
                        type="datetime-local"
                        value={toLocalDatetime(editing.end_date)}
                        onChange={e => setEditing({ ...editing, end_date: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      />
                    </div>
                  </AdminCard>

                  <div className="text-left">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Deskripsi</label>
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[80px]"
                      value={editing.description || ''}
                      onChange={e => setEditing({ ...editing, description: e.target.value })}
                      placeholder="Deskripsi promo..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <AdminButton type="button" variant="secondary" onClick={() => setEditing(null)}>Batal</AdminButton>
                <AdminButton type="submit" isLoading={loading}>Simpan</AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
