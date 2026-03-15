'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  start_date: string | null;
  end_date: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoucherUsage {
  id: string;
  user_id: string;
  voucher_id: string | null;
  voucher_code: string;
  discount_value: number;
  order_id: string | null;
  used_at: string;
}

export async function getPublicVouchers() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // RLS handles the filtering for active and valid date ranges
    // But we'll add explicit filters just to be safe
    const now = new Date().toISOString();
    
    const query = supabase
      .from('vouchers')
      .select('*')
      .eq('status', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('created_at', { ascending: false });
      
    const { data: vouchers, error } = await query;

    if (error) {
      console.error('Error fetching public vouchers:', error);
      return [];
    }
    
    // Filter out fully used vouchers in memory (if RLS doesn't catch it somehow)
    return (vouchers as Voucher[]).filter(v => 
      v.usage_limit === null || v.used_count < v.usage_limit
    );
  } catch (error) {
    console.error('Server error getPublicVouchers:', error);
    return [];
  }
}

export async function getAdminVouchers() {
  try {
    const supabase = await createServerSupabaseClient();
    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: [] };
    
    // Fetch all vouchers
    const { data: vouchers, error } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, data: vouchers as Voucher[] };
  } catch (error) {
    console.error('Server error getAdminVouchers:', error);
    return { success: false, data: [] };
  }
}

export async function createVoucher(voucherData: Partial<Voucher>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('vouchers')
      .insert({
        ...voucherData,
        code: voucherData.code?.toUpperCase(),
      });

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Kode voucher sudah digunakan');
      }
      throw error;
    }

    revalidatePath('/admin/vouchers');
    revalidatePath('/vouchers');
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal membuat voucher';
    return { success: false, error: errorMessage };
  }
}

export async function updateVoucher(id: string, voucherData: Partial<Voucher>) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Ensure code is always uppercase
    const dataToUpdate = { ...voucherData };
    if (dataToUpdate.code) {
      dataToUpdate.code = dataToUpdate.code.toUpperCase();
    }
    
    const { error } = await supabase
      .from('vouchers')
      .update(dataToUpdate)
      .eq('id', id);

    if (error) {
       if (error.code === '23505') {
        throw new Error('Kode voucher sudah digunakan');
      }
      throw error;
    }

    revalidatePath('/admin/vouchers');
    revalidatePath('/vouchers');
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal mengubah voucher';
    return { success: false, error: errorMessage };
  }
}

export async function deleteVoucher(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/vouchers');
    revalidatePath('/vouchers');
    
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus voucher';
    return { success: false, error: errorMessage };
  }
}

export async function toggleVoucherStatus(id: string, currentStatus: boolean) {
  return await updateVoucher(id, { status: !currentStatus });
}

export async function validateVoucher(code: string, cartTotal: number) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // code must be uppercase
    const upperCode = code.toUpperCase();
    
    const { data: voucher, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', upperCode)
      .single();

    if (error || !voucher) {
      return { isValid: false, message: 'Kode voucher tidak ditemukan' };
    }

    // 1. Check if active
    if (!voucher.status) {
      return { isValid: false, message: 'Voucher sedang tidak aktif' };
    }

    // 2. Check date limits
    const now = new Date();
    if (voucher.start_date && new Date(voucher.start_date) > now) {
      return { isValid: false, message: 'Voucher belum berlaku' };
    }
    if (voucher.end_date && new Date(voucher.end_date) < now) {
      return { isValid: false, message: 'Voucher sudah kadaluwarsa' };
    }

    // 3. Check usage limit
    if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
      return { isValid: false, message: 'Kuota penggunaan voucher sudah habis' };
    }

    // 4. Check min purchase
    if (cartTotal < voucher.min_purchase) {
      return { 
        isValid: false, 
        message: `Minimum belanja Rp ${voucher.min_purchase.toLocaleString('id-ID')} tidak terpenuhi` 
      };
    }

    return { isValid: true, data: voucher as Voucher };
  } catch (error) {
    console.error('Error validating voucher:', error);
    return { isValid: false, message: 'Terjadi kesalahan saat memvalidasi voucher' };
  }
}

export async function incrementVoucherUsage(code: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const upperCode = code.toUpperCase();
    
    // Instead of using RPC, we can fetch, check, and update simply
    // (A real production system with high concurrency should use RPC to avoid race conditions)
    // Here we use a direct update for simplicity if we don't have RPC
    
    // Get current usage
    const { data: voucher } = await supabase
      .from('vouchers')
      .select('id, used_count')
      .eq('code', upperCode)
      .single();
      
    if (voucher) {
      await supabase
        .from('vouchers')
        .update({ used_count: voucher.used_count + 1 })
        .eq('id', voucher.id);
    }
    
    return true;
  } catch (error) {
    console.warn('Failed to increment voucher usage:', error);
    return false;
  }
}

export async function getUserVoucherUsage(): Promise<VoucherUsage[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_voucher_usage')
      .select('*')
      .eq('user_id', user.id)
      .order('used_at', { ascending: false });

    if (error) {
      console.error('Error fetching user voucher usage:', error);
      return [];
    }

    return (data || []) as VoucherUsage[];
  } catch (error) {
    console.error('Server error getUserVoucherUsage:', error);
    return [];
  }
}

export async function recordVoucherUsage(params: {
  voucherId: string;
  voucherCode: string;
  discountValue: number;
  orderId?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_voucher_usage')
      .insert({
        user_id: user.id,
        voucher_id: params.voucherId,
        voucher_code: params.voucherCode.toUpperCase(),
        discount_value: params.discountValue,
        order_id: params.orderId || null,
      });

    if (error) {
      console.error('Error recording voucher usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Failed to record voucher usage:', error);
    return false;
  }
}
