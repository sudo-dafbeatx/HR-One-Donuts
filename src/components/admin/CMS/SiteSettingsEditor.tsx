'use client';

import { useState } from 'react';
import { SiteSettings } from '@/types/cms';
import { AdminInput, AdminButton, AdminCard } from './Shared';
import { updateSettings } from '@/app/admin/actions';
import ImageUploader from '../ImageUploader';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function SiteSettingsEditor({ initialData }: { initialData?: SiteSettings }) {
  const [settings, setSettings] = useState<SiteSettings>(initialData || {
    store_name: 'HR-One Donuts',
    tagline: 'Fresh and Smooth',
    whatsapp_number: '',
    phone_number: '',
    email: '',
    address: '',
    opening_hours: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await updateSettings('site_info', settings as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Error updating settings: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <AdminCard title="Informasi Toko & Kontak">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <AdminInput 
              label="Nama Toko" 
              value={settings.store_name} 
              onChange={e => setSettings({...settings, store_name: e.target.value})}
              required 
            />
            <AdminInput 
              label="Tagline" 
              value={settings.tagline} 
              onChange={e => setSettings({...settings, tagline: e.target.value})}
            />
            <AdminInput 
              label="Nomor WhatsApp (Format: 628...)" 
              value={settings.whatsapp_number} 
              onChange={e => setSettings({...settings, whatsapp_number: e.target.value})}
              required 
            />
            <AdminInput 
              label="Nomor Telepon" 
              value={settings.phone_number} 
              onChange={e => setSettings({...settings, phone_number: e.target.value})}
            />
          </div>
          <div className="space-y-4">
            <AdminInput 
              label="Email" 
              type="email"
              value={settings.email} 
              onChange={e => setSettings({...settings, email: e.target.value})}
            />
            <AdminInput 
              label="Jam Operasional" 
              placeholder="Senin - Minggu: 08:00 - 20:00"
              value={settings.opening_hours} 
              onChange={e => setSettings({...settings, opening_hours: e.target.value})}
            />
            <AdminInput 
              label="Alamat Lengkap" 
              multiline 
              rows={3}
              value={settings.address} 
              onChange={e => setSettings({...settings, address: e.target.value})}
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Logo Toko">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 italic">Upload logo resmi toko yang akan digunakan di seluruh aplikasi.</p>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/2">
              <ImageUploader 
                currentImage={settings.logo_url}
                onImageUploaded={(url) => setSettings({...settings, logo_url: url})}
                label="Logo (Rekomendasi PNG Transparan atau 512x512px)"
                aspectRatio="square"
              />
            </div>
            
            <div className="w-full md:w-1/4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preview Logo</label>
              <div className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center p-4 group">
                <div className="relative size-full">
                  <Image 
                    src={settings.logo_url || "/images/logo-hr-one.png"} 
                    alt="Logo Preview" 
                    fill 
                    className="object-contain"
                    unoptimized={settings.logo_url?.startsWith('http')}
                  />
                </div>
                {settings.logo_url && (
                  <button 
                    type="button"
                    onClick={() => setSettings({...settings, logo_url: undefined})}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform z-10 opacity-0 group-hover:opacity-100"
                    title="Hapus Logo"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSettings({...settings, logo_url: undefined})}
                className="mt-2 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
              >
                Reset ke Default
              </button>
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Social Media Links">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AdminInput 
            label="Instagram URL" 
            placeholder="https://instagram.com/..."
            value={settings.instagram_url || ''} 
            onChange={e => setSettings({...settings, instagram_url: e.target.value})}
          />
          <AdminInput 
            label="Facebook URL" 
            placeholder="https://facebook.com/..."
            value={settings.facebook_url || ''} 
            onChange={e => setSettings({...settings, facebook_url: e.target.value})}
          />
          <AdminInput 
            label="TikTok URL" 
            placeholder="https://tiktok.com/@..."
            value={settings.tiktok_url || ''} 
            onChange={e => setSettings({...settings, tiktok_url: e.target.value})}
          />
        </div>
      </AdminCard>

      <AdminCard title="Banner Utama (Hero)">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 italic">Upload gambar banner yang akan tampil di bagian atas halaman beranda.</p>
          
          <div className="flex flex-col gap-8">
            {/* Desktop Banner */}
            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-slate-100 pb-8">
              <div className="w-full md:w-1/2">
                <ImageUploader 
                  currentImage={settings.hero_banner_image}
                  onImageUploaded={(url) => setSettings({...settings, hero_banner_image: url})}
                  label="Desktop Banner (Rekomendasi 21:9 atau 1200x400px)"
                  aspectRatio="video"
                />
              </div>
              
              <div className="w-full md:w-1/2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preview Desktop</label>
                <div className="relative aspect-[21/9] bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center group">
                  {settings.hero_banner_image ? (
                    <>
                      <Image 
                        src={settings.hero_banner_image} 
                        alt="Hero Banner Preview" 
                        fill 
                        className="object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => setSettings({...settings, hero_banner_image: undefined})}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform z-10 opacity-0 group-hover:opacity-100"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <PhotoIcon className="w-8 h-8" />
                      <span className="text-[10px] font-medium">Belum ada gambar desktop</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Banner */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/2">
                <ImageUploader 
                  currentImage={settings.hero_banner_mobile_image}
                  onImageUploaded={(url) => setSettings({...settings, hero_banner_mobile_image: url})}
                  label="Mobile Banner (Rekomendasi 16:9 atau 600x338px)"
                  aspectRatio="video"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  *Opsional. Jika kosong, akan menggunakan gambar desktop.
                </p>
              </div>
              
              <div className="w-full md:w-1/3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preview Mobile</label>
                <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center group">
                  {settings.hero_banner_mobile_image ? (
                    <>
                      <Image 
                        src={settings.hero_banner_mobile_image} 
                        alt="Mobile Banner Preview" 
                        fill 
                        className="object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => setSettings({...settings, hero_banner_mobile_image: undefined})}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform z-10 opacity-0 group-hover:opacity-100"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <PhotoIcon className="w-8 h-8" />
                      <span className="text-[10px] font-medium">Belum ada gambar mobile</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminCard>

      <div className="flex items-center gap-4">
        <AdminButton type="submit" isLoading={loading}>
          Simpan Pengaturan
        </AdminButton>
        {success && (
          <span className="text-green-600 font-bold animate-bounce">
            ✅ Pengaturan berhasil disimpan!
          </span>
        )}
      </div>
    </form>
  );
}
