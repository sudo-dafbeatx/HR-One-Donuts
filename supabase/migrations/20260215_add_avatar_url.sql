-- Add avatar_url to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Ensure RLS allows users to update their own avatar_url
-- The existing update policy should cover this, but we'll double check.
-- DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
-- CREATE POLICY "Users can update their own profile" ON public.profiles
--   FOR UPDATE USING (auth.uid() = id);

-- Create bucket 'images' if not exists is usually done via dashboard, 
-- but we can ensure policies are there if the bucket exists.
-- Assuming 'images' bucket exists from previous work.
