'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type NotificationType = 'login' | 'order' | 'review' | 'event' | 'points' | 'system';

export async function addNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, unknown>;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { error } = await supabase.from('user_notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      content: params.content,
      data: params.data || {},
    });

    if (error) {
      console.error('[NotificationActions] Failed to add notification:', error.message);
      return { success: false, error: error.message };
    }

    revalidatePath('/profile/notifications');
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[NotificationActions] Unexpected error:', err);
    return { success: false, error: err.message || 'Internal server error' };
  }
}

export async function getUserNotifications(limit = 20) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[NotificationActions] Failed to fetch notifications:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[NotificationActions] Failed to fetch notifications:', err);
    return [];
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { success: false };

    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    
    revalidatePath('/profile/notifications');
    return { success: true };
  } catch (err) {
    console.error('[NotificationActions] Mark as read failed:', err);
    return { success: false };
  }
}
