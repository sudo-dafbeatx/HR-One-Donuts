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
import ResetSalesButton from '@/components/admin/ResetSalesButton';
import Breadcrumb from '@/components/admin/Breadcrumb';

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

function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="rounded-sm border border-slate-200 bg-white px-7.5 py-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
        <Icon className={`size-6 ${color.replace('bg-', 'text-')}`} />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-slate-800 dark:text-white">
            {value}
          </h4>
          <span className="text-sm font-medium text-slate-500">{title}</span>
        </div>
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
    <div className="space-y-6 pb-20">
      <Breadcrumb pageName="Dashboard" />

      {/* Header section with Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <ResetSalesButton />
        <Link 
          href="/admin/products"
          className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-all text-sm"
        >
          <ListBulletIcon className="size-4" />
          Kelola Produk
        </Link>
        <Link 
          href="/admin/products"
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all text-sm"
        >
          <PlusIcon className="size-4" />
          Tambah Produk
        </Link>
      </div>

      {ordersError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-3">
          <ExclamationTriangleIcon className="size-5 shrink-0" />
          <p><strong>Koneksi Bermasalah:</strong> Pastikan tabel database sudah siap di Supabase.</p>
        </div>
      )}

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 2xl:gap-7.5">
        <StatsCard 
          title="Total Pendapatan" 
          value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
          icon={CurrencyDollarIcon}
          color="bg-primary"
        />
        <StatsCard 
          title="Total Pesanan" 
          value={totalOrders}
          icon={ShoppingBagIcon}
          color="bg-primary"
        />
        <StatsCard 
          title="Item Terjual" 
          value={totalItemsSold}
          icon={ArchiveBoxIcon}
          color="bg-primary"
        />
        <StatsCard 
          title="Produk Aktif" 
          value={activeProducts}
          icon={CheckBadgeIcon}
          color="bg-primary"
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
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ClockIcon className="size-5 text-primary" />
              Produk Terbaru
            </h2>
            <Link href="/admin/products" className="text-sm font-semibold text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>
          
          <div className="rounded-sm border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
            {recentlyAddedProducts.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {recentlyAddedProducts.map((product) => (
                  <div key={product.id} className="p-4.5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0 relative overflow-hidden">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="size-full flex items-center justify-center text-xl">🍩</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white truncate group-hover:text-primary transition-colors">{product.name}</p>
                      <p className="text-xs font-medium text-slate-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-white">Rp {product.price.toLocaleString('id-ID')}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${product.stock > 5 ? 'text-green-500' : 'text-red-500'}`}>
                        Stok: {product.stock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="size-20 mx-auto bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-4xl mb-4">🍩</div>
                <p className="text-slate-800 dark:text-white font-bold text-lg">Belum ada produk</p>
                <p className="text-slate-500 text-sm mb-6">Mulai isi tokomu dengan donat-donat lezat.</p>
                <Link 
                  href="/admin/products"
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-opacity-90 transition-all"
                >
                  <PlusIcon className="size-5" />
                  Tambah Produk Pertama
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Info / Activity Summary */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wider text-sm opacity-50">Ringkasan Aktivitas</h2>
          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 relative overflow-hidden">
             <div className="relative z-10 space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white mb-2">Tips untuk Anda</h4>
                  <p className="text-sm font-medium leading-relaxed text-slate-500">
                    Gunakan fitur <strong>Flash Sale</strong> untuk menghabiskan stok berlebih di akhir hari dengan cepat! Produk yang sedang promo akan diprioritaskan di katalog.
                  </p>
                </div>
                
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                  <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <div className="size-2 rounded-full bg-green-500"></div>
                    Pesanan diproses otomatis via WhatsApp
                  </div>
                  <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <div className="size-2 rounded-full bg-[#3C50E0]"></div>
                    Koneksi ke Supabase Database Aktif
                  </div>
                  <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <div className="size-2 rounded-full bg-orange-400"></div>
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
