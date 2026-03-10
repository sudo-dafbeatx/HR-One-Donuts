-- =====================================================
-- CREATE 'images' STORAGE BUCKET
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create the bucket (make it public so images can be viewed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies on 'images' bucket just in case
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;

-- 3. Set up Storage Policies

-- Allow anyone to read images from the bucket
CREATE POLICY "Public Access" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'images');

-- Allow creation/upload. 
-- In this case, service role handles the admin uploads so it automatically bypasses RLS,
-- but we'll add policies for authenticated users anyway in case you use client-side uploads later.
CREATE POLICY "Authenticated users can upload" 
  ON storage.objects FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Authenticated users can update" 
  ON storage.objects FOR UPDATE 
  TO authenticated
  USING (bucket_id = 'images')
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Authenticated users can delete" 
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images');
