'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Product, PromoEvent } from '@/types/cms';
import { extractStoragePath } from '@/lib/image-utils';
import { deleteImage } from './upload-actions';

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
  
  // Cleanup old image if the URL changed
  if (data.id && data.image_url) {
    const { data: oldData } = await supabase.from('products').select('image_url').eq('id', data.id).single();
    if (oldData?.image_url && oldData.image_url !== data.image_url) {
      const oldPath = extractStoragePath(oldData.image_url);
      if (oldPath) await deleteImage(oldPath).catch(err => console.error('Cleanup error:', err));
    }
  }

  const { data: savedData, error } = await supabase
    .from('products')
    .upsert(productData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  revalidatePath('/catalog');
  revalidatePath('/admin/products');
  return { success: true, data: savedData as Product };
}

export async function deleteProduct(id: string) {
  const supabase = await checkAdmin();
  
  // Cleanup image first
  const { data: product } = await supabase.from('products').select('image_url').eq('id', id).single();
  if (product?.image_url) {
    const path = extractStoragePath(product.image_url);
    if (path) await deleteImage(path).catch(err => console.error('Cleanup error:', err));
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  
  revalidatePath('/catalog');
  revalidatePath('/admin/products');
  return { success: true, id };
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
  
  // Cleanup old image if URL changed
  if (data.id && data.banner_image_url) {
    const { data: oldData } = await supabase.from('events').select('banner_image_url').eq('id', data.id).single();
    if (oldData?.banner_image_url && oldData.banner_image_url !== data.banner_image_url) {
      const oldPath = extractStoragePath(oldData.banner_image_url);
      if (oldPath) await deleteImage(oldPath).catch(err => console.error('Cleanup error:', err));
    }
  }

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
  
  // Cleanup image first
  const { data: event } = await supabase.from('events').select('banner_image_url').eq('id', id).single();
  if (event?.banner_image_url) {
    const path = extractStoragePath(event.banner_image_url);
    if (path) await deleteImage(path).catch(err => console.error('Cleanup error:', err));
  }

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
