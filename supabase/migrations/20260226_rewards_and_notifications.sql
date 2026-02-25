-- =====================================================
-- Points, Reviews, & Notifications System Schema
-- Migration: 20260226_rewards_and_notifications
-- =====================================================

-- 1. Add points to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system', -- 'order_update', 'promo', 'system'
  is_read BOOLEAN DEFAULT false,
  related_record_id TEXT, -- e.g., order ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System/Service Role can insert and update notifications (bypasses RLS)
-- Users can update (mark as read) their own notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
