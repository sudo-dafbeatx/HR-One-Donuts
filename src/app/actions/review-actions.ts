'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ProductReview, ReviewStats } from '@/types/cms';

/**
 * Create a new product review
 */
export async function createReview(
  productId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; error?: string; data?: ProductReview }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Anda harus login untuk memberikan ulasan' };
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Rating harus antara 1-5 bintang' };
    }

    // Check if user already reviewed this product
    const { data: existing } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return { success: false, error: 'Anda sudah memberikan ulasan untuk produk ini' };
    }

    // Insert review
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        comment: comment || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return { success: false, error: 'Gagal menyimpan ulasan' };
    }

    // Revalidate product page
    revalidatePath(`/catalog/${productId}`);
    
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in createReview:', error);
    return { success: false, error: 'Terjadi kesalahan sistem' };
  }
}

/**
 * Update an existing review
 */
export async function updateReview(
  reviewId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; error?: string; data?: ProductReview }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Anda harus login untuk mengubah ulasan' };
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Rating harus antara 1-5 bintang' };
    }

    // Update review (RLS will ensure user owns it)
    const { data, error } = await supabase
      .from('product_reviews')
      .update({
        rating,
        comment: comment || null,
      })
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return { success: false, error: 'Gagal mengubah ulasan' };
    }

    if (!data) {
      return { success: false, error: 'Ulasan tidak ditemukan atau bukan milik Anda' };
    }

    // Revalidate product page
    revalidatePath(`/catalog/${data.product_id}`);
    
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in updateReview:', error);
    return { success: false, error: 'Terjadi kesalahan sistem' };
  }
}

/**
 * Delete a review
 */
export async function deleteReview(
  reviewId: string,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Anda harus login untuk menghapus ulasan' };
    }

    // Delete review (RLS will ensure user owns it)
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting review:', error);
      return { success: false, error: 'Gagal menghapus ulasan' };
    }

    // Revalidate product page
    revalidatePath(`/catalog/${productId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteReview:', error);
    return { success: false, error: 'Terjadi kesalahan sistem' };
  }
}

/**
 * Get reviews for a product with user information
 */
export async function getProductReviews(
  productId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ success: boolean; data?: ProductReview[]; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Use the database function to get reviews with user info
    const { data, error } = await supabase.rpc('get_product_reviews_with_user_info', {
      p_product_id: productId,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error('Error fetching reviews:', error);
      return { success: false, error: 'Gagal memuat ulasan' };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Unexpected error in getProductReviews:', error);
    return { success: false, error: 'Terjadi kesalahan sistem' };
  }
}

/**
 * Get review statistics for a product
 */
export async function getProductReviewStats(
  productId: string
): Promise<{ success: boolean; data?: ReviewStats; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('product_review_stats')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching review stats:', error);
      return { success: false, error: 'Gagal memuat statistik ulasan' };
    }

    // If no data, return default stats
    if (!data) {
      return {
        success: true,
        data: {
          product_id: productId,
          average_rating: 0,
          total_reviews: 0,
          five_star_count: 0,
          four_star_count: 0,
          three_star_count: 0,
          two_star_count: 0,
          one_star_count: 0,
        },
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getProductReviewStats:', error);
    return { success: false, error: 'Terjadi kesalahan sistem' };
  }
}

/**
 * Check if current user has reviewed a product
 */
export async function getUserReviewForProduct(
  productId: string
): Promise<{ success: boolean; data?: ProductReview | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: true, data: null };
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching user review:', error);
      return { success: false, error: 'Gagal memeriksa ulasan Anda' };
    }

    return { success: true, data: data || null };
  } catch (error) {
    console.error('Unexpected error in getUserReviewForProduct:', error);
    return { success: false, error: 'Terjadi kesalahan sistem' };
  }
}
