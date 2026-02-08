'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { HeroData, Product, Reason } from '@/types/cms';

// --- Hero Actions ---
export async function updateHero(data: HeroData) {
  const supabase = await createServerSupabaseClient();
  
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
  const supabase = await createServerSupabaseClient();
  
  // Generate ID for new products if not provided
  const productData = {
    ...data,
    id: data.id || crypto.randomUUID(),
    updated_at: new Date().toISOString()
  };
  
  const { error } = await supabase
    .from('products')
    .upsert(productData);

  if (error) throw new Error(error.message);
  
  revalidatePath('/catalog');
  revalidatePath('/admin/products');
  revalidatePath('/admin/(dashboard)/content');
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
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  return { success: true };
}
