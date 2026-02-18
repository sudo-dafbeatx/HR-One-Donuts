'use client';

import { useState } from 'react';
import { OrderStep } from '@/types/cms';
import { AdminInput, AdminButton, AdminCard } from './Shared';
import { updateSettings } from '@/app/admin/actions';
import { TrashIcon, PlusIcon, Bars3Icon } from '@heroicons/react/24/outline';

export default function OrderStepsEditor({ initialSteps }: { initialSteps: OrderStep[] }) {
  const [steps, setSteps] = useState<OrderStep[]>(initialSteps.length > 0 ? initialSteps : [
    { id: crypto.randomUUID(), step_number: 1, title: "Pilih Produk", description: "Temukan donat favorit Anda di menu katalog kami." },
    { id: crypto.randomUUID(), step_number: 2, title: "Tambah ke Keranjang", description: "Pilih jumlah dan tambahkan ke keranjang belanja." },
    { id: crypto.randomUUID(), step_number: 3, title: "Login / Daftar", description: "Masuk ke akun Anda untuk proses pemesanan yang lebih cepat." },
    { id: crypto.randomUUID(), step_number: 4, title: "Isi Alamat & Pembayaran", description: "Tentukan lokasi pengiriman dan pilih metode pembayaran." },
    { id: crypto.randomUUID(), step_number: 5, title: "Konfirmasi Pesanan", description: "Periksa kembali pesanan Anda dan konfirmasi pembayaran." }
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addStep = () => {
    setSteps([...steps, { 
      id: crypto.randomUUID(), 
      step_number: steps.length + 1, 
      title: '', 
      description: '' 
    }]);
  };

  const removeStep = (id: string) => {
    const newSteps = steps.filter(s => s.id !== id).map((s, idx) => ({
      ...s,
      step_number: idx + 1
    }));
    setSteps(newSteps);
  };

  const updateStep = (id: string, field: keyof OrderStep, value: string | number) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await updateSettings('order_steps', { steps } as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Error updating order steps: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-heading">Cara Pesan</h2>
        <AdminButton onClick={addStep} variant="secondary">
          <PlusIcon className="w-4 h-4" /> Tambah Langkah
        </AdminButton>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <AdminCard key={step.id} title={`Langkah ${step.step_number}`}>
             <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                <div className="flex-1 w-full space-y-4">
                   <AdminInput 
                     label="Judul Langkah" 
                     value={step.title} 
                     onChange={e => updateStep(step.id, 'title', e.target.value)}
                     placeholder="Contoh: Pilih Donat"
                   />
                   <AdminInput 
                     label="Deskripsi" 
                     value={step.description} 
                     onChange={e => updateStep(step.id, 'description', e.target.value)}
                     multiline
                     rows={2}
                     placeholder="Jelaskan apa yang harus dilakukan pelanggan..."
                   />
                </div>
                <button 
                 onClick={() => removeStep(step.id)}
                 className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors sm:mt-8 self-end sm:self-start"
                 title="Hapus Langkah"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
             </div>
          </AdminCard>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <AdminButton onClick={handleSave} isLoading={loading}>
          Simpan Langkah Pemesanan
        </AdminButton>
        {success && (
          <span className="text-green-600 font-bold animate-bounce">
            ✅ Langkah pemesanan berhasil disimpan!
          </span>
        )}
      </div>
    </div>
  );
}
