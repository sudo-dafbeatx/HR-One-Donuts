'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CameraIcon, ChevronLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useLoading } from '@/context/LoadingContext';
import { useErrorPopup } from '@/context/ErrorPopupContext';
import { uploadAvatar as uploadAvatarAction } from '@/app/actions/avatar-actions';
import Image from 'next/image';

export default function EditProfilePage() {
  const { setIsLoading } = useLoading();
  const { showError } = useErrorPopup();
  const supabase = createClient();
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phoneNumber: '',
    birthPlace: '',
    birthDate: '',
    gender: '',
    addressDetail: '',
    fb: '',
    ig: '',
    tt: ''
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || '');

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setProfileId(data.id);
        setFormData({
          fullName: data.full_name || '',
          username: data.username || '',
          phoneNumber: data.phone_number || data.phone || '',
          birthPlace: data.birth_place || '',
          birthDate: data.birth_date || '',
          gender: data.gender || '',
          addressDetail: data.address_detail || '',
          fb: data.social_links?.facebook || '',
          ig: data.social_links?.instagram || '',
          tt: data.social_links?.tiktok || ''
        });
        setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    };
    fetchProfileData();
  }, [supabase]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];

      setIsLoading(true, 'Mengoptimalkan foto...');
      const fd = new FormData();
      fd.append('file', file);

      const result = await uploadAvatarAction(fd);
      if (result.url) {
        setAvatarUrl(result.url);
        // Also update avatar in DB immediately
        if (profileId) {
          await supabase.from('user_profiles').update({ avatar_url: result.url }).eq('id', profileId);
        }
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showError('Gagal Upload', 'Gagal mengunggah foto. Coba lagi.');
    } finally {
      setUploading(false);
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;

    setIsLoading(true, 'Menyimpan perubahan...');
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.fullName,
          username: formData.username.toLowerCase().replace(/\s/g, ''),
          phone_number: formData.phoneNumber,
          phone: formData.phoneNumber,
          birth_place: formData.birthPlace,
          birth_date: formData.birthDate || null,
          gender: formData.gender || null,
          address_detail: formData.addressDetail,
          age: formData.birthDate ? calculateAge(formData.birthDate) : null,
          social_links: {
            facebook: formData.fb || null,
            instagram: formData.ig || null,
            tiktok: formData.tt || null
          },
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => {
        router.back();
        router.refresh();
      }, 800);
    } catch (error) {
      console.error('Save profile error:', error);
      showError('Gagal Simpan', (error as Error)?.message || 'Gagal menyimpan perubahan. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateStr: string) => {
    if (!dateStr) return null;
    const birthDate = new Date(dateStr);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) computedAge--;
    return computedAge;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl transition-colors active:scale-95">
            <ChevronLeftIcon className="size-5 text-slate-700" />
          </button>
          <h1 className="text-lg font-black text-slate-900">Edit Akun</h1>
        </div>
        <button 
          form="edit-form"
          type="submit"
          disabled={saved}
          className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${saved ? 'bg-green-500 text-white' : 'bg-primary text-white shadow-md shadow-primary/20'}`}
        >
          {saved ? '✓ Tersimpan' : 'Simpan'}
        </button>
      </div>

      <form id="edit-form" onSubmit={handleSave} className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Avatar Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="size-28 rounded-full overflow-hidden border-4 border-white shadow-xl relative bg-slate-100 ring-2 ring-slate-100">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="size-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <span className="material-symbols-outlined text-4xl text-primary/40">person</span>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 size-9 bg-primary text-white rounded-full shadow-lg flex items-center justify-center overflow-hidden hover:scale-110 active:scale-90 transition-all ring-3 ring-white">
                <CameraIcon className="size-4 pointer-events-none" />
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  disabled={uploading} 
                />
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 text-sm">{formData.fullName || 'Nama Anda'}</p>
              <p className="text-[10px] text-slate-400 font-medium">{email}</p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <SectionHeader icon="badge" title="Informasi Pribadi" />
          
          <FormField label="Nama Lengkap" icon="person" required>
            <input 
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="form-input"
              placeholder="Nama lengkap Anda"
              required
            />
          </FormField>

          <FormField label="Username" icon="alternate_email">
            <input 
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value.replace(/\s/g, '').toLowerCase()})}
              className="form-input"
              placeholder="username_unik"
            />
          </FormField>

          <FormField label="Email" icon="mail">
            <input 
              type="email"
              value={email}
              disabled
              className="form-input !bg-slate-100 !text-slate-400 cursor-not-allowed"
            />
          </FormField>

          <FormField label="Nomor Handphone" icon="call">
            <input 
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value.replace(/\D/g, '')})}
              className="form-input"
              placeholder="08123456789"
            />
          </FormField>
        </div>

        {/* Birth & Gender */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <SectionHeader icon="cake" title="Profil & Kelahiran" />

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Jenis Kelamin" icon="wc">
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="form-input appearance-none"
              >
                <option value="">Pilih</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </FormField>

            <FormField label="Tempat Lahir" icon="location_on">
              <input 
                type="text"
                value={formData.birthPlace}
                onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                className="form-input"
                placeholder="Jakarta"
              />
            </FormField>
          </div>

          <FormField label="Tanggal Lahir" icon="calendar_today">
            <input 
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              className="form-input"
            />
          </FormField>

          {formData.birthDate && (
            <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 rounded-2xl border border-primary/10">
              <CheckCircleIcon className="size-4 text-primary shrink-0" />
              <p className="text-xs font-bold text-primary">
                Usia Anda: {calculateAge(formData.birthDate)} tahun
              </p>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <SectionHeader icon="home" title="Alamat Domisili" />
          
          <FormField label="Detail Alamat" icon="edit_location_alt">
            <textarea 
              value={formData.addressDetail}
              onChange={(e) => setFormData({...formData, addressDetail: e.target.value})}
              className="form-input min-h-[100px] resize-none"
              placeholder="Nama jalan, nomor rumah, RT/RW..."
            />
          </FormField>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
          <SectionHeader icon="share" title="Media Sosial" subtitle="Opsional" />

          <FormField label="Facebook" icon="facebook">
            <input 
              type="text"
              value={formData.fb}
              onChange={(e) => setFormData({...formData, fb: e.target.value})}
              className="form-input"
              placeholder="ID Facebook / URL"
            />
          </FormField>

          <FormField label="Instagram" icon="photo_camera">
            <input 
              type="text"
              value={formData.ig}
              onChange={(e) => setFormData({...formData, ig: e.target.value})}
              className="form-input"
              placeholder="@username_instagram"
            />
          </FormField>

          <FormField label="TikTok" icon="music_note">
            <input 
              type="text"
              value={formData.tt}
              onChange={(e) => setFormData({...formData, tt: e.target.value})}
              className="form-input"
              placeholder="@username_tiktok"
            />
          </FormField>
        </div>

        {/* Bottom Save Button (mobile) */}
        <button 
          type="submit"
          disabled={saved}
          className={`w-full py-4 font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white shadow-primary/20'}`}
        >
          {saved ? (
            <><CheckCircleIcon className="size-5" /> Perubahan Tersimpan</>
          ) : (
            'Simpan Perubahan'
          )}
        </button>
      </form>

      <style jsx>{`
        .form-input {
          width: 100%;
          padding: 14px 16px;
          background: rgb(248, 250, 252);
          border: 1px solid rgb(241, 245, 249);
          border-radius: 16px;
          font-size: 14px;
          font-weight: 500;
          color: rgb(30, 41, 59);
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 234 179 8) / 0.15);
          border-color: rgba(var(--color-primary-rgb, 234 179 8) / 0.3);
        }
        .form-input::placeholder {
          color: rgb(203, 213, 225);
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-50">
      <div className="size-8 bg-slate-50 rounded-xl flex items-center justify-center">
        <span className="material-symbols-outlined text-[16px] text-slate-400">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{title}</p>
        {subtitle && <p className="text-[9px] text-slate-400 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}

function FormField({ label, icon, required, children }: { label: string; icon: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[13px] text-slate-300">{icon}</span>
        {label}
        {required && <span className="text-red-400 text-[8px]">*</span>}
      </label>
      {children}
    </div>
  );
}
