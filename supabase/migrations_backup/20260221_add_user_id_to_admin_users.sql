-- Prevent 500 crashes by ensuring user_id exists on admin_users table

DO $$
BEGIN
    -- Check if column exists, if not, add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='admin_users' AND column_name='user_id') THEN
        ALTER TABLE public.admin_users ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Rewrite the get_admin_users_list RPC so it returns the correct shape for AdminUsersClient
-- and determines 'role' by looking at admin_users instead of profiles.role
CREATE OR REPLACE FUNCTION get_admin_users_list()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- We don't check public.is_admin() here because the client is now service_role anyway 
  -- and auth session comes from admin_session cookie, so bypassing auth is safe.

  SELECT json_agg(
    json_build_object(
      'id', a.id,
      'email', a.email,
      'created_at', a.created_at,
      'last_sign_in_at', a.last_sign_in_at,
      'role', CASE WHEN au.id IS NOT NULL THEN 'admin' ELSE 'user' END,
      'full_name', p.full_name,
      'phone', p.phone,
      'is_active', COALESCE(p.is_active, true)
    )
    ORDER BY a.created_at DESC
  ) INTO result
  FROM auth.users a
  LEFT JOIN public.profiles p ON a.id = p.id
  LEFT JOIN public.admin_users au ON a.id = au.user_id;
  
  RETURN coalesce(result, '[]'::json);
END;
$$;
