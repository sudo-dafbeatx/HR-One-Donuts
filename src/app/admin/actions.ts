'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { HeroData, Product, Reason, PromoEvent } from '@/types/cms';

// Helper to verify admin role
async function checkAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Admin access only');
  }
  return supabase;
}

// --- Hero Actions ---
export async function updateHero(data: HeroData) {
  const supabase = await checkAdmin();
  
  // First, check if a hero record exists
  const { data: existing } = await supabase
    .from('hero')
    .select('id')
    .single();
  
  const heroData = {
    ...data,
    updated_at: new Date().toISOString()
  };
  
  // Include ID if record exists to ensure update instead of insert
  if (existing?.id) {
    heroData.id = existing.id;
  }
  
  const { error } = await supabase
    .from('hero')
    .upsert(heroData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  revalidatePath('/admin/(dashboard)/content');
  return { success: true };
}

// --- Product Actions ---
export async function saveProduct(data: Partial<Product>) {
  const supabase = await checkAdmin();
  
  // Basic validation for mandatory fields
  if (!data.name || data.price === undefined || data.price < 0) {
    throw new Error('Name and a valid price are required');
  }

  const productData = {
    ...data,
    id: data.id || crypto.randomUUID(),
    category: data.category || 'Uncategorized',
    stock: data.stock ?? 0,
    is_active: data.is_active ?? true,
    sale_type: data.sale_type || 'normal',
    package_type: data.package_type || 'satuan',
    updated_at: new Date().toISOString()
  };
  
  const { error } = await supabase
    .from('products')
    .upsert(productData);

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  revalidatePath('/catalog');
  revalidatePath('/admin/products');
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await checkAdmin();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  
  revalidatePath('/catalog');
  revalidatePath('/admin/products');
  return { success: true };
}

// --- Reasons Actions ---
export async function saveReason(data: Partial<Reason>) {
  const supabase = await checkAdmin();
  
  // Generate ID for new reasons if not provided
  const reasonData = {
    ...data,
    id: data.id || crypto.randomUUID(),
    updated_at: new Date().toISOString()
  };
  
  const { error } = await supabase
    .from('reasons')
    .upsert(reasonData);

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  revalidatePath('/admin/(dashboard)/content');
  return { success: true };
}

// --- Settings Actions ---
export async function updateSettings(key: string, value: Record<string, unknown>) {
  const supabase = await checkAdmin();
  
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  return { success: true };
}

// --- Event Actions ---
export async function saveEvent(data: Partial<PromoEvent>) {
  const supabase = await checkAdmin();
  
  const eventData = {
    ...data,
    id: data.id || crypto.randomUUID(),
    updated_at: new Date().toISOString()
  };
  
  const { error } = await supabase
    .from('events')
    .upsert(eventData);

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  revalidatePath('/admin/(dashboard)/content');
  return { success: true };
}

export async function deleteEvent(id: string) {
  const supabase = await checkAdmin();
  
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  revalidatePath('/admin/(dashboard)/content');
  return { success: true };
}

// --- Sales Tracking ---
export async function incrementSoldCount(productIds: string[]) {
  const supabase = await createServerSupabaseClient();
  
  // We don't check admin here because this is called by public users on order
  for (const id of productIds) {
    const { error } = await supabase.rpc('increment_product_sold', { product_id: id });
    
    if (error) {
      // Fallback if RPC is not defined yet
      const { data: p } = await supabase.from('products').select('sold_count').eq('id', id).single();
      await supabase.from('products').update({ sold_count: (p?.sold_count || 0) + 1 }).eq('id', id);
    }
  }
  
  revalidatePath('/');
  revalidatePath('/catalog');
  return { success: true };
}
