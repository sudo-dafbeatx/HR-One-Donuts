-- Fix the get_admin_users_list RPC function
-- This function combines auth.users (customers) and admin_users (independent admins) 
-- into a single JSON response for the Admin panel.

-- Ensure profiles table has the expected columns used by the admin panel
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE OR REPLACE FUNCTION get_admin_users_list()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Use a CTE (Common Table Expression) to unify the users before aggregating to JSON
  WITH unified_users AS (
    -- 1. Standard Supabase Auth Users
    SELECT 
      a.id,
      a.email,
      a.created_at,
      a.last_sign_in_at,
      CASE WHEN au.id IS NOT NULL THEN 'admin' ELSE 'user' END as role,
      COALESCE(up.full_name, p.full_name) as full_name,
      COALESCE(up.phone, p.phone) as phone,
      COALESCE(up.avatar_url, p.avatar_url) as avatar_url,
      COALESCE(p.is_active, true) as is_active,
      COALESCE(up.points, 0) as points,
      (SELECT count(*) FROM public.orders o WHERE o.user_id = a.id) as total_orders
    FROM auth.users a
    LEFT JOIN public.profiles p ON a.id = p.id
    LEFT JOIN public.user_profiles up ON a.id = up.id
    LEFT JOIN public.admin_users au ON a.id = au.id

    UNION ALL

    -- 2. Independent Admin Users (Like admin_hronedonut) that have no auth.user record
    SELECT 
      au.id,
      COALESCE(au.email, au.username) as email,
      au.created_at,
      NULL::timestamptz as last_sign_in_at,
      'admin' as role,
      'Super Admin' as full_name,
      NULL::text as phone,
      NULL::text as avatar_url,
      true as is_active,
      0 as points,
      0 as total_orders
    FROM public.admin_users au
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users a WHERE a.id = au.id
    )
  )
  
  -- Aggregate the combined results into JSON
  SELECT json_agg(
    json_build_object(
      'id', u.id,
      'email', u.email,
      'created_at', u.created_at,
      'last_sign_in_at', u.last_sign_in_at,
      'role', u.role,
      'full_name', u.full_name,
      'phone', u.phone,
      'avatar_url', u.avatar_url,
      'is_active', u.is_active,
      'points', u.points,
      'total_orders', u.total_orders
    )
    ORDER BY u.created_at DESC
  ) INTO result
  FROM unified_users u;
  
  RETURN coalesce(result, '[]'::json);
END;
$$;
