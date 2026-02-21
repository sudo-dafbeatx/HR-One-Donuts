import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  CurrencyDollarIcon, 
  ArchiveBoxIcon, 
  CheckBadgeIcon, 
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

interface RecentProductsCardProps {
  products: Product[];
}

function RecentProductsCard({ products }: RecentProductsCardProps) {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl border border-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-[var(--color-card-bg,#ffffff)] flex flex-col transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 border-b border-slate-100/60 bg-slate-50/30">
        <div>
          <h4 className="text-lg font-black tracking-tight" style={{ color: 'var(--color-text, #1e293b)' }}>
            Katalog Produk Terbaru
          </h4>
          <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-muted, #94a3b8)' }}>
            Produk terbaru yang ditambahkan
          </p>
        </div>
        <Link 
          href="/admin/products"
          className="text-[11px] font-bold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow active:scale-95"
          style={{ 
            backgroundColor: 'var(--color-primary, #1152d4)', 
            color: '#ffffff'
          }}
        >
          KELOLA SEMUA
        </Link>
      </div>

      {/* Product List */}
      <div className="p-2 md:p-3 flex flex-col gap-1">
        {products.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
             <ArchiveBoxIcon className="w-12 h-12 mb-3 opacity-20" style={{ color: 'var(--color-text, #1e293b)' }} />
             <p className="font-bold text-sm" style={{ color: 'var(--color-muted, #94a3b8)' }}>Belum ada produk</p>
          </div>
        ) : (
          products.map((product) => (
            <div 
              key={product.id} 
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50/80 transition-colors"
            >
              {/* Left & Middle: Image + Details */}
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex shrink-0 items-center justify-center relative overflow-hidden shadow-sm border border-white/50"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
                >
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <ArchiveBoxIcon className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--color-primary, #1152d4)' }} />
                  )}
                </div>
                
                <div className="flex flex-col overflow-hidden">
                  <span 
                    className="font-bold text-sm md:text-base truncate group-hover:text-primary transition-colors"
                    style={{ color: 'var(--color-text, #1e293b)' }}
                  >
                    {product.name}
                  </span>
                  <span 
                    className="text-[10px] md:text-xs font-semibold uppercase tracking-wider mt-0.5 truncate"
                    style={{ color: 'var(--color-muted, #94a3b8)' }}
                  >
                    {product.category || 'Uncategorized'}
                  </span>
                </div>
              </div>

              {/* Right: Price & Status */}
              <div className="flex flex-col items-end shrink-0 pl-3">
                <span 
                  className="font-black text-sm md:text-base tracking-tight"
                  style={{ color: 'var(--color-text, #1e293b)' }}
                >
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {product.is_active ? 'Aktif' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
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
          <RecentProductsCard products={recentlyAddedProducts} />
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
