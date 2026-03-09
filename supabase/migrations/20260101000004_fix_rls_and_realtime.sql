-- =====================================================
-- FIX RLS FOR PROFILES & ENABLE REALTIME
-- =====================================================

-- 1. Fix Profiles RLS (Allow users to insert/update their own profile)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- 1.5 Create notifications table if missing
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  is_read BOOLEAN DEFAULT false,
  related_record_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 2. Enable Realtime for key tables
-- We check if table exists before adding to publication to avoid errors
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products') THEN
    ALTER publication supabase_realtime ADD TABLE public.products;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'orders') THEN
    ALTER publication supabase_realtime ADD TABLE public.orders;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications') THEN
    ALTER publication supabase_realtime ADD TABLE public.notifications;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Handle case where it might already be in publication
  NULL;
END $$;

-- 3. Fix user_profiles RLS just in case
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own user_profiles" ON public.user_profiles;
CREATE POLICY "Users manage own user_profiles"
  ON public.user_profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
