'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { HeroData, Product, Reason } from '@/types/cms';

// --- Hero Actions ---
export async function updateHero(data: HeroData) {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('hero')
    .upsert({ ...data, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  return { success: true };
}

// --- Product Actions ---
export async function saveProduct(data: Partial<Product>) {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('products')
    .upsert({ ...data, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
  
  revalidatePath('/catalog');
  revalidatePath('/admin/products');
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createServerSupabaseClient();
  
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
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('reasons')
    .upsert(data);

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  return { success: true };
}

// --- Settings Actions ---
export async function updateSettings(key: string, value: any) {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  return { success: true };
}
