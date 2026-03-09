-- Add avatar_url to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ENSURE STORAGE BUCKET 'images' EXISTS AND HAS POLICIES
-- This part is usually done in Supabase SQL Editor
-- but we provide it here for completeness.

-- 1. Enable RLS on storage.objects if not already
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Allow public access to all avatars
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
CREATE POLICY "Public Avatar Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'images' AND (storage.foldername(name))[1] = 'avatars');

-- 3. Allow authenticated users to upload their own avatars
DROP POLICY IF EXISTS "User Avatar Upload" ON storage.objects;
CREATE POLICY "User Avatar Upload" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 4. Allow authenticated users to update/delete their own avatars
DROP POLICY IF EXISTS "User Avatar Update" ON storage.objects;
CREATE POLICY "User Avatar Update" ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "User Avatar Delete" ON storage.objects;
CREATE POLICY "User Avatar Delete" ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
