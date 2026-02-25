'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCurrentUserProfile() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // 1. Try to fetch existing profile (merge legacy and new detailed metadata)
    const { data: legacyProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const { data: detailProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (legacyProfile || detailProfile) {
      return {
        ...legacyProfile,
        ...detailProfile
      };
    }

    // 2. Fallback: Auto-create profile if missing (safety net for failed triggers)
    console.warn(` [getCurrentUserProfile] Profile missing for user ${user.id}, performing auto-create...`);
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        role: 'user'
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error(' [getCurrentUserProfile] Auto-create failed:', insertError);
      return null;
    }

    return newProfile;
  } catch (err) {
    console.error(' [getCurrentUserProfile] Unexpected crash:', err);
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
  delivery_method?: string;
  shipping_fee?: number;
  shipping_address?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Anda harus login untuk membuat pesanan');
    // Normalize data (ensure proper types even if passed from client haphazardly)
    const finalMethod = data.delivery_method || 'delivery';
    const finalFee = finalMethod === 'pickup' ? 0 : (data.shipping_fee || 0);

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: data.total_amount,
        total_items: data.total_items,
        items: data.items,
        session_id: data.session_id,
        delivery_method: finalMethod,
        shipping_fee: finalFee,
        shipping_address: data.shipping_address || null,
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
