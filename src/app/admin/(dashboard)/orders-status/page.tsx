import { createServiceRoleClient } from '@/lib/supabase/server';
import AdminOrdersStatusClient from '@/components/admin/AdminOrdersStatusClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersStatusPage() {
  const supabase = createServiceRoleClient();
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles:user_id (full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Status Pesanan</h1>
          <p className="text-slate-500 text-sm font-medium">Pantau dan kelola proses pemenuhan donat pelanggan.</p>
        </div>
        
        <AdminOrdersStatusClient initialOrders={(orders as any) || []} />
      </div>
    </div>
  );
}
