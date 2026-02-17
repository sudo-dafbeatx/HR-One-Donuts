'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import GeoDropdown from './GeoDropdown';
import { useLoading } from '@/context/LoadingContext';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
  userId: string;
  initialData: {
    full_name: string;
    email: string;
  };
}

export default function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData.full_name,
    email: initialData.email,
    gender: '' as 'male' | 'female' | '',
    age: '',
    birthPlace: '',
    birthDate: '',
    province: { id: '', name: '' },
    city: { id: '', name: '' },
    district: { id: '', name: '' },
    addressDetail: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [slowSubmission, setSlowSubmission] = useState(false);
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
    if (!formData.birthPlace.trim()) newErrors.birthPlace = 'Tempat lahir wajib diisi';
    if (!formData.birthDate) newErrors.birthDate = 'Tanggal lahir wajib diisi';
    if (!formData.province.id) newErrors.province = 'Provinsi wajib dipilih';
    if (!formData.city.id) newErrors.city = 'Kota/Kabupaten wajib dipilih';
    if (!formData.district.id) newErrors.district = 'Kecamatan wajib dipilih';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    const startTime = Date.now();
    console.log(`[Onboarding] Submission started at: ${new Date(startTime).toISOString()}`);
    
    setSubmitting(true);
    setSlowSubmission(false);
    setIsLoading(true, 'Menyimpan profil kamu...');

    // Timeout guard: show reassurance message if > 4s
    const timeoutMsg = setTimeout(() => {
      setSlowSubmission(true);
      setIsLoading(true, 'Menyimpan data... Mohon tunggu sebentar');
    }, 4000);

    try {
      // Use the userId prop - no need to await getUser() again
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          full_name: formData.fullName,
          email: formData.email,
          gender: formData.gender,
          age: parseInt(formData.age),
          birth_place: formData.birthPlace,
          birth_date: formData.birthDate,
          province_id: formData.province.id,
          province_name: formData.province.name,
          city_id: formData.city.id,
          city_name: formData.city.name,
          district_id: formData.district.id,
          district_name: formData.district.name,
          address_detail: formData.addressDetail,
          is_profile_complete: true
        });

      clearTimeout(timeoutMsg);
      const endTime = Date.now();
      console.log(`[Onboarding] Supabase response in ${endTime - startTime}ms`);

      if (error) throw error;

      // Optimistic UI: Sync cookie and state immediately
      document.cookie = "hr_profile_complete=true; path=/; max-age=31536000; SameSite=Lax";
      setSuccess(true);
      setIsLoading(false); // Stop general loading to show success UI

      // Fast redirect after success UI is shown
      setTimeout(() => {
        router.push('/');
        // Do refresh in background or later to avoid blocking
      }, 600);
      
    } catch (err: unknown) {
      clearTimeout(timeoutMsg);
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      console.error('[Onboarding] Error:', message, err);
      alert('Gagal menyimpan data. Coba lagi.');
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Pendaftaran Berhasil! 👋</h2>
        <p className="text-slate-500 font-medium">Selamat datang di HR-One Donuts. Kamu sedang diarahkan ke beranda...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Nama Lengkap</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Masukkan nama lengkap"
            className={`block w-full rounded-2xl border px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-slate-50 ${errors.fullName ? 'border-red-300' : 'border-slate-200'}`}
          />
          {errors.fullName && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Email (Akun)</label>
          <input
            type="email"
            value={formData.email}
            readOnly
            className="block w-full rounded-2xl border border-slate-200 px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-base text-slate-400 outline-none bg-slate-100 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Jenis Kelamin</label>
          <div className="flex gap-3">
            {['male', 'female'].map((g) => (
              <label 
                key={g}
                className={`flex-1 flex items-center justify-center gap-2 h-12 md:h-13 rounded-2xl border-2 cursor-pointer transition-all ${
                  formData.gender === g 
                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm shadow-primary/10' 
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
                <span className="material-symbols-outlined text-[18px]">
                  {g === 'male' ? 'male' : 'female'}
                </span>
                <span className="text-[13px] md:text-sm">{g === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
              </label>
            ))}
          </div>
          {errors.gender && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.gender}</p>}
        </div>

        <div>
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Usia (Tahun)</label>
          <input
            type="number"
            min="13"
            max="100"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="Contoh: 25"
            className={`block w-full rounded-2xl border px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-slate-50 ${errors.age ? 'border-red-300' : 'border-slate-200'}`}
          />
          {errors.age && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.age}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Tempat Lahir</label>
          <input
            type="text"
            value={formData.birthPlace}
            onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
            placeholder="Kota kelahiran"
            className={`block w-full rounded-2xl border px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-slate-50 ${errors.birthPlace ? 'border-red-300' : 'border-slate-200'}`}
          />
          {errors.birthPlace && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.birthPlace}</p>}
        </div>

        <div>
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Tanggal Lahir</label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className={`block w-full rounded-2xl border px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-base text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-slate-50 ${errors.birthDate ? 'border-red-300' : 'border-slate-200'}`}
          />
          {errors.birthDate && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.birthDate}</p>}
        </div>
      </div>

      <div className="bg-slate-50/50 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 space-y-4">
        <h3 className="text-[14px] md:text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
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
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Alamat Lengkap (Opsional)</label>
          <textarea
            value={formData.addressDetail}
            onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
            placeholder="Nama jalan, nomor rumah, RT/RW, or ciri-ciri bangunan"
            rows={2}
            className="block w-full rounded-2xl border border-slate-200 px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-white resize-none"
          />
        </div>
      </div>

      <div className="pt-2 sticky bottom-0 bg-white/90 backdrop-blur-md -mx-5 px-5 py-4 pb-safe border-t border-slate-100 md:relative md:bg-transparent md:border-none md:p-0 md:m-0 z-20">
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-14 rounded-2xl bg-primary text-white font-black text-base md:text-lg shadow-lg shadow-primary/25 hover:bg-blue-600 hover:shadow-primary/35 focus:ring-4 focus:ring-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="size-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{slowSubmission ? 'Sedang memproses... Mohon tunggu' : 'Menyimpan...'}</span>
            </>
          ) : (
            <>
              <span>Selesai & Mulai Belanja</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>
        {slowSubmission && (
          <p className="mt-3 text-center text-xs font-bold text-amber-600 animate-pulse">
            Koneksi agak lambat, tetap di sini ya... 🍩
          </p>
        )}
      </div>
    </form>
  );
}
