'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCurrentUserProfile() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return profile;
  } catch (err) {
    console.error('Error getting profile:', err);
    return null;
  }
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
  try {
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
      .maybeSingle();

    if (error) {
      console.error('Supabase error creating order:', error);
      throw new Error(`Gagal menyimpan pesanan: ${error.message}`);
    }

    // Attempt to track sales volume as well
    try {
      for (const item of data.items) {
        await supabase.rpc('increment_product_sold', { product_id: item.product_id });
      }
    } catch (e) {
      console.warn('RPC volume track failed:', e);
    }

    revalidatePath('/profile');
    revalidatePath('/admin');
    
    return { success: true, order };
  } catch (error: unknown) {
    console.error('CreateOrder server error:', error);
    const message = error instanceof Error ? error.message : 'Gagal memproses pesanan di server';
    throw new Error(message);
  }
}
