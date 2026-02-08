'use client';

import { useState } from 'react';
import { Reason } from '@/types/cms';
import { AdminCard, AdminInput, AdminButton } from './Shared';
import { saveReason } from '@/app/admin/actions';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function ReasonsEditor({ initialReasons }: { initialReasons: Reason[] }) {
  const [reasons, setReasons] = useState<Reason[]>(initialReasons);
  const [loading, setLoading] = useState(false);

  const handleAddField = () => {
    setReasons([...reasons, { id: crypto.randomUUID(), title: '', description: '', order_index: reasons.length }]);
  };

  const handleUpdate = (id: string, field: keyof Reason, value: string) => {
    setReasons(reasons.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      for (const reason of reasons) {
        await saveReason(reason);
      }
      alert('Reasons updated successfully!');
    } catch (error) {
      alert('Error saving reasons');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminCard title="Mengapa Memilih Kami (Reasons Section)">
      <div className="space-y-6">
        {reasons.map((reason, index) => (
          <div key={reason.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/30 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fitur #{index + 1}</span>
            </div>
            <AdminInput 
              label="Judul" 
              value={reason.title} 
              onChange={e => handleUpdate(reason.id, 'title', e.target.value)}
            />
            <AdminInput 
              label="Deskripsi" 
              multiline
              rows={2}
              value={reason.description} 
              onChange={e => handleUpdate(reason.id, 'description', e.target.value)}
            />
          </div>
        ))}
        
        <div className="flex justify-between items-center pt-4">
          <AdminButton variant="secondary" onClick={handleAddField}>
            <PlusIcon className="w-4 h-4" />
            Tambah Fitur
          </AdminButton>
          <AdminButton onClick={handleSave} isLoading={loading}>
            Simpan Perubahan
          </AdminButton>
        </div>
      </div>
    </AdminCard>
  );
}
