import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  ArchiveBoxIcon, 
  CheckBadgeIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  ListBulletIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/cms';

interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total_amount: number;
  total_items: number;
  created_at: string;
  session_id?: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  description?: string;
}

function StatsCard({ title, value, icon: Icon, color, description }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`h-1.5 w-full ${color}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:scale-110 transition-transform`}>
            <Icon className="size-6" />
          </div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        </div>
        <p className="text-4xl font-black text-slate-800 tracking-tight mb-1">{value}</p>
        {description && <p className="text-xs font-medium text-slate-500">{description}</p>}
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();

  // Fetch orders
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch products for extra stats
  const { data: productsData } = await supabase
    .from('products')
    .select('*');

  const orders = ordersData as Order[] | null;
  const products = productsData as Product[] | null;

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
  const totalItemsSold = orders?.reduce((sum, o) => sum + (o.total_items || 0), 0) || 0;
  
  const activeProducts = products?.filter(p => p.is_active).length || 0;
  const lowStockProducts = products?.filter(p => p.stock <= 5 && p.stock > 0).length || 0;
  
  // Get recently added products
  const recentlyAddedProducts = [...(products || [])]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Ringkasan Bisnis</h1>
          <p className="text-slate-500 font-medium mt-1">
            Selamat datang kembali! Ini yang terjadi dengan toko Anda hari ini.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/products"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm shadow-sm"
          >
            <ListBulletIcon className="size-4" />
            Kelola Produk
          </Link>
          <Link 
            href="/admin/products"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/20"
          >
            <PlusIcon className="size-4" />
            Tambah Produk
          </Link>
        </div>
      </div>

      {ordersError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-800 flex items-center gap-3">
          <ExclamationTriangleIcon className="size-5 shrink-0" />
          <p><strong>Koneksi Bermasalah:</strong> Pastikan tabel database sudah siap di Supabase.</p>
        </div>
      )}

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Pendapatan" 
          value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
          icon={CurrencyDollarIcon}
          color="bg-primary"
          description="Total akumulasi semua pesanan"
        />
        <StatsCard 
          title="Total Pesanan" 
          value={totalOrders}
          icon={ShoppingBagIcon}
          color="bg-primary"
          description="Jumlah paket yang telah dipesan"
        />
        <StatsCard 
          title="Item Terjual" 
          value={totalItemsSold}
          icon={ArchiveBoxIcon}
          color="bg-primary"
          description="Total donat yang keluar dari dapur"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-6 group hover:border-primary/30 transition-colors">
          <div className="size-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckBadgeIcon className="size-8" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Produk Aktif</p>
            <p className="text-3xl font-black text-slate-800">{activeProducts}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Muncul di Katalog Publik</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex items-center gap-6 group hover:border-red-300 transition-colors">
          <div className="size-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ExclamationTriangleIcon className="size-8" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Stok Menipis</p>
            <p className="text-3xl font-black text-red-600">{lowStockProducts}</p>
            <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-tighter">Perlu Restock Segera!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recently Added Products */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ClockIcon className="size-5 text-primary" />
              Produk Terbaru
            </h2>
            <Link href="/admin/products" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">
              Lihat Semua
            </Link>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            {recentlyAddedProducts.length > 0 ? (
              <div className="divide-y divide-slate-100 text-sm">
                {recentlyAddedProducts.map((product) => (
                  <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                    <div className="size-12 rounded-xl bg-slate-100 flex-shrink-0 relative overflow-hidden">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="size-full flex items-center justify-center text-xl">🍩</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{product.name}</p>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-800">Rp {product.price.toLocaleString('id-ID')}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${product.stock > 5 ? 'text-green-500' : 'text-red-500'}`}>
                        Stok: {product.stock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="size-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4 border border-slate-100">🍩</div>
                <p className="text-slate-800 font-black text-lg">Belum ada produk</p>
                <p className="text-slate-500 text-sm mb-6">Mulai isi tokomu dengan donat-donat lezat.</p>
                <Link 
                  href="/admin/products"
                  className="px-6 py-3 bg-primary text-white rounded-xl font-bold inline-flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  <PlusIcon className="size-5" />
                  Tambah Produk Pertama
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Top Product Summary */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-black text-slate-800">Ringkasan Aktivitas</h2>
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-40 bg-primary rounded-full blur-[80px] opacity-40"></div>
            
             <div className="relative z-10 space-y-6">
                <div>
                  <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Tips Operasional</p>
                  <p className="text-sm font-medium leading-relaxed text-white/80">
                    Gunakan fitur <strong>Flash Sale</strong> untuk menghabiskan stok berlebih di akhir hari dengan cepat!
                  </p>
                </div>
                
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center gap-4 text-sm font-bold">
                    <div className="size-2 rounded-full bg-green-500"></div>
                    Pesanan diproses otomatis via WA
                  </div>
                  <div className="flex items-center gap-4 text-sm font-bold text-white/60">
                    <div className="size-2 rounded-full bg-blue-500"></div>
                    Sistem dalam kondisi optimal
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
