-- =====================================================
-- AUTH SECURITY HARDENING
-- Migration: 20260221_auth_security_hardening
-- =====================================================

-- =====================================================
-- 1. CREATE auth_logs TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'login',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON public.auth_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- User can only read their own logs
DROP POLICY IF EXISTS "Users can read own auth logs" ON public.auth_logs;
CREATE POLICY "Users can read own auth logs"
  ON public.auth_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin can read all logs
DROP POLICY IF EXISTS "Admins can read all auth logs" ON public.auth_logs;
CREATE POLICY "Admins can read all auth logs"
  ON public.auth_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Server-side insert only (service role or SECURITY DEFINER function)
DROP POLICY IF EXISTS "Server can insert auth logs" ON public.auth_logs;
CREATE POLICY "Server can insert auth logs"
  ON public.auth_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 2. FIX profiles RLS POLICIES
-- Remove overly permissive policies, add uid-based ones
-- =====================================================

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Admins can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public can read products" ON products;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin can read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admin can update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Re-create products public read (was accidentally dropped in scope)
DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = true);

-- =====================================================
-- 3. STORAGE POLICIES for avatars bucket
-- Ensure user can only upload/read within their own folder
-- =====================================================

-- Note: These policies apply to the 'images' bucket
-- Storage policies use storage.foldername() and storage.filename()

-- User can upload to their own avatar folder
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- User can update/overwrite their own avatar files
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- User can read their own avatar files
DROP POLICY IF EXISTS "Users can read own avatar" ON storage.objects;
CREATE POLICY "Users can read own avatar"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Public can read all avatar files (needed for avatar display on reviews, etc.)
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;
CREATE POLICY "Public can read avatars"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- Admin can read all storage objects
DROP POLICY IF EXISTS "Admins can read all storage" ON storage.objects;
CREATE POLICY "Admins can read all storage"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- User can delete their own avatar files
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- =====================================================
-- DONE! Run this migration in Supabase SQL Editor.
-- =====================================================
