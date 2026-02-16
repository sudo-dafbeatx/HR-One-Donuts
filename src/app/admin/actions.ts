'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Product, PromoEvent, UITheme } from '@/types/cms';
import { extractStoragePath } from '@/lib/image-utils';
import { deleteImage } from './upload-actions';

// Helper to verify admin role
async function checkAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error(' [checkAdmin] Profile error:', profileError);
  }

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Admin access only');
  }
  return supabase;
}


// --- Product Actions ---
export async function saveProduct(data: Partial<Product>) {
  const supabase = await checkAdmin();
  
  // Basic validation for mandatory fields
  if (!data.name?.trim() || data.price === undefined || data.price < 0) {
    throw new Error('Nama produk dan harga yang valid wajib diisi');
  }

  if (!data.category || data.category === '') {
    throw new Error('Kategori wajib dipilih');
  }

  // Ensure and sanitize product data
  const productData = {
    id: data.id || crypto.randomUUID(),
    name: data.name.trim(),
    price: data.price,
    description: data.description || '',
    image_url: data.image_url || null,
    category: data.category || 'Uncategorized',
    stock: data.stock ?? 0,
    is_active: data.is_active ?? true,
    sale_type: data.sale_type || 'normal',
    discount_percent: data.discount_percent ?? 0,
    promo_start: data.promo_start || null,
    promo_end: data.promo_end || null,
    tag: data.tag || null,
    variants: data.variants || [],
    sold_count: data.sold_count ?? 0,
    updated_at: new Date().toISOString()
  };
  
  // Cleanup old image if the URL changed
  if (data.id && data.image_url) {
    try {
      const { data: oldData } = await supabase.from('products').select('image_url').eq('id', data.id).maybeSingle();
      if (oldData?.image_url && oldData.image_url !== data.image_url) {
        const oldPath = extractStoragePath(oldData.image_url);
        if (oldPath) await deleteImage(oldPath).catch(err => console.error('Cleanup error:', err));
      }
    } catch (e) {
      console.error('Image cleanup error:', e);
    }
  }

  try {
    const { data: savedData, error } = await supabase
      .from('products')
      .upsert(productData)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Upsert Error:', error);
      throw new Error(`Gagal menyimpan produk: ${error.message}`);
    }
    
    revalidatePath('/');
    revalidatePath('/catalog');
    revalidatePath('/admin/products');
    return { success: true, data: savedData as Product };
  } catch (err: unknown) {
    console.error('SaveProduct Crash:', err);
    throw err instanceof Error ? err : new Error('An unexpected error occurred during saveProduct');
  }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await checkAdmin();
    
    // Cleanup image first
    try {
      const { data: product } = await supabase.from('products').select('image_url').eq('id', id).maybeSingle();
      if (product?.image_url) {
        const path = extractStoragePath(product.image_url);
        if (path) await deleteImage(path).catch(err => console.error('Cleanup error:', err));
      }
    } catch (err) {
      console.warn('Image cleanup skipped:', err);
    }

    // Delete associated reviews first (in case CASCADE isn't set up)
    try {
      await supabase
        .from('product_reviews')
        .delete()
        .eq('product_id', id);
    } catch (err) {
      console.warn('Review cleanup skipped (table may not exist):', err);
    }

    // Delete product from database
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete product error:', error);
      return { success: false, error: `Gagal menghapus produk: ${error.message}` };
    }
    
    // Revalidate paths
    revalidatePath('/catalog');
    revalidatePath('/admin/products');

    return { success: true, id };
  } catch (err) {
    console.error('deleteProduct error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menghapus produk' };
  }
}


// --- Settings Actions ---
export async function updateSettings(key: string, value: Record<string, unknown>) {
  const supabase = await checkAdmin();
  
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
  
  revalidatePath('/');
  revalidatePath('/login');
  revalidatePath('/admin', 'layout');
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
    const { data: oldData } = await supabase.from('events').select('banner_image_url').eq('id', data.id).maybeSingle();
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
  const { data: event } = await supabase.from('events').select('banner_image_url').eq('id', id).maybeSingle();
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
      const { data: p } = await supabase.from('products').select('sold_count').eq('id', id).maybeSingle();
      await supabase.from('products').update({ sold_count: (p?.sold_count || 0) + 1 }).eq('id', id);
    }
  }
  
  revalidatePath('/');
  revalidatePath('/catalog');
  return { success: true };
}

// --- Category Actions ---
export async function saveCategory(name: string, id?: string) {
  const supabase = await checkAdmin();
  
  const { error } = await supabase
    .from('categories')
    .upsert({ 
      id: id || crypto.randomUUID(), 
      name, 
      updated_at: new Date().toISOString() 
    });

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/products');
  revalidatePath('/admin/content');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await checkAdmin();
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/products');
  revalidatePath('/admin/content');
  return { success: true };
}

// --- Theme Actions ---
export async function saveTheme(data: Partial<UITheme>) {
  const supabase = await checkAdmin();
  
  // Get existing theme row or create
  const { data: existing } = await supabase
    .from('ui_theme')
    .select('id')
    .limit(1)
    .maybeSingle();

  const themeData = {
    ...(existing?.id ? { id: existing.id } : {}),
    primary_color: data.primary_color,
    secondary_color: data.secondary_color,
    background_color: data.background_color,
    text_color: data.text_color,
    heading_font: data.heading_font,
    body_font: data.body_font,
    button_radius: data.button_radius,
    card_radius: data.card_radius,
    card_bg_color: data.card_bg_color,
    card_border_color: data.card_border_color,
    search_bg_color: data.search_bg_color,
    search_text_color: data.search_text_color,
    account_bg_color: data.account_bg_color,
    account_text_color: data.account_text_color,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('ui_theme')
    .upsert(themeData);

  if (error) throw new Error(error.message);
  
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/catalog');
  revalidatePath('/admin/theme');
  return { success: true };
}

// --- UI Copy Actions ---
export async function saveUICopy(key: string, value: string) {
  const supabase = await checkAdmin();
  
  const { error } = await supabase
    .from('ui_copy')
    .upsert({ 
      key, 
      value, 
      updated_at: new Date().toISOString() 
    }, { onConflict: 'key' });

  if (error) throw new Error(error.message);
  
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/catalog');
  revalidatePath('/admin/theme');
  return { success: true };
}

export async function saveUICopyBatch(entries: { key: string; value: string }[]) {
  const supabase = await checkAdmin();
  
  const data = entries.map(e => ({
    key: e.key,
    value: e.value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('ui_copy')
    .upsert(data, { onConflict: 'key' });

  if (error) throw new Error(error.message);
  
  revalidatePath('/', 'layout');
  revalidatePath('/admin/theme');
  return { success: true };
}

// --- Development Actions ---
export async function resetSalesData() {
  const supabase = await checkAdmin();
  
  // Use the atomic RPC function for a safer reset
  const { error } = await supabase.rpc('reset_all_sales_data');
  
  if (error) {
    console.error(' [resetSalesData] RPC Error:', error);
    
    // Fallback if RPC is not yet applied to the database
    const { error: deleteOrdersError } = await supabase
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteOrdersError) throw new Error('Reset failed: ' + deleteOrdersError.message);

    await supabase
      .from('products')
      .update({ sold_count: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000');
  }

  // Revalidate dashboard to show new (empty) stats
  revalidatePath('/admin');
  revalidatePath('/');
  
  return { success: true };
}
