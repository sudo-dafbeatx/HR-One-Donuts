'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCurrentUserProfile() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function createOrder(data: {
  total_amount: number;
  total_items: number;
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  session_id?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Anda harus login untuk membuat pesanan');

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_amount: data.total_amount,
      total_items: data.total_items,
      items: data.items,
      session_id: data.session_id,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw new Error('Gagal menyimpan riwayat pesanan');
  }

  revalidatePath('/profile');
  return { success: true, order };
}
