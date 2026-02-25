'use client';

import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import GeoDropdown from './GeoDropdown';
import { useLoading } from '@/context/LoadingContext';
import { useErrorPopup } from '@/context/ErrorPopupContext';
import { useRouter } from 'next/navigation';
import { normalizePhoneToID } from '@/lib/phone';

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
    username: '',
    email: initialData.email,
    phone: '',
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
  const [phoneDuplicate, setPhoneDuplicate] = useState(false);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const phoneDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [agreements, setAgreements] = useState({
    terms: false,
    syarat: false,
    cookies: false,
    notifikasi: false,
  });
  const { setIsLoading } = useLoading();
  const { showError } = useErrorPopup();
  const router = useRouter();
  const supabase = createClient();

  const calculateAge = (dateStr: string) => {
    if (!dateStr) return '';
    const birthDate = new Date(dateStr);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    return computedAge.toString();
  };

  const allAgreed = agreements.terms && agreements.syarat && agreements.cookies && agreements.notifikasi;

  const checkPhoneDuplicate = useCallback(async (phoneValue: string) => {
    if (!phoneValue || phoneValue.length < 8) {
      setPhoneDuplicate(false);
      return;
    }
    setPhoneChecking(true);
    try {
      const res = await fetch(`/api/check-phone?phone=${encodeURIComponent(phoneValue)}`);
      const data = await res.json();
      setPhoneDuplicate(data.exists === true);
    } catch {
      setPhoneDuplicate(false);
    } finally {
      setPhoneChecking(false);
    }
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
    setPhoneDuplicate(false);
    if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current);
    phoneDebounceRef.current = setTimeout(() => checkPhoneDuplicate(value), 500);
  }, [checkPhoneDuplicate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Nama wajib diisi';
    if (!formData.username.trim()) {
      newErrors.username = 'Username wajib diisi';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.username)) {
      newErrors.username = 'Username hanya boleh huruf, angka, underscore, dan titik';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Nomor HP wajib diisi';
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
    if (phoneDuplicate) newErrors.phone = 'Nomor HP sudah terdaftar';
    if (!allAgreed) newErrors.agreements = 'Semua persetujuan wajib dicentang';

    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    if (!isValid) {
      // Find the first error and alert it, so mobile users know what's wrong if it's off-screen
      const firstErrorKey = Object.keys(newErrors)[0];
      showError('Pendaftaran Gagal', newErrors[firstErrorKey]);
    }
    return isValid;
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
      const normalizedPhone = normalizePhoneToID(formData.phone);

      // Update basic profiles table for phone/name sync and unique constraint
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: formData.fullName,
          phone: normalizedPhone,
        }, { onConflict: 'id' });

      if (profileError) {
        if (profileError.code === '23505' || profileError.message.toLowerCase().includes('unique')) {
           throw new Error('Nomor HP ini sudah terdaftar. Pakai nomor lain.');
        }
        throw profileError;
      }

      // Update detailed user_profiles
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          full_name: formData.fullName,
          username: formData.username.toLowerCase(),
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

      if (error) throw error;

      // Also create an initial entry in user_addresses Table
      const { error: addressError } = await supabase
        .from('user_addresses')
        .insert({
          user_id: userId,
          label: 'Rumah',
          full_name: formData.fullName,
          phone: normalizedPhone,
          province: formData.province.name,
          city: formData.city.name,
          district: formData.district.name,
          postal_code: '00000', // Required by schema, can be updated later by user
          street_name: formData.addressDetail || 'Alamat Pendaftaran',
          is_default: true
        });

      if (addressError) throw addressError;

      // Optimistic UI: Sync cookie and state immediately
      document.cookie = "hr_profile_complete=true; path=/; max-age=31536000; SameSite=Lax";
      setSuccess(true);
      setIsLoading(false); // Stop general loading to show success UI
      
      // Removed the automatic hidden setTimeout redirect.
      // The user will explicitly click "Mulai Berbelanja" the success screen.
      
    } catch (err: unknown) {
      clearTimeout(timeoutMsg);
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      console.error('[Onboarding] Error:', message, err);
      showError('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan data. Coba lagi.');
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-200">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Pendaftaran Berhasil! 👋</h2>
        <p className="text-slate-500 font-medium mb-8">Selamat datang di HR-One Donuts. Profil kamu sudah lengkap.</p>
        
        <button 
          onClick={() => {
            router.push('/');
            setTimeout(() => router.refresh(), 100);
          }}
          className="w-full max-w-sm h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-lg shadow-primary/25 hover:bg-blue-600 hover:shadow-primary/35 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>Mulai Berbelanja</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
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

        <div>
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s/g, '').toLowerCase() })}
            placeholder="Pilih username unik"
            className={`block w-full rounded-2xl border px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-slate-50 ${errors.username ? 'border-red-300' : 'border-slate-200'}`}
          />
          {errors.username && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.username}</p>}
          <p className="mt-1.5 ml-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold">Digunakan untuk profil publikmu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Nomor HP</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="0812xxxx"
            className={`block w-full rounded-2xl border px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-slate-50 ${phoneDuplicate ? 'border-red-400 bg-red-50' : errors.phone ? 'border-red-300' : 'border-slate-200'}`}
          />
          {phoneChecking && <p className="mt-1.5 ml-1 text-[10px] text-slate-400">Memeriksa nomor...</p>}
          {phoneDuplicate && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">Nomor HP sudah terdaftar. Gunakan nomor lain.</p>}
          {errors.phone && !phoneDuplicate && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.phone}</p>}
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
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Tanggal Lahir</label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value, age: calculateAge(e.target.value) })}
            className={`block w-full rounded-2xl border px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-base text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-slate-50 ${errors.birthDate ? 'border-red-300' : 'border-slate-200'}`}
          />
          {errors.birthDate && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.birthDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Tempat Lahir</label>
          <input
            type="text"
            value={formData.birthPlace}
            onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
            placeholder="Contoh: Jakarta"
            className={`block w-full rounded-2xl border px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-base text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none bg-slate-50 ${errors.birthPlace ? 'border-red-300' : 'border-slate-200'}`}
          />
          {errors.birthPlace && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.birthPlace}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-[11px] md:text-sm font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Usia (Tahun)</label>
          <input
            type="number"
            value={formData.age}
            readOnly
            placeholder="Terisi Otomatis"
            className={`block w-full rounded-2xl border px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-base text-slate-400 outline-none bg-slate-100 cursor-not-allowed ${errors.age ? 'border-red-300' : 'border-slate-200'}`}
          />
          {errors.age && <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.age}</p>}
        </div>
      </div>

      <div className="bg-slate-50/50 p-5 md:p-8 rounded-[1.5rem] md:rounded-4xl border border-slate-100 space-y-4">
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

      {/* Mandatory Agreements */}
      <div className="bg-blue-50/50 p-5 md:p-8 rounded-[1.5rem] md:rounded-4xl border border-blue-100 space-y-3">
        <h3 className="text-[14px] md:text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Persetujuan Wajib
        </h3>
        {[
          { key: 'terms' as const, label: 'Saya menyetujui Terms of Service', link: '/terms' },
          { key: 'syarat' as const, label: 'Saya menyetujui Syarat & Ketentuan', link: '/privacy' },
          { key: 'cookies' as const, label: 'Saya menyetujui pengumpulan Cookies', link: '/cookies' },
          { key: 'notifikasi' as const, label: 'Saya bersedia menerima Notifikasi', link: null },
        ].map((item) => (
          <label key={item.key} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreements[item.key]}
              onChange={(e) => setAgreements(prev => ({ ...prev, [item.key]: e.target.checked }))}
              className="mt-0.5 w-5 h-5 rounded border-2 border-slate-300 text-primary focus:ring-primary/30 accent-primary cursor-pointer shrink-0"
            />
            <span className="text-[12px] md:text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
              {item.label}
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary font-bold ml-1 hover:underline">
                  (Baca)
                </a>
              )}
            </span>
          </label>
        ))}
        {errors.agreements && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.agreements}</p>}
      </div>

      <div className="pt-2 sticky bottom-0 bg-white/90 backdrop-blur-md -mx-5 px-5 py-4 pb-safe border-t border-slate-100 md:relative md:bg-transparent md:border-none md:p-0 md:m-0 z-20">
        <button
          type="submit"
          disabled={submitting || !allAgreed || phoneDuplicate}
          className={`w-full h-14 rounded-2xl text-white font-black text-base md:text-lg shadow-lg focus:ring-4 focus:ring-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${allAgreed && !phoneDuplicate ? 'bg-primary shadow-primary/25 hover:bg-blue-600 hover:shadow-primary/35' : 'bg-slate-300 cursor-not-allowed'}`}
        >
          {submitting ? (
            <>
              <div className="size-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{slowSubmission ? 'Sedang memproses... Mohon tunggu' : 'Menyimpan...'}</span>
            </>
          ) : (
            <>
              <span>Selesai</span>
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </>
          )}
        </button>
        {slowSubmission && (
          <p className="mt-3 text-center text-xs font-bold text-amber-600 animate-pulse">
            Koneksi agak lambat, tetap di sini ya... 🍩
          </p>
        )}
        <div className="mt-4 text-center">
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_CONTACT_WA_NUMBER || '62895351251395'}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline">
            Butuh bantuan? Hubungi Admin
          </a>
        </div>
      </div>
    </form>
  );
}
