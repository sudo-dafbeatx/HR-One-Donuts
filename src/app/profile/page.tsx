'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  UserCircleIcon, 
  MapPinIcon, 
  PhoneIcon, 
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
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
  const router = useRouter();
  const supabase = createClient();

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
        .single();
      
      setProfile(profileData);

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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Profile */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="size-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
              <UserCircleIcon className="size-14" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black text-slate-900 mb-1">{profile?.full_name || 'Pelanggan Setia'}</h1>
              <p className="text-slate-500 font-medium mb-4">{profile?.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600">
                  <PhoneIcon className="size-4 text-primary" />
                  {profile?.phone || '-'}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600">
                  <MapPinIcon className="size-4 text-primary" />
                  {profile?.address ? 'Alamat Tersimpan' : 'Alamat Belum Diatur'}
                </div>
              </div>
            </div>

            <button 
              onClick={handleSignOut}
              className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <ArrowRightOnRectangleIcon className="size-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar / Info Detail */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Informasi Detail</h2>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alamat Pengiriman</p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">
                    {profile?.address || 'Belum ada alamat pengiriman yang ditambahkan.'}
                  </p>
                </div>
                
                <button className="w-full py-3 border-2 border-slate-100 hover:border-primary hover:text-primary transition-all rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest">
                  Edit Profil
                </button>
              </div>
            </div>

            <Link href="/catalog" className="block bg-primary p-6 rounded-3xl shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <ShoppingBagIcon className="size-8 text-white/40" />
                <ChevronRightIcon className="size-5 text-white/60 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-white font-black text-lg">Pesan Donat Lagi?</p>
              <p className="text-white/70 text-sm font-medium">Banyak varian baru yang nungguin kamu!</p>
            </Link>
          </div>

          {/* Activity / Order History */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              Riwayat Pesanan
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full">
                {orders.length}
              </span>
            </h2>

            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <ShoppingBagIcon className="size-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada pesanan</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">
                  Sepertinya kamu belum pernah memesan donat. Yuk mulai pesanan pertama kamu!
                </p>
                <Link 
                  href="/catalog" 
                  className="inline-flex h-12 items-center px-8 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Lihat Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="size-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        <ShoppingBagIcon className="size-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-slate-800">Order #{order.id.slice(0, 8)}</p>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-green-50 text-green-600 rounded-md">Lunas</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarDaysIcon className="size-3" />
                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span>•</span>
                          <span>{order.total_items} Item</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-black text-slate-900 mb-1">Rp {order.total_amount.toLocaleString('id-ID')}</p>
                      <button className="text-xs font-black text-primary hover:underline">Detail</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
