'use client';

import { useState } from 'react';
import { AdminInput, AdminButton, AdminCard } from './Shared';
import { updateSettings } from '@/app/admin/actions';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function CategoryManager({ initialCategories }: { initialCategories: string[] }) {
  const [categories, setCategories] = useState<string[]>(initialCategories.length > 0 ? initialCategories : ['Signature', 'Box', 'Satuan', 'Minuman']);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      alert('Kategori sudah ada');
      return;
    }
    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await updateSettings('product_categories', { categories } as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Error updating categories: ' + (error as Error).message);
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
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory())}
            />
          </div>
          <AdminButton type="button" onClick={addCategory} className="mt-8">
            <PlusIcon className="w-4 h-4" />
          </AdminButton>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl group transition-all hover:border-primary/30">
              <span className="text-sm font-bold text-slate-700">{cat}</span>
              <button 
                onClick={() => removeCategory(cat)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-slate-400 italic">Belum ada kategori.</p>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <AdminButton onClick={handleSave} isLoading={loading}>
            Simpan Daftar Kategori
          </AdminButton>
          {success && (
            <span className="text-green-600 font-bold animate-bounce text-sm">
              ✅ Kategori berhasil disimpan!
            </span>
          )}
        </div>
      </div>
    </AdminCard>
  );
}
