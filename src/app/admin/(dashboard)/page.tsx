import { createServerSupabaseClient } from '@/lib/supabase/server';

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
  icon?: React.ReactNode;
  trend?: string;
}

function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <p className="text-3xl font-black text-heading">{value}</p>
      {trend && <p className="text-xs text-slate-500 mt-2">{trend}</p>}
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

  const orders = ordersData as Order[] | null;

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
  const totalItems = orders?.reduce((sum, o) => sum + (o.total_items || 0), 0) || 0;

  // Get recent orders (last 10)
  const recentOrders = orders?.slice(0, 10) || [];

  // Calculate top products
  const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
  
  orders?.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: OrderItem) => {
        const productId = item.product_id || item.name;
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.name,
            count: 0,
            revenue: 0
          };
        }
        productSales[productId].count += item.quantity || 0;
        productSales[productId].revenue += (item.price * item.quantity) || 0;
      });
    }
  });

  const topProducts = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-heading">Dashboard</h1>
        <div className="text-sm text-slate-500">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {ordersError && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          <strong>Database belum setup:</strong> Tabel belum dibuat. Silakan buat tabel di Supabase SQL Editor.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Pesanan" 
          value={totalOrders}
          trend="Semua waktu"
        />
        <StatsCard 
          title="Total Pendapatan" 
          value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
          trend="Semua waktu"
        />
        <StatsCard 
          title="Total Item Terjual" 
          value={totalItems}
          trend="Semua waktu"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-heading mb-4">Produk Terlaris</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        Rp {product.revenue.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{product.count}</p>
                    <p className="text-xs text-slate-500">terjual</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Belum ada data penjualan</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-heading mb-4">Pesanan Terbaru</h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-3 border border-slate-100 rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      Rp {order.total_amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="text-sm text-slate-700">
                    {order.total_items} item
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Belum ada pesanan</p>
          )}
        </div>
      </div>
    </div>
  );
}
