'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(
  orderId: string, 
  reviews: Array<{ product_id: string; rating: number; comment: string }>
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Silakan login kembali' };
    }

    // 1. Validate that the order belongs to the user and is 'completed'
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status, items')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return { success: false, error: 'Pesanan tidak ditemukan' };
    }

    if (order.status !== 'completed') {
      return { success: false, error: 'Pesanan belum selesai' };
    }

    const orderItems = order.items || [];
    let itemsUpdated = false;
    let earnedPoints = 0;

    // We process each review
    for (const review of reviews) {
      // Ensure the user actually bought this product in this order, and it's not already reviewed
      const itemIndex = orderItems.findIndex(
        (i: { product_id: string; is_reviewed?: boolean }) => i.product_id === review.product_id && !i.is_reviewed
      );

      if (itemIndex > -1) {
        // Double check if a review already exists to prevent duplication
        const { data: existingReview } = await supabase
          .from('product_reviews')
          .select('id')
          .eq('product_id', review.product_id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        // We either insert a new review, or if one somehow exists, update it.
        const reviewPayload = {
          product_id: review.product_id,
          user_id: user.id,
          rating: review.rating,
          comment: review.comment || null,
          updated_at: new Date().toISOString()
        };

        let reviewResult;
        if (existingReview) {
          reviewResult = await supabase.from('product_reviews').update(reviewPayload).eq('id', existingReview.id);
        } else {
          reviewResult = await supabase.from('product_reviews').insert(reviewPayload);
        }

        if (!reviewResult.error) {
           // Mark item locally as reviewed
           orderItems[itemIndex].is_reviewed = true;
           itemsUpdated = true;
           earnedPoints += 10;
        } else {
           console.error('Failed inserting review:', reviewResult.error);
        }
      }
    }

    // Apply the batched updates using RPC or Service Role logic if strictly needed, 
    // but the authenticated client is fine here since user_profiles has an UPDATE policy matching user_id.

    if (itemsUpdated) {
      // Update the JSONB items array in the orders table
      const { error: updateItemsErr } = await supabase
        .from('orders')
        .update({ items: orderItems })
        .eq('id', orderId);
        
      if (updateItemsErr) console.error('Failed updating order items is_reviewed:', updateItemsErr);

      // Increment Points
      if (earnedPoints > 0) {
        // Safe atomic increment via RPC doesn't exist out of box in our current schema,
        // so we fetch current profile and add:
        const { data: profile } = await supabase.from('user_profiles').select('points').eq('id', user.id).single();
        const currentPoints = profile?.points || 0;
        
        await supabase
          .from('user_profiles')
          .update({ points: currentPoints + earnedPoints })
          .eq('id', user.id);
      }
    }

    revalidatePath(`/profile/orders/${orderId}`);
    revalidatePath('/profile');
    revalidatePath('/'); // Reval homepage for review stars

    return { success: true, earnedPoints };

  } catch (err: unknown) {
    console.error('submitReview crash:', err);
    return { success: false, error: (err as Error).message || 'Terjadi kesalahan sistem.' };
  }
}
