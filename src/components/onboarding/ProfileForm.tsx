'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import GeoDropdown from './GeoDropdown';
import { useLoading } from '@/context/LoadingContext';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
  initialData: {
    full_name: string;
    email: string;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData.full_name,
    email: initialData.email,
    gender: '' as 'male' | 'female' | '',
    age: '',
    province: { id: '', name: '' },
    city: { id: '', name: '' },
    district: { id: '', name: '' },
    addressDetail: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { setIsLoading } = useLoading();
  const router = useRouter();
  const supabase = createClient();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Nama wajib diisi';
    if (!formData.gender) newErrors.gender = 'Pilih jenis kelamin';
    if (!formData.age) {
      newErrors.age = 'Usia wajib diisi';
    } else {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
        newErrors.age = 'Usia harus antara 13–100 tahun';
      }
    }
    if (!formData.province.id) newErrors.province = 'Provinsi wajib dipilih';
    if (!formData.city.id) newErrors.city = 'Kota/Kabupaten wajib dipilih';
    if (!formData.district.id) newErrors.district = 'Kecamatan wajib dipilih';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setIsLoading(true, 'Menyimpan profil kamu...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesi tidak ditemukan');

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          gender: formData.gender,
          age: parseInt(formData.age),
          province_id: formData.province.id,
          province_name: formData.province.name,
          city_id: formData.city.id,
          city_name: formData.city.name,
          district_id: formData.district.id,
          district_name: formData.district.name,
          address_detail: formData.addressDetail,
          is_profile_complete: true
        });

      if (error) throw error;

      // Set cookie to avoid middleware redirect (expires in 365 days)
      document.cookie = "hr_profile_complete=true; path=/; max-age=31536000; SameSite=Lax";

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert('Gagal menyimpan profil: ' + message);
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Nama Lengkap</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Masukkan nama lengkap"
            className={`block w-full rounded-full border px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-slate-50 ${errors.fullName ? 'border-red-300' : 'border-slate-200'}`}
          />
          {errors.fullName && <p className="mt-1.5 ml-1 text-[11px] font-bold text-red-500 uppercase tracking-wider">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Email (Akun)</label>
          <input
            type="email"
            value={formData.email}
            readOnly
            className="block w-full rounded-full border border-slate-200 px-6 py-4 text-slate-400 outline-none bg-slate-100 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3 pl-1">Jenis Kelamin</label>
          <div className="flex gap-4">
            {['male', 'female'].map((g) => (
              <label 
                key={g}
                className={`flex-1 flex items-center justify-center gap-3 h-14 rounded-full border-2 cursor-pointer transition-all ${
                  formData.gender === g 
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-md shadow-primary/10' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={formData.gender === g}
                  onChange={() => setFormData({ ...formData, gender: g as "male" | "female" })}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-[20px]">
                  {g === 'male' ? 'male' : 'female'}
                </span>
                {g === 'male' ? 'Laki-laki' : 'Perempuan'}
              </label>
            ))}
          </div>
          {errors.gender && <p className="mt-1.5 ml-1 text-[11px] font-bold text-red-500 uppercase tracking-wider">{errors.gender}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Usia (Tahun)</label>
          <input
            type="number"
            min="13"
            max="100"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="Contoh: 25"
            className={`block w-full rounded-full border px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-slate-50 ${errors.age ? 'border-red-300' : 'border-slate-200'}`}
          />
          {errors.age && <p className="mt-1.5 ml-1 text-[11px] font-bold text-red-500 uppercase tracking-wider">{errors.age}</p>}
        </div>
      </div>

      <div className="bg-slate-50/50 p-6 md:p-8 rounded-[2rem] border border-slate-100 space-y-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">location_on</span>
          Wilayah Pengiriman
        </h3>
        
        <GeoDropdown 
          onProvinceChange={(id, name) => setFormData(prev => ({ ...prev, province: { id, name } }))}
          onCityChange={(id, name) => setFormData(prev => ({ ...prev, city: { id, name } }))}
          onDistrictChange={(id, name) => setFormData(prev => ({ ...prev, district: { id, name } }))}
          errors={{
            province: errors.province,
            city: errors.city,
            district: errors.district
          }}
        />

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Alamat Lengkap (Opsional)</label>
          <textarea
            value={formData.addressDetail}
            onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
            placeholder="Nama jalan, nomor rumah, RT/RW, or ciri-ciri bangunan"
            rows={3}
            className="block w-full rounded-2xl border border-slate-200 px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-white resize-none"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-16 rounded-full bg-primary text-white font-black text-lg shadow-xl shadow-primary/30 hover:bg-blue-600 hover:shadow-primary/40 focus:ring-4 focus:ring-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {submitting ? (
            <>
              <div className="size-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <span>Selesai & Mulai Belanja</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
