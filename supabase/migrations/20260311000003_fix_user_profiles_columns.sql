-- Fix user_profiles: add missing columns used by Edit Account form
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS birth_place TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Copy existing phone data to phone_number if phone_number is empty
UPDATE public.user_profiles
  SET phone_number = phone
  WHERE phone IS NOT NULL AND phone_number IS NULL;

NOTIFY pgrst, 'reload schema';
