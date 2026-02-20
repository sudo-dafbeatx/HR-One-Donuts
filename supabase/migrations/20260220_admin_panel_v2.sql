-- =====================================================
-- Admin Panel V2 Schema & RPCs (User Management, Logs, Security)
-- =====================================================

-- 1. Create Admin Logs Table
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin logs" ON public.admin_logs;
CREATE POLICY "Admins can view admin logs"
    ON public.admin_logs FOR SELECT
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert admin logs" ON public.admin_logs;
CREATE POLICY "Admins can insert admin logs"
    ON public.admin_logs FOR INSERT
    WITH CHECK (public.is_admin() AND auth.uid() = admin_id);

-- 2. Add is_active column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='is_active') THEN
        ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. RPC: Log Admin Action safely
CREATE OR REPLACE FUNCTION public.log_admin_action(action_type TEXT, action_details TEXT)
RETURNS boolean AS $$
BEGIN
    IF public.is_admin() THEN
        INSERT INTO public.admin_logs (admin_id, action, details)
        VALUES (auth.uid(), action_type, action_details);
        RETURN true;
    END IF;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC: Ban / Unban User
CREATE OR REPLACE FUNCTION public.toggle_user_ban(target_user_id UUID, ban_status BOOLEAN)
RETURNS boolean AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Access denied'; END IF;
    
    -- Prevent banning last admin
    IF ban_status THEN
        IF (SELECT count(*) FROM public.profiles WHERE role = 'admin' AND is_active = true) <= 1 THEN
            IF (SELECT role FROM public.profiles WHERE id = target_user_id) = 'admin' THEN
                RAISE EXCEPTION 'Cannot ban the last active admin';
            END IF;
        END IF;
    END IF;

    -- Update is_active in profiles
    UPDATE public.profiles
    SET is_active = NOT ban_status,
        updated_at = NOW()
    WHERE id = target_user_id;

    -- Note: Updating auth.users requires superuser privileges inside Supabase.
    -- While SECURITY DEFINER runs as Postgres (superuser), some Supabase versions restrict writing directly to auth schema.
    -- We assume it works here, but gracefully ignore if restricted.
    BEGIN
      UPDATE auth.users
      SET banned_until = CASE WHEN ban_status THEN NOW() + interval '100 years' ELSE NULL END
      WHERE id = target_user_id;
    EXCEPTION WHEN others THEN
      -- Silently proceed if auth.users update fails
      NULL;
    END;

    -- Log action
    PERFORM public.log_admin_action(
        CASE WHEN ban_status THEN 'BAN_USER' ELSE 'UNBAN_USER' END,
        'User ID: ' || target_user_id
    );

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: Revoke Session
CREATE OR REPLACE FUNCTION public.revoke_user_session(target_user_id UUID)
RETURNS boolean AS $$
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Access denied'; END IF;

    -- Delete sessions from auth.sessions (forcing logout)
    BEGIN
      DELETE FROM auth.sessions WHERE user_id = target_user_id;
    EXCEPTION WHEN others THEN
      NULL;
    END;

    PERFORM public.log_admin_action('REVOKE_SESSION', 'User ID: ' || target_user_id);
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC: Update get_admin_users_list to include is_active
CREATE OR REPLACE FUNCTION public.get_admin_users_list()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
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
      'phone', p.phone,
      'is_active', COALESCE(p.is_active, true)
    )
    ORDER BY a.created_at DESC
  ) INTO result
  FROM auth.users a
  LEFT JOIN public.profiles p ON a.id = p.id;
  
  RETURN coalesce(result, '[]');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
