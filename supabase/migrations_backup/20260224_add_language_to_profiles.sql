-- Migration: 20260224_add_language_to_profiles
-- Description: Adds a 'language' column to profiles and user_profiles to store user preferences.

-- 1. Update public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'id';

-- 2. Update public.user_profiles (The new detailed profile table)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'id';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.language IS 'User preferred language code (id, en, su, jv)';
COMMENT ON COLUMN public.user_profiles.language IS 'User preferred language code (id, en, su, jv)';

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
