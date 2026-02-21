-- =====================================================
-- ADMIN USERS MANAGEMENT & RPC FIX
-- Migration file: 20260220_admin_users_management.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Note: In the user's latest requirement, `user_id` was added.
-- The column `user_id` allows linking the admin row to an optional Supabase auth user if needed,
-- but the main admin login bypasses Supabase auth altogether.

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Tidak ada public select, Hanya service role yang bisa baca
-- Empty restrictive policy ensures that anon and authenticated roles have NO access at all.
-- Service role inherently bypasses RLS.
DROP POLICY IF EXISTS "Deny all access to admin_users" ON public.admin_users;
CREATE POLICY "Deny all access to admin_users"
  ON public.admin_users FOR ALL
  USING (false);

-- Insert original 'admin' user with hash if not exists.
INSERT INTO public.admin_users (username, password_hash)
VALUES (
  'admin',
  '$2b$10$TBVxaXbBYczBfB7kv81AKuu.5F99M9ADTqvX72goCGN0voI9HCL1.'
)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- 2. FIX RPC `get_admin_users_list`
-- The dashboard users page calls this. We combine admin_users and profiles
-- =====================================================
CREATE OR REPLACE FUNCTION get_admin_users_list()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', au.id,
      'username', au.username,
      'created_at', au.created_at,
      'user_id', au.user_id,
      'last_sign_in_at', COALESCE(u.last_sign_in_at, au.created_at)
    )
  ) INTO result
  FROM public.admin_users au
  LEFT JOIN auth.users u ON au.user_id = u.id;
  
  RETURN coalesce(result, '[]'::json);
END;
$$;
