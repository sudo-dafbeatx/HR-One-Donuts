-- =====================================================
-- ADD MISSING COLUMNS TO user_profiles
-- Run this in Supabase SQL Editor
-- =====================================================

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'id';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Refresh PostgREST schema cache so the API recognizes the new columns
NOTIFY pgrst, 'reload schema';
