'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  UserCircleIcon, 
  MapPinIcon, 
  PhoneIcon, 
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useLoading } from '@/context/LoadingContext';
import { uploadAvatar, setPredefinedAvatar } from '@/app/actions/avatar-actions';
import Image from 'next/image';
import { CameraIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  role: string;
}

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  total_items: number;
  items: OrderItem[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  
  const { setIsLoading } = useLoading();
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const predefinedAvatars = [
    { id: '1', name: 'Classic Pink', url: '/avatars/classic.png' },
    { id: '2', name: 'Strawberry Wink', url: '/avatars/strawberry.png' },
    { id: '3', name: 'Matcha Cool', url: '/avatars/matcha.png' },
    { id: '4', name: 'Caramel Smile', url: '/avatars/caramel.png' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?next=/profile');
        return;
      }

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Safer than single()
      
      if (profileData) {
        setProfile(profileData);
        setEditFullName(profileData.full_name || '');
        setEditPhone(profileData.phone || '');
        setEditAddress(profileData.address || '');
      }

      // Fetch Recent Orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);
      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsLoading(true, 'Memperbarui profil...');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFullName,
          phone: editPhone,
          address: editAddress
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        full_name: editFullName,
        phone: editPhone,
        address: editAddress
      });
      setIsEditing(false);
      // Success feedback would be nice, but keeping it simple as per request
      await new Promise(r => setTimeout(r, 600));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal';
      alert(`Gagal memperbarui profil: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSelect = async (url: string) => {
    if (!profile) return;
    setIsLoading(true, 'Menyetel avatar...');
    try {
      await setPredefinedAvatar(url);
      setProfile({ ...profile, avatar_url: url });
      setShowAvatarSelector(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal';
      alert(`Gagal: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true, 'Mengunggah & mengubah ke WebP...');
    try {
      const result = await uploadAvatar(formData);
      if (result.success) {
        setProfile({ ...profile, avatar_url: result.url });
        setShowAvatarSelector(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal upload avatar';
      alert(`Gagal upload: ${message}`);
    } finally {
      setIsLoading(false);
      // Reset input value so same file can be selected again
      if (e.target) e.target.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 overflow-x-hidden">
      {/* Premium Header with Gradient */}
      <div className="relative bg-gradient-to-br from-primary via-blue-600 to-cyan-500">
        {/* Abstract shapes for premium feel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 anim-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-12 pb-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
            {/* Profile Avatar with premium border */}
            <div className="relative group shrink-0">
              <div className="size-28 md:size-32 bg-white/20 backdrop-blur-md rounded-3xl border-2 border-white/30 flex items-center justify-center text-white shadow-2xl transition-all duration-500 overflow-hidden relative">
                {profile?.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <UserCircleIcon className="size-16 md:size-20" />
                )}
                
                {/* Hover Overlay */}
                <button 
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1"
                >
                  <CameraIcon className="size-6 text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Ubah Foto</span>
                </button>
              </div>
              
              <div className="absolute -bottom-2 -right-2 bg-green-400 size-6 rounded-full border-4 border-primary shadow-lg animate-pulse"></div>
              
              {/* Mobile Change Button */}
              <button 
                onClick={() => setShowAvatarSelector(true)}
                className="md:hidden absolute -top-1 -right-1 size-8 bg-white text-primary rounded-full shadow-lg flex items-center justify-center active:scale-95"
              >
                <CameraIcon className="size-4" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left text-white min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-white/10">
                <span className="size-1.5 bg-cyan-300 rounded-full animate-ping"></span>
                Pelanggan
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1 drop-shadow-sm truncate">
                {profile?.full_name || 'Teman Donat'}
              </h1>
              <p className="text-blue-50/80 font-medium mb-0 opacity-90 text-sm md:text-base truncate">{profile?.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSignOut}
                className="px-6 h-12 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <ArrowRightOnRectangleIcon className="size-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Selection Modal/Overlay */}
      {showAvatarSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowAvatarSelector(false)}
          ></div>
          
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Ubah Foto Profil</h3>
                  <p className="text-sm text-slate-500 font-medium italic">Pilih karakter donat atau foto sendiri</p>
                </div>
                <button 
                  onClick={() => setShowAvatarSelector(false)}
                  className="size-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"
                >
                  <span className="material-symbols-outlined text-slate-500">close</span>
                </button>
              </div>

              {/* Predefined Avatars */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <SparklesIcon className="size-4 text-primary" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pilih Karakter Donat</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {predefinedAvatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarSelect(avatar.url)}
                      type="button"
                      className="relative grow aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-primary transition-all active:scale-95 group"
                    >
                      <Image 
                        src={avatar.url} 
                        alt={avatar.name} 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <PhotoIcon className="size-4 text-primary" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Atau Gunakan Foto HP</span>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="absolute opacity-0 pointer-events-none" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />

                <button 
                  onClick={triggerFileUpload}
                  type="button"
                  className="flex items-center justify-center gap-3 w-full h-20 border-2 border-dashed border-slate-200 rounded-3xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <CameraIcon className="size-8 text-slate-400 group-hover:text-primary" />
                    <span className="font-bold text-slate-600 group-hover:text-primary">Ambil dari Galeri</span>
                  </div>
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-tight">Otomatis Convert ke WebP & Hemat Kuota</p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
              <button 
                onClick={() => setShowAvatarSelector(false)}
                className="text-sm font-bold text-slate-400 hover:text-slate-600"
              >
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-10 md:-mt-12 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Content Info */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 border border-white">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Informasi Pribadi</h2>
                  <p className="text-sm text-slate-500 font-medium">Lengkapi detail Anda untuk pesanan lebih cepat</p>
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-5 py-2.5 rounded-xl hover:bg-primary/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Profil
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
                      <input 
                        type="text" 
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                        placeholder="Nama Lengkap"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Nomor Telepon</label>
                      <input 
                        type="tel" 
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                        placeholder="0812xxxx"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Alamat Pengiriman</label>
                    <textarea 
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium min-h-[120px]"
                      placeholder="Alamat lengkap pengiriman"
                      required
                    />
                  </div>
                  <div className="flex gap-3 justify-end pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                    <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                      <PhoneIcon className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">WhatsApp</p>
                      <p className="font-bold text-slate-700">{profile?.phone || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                    <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                      <MapPinIcon className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Alamat Utama</p>
                      <p className="font-bold text-slate-700 leading-snug">
                        {profile?.address || 'Belum diatur'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                  Riwayat Pesanan Terbaru
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-extrabold rounded-full border border-primary/10">
                    {orders.length}
                  </span>
                </h2>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 p-12 text-center shadow-sm">
                  <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <ShoppingBagIcon className="size-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada pesanan</h3>
                  <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm font-medium">
                    Wah, dompetnya masih gatal? Yuk pilih donat favoritmu sekarang!
                  </p>
                  <Link 
                    href="/catalog" 
                    className="inline-flex h-12 items-center px-8 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                  >
                    Buka Katalog Menu
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id}
                      className="bg-white p-6 rounded-[1.5rem] border border-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex items-center justify-between group cursor-default"
                    >
                      <div className="flex items-center gap-5">
                        <div className="size-14 bg-blue-50/50 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <ShoppingBagIcon className="size-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-extrabold text-slate-800">#{order.id.slice(0, 8).toUpperCase()}</p>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-green-500/10 text-green-600 rounded-lg">Success</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <CalendarDaysIcon className="size-3.5" />
                              {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                            </span>
                            <span className="size-1 bg-slate-200 rounded-full"></span>
                            <span>{order.total_items} item donat</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-black text-slate-900 text-lg">Rp {order.total_amount.toLocaleString('id-ID')}</p>
                        <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline px-2 py-1">Detail 👉</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/catalog" className="relative block h-full min-h-[220px] bg-primary rounded-[2rem] shadow-xl shadow-primary/30 overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <div className="size-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                  <ShoppingBagIcon className="size-6 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2 leading-tight">Lapar melanda?<br/>Donat solusinya!</h3>
                <p className="text-blue-50/70 font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  Pesan Sekarang <ArrowRightOnRectangleIcon className="size-4 rotate-180" />
                </p>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
