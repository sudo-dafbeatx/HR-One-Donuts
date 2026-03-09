-- Fix the get_admin_users_list RPC function
-- This function combines auth.users (customers) and admin_users (independent admins) 
-- into a single JSON response for the Admin panel.

CREATE OR REPLACE FUNCTION get_admin_users_list()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- We don't check public.is_admin() here because the client using this is the service_role key
  -- bypassing RLS, taking authorization responsibility away from the DB safely.
  
  -- Use a CTE (Common Table Expression) to unify the users before aggregating to JSON
  WITH unified_users AS (
    -- 1. Standard Supabase Auth Users
    SELECT 
      a.id,
      a.email,
      a.created_at,
      a.last_sign_in_at,
      CASE WHEN au.id IS NOT NULL THEN 'admin' ELSE 'user' END as role,
      p.full_name,
      p.phone,
      COALESCE(p.is_active, true) as is_active
    FROM auth.users a
    LEFT JOIN public.profiles p ON a.id = p.id
    LEFT JOIN public.admin_users au ON a.id = au.user_id

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
      true as is_active
    FROM public.admin_users au
    WHERE au.user_id IS NULL
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
      'is_active', u.is_active
    )
    ORDER BY u.created_at DESC
  ) INTO result
  FROM unified_users u;
  
  RETURN coalesce(result, '[]'::json);
END;
$$;
