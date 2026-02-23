import { createServiceRoleClient } from '@/lib/supabase/server';
import AdminOrdersStatusClient from '@/components/admin/AdminOrdersStatusClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersStatusPage() {
  let orders: Record<string, unknown>[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = createServiceRoleClient();

    // Step 1: Fetch orders WITHOUT join (most reliable)
    const { data: rawOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('[AdminOrdersStatus] Orders fetch error:', ordersError);
      fetchError = ordersError.message;
    } else if (rawOrders && rawOrders.length > 0) {
      // Step 2: Fetch profile names separately to avoid broken joins
      const userIds = [...new Set(rawOrders.map(o => o.user_id).filter(Boolean))];
      
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (profiles) {
          profileMap = Object.fromEntries(
            profiles.map(p => [p.id, p.full_name || 'Pelanggan'])
          );
        }
      }

      // Step 3: Merge profile names into orders
      orders = rawOrders.map(order => ({
        ...order,
        profiles: order.user_id ? { full_name: profileMap[order.user_id] || 'Pelanggan' } : null,
      }));
    }
  } catch (err) {
    console.error('[AdminOrdersStatus] Critical error:', err);
    fetchError = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Status Pesanan</h1>
          <p className="text-slate-500 text-sm font-medium">Pantau dan kelola proses pemenuhan donat pelanggan.</p>
        </div>
        
        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-sm text-red-700">
            <p className="font-bold">⚠️ Gagal memuat data pesanan</p>
            <p className="text-xs mt-1 font-mono">{fetchError}</p>
          </div>
        )}

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <AdminOrdersStatusClient initialOrders={orders as any} />
      </div>
    </div>
  );
}
