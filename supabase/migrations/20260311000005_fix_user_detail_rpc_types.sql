-- Fix the get_admin_user_detail RPC function type collision crash
-- The previous function had UNION ALL trying to merge `NULL::text as gender` with `gender_type`

CREATE OR REPLACE FUNCTION get_admin_user_detail(lookup_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  WITH target_user AS (
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
      up.gender::text,
      up.age,
      up.language,
      up.birth_date,
      up.address_detail,
      up.province_name,
      up.city_name,
      up.district_name
    FROM auth.users a
    LEFT JOIN public.profiles p ON a.id = p.id
    LEFT JOIN public.user_profiles up ON a.id = up.id
    LEFT JOIN public.admin_users au ON a.id = au.id
    WHERE a.id = lookup_id

    UNION ALL

    -- 2. Independent Admin Users
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
      NULL::text as gender,
      NULL::int as age,
      NULL::text as language,
      NULL::date as birth_date,
      NULL::text as address_detail,
      NULL::text as province_name,
      NULL::text as city_name,
      NULL::text as district_name
    FROM public.admin_users au
    WHERE au.id = lookup_id
    AND NOT EXISTS (
      SELECT 1 FROM auth.users a WHERE a.id = au.id
    )
  )
  SELECT row_to_json(t) INTO result FROM target_user t LIMIT 1;
  RETURN result;
END;
$$;
