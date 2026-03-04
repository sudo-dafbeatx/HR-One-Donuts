import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import OrderDetailClient from '@/components/detail/OrderDetailClient';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params;
  const supabase = await createServerSupabaseClient();
  
  // 1. Authenticate Request
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect('/login');
  }

  // 2. Fetch Order Data
  const { data: order, error: orderResultError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', authData.user.id)
    .single();

  if (orderResultError) {
    console.error(' [Order Detail] Supabase Error fetching order:', orderResultError.message);
    throw new Error(`Gagal memuat detail pesanan: ${orderResultError.message}`);
  }

  if (!order) {
    notFound();
  }

  return (
    <OrderDetailClient 
      initialOrder={order as unknown as Parameters<typeof OrderDetailClient>[0]['initialOrder']} 
    />
  );
}
