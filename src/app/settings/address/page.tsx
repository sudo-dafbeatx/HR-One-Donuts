'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  MapPinIcon, 
  PlusIcon, 
  HomeIcon, 
  BriefcaseIcon,
  TrashIcon,
  MapIcon
} from '@heroicons/react/24/outline';

interface Address {
  id: string;
  label: string;
  is_default: boolean;
  full_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  street_name: string;
  building_name?: string;
  house_no?: string;
  additional_details?: string;
  latitude?: number;
  longitude?: number;
}

interface ProfileAddress {
  id: string;
  full_name: string | null;
  phone?: string | null;
  province_name: string;
  city_name: string;
  district_name: string;
  address_detail: string | null;
  province_id?: string;
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Address>>({
    label: 'Rumah',
    phone: '+62'
  });
  const [profileAddress, setProfileAddress] = useState<ProfileAddress | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAddresses() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      setAddresses(data || []);
      
      if (!data || data.length === 0) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileData && profileData.province_id) {
          setProfileAddress(profileData);
        }
      }
      setLoading(false);
    }
    fetchAddresses();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_addresses')
      .upsert({
        ...formData,
        user_id: user.id
      });

    if (!error) {
      setIsAdding(false);
      window.location.reload(); // Refresh to show new list
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus alamat ini?')) return;
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setAddresses(addresses.filter(a => a.id !== id));
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-slate-800">Alamat Saya</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-xl active:scale-95 transition-all"
        >
          <PlusIcon className="size-4" />
          Tambah Baru
        </button>
      </div>

      {isAdding ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Atur Lokasi Baru</p>
            <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-slate-400 font-bold hover:text-slate-600">Batal</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button 
               type="button"
               onClick={() => setFormData({...formData, label: 'Rumah'})}
               className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all font-bold text-xs ${formData.label === 'Rumah' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 text-slate-400'}`}
             >
               <HomeIcon className="size-4" /> Rumah
             </button>
             <button 
               type="button"
               onClick={() => setFormData({...formData, label: 'Kantor'})}
               className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all font-bold text-xs ${formData.label === 'Kantor' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 text-slate-400'}`}
             >
               <BriefcaseIcon className="size-4" /> Kantor
             </button>
          </div>

          <div className="space-y-4">
            <Input label="Nama Lengkap" value={formData.full_name} onChange={v => setFormData({...formData, full_name: v})} placeholder="Contoh: Budi Sudarsono" />
            <Input label="Nomor Telepon" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="+62..." />
            
            <div className="grid grid-cols-2 gap-4">
              <Input label="Provinsi" value={formData.province} onChange={v => setFormData({...formData, province: v})} placeholder="Jawa Barat" />
              <Input label="Kota" value={formData.city} onChange={v => setFormData({...formData, city: v})} placeholder="Bogor" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Kecamatan" value={formData.district} onChange={v => setFormData({...formData, district: v})} placeholder="Babakan Madang" />
              <Input label="Kode Pos" value={formData.postal_code} onChange={v => setFormData({...formData, postal_code: v})} placeholder="16810" />
            </div>

            <Input label="Nama Jalan" value={formData.street_name} onChange={v => setFormData({...formData, street_name: v})} placeholder="Jl. Raya Utama" />
            
            <div className="grid grid-cols-2 gap-4">
              <Input label="Gedung (Opsional)" value={formData.building_name} onChange={v => setFormData({...formData, building_name: v})} />
              <Input label="No. Rumah" value={formData.house_no} onChange={v => setFormData({...formData, house_no: v})} />
            </div>

            <textarea 
              placeholder="Detail Lainnya (Blok/Unit No., Patokan)"
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[100px] resize-none"
              value={formData.additional_details}
              onChange={e => setFormData({...formData, additional_details: e.target.value})}
            />

            {/* Map Placeholder */}
            <div className="h-40 bg-slate-100 rounded-3xl flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200">
               <MapIcon className="size-8 text-slate-300" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 text-center">Visual Bantu Peta (OpenStreetMap)</p>
               <button type="button" className="text-[10px] text-primary font-black underline uppercase tracking-widest">Tampilkan Lokasi di Peta</button>
            </div>
          </div>

          <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
            Simpan Alamat
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {addresses.length > 0 ? addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative group overflow-hidden">
               {addr.is_default && <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest">Utama</div>}
               
               <div className="flex items-start gap-4 mb-4">
                 <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
                    {addr.label === 'Kantor' ? <BriefcaseIcon className="size-6" /> : <HomeIcon className="size-6" />}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{addr.label}</p>
                    <p className="font-bold text-slate-800 truncate">{addr.full_name}</p>
                    <p className="text-xs text-slate-500 font-medium">({addr.phone})</p>
                 </div>
               </div>

               <div className="space-y-1 mb-6">
                 <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                   {addr.building_name ? `${addr.building_name}, ` : ''}
                   {addr.street_name} No. {addr.house_no}, {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                 </p>
                 {addr.additional_details && (
                   <p className="text-xs text-slate-400 font-medium font-serif                   p-2 rounded-lg border-l-2 border-slate-200 mt-2">
                     📝 &quot;{addr.additional_details}&quot;
                   </p>
                 )}
               </div>

               <div className="flex gap-2">
                 {!addr.is_default && (
                   <button className="flex-1 h-10 border border-slate-100 text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">Utamakan</button>
                 )}
                 <button className="flex-1 h-10 border border-slate-100 text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">Edit</button>
                 <button 
                   onClick={() => handleDelete(addr.id)}
                   className="size-10 flex items-center justify-center text-red-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                   <TrashIcon className="size-5" />
                 </button>
               </div>
            </div>
          )) : (
            <div className="bg-white rounded-4xl border border-dashed border-slate-200 p-12 text-center">
              <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <MapPinIcon className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada alamat</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">Tambahkan alamat pengiriman favoritmu sekarang.</p>
              
              {profileAddress && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-left animate-in slide-in-from-top-4 duration-500">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Saran dari Profil</p>
                  <p className="text-sm font-bold text-slate-800 mb-1">{profileAddress.full_name}</p>
                  <p className="text-xs text-slate-500 mb-4 whitespace-pre-line">
                    {profileAddress.district_name}, {profileAddress.city_name}, {profileAddress.province_name}
                    {profileAddress.address_detail ? `\n${profileAddress.address_detail}` : ''}
                  </p>
                  <button 
                    onClick={() => {
                      setFormData({
                        label: 'Utama',
                        full_name: profileAddress.full_name || '',
                        phone: profileAddress.phone || '+62',
                        province: profileAddress.province_name,
                        city: profileAddress.city_name,
                        district: profileAddress.district_name,
                        street_name: profileAddress.address_detail || '',
                        is_default: true
                      });
                      setIsAdding(true);
                    }}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all"
                  >
                    Gunakan Alamat Pendaftaran
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string, value: string | undefined, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="text" 
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
      />
    </div>
  );
}
