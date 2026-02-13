'use client';

import { useState } from 'react';
import { AdminInput, AdminButton, AdminCard } from './Shared';
import { saveCategory, deleteCategory } from '@/app/admin/actions';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Category } from '@/types/cms';

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;
    if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      alert('Kategori sudah ada');
      return;
    }
    
    setLoading(true);
    try {
      const result = await saveCategory(newCategoryName.trim());
      if (result.success) {
        // Refresh would be ideal, but for now we just re-sync or wait for revalidate
        window.location.reload();
      }
    } catch (error) {
      alert('Gagal menambah kategori: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini? Produk dengan kategori ini mungkin tidak akan muncul di filter.')) return;
    
    setLoading(true);
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (error) {
      alert('Gagal menghapus kategori: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminCard title="Manajemen Kategori">
      <div className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <AdminInput 
              label="Tambah Kategori Baru" 
              placeholder="Contoh: Donat Asin"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), !loading && handleAdd())}
              disabled={loading}
            />
          </div>
          <AdminButton type="button" onClick={handleAdd} className="mt-8" isLoading={loading}>
            <PlusIcon className="w-4 h-4" />
          </AdminButton>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl group transition-all hover:border-primary/30">
              <span className="text-sm font-bold text-slate-700">{cat.name}</span>
              <button 
                onClick={() => handleDelete(cat.id)}
                disabled={loading}
                className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-slate-400 italic">Belum ada kategori. Tambahkan minimal satu untuk menu.</p>
          )}
        </div>

        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          * Perubahan kategori akan langsung tersimpan di database.
        </p>
      </div>
    </AdminCard>
  );
}
