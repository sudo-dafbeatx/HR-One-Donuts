'use client';

import { useState } from 'react';
import { FlashSale, FlashSaleItem, Product } from '@/types/cms';
import { AdminInput, AdminSelect, AdminButton, AdminCard, AdminCurrencyInput } from './Shared';
import { saveFlashSale, deleteFlashSale, saveFlashSaleItem, deleteFlashSaleItem } from '@/app/admin/actions';
import { TrashIcon, PencilIcon, PlusIcon, BoltIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface FlashSaleManagerProps {
  initialData: FlashSale[];
  products: Product[];
}

export default function FlashSaleManager({ initialData, products }: FlashSaleManagerProps) {
  const [sales, setSales] = useState<FlashSale[]>(initialData);
  const [editing, setEditing] = useState<Partial<FlashSale> | null>(null);
  const [loading, setLoading] = useState(false);

  // Item management
  const [managingItems, setManagingItems] = useState<FlashSale | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<FlashSaleItem> | null>(null);
  const [itemLoading, setItemLoading] = useState(false);

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
    if (!confirm('Hapus flash sale ini? Semua item produk di dalamnya juga akan terhapus.')) return;
    try {
      await deleteFlashSale(id);
      setSales(sales.filter(s => s.id !== id));
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !managingItems) return;

    setItemLoading(true);
    try {
      await saveFlashSaleItem({
        ...editingItem,
        flash_sale_id: managingItems.id,
      });
      window.location.reload();
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setItemLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Hapus produk ini dari flash sale?')) return;
    try {
      await deleteFlashSaleItem(itemId);
      if (managingItems) {
        setManagingItems({
          ...managingItems,
          items: (managingItems.items || []).filter(i => i.id !== itemId),
        });
      }
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

  const formatCurrency = (val: number) => `Rp${val.toLocaleString('id-ID')}`;

  // Get products not already in managing flash sale
  const availableProducts = products.filter(p => {
    if (!managingItems?.items) return true;
    return !managingItems.items.some(item => item.product_id === p.id);
  });

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

            <div className="p-5">
              {/* Meta info */}
              <div className="flex justify-between items-start mb-4">
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
                    onClick={() => setManagingItems(sale)}
                    className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                    title="Kelola Produk"
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                  </button>
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

              {/* Items preview */}
              {sale.items && sale.items.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    {sale.items.length} Produk Flash Sale
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sale.items.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg text-xs">
                        {item.products?.image_url && (
                          <div className="relative w-full h-full">
                            <Image src={item.products.image_url} alt="" fill sizes="64px" className="rounded object-cover" />
                          </div>
                        )}
                        <span className="font-bold text-slate-700 truncate max-w-[100px]">
                          {item.products?.name || item.product_id}
                        </span>
                        <span className="text-red-600 font-black">{formatCurrency(item.sale_price)}</span>
                      </div>
                    ))}
                    {(sale.items?.length || 0) > 4 && (
                      <span className="text-xs text-slate-400 font-bold self-center">+{(sale.items?.length || 0) - 4} lagi</span>
                    )}
                  </div>
                </div>
              )}
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

      {/* ==================== Edit/Create Flash Sale Modal ==================== */}
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

      {/* ==================== Manage Items Modal ==================== */}
      {managingItems && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="my-auto w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-left max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-5 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-heading">Produk Flash Sale</h3>
                <p className="text-sm text-slate-500 font-medium">{managingItems.title}</p>
              </div>
              <button
                type="button"
                onClick={() => { setManagingItems(null); setEditingItem(null); }}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1">
              {/* Add Item */}
              <AdminButton onClick={() => setEditingItem({
                flash_sale_id: managingItems.id,
                product_id: '',
                sale_price: 0,
                stock_limit: 10,
                sold_count: 0,
              })}>
                <PlusIcon className="w-5 h-5" />
                Tambah Produk
              </AdminButton>

              {/* Items list */}
              {managingItems.items && managingItems.items.length > 0 ? (
                <div className="space-y-3">
                  {managingItems.items.map((item) => {
                    const product = item.products;
                    const originalPrice = products.find(p => p.id === item.product_id)?.price || 0;
                    const discountPercent = originalPrice > 0 ? Math.round((1 - item.sale_price / originalPrice) * 100) : 0;
                    const stockPercent = item.stock_limit > 0 ? Math.round((item.sold_count / item.stock_limit) * 100) : 0;

                    return (
                      <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                          {product?.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill sizes="64px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ShoppingBagIcon className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{product?.name || item.product_id}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-red-600 font-black text-sm">{formatCurrency(item.sale_price)}</span>
                            {originalPrice > 0 && (
                              <span className="text-slate-400 text-xs line-through">{formatCurrency(originalPrice)}</span>
                            )}
                            {discountPercent > 0 && (
                              <span className="bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>
                          {/* Stock Bar */}
                          <div className="mt-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                              <span>Terjual {item.sold_count} / {item.stock_limit}</span>
                              <span>{stockPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${stockPercent > 80 ? 'bg-orange-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(stockPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="p-2 rounded-xl bg-slate-50 text-primary hover:bg-primary/10 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 rounded-xl bg-slate-50 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <ShoppingBagIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm font-medium italic">Belum ada produk. Tambahkan produk ke flash sale ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== Add/Edit Item Sub-Modal ==================== */}
      {editingItem && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-base font-black text-heading">
                {editingItem.id ? 'Edit Item' : 'Tambah Produk'}
              </h4>
              <button type="button" onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              {/* Product Picker */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Pilih Produk *</label>
                <select
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
                  value={editingItem.product_id || ''}
                  onChange={e => {
                    const selectedProduct = products.find(p => p.id === e.target.value);
                    setEditingItem({
                      ...editingItem,
                      product_id: e.target.value,
                      sale_price: editingItem.sale_price || Math.round((selectedProduct?.price || 0) * 0.5),
                    });
                  }}
                  required
                  disabled={!!editingItem.id}
                >
                  <option value="">— Pilih Produk —</option>
                  {(editingItem.id ? products : availableProducts).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)}
                    </option>
                  ))}
                </select>
                {editingItem.product_id && (() => {
                  const p = products.find(pr => pr.id === editingItem.product_id);
                  return p ? (
                    <div className="flex items-center gap-3 mt-2 p-3 bg-slate-50 rounded-xl">
                      {p.image_url && (
                        <div className="relative w-12 h-12 shrink-0">
                          <Image src={p.image_url} alt="" fill sizes="48px" className="rounded-lg object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-500">Harga normal: {formatCurrency(p.price)}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              <AdminCurrencyInput
                label="Harga Flash Sale *"
                value={editingItem.sale_price || 0}
                onChange={val => setEditingItem({ ...editingItem, sale_price: val })}
              />

              <AdminInput
                label="Stok Flash Sale *"
                type="number"
                min={1}
                value={editingItem.stock_limit ?? 10}
                onChange={e => setEditingItem({ ...editingItem, stock_limit: Number(e.target.value) })}
                required
              />

              <AdminInput
                label="Sudah Terjual"
                type="number"
                min={0}
                value={editingItem.sold_count ?? 0}
                onChange={e => setEditingItem({ ...editingItem, sold_count: Number(e.target.value) })}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <AdminButton type="button" variant="secondary" onClick={() => setEditingItem(null)}>Batal</AdminButton>
                <AdminButton type="submit" isLoading={itemLoading}>Simpan</AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
