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

interface MetricCardProps {
  title: string;
  value: string | number;
  percentChange?: number;
  icon: React.ElementType;
  progress?: number;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, percentChange, icon: Icon, progress = 0, trend = 'neutral' }: MetricCardProps) {
  // Determine trend indicators
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  const isNeutral = trend === 'neutral';

  let trendColorClass = 'text-slate-400 bg-slate-100'; // neutral
  if (isUp) trendColorClass = 'text-emerald-600 bg-emerald-100';
  if (isDown) trendColorClass = 'text-red-600 bg-red-100';

  return (
    <div className="w-full relative overflow-hidden rounded-2xl border border-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-[--color-card-bg,#ffffff] group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col p-5">
      {/* Background Glow Effect synced to Theme Primary */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-10 pointer-events-none transition-colors duration-500"
        style={{ background: 'var(--color-primary, #1152d4)' }}
      />
      
      {/* Header (Title & Icon) */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-slate-100/80 transition-colors">
          <Icon className="w-6 h-6 text-slate-600 transition-transform group-hover:scale-110" style={{ color: 'var(--color-primary, #1152d4)' }} />
        </div>
        
        {percentChange !== undefined && (
           <div className={`flex items-center gap-1 mt-1 px-2 py-1 rounded-md text-xs font-bold ${trendColorClass}`}>
            {isUp && <span className="material-symbols-outlined text-[12px]">trending_up</span>}
            {isDown && <span className="material-symbols-outlined text-[12px]">trending_down</span>}
            {isNeutral && <span className="material-symbols-outlined text-[12px]">horizontal_rule</span>}
            <span>{percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Content (Value & Title) */}
      <div className="relative z-10 flex-1 flex flex-col justify-end">
        <div className="font-black text-3xl text-slate-800 mb-1 leading-none tracking-tight" style={{ color: 'var(--color-text, #1e293b)' }}>
          {value}
        </div>
        <div className="text-sm font-semibold text-slate-500">{title}</div>
      </div>

      {/* Progress Bar (Dynamic Theme Color) */}
      <div className="mt-5 w-full bg-slate-100 rounded-full h-1.5 relative overflow-hidden z-10">
        <div 
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${Math.min(Math.max(progress, 2), 100)}%`, // min 2% so it's always slightly visible
            backgroundColor: isDown ? '#ef4444' : 'var(--color-primary, #1152d4)' // Red if down, theme primary otherwise
          }}
        />
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
  let usersList: { created_at: string; last_sign_in_at: string | null }[] = [];
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
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  
  // Orders 7 days calculation
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  let currentRevenue = 0;
  let prevRevenue = 0;
  
  if (orders) {
    orders.forEach(o => {
      const orderDate = new Date(o.created_at);
      if (orderDate >= sevenDaysAgo) {
        currentRevenue += (o.total_amount || 0);
      } else if (orderDate >= fourteenDaysAgo && orderDate < sevenDaysAgo) {
        prevRevenue += (o.total_amount || 0);
      }
    });
  }

  const revenueChange = prevRevenue === 0 
    ? (currentRevenue > 0 ? 100 : 0) 
    : ((currentRevenue - prevRevenue) / prevRevenue) * 100;

  // Users calculation
  const totalUsers = usersList.length;
  let currentUsers = 0;
  let prevUsers = 0;
  
  usersList.forEach(u => {
    const uDate = new Date(u.created_at);
    if (uDate >= sevenDaysAgo) {
      currentUsers++;
    } else if (uDate >= fourteenDaysAgo && uDate < sevenDaysAgo) {
      prevUsers++;
    }
  });

  const usersChange = prevUsers === 0 
    ? (currentUsers > 0 ? 100 : 0) 
    : ((currentUsers - prevUsers) / prevUsers) * 100;

  const activeUsersToday = usersList.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= todayStart).length;
  const activeProducts = products?.filter(p => p.is_active).length || 0;
  const totalProductsCount = products?.length || 1; // Avoid division by zero
  
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

  // Metric Cards Mapping
  const metrics = [
    {
      title: "Total Pendapatan",
      value: `Rp ${currentRevenue.toLocaleString('id-ID')}`,
      percentChange: revenueChange,
      icon: CurrencyDollarIcon,
      trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'neutral' as const,
      progress: Math.min(100, (currentRevenue / (prevRevenue || 1)) * 50) // visual relation to prev
    },
    {
      title: "Total User Database",
      value: totalUsers,
      percentChange: usersChange,
      icon: UserGroupIcon,
      trend: usersChange > 0 ? 'up' : usersChange < 0 ? 'down' : 'neutral' as const,
      progress: Math.min(100, (currentUsers / (totalUsers || 1)) * 100)
    },
    {
      title: "User Aktif (24 jam)",
      value: activeUsersToday,
      percentChange: 0, // No easy week-over-week daily active sequence from db right now, keep neutral
      icon: CheckBadgeIcon,
      trend: 'neutral' as const,
      progress: Math.min(100, (activeUsersToday / (totalUsers || 1)) * 100)
    },
    {
      title: "Katalog Aktif",
      value: activeProducts,
      percentChange: undefined, // Hide percentage for this since it's a fixed pool
      icon: ArchiveBoxIcon,
      trend: 'neutral' as const,
      progress: (activeProducts / totalProductsCount) * 100
    }
  ];

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

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {metrics.map((metric, idx) => (
          <MetricCard 
            key={idx}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            percentChange={metric.percentChange}
            progress={metric.progress}
            trend={metric.trend as 'up' | 'down' | 'neutral' | undefined}
          />
        ))}
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
