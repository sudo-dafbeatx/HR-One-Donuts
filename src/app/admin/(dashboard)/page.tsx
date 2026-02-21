import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  CurrencyDollarIcon, 
  ArchiveBoxIcon, 
  CheckBadgeIcon, 
  PlusIcon,
  ListBulletIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/cms';
import ResetSalesButton from '@/components/admin/ResetSalesButton';
import DashboardChart from '@/components/admin/DashboardChart';

// New Widgets
import SystemAlertsWidget from '@/components/admin/dashboard/SystemAlertsWidget';
import SystemHealthWidget from '@/components/admin/dashboard/SystemHealthWidget';
import ToDoAdminWidget from '@/components/admin/dashboard/ToDoAdminWidget';
import AutomatedInsightsWidget from '@/components/admin/dashboard/AutomatedInsightsWidget';
import AdminActivityLogsWidget from '@/components/admin/dashboard/AdminActivityLogsWidget';

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
        <div className="shrink-0">
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
  const now = new Date();

  // 1. Fetch orders
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  // 2. Fetch admin logs
  const { data: logsData } = await supabase
    .from('admin_logs')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(10); // More logs for the new widget

  // 3. Fetch Users via RPC
  const { data: adminUsersResult } = await supabase.rpc('get_admin_users_list');
  let usersList: { last_sign_in_at: string | null }[] = [];
  try {
    if (typeof adminUsersResult === 'string') {
      usersList = JSON.parse(adminUsersResult);
    } else if (Array.isArray(adminUsersResult)) {
      usersList = adminUsersResult;
    }
  } catch(e) {
    console.error('Failed to parse users:', e);
  }

  // 4. Fetch Products
  const { data: productsData } = await supabase
    .from('products')
    .select('*');

  // 5. Fetch Events (Promo)
  const { data: eventsData } = await supabase
    .from('promo_events')
    .select('*')
    .eq('is_enabled', true);

  // 6. Fetch Settings (for Checklist)
  const { data: settingsData } = await supabase
    .from('settings')
    .select('*');

  // 7. Fetch Hero (for Checklist)
  const { data: heroData } = await supabase
    .from('hero')
    .select('*')
    .limit(1);

  const orders = ordersData as Order[] | null;
  const products = productsData as Product[] | null;
  const events = eventsData || [];
  const settings = settingsData || [];
  const hero = heroData?.[0] || null;

  // --- STATS CALCULATION ---
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
  const activeProducts = products?.filter(p => p.is_active).length || 0;
  const totalUsers = usersList.length;
  
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const activeUsersToday = usersList.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= todayStart).length;
  
  const recentlyAddedProducts = [...(products || [])]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  // --- WIDGET DATA HELPERS ---
  const dbError = !!ordersError;
  const isFlashSaleDay = now.getDay() === 2 || now.getDay() === 5;
  const hasProducts = (products?.length || 0) > 0;
  
  // Checklist Logic
  const hasLogo = settings.some(s => {
    if (s.key === 'logo') return true;
    if (s.key === 'site_info' && typeof s.value === 'object' && s.value !== null) {
      return 'logo_url' in s.value && !!(s.value as { logo_url?: string }).logo_url;
    }
    return false;
  });
  const hasDescription = !!hero?.description;
  const hasActivePromo = events.length > 0;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Admin Intelligence Dashboard</h2>
      </div>

      {/* SYSTEM ALERTS AREA */}
      <SystemAlertsWidget 
        dbError={dbError} 
        hasProducts={hasProducts}
        isFlashSaleDay={isFlashSaleDay}
        activeEventsCount={events.length}
      />

      {/* PRIMARY STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Pendapatan" 
          value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
          icon={CurrencyDollarIcon}
          iconColor="text-[#09cc06]"
        />
        <StatsCard 
          title="Total User Database" 
          value={totalUsers}
          icon={UserGroupIcon}
          iconColor="text-[#1b00ff]"
        />
        <StatsCard 
          title="User Aktif (24 jam)" 
          value={activeUsersToday}
          icon={CheckBadgeIcon}
          iconColor="text-[#00eccf]"
        />
        <StatsCard 
          title="Katalog Aktif" 
          value={activeProducts}
          icon={ArchiveBoxIcon}
          iconColor="text-[#ff5b5b]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 items-start">
        
        {/* CENTER MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 p-6">
             <DashboardChart orders={orders || []} />
          </div>

          {/* Recently Added Products List */}
          <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/20">
              <h4 className="text-lg font-bold text-slate-800">Katalog Produk Terbaru</h4>
              <Link 
                href="/admin/products"
                className="text-xs font-black text-[#1b00ff] hover:text-blue-800 border-b-2 border-primary/20 hover:border-primary transition-all pb-0.5"
              >
                KELOLA SEMUA
              </Link>
            </div>
            
            <div className="p-0">
              {recentlyAddedProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100 tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-black">Produk</th>
                        <th className="px-6 py-4 font-black">Kategori</th>
                        <th className="px-6 py-4 font-black">Harga</th>
                        <th className="px-6 py-4 font-black text-right">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentlyAddedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-100 relative overflow-hidden shrink-0 shadow-sm">
                                {product.image_url ? (
                                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sm">🍩</div>
                                )}
                              </div>
                              <div className="font-bold text-slate-800 whitespace-nowrap">{product.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold uppercase text-slate-400">{product.category}</td>
                          <td className="px-6 py-4 font-black text-slate-800">Rp {product.price.toLocaleString('id-ID')}</td>
                          <td className="px-6 py-4 text-right">
                             <Link 
                                href={`/admin/products/${product.id}`}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
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
                  <p className="text-slate-800 font-black mb-1">Belum ada katalog</p>
                  <p className="text-slate-500 text-xs mb-8 max-w-xs mx-auto">Mulai isi tokomu dengan produk pertama agar website bisa mulai beroperasi.</p>
                  <Link 
                    href="/admin/products"
                    className="px-6 py-3 bg-[#1b00ff] text-white rounded-xl text-sm font-black inline-flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-[#1b00ff]/30 active:scale-95"
                  >
                    <PlusIcon className="w-4 h-4 stroke-3" />
                    Tambah Produk Sekarang
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDE WIDGETS COLUMN */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Smart Insights (AI) */}
          <AutomatedInsightsWidget stats={{
             productCount: products?.length || 0,
             orderCount: orders?.length || 0,
             userCount: totalUsers,
             activeUsersToday
          }} />

          {/* Checklist Widget */}
          <ToDoAdminWidget checks={{
             hasProducts: (products?.length || 0) > 0,
             hasLogo: hasLogo,
             hasDescription: hasDescription,
             hasActivePromo: hasActivePromo
          }} />

          {/* System Health Status */}
          <SystemHealthWidget dbStatus={dbError ? 'ERROR' : 'OK'} />

          {/* Activity Logs Widget */}
          <AdminActivityLogsWidget logs={logsData || []} />

          {/* Legacy Quick Actions Support */}
          <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 p-6">
             <h4 className="text-sm font-black text-slate-800 mb-6 pb-2 border-b border-slate-100 uppercase tracking-widest">Aksi Database</h4>
             <div className="space-y-4">
               <ResetSalesButton />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
