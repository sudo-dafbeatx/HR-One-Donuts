-- Add is_verified colum to profiles and user_profiles tables
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.is_verified IS 'Whether the user account has been verified after 100% profile completion';
COMMENT ON COLUMN public.user_profiles.is_verified IS 'Whether the user account has been verified after 100% profile completion';

NOTIFY pgrst, 'reload schema';
