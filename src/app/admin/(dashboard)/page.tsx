import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  CurrencyDollarIcon, 
  ArchiveBoxIcon, 
  CheckBadgeIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  ListBulletIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/cms';
import ResetSalesButton from '@/components/admin/ResetSalesButton';
import DashboardChart from '@/components/admin/DashboardChart';

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
  iconColor: string;
}

function StatsCard({ title, value, icon: Icon, iconColor }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] p-6 h-full transition-all hover:shadow-[0_0_28px_0_rgba(82,63,105,0.12)] border border-slate-100/50">
      <div className="flex flex-wrap items-center">
        <div className="flex-1 pr-4">
          <div className="font-bold text-2xl text-slate-800 mb-1">{value}</div>
          <div className="text-sm text-slate-500 font-medium">{title}</div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 group">
            <Icon className={`w-7 h-7 ${iconColor} transition-transform group-hover:scale-110`} />
          </div>
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

  // Fetch admin logs
  const { data: logsData } = await supabase
    .from('admin_logs')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch Users
  const { data: adminUsersResult } = await supabase.rpc('get_admin_users_list');
  let usersList: { last_sign_in_at: string | null }[] = [];
  try {
    if (typeof adminUsersResult === 'string') {
      usersList = JSON.parse(adminUsersResult);
    } else if (Array.isArray(adminUsersResult)) {
      usersList = adminUsersResult;
    }
  } catch(e: unknown) {
    console.error(e);
  }

  // Fetch products for extra stats
  const { data: productsData } = await supabase
    .from('products')
    .select('*');

  const orders = ordersData as Order[] | null;
  const products = productsData as Product[] | null;

  // Calculate stats
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
  
  const activeProducts = products?.filter(p => p.is_active).length || 0;
  const lowStockProducts = products?.filter(p => p.stock <= 5 && p.stock > 0).length || 0;
  
  // User Stats
  const totalUsers = usersList.length;
  const today = new Date();
  today.setHours(0,0,0,0);
  const activeUsersToday = usersList.filter((u: { last_sign_in_at: string | null }) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= today).length;
  
  // Get recently added products
  const recentlyAddedProducts = [...(products || [])]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between pb-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Store Overview</h2>
        </div>
      </div>

      {ordersError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-3 mb-6">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          <p><strong>Database Connection Issue:</strong> Please ensure the database tables are properly configured in Supabase.</p>
        </div>
      )}

      {/* Primary Stats Grid (DeskApp Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Pendapatan" 
          value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
          icon={CurrencyDollarIcon}
          iconColor="text-[#09cc06]"
        />
        <StatsCard 
          title="Total Pengguna" 
          value={totalUsers}
          icon={UserGroupIcon}
          iconColor="text-[#1b00ff]"
        />
        <StatsCard 
          title="User Aktif Hari Ini" 
          value={activeUsersToday}
          icon={CheckBadgeIcon}
          iconColor="text-[#00eccf]"
        />
        <StatsCard 
          title="Total Konten Utama (Produk)" 
          value={activeProducts}
          icon={ArchiveBoxIcon}
          iconColor="text-[#ff5b5b]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Sales Chart Section */}
        <div className="lg:col-span-2">
           <DashboardChart orders={orders || []} />
        </div>

        {/* Recently Added Products List */}
        <div className="lg:col-span-2 mt-6 lg:mt-0">
          <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 h-full">
            <div className="flex flex-wrap items-center justify-between px-6 py-5 border-b border-slate-100">
              <h4 className="text-lg font-bold text-slate-800">Produk Terbaru</h4>
              <Link 
                href="/admin/products"
                className="text-sm font-semibold text-[#1b00ff] hover:text-blue-800 transition-colors"
              >
                Lihat Semua
              </Link>
            </div>
            
            <div className="p-0">
              {recentlyAddedProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Produk</th>
                        <th className="px-6 py-3 font-semibold">Kategori</th>
                        <th className="px-6 py-3 font-semibold">Harga</th>
                        <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentlyAddedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 relative overflow-hidden shrink-0">
                                {product.image_url ? (
                                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sm">🍩</div>
                                )}
                              </div>
                              <div className="font-semibold text-slate-800">{product.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-500">{product.category}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">Rp {product.price.toLocaleString('id-ID')}</td>
                          <td className="px-6 py-4 text-right">
                             <Link 
                                href={`/admin/products/${product.id}`}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 text-slate-600 hover:bg-[#1b00ff] hover:text-white transition-colors"
                             >
                                <ListBulletIcon className="w-4 h-4" />
                             </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-4 border border-slate-100">🍩</div>
                  <p className="text-slate-800 font-bold mb-1">Belum ada produk</p>
                  <p className="text-slate-500 text-sm mb-6">Mulai isi tokomu dengan produk pertama.</p>
                  <Link 
                    href="/admin/products"
                    className="px-5 py-2.5 bg-[#1b00ff] text-white rounded-md text-sm font-semibold inline-flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md shadow-[#1b00ff]/20"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Tambah Produk
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions / Alerts */}
        <div className="space-y-6 lg:col-span-1">
          {/* Action Card */}
          <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 p-6">
             <h4 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100">Aksi Cepat</h4>
             <div className="space-y-3">
               <Link 
                  href="/admin/products"
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#1b00ff] hover:bg-blue-50/50 transition-all group"
               >
                 <div className="w-10 h-10 rounded-md bg-blue-100 text-[#1b00ff] flex items-center justify-center shrink-0">
                    <PlusIcon className="w-5 h-5" />
                 </div>
                 <div>
                    <div className="font-semibold text-sm text-slate-800 group-hover:text-[#1b00ff] transition-colors">Tambah Produk Baru</div>
                    <div className="text-xs text-slate-500 mt-0.5">Edit katalog ke website</div>
                 </div>
               </Link>

               <div className="p-1">
                  <ResetSalesButton />
               </div>
             </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts > 0 && (
             <div className="bg-[#fff5f5] rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-red-100 p-6">
               <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0 mt-1">
                   <ExclamationTriangleIcon className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="font-bold text-red-800 text-lg mb-1">{lowStockProducts} Produk Menipis</h4>
                    <p className="text-sm text-red-600/80 leading-relaxed mb-4">
                      Terdapat produk dengan stok 5 atau kurang. Segera lakukan restock agar pelanggan dapat memesan!
                    </p>
                    <Link 
                      href="/admin/products"
                      className="inline-flex text-sm font-semibold text-red-700 hover:text-red-900 underline underline-offset-4"
                    >
                      Lihat Produk
                    </Link>
                 </div>
               </div>
             </div>
          )}

          {/* Admin Activity Logs */}
          <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
               <ClockIcon className="w-5 h-5 text-slate-500" />
               <h4 className="text-sm font-bold text-slate-800">Log Aktivitas Admin</h4>
             </div>
             <div className="p-0">
                {logsData && logsData.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {logsData.map((log: { id: string; created_at: string; action: string; details: string; profiles?: { full_name: string; email: string } }) => (
                      <div key={log.id} className="p-4 flex flex-col gap-1">
                        <div className="text-xs text-slate-400 font-medium">
                          {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                        <div className="text-sm text-slate-800">
                          <span className="font-semibold text-indigo-600">{log.action}:</span> {log.details}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Oleh: {log.profiles?.full_name || log.profiles?.email || 'Admin'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Belum ada log aktivitas yang tercatat.
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
