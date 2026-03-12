'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useErrorPopup } from '@/context/ErrorPopupContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CartAddressFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function CartAddressForm({ onCancel, onSuccess, userId }: CartAddressFormProps) {
  const { showError } = useErrorPopup();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    label: 'Rumah',
    full_name: '',
    phone: '+62',
    province: '',
    city: '',
    district: '',
    postal_code: '',
    street_name: '',
    additional_details: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone || !formData.city || !formData.street_name) {
      showError('Data Tidak Lengkap', 'Harap isi semua kolom alamat wajib.');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    // Set all existing addresses to not default
    await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', userId);

    // Insert new default address
    const { error: addressError } = await supabase
      .from('user_addresses')
      .insert({
        ...formData,
        user_id: userId,
        is_default: true,
      });

    // Also update profile basic info if we can, to ensure WA has name/phone
    await supabase.from('user_profiles').update({
      full_name: formData.full_name,
      phone: formData.phone
    }).eq('id', userId);

    setSaving(false);

    if (addressError) {
      console.error(addressError);
      showError('Gagal Simpan', 'Terjadi kesalahan saat menyimpan alamat.');
    } else {
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f7fb]">
      <div className="p-4 bg-white flex items-center justify-between shadow-[0_4px_10px_rgba(0,0,0,0.05)] rounded-b-[16px]">
        <h2 className="text-[20px] font-bold text-[#1a1a1a]">Lengkapi Alamat</h2>
        <button onClick={onCancel} className="p-2 bg-[#f5f7fb] rounded-full hover:bg-gray-200">
          <XMarkIcon className="w-5 h-5 text-[#1a1a1a]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSave} className="bg-white p-4 rounded-[16px] shadow-[0_4px_10px_rgba(0,0,0,0.05)] space-y-4">
          
          <div className="space-y-3">
            <h3 className="text-[14px] font-bold text-[#1a1a1a] border-b border-gray-100 pb-2">Kontak Penerima</h3>
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-gray-500">Nama Penerima <span className="text-red-500">*</span></label>
              <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required className="w-full border border-gray-200 p-3 rounded-[12px] text-[14px] outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-gray-500">Nomor Telepon (WA) <span className="text-red-500">*</span></label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="w-full border border-gray-200 p-3 rounded-[12px] text-[14px] outline-none focus:border-primary" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-[14px] font-bold text-[#1a1a1a] border-b border-gray-100 pb-2">Detail Alamat</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-gray-500">Provinsi</label>
                <input type="text" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full border border-gray-200 p-3 rounded-[12px] text-[14px] outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-gray-500">Kota / Kabupaten <span className="text-red-500">*</span></label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required className="w-full border border-gray-200 p-3 rounded-[12px] text-[14px] outline-none focus:border-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-gray-500">Kecamatan</label>
                <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full border border-gray-200 p-3 rounded-[12px] text-[14px] outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-gray-500">Kode Pos</label>
                <input type="text" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className="w-full border border-gray-200 p-3 rounded-[12px] text-[14px] outline-none focus:border-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-gray-500">Alamat Lengkap (Jalan, No. Rumah) <span className="text-red-500">*</span></label>
              <textarea value={formData.street_name} onChange={e => setFormData({...formData, street_name: e.target.value})} required rows={2} className="w-full border border-gray-200 p-3 rounded-[12px] text-[14px] outline-none focus:border-primary resize-none"></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-gray-500">Catatan Tambahan (Opsional)</label>
              <input type="text" value={formData.additional_details} onChange={e => setFormData({...formData, additional_details: e.target.value})} placeholder="Contoh: Pagar hitam, titip di possatpam" className="w-full border border-gray-200 p-3 rounded-[12px] text-[14px] outline-none focus:border-primary" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full mt-4 bg-primary text-white font-bold h-[48px] rounded-[12px] shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Alamat & Lanjutkan'}
          </button>
        </form>
      </div>
    </div>
  );
}
