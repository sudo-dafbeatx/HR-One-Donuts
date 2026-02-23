'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CameraIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useLoading } from '@/context/LoadingContext';
import Image from 'next/image';

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  social_links: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  } | null;
}

export default function EditProfilePage() {
  const { setIsLoading } = useLoading();
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    fb: '',
    ig: '',
    tt: ''
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data) {
          setProfile(data);
          setFormData({
            fullName: data.full_name || '',
            username: data.username || '',
            fb: data.social_links?.facebook || '',
            ig: data.social_links?.instagram || '',
            tt: data.social_links?.tiktok || ''
          });
          setAvatarUrl(data.avatar_url);
        }
      }
      setLoading(false);
    };
    fetchProfileData();
  }, [supabase]);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400; // Smaller for mobile as requested
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas to Blob failed'));
          }, 'image/webp', 0.82); // 0.82 quality target
        };
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      setIsLoading(true, 'Mengoptimalkan foto...');
      const compressedBlob = await compressImage(file);
      
      const fileName = `${profile?.id}-${Date.now()}.webp`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, compressedBlob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // Update profile immediately
      await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile?.id);

    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true, 'Menyimpan perubahan...');
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.fullName,
          username: formData.username.toLowerCase(),
          social_links: {
            facebook: formData.fb,
            instagram: formData.ig,
            tiktok: formData.tt
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', profile?.id);

      if (error) throw error;
      
      router.back();
      router.refresh();
    } catch (error) {
      console.error('Save profile error:', error);
      alert('Gagal menyimpan perubahan');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeftIcon className="size-6 text-slate-800" />
        </button>
        <h1 className="text-xl font-black text-slate-900">Edit Akun</h1>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-8 pb-32">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="size-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-xl relative bg-slate-100">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="size-full flex items-center justify-center text-slate-300">
                   <span className="material-symbols-outlined text-5xl">person</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 size-10 bg-primary text-white rounded-full shadow-lg flex items-center justify-center overflow-hidden hover:scale-110 active:scale-95 transition-all">
              <CameraIcon className="size-5 pointer-events-none" />
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
                disabled={uploading} 
              />
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
             Ketuk ikon kamera untuk ubah foto
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <input 
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Nama kamu"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value.replace(/\s/g, '').toLowerCase()})}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="username_unik"
              required
            />
          </div>

          <div className="space-y-4 pt-4">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Social Media (Optional)</h3>
             <div className="space-y-3">
                <input 
                  type="text" 
                  value={formData.fb}
                  onChange={(e) => setFormData({...formData, fb: e.target.value})}
                  placeholder="ID Facebook / URL"
                  className="w-full px-5 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/10 outline-none"
                />
                <input 
                  type="text" 
                  value={formData.ig}
                  onChange={(e) => setFormData({...formData, ig: e.target.value})}
                  placeholder="@username_instagram"
                  className="w-full px-5 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/10 outline-none"
                />
                <input 
                  type="text" 
                  value={formData.tt}
                  onChange={(e) => setFormData({...formData, tt: e.target.value})}
                  placeholder="@username_tiktok"
                  className="w-full px-5 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/10 outline-none"
                />
             </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] hover:shadow-primary/30 transition-all uppercase tracking-widest text-sm"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
