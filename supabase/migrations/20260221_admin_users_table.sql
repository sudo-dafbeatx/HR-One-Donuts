-- =====================================================
-- ADMIN USERS TABLE
-- Migration: 20260221_admin_users_table
-- Separate admin auth with bcrypt password hashing
-- =====================================================

-- 1. CREATE TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE RLS — deny all public access
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- No SELECT/INSERT/UPDATE/DELETE policies for anon or authenticated
-- Only the service role key can access this table

-- 3. INSERT DEFAULT ADMIN
-- Default password: admin123 (CHANGE THIS IMMEDIATELY!)
-- Hash generated via: bcryptjs.hashSync('admin123', 10)
INSERT INTO public.admin_users (username, password_hash)
VALUES (
  'admin',
  '$2b$10$TBVxaXbBYczBfB7kv81AKuu.5F99M9ADTqvX72goCGN0voI9HCL1.'
)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- DONE! Run this migration in Supabase SQL Editor.
-- IMPORTANT: Change the default admin password immediately!
-- =====================================================
