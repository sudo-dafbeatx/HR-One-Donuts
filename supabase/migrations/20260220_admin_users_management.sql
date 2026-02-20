-- =====================================================
-- Admin Users Management RPCs
-- =====================================================

-- 1. Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  SELECT (role = 'admin') INTO is_admin_user
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN coalesce(is_admin_user, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to get all users (Admin Only)
-- This joins auth.users and public.profiles using SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.get_admin_users_list()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;

  SELECT json_agg(
    json_build_object(
      'id', a.id,
      'email', a.email,
      'created_at', a.created_at,
      'last_sign_in_at', a.last_sign_in_at,
      'role', p.role,
      'full_name', p.full_name,
      'phone', p.phone
    )
    ORDER BY a.created_at DESC
  ) INTO result
  FROM auth.users a
  LEFT JOIN public.profiles p ON a.id = p.id;
  
  RETURN coalesce(result, '[]');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to update a user's role (Admin Only)
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id UUID, new_role TEXT)
RETURNS boolean AS $$
BEGIN
  -- 1. Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;

  -- 2. Prevent taking away last admin's role (basic safety)
  -- If we are demoting an admin, make sure they aren't the ONLY admin
  IF new_role != 'admin' THEN
    IF (SELECT count(*) FROM public.profiles WHERE role = 'admin') <= 1 THEN
      IF (SELECT role FROM public.profiles WHERE id = target_user_id) = 'admin' THEN
         RAISE EXCEPTION 'Cannot demote the last admin';
      END IF;
    END IF;
  END IF;

  -- 3. Perform the update
  UPDATE public.profiles
  SET role = new_role,
      updated_at = NOW()
  WHERE id = target_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
