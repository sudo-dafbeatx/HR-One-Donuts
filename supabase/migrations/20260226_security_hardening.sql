-- =====================================================
-- SUPABASE SECURITY HARDENING
-- Fixes for function_search_path_mutable and rls_policy_always_true
-- =====================================================

-- =====================================================
-- 1. FIX FUNCTION SEARCH_PATH MUTABLE
-- Dynamically adds "SET search_path = public" to all flagged functions
-- =====================================================
DO $$
DECLARE
    func RECORD;
BEGIN
    FOR func IN
        SELECT p.oid::regprocedure AS sig
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.proname IN (
              'increment_product_sold',
              'update_updated_at_column',
              'normalize_phone',
              'update_user_role',
              'update_profile_verification',
              'log_admin_action',
              'toggle_user_ban',
              'revoke_user_session',
              'handle_updated_at',
              'handle_new_user'
          )
    LOOP
        EXECUTE 'ALTER FUNCTION ' || func.sig || ' SET search_path = public';
    END LOOP;
END
$$;


-- =====================================================
-- 2. FIX RLS POLICY ALWAYS TRUE (Row Level Security Bocor)
-- =====================================================

-- Helper to safely drop all policies from a table
DO $$
DECLARE
    t TEXT;
    pol RECORD;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'article_satisfaction', 
        'bot_questions_log', 
        'orders', 
        'traffic_logs',
        'featured_products', 
        'products', 
        'hero', 
        'reasons', 
        'settings'
    ]
    LOOP
        FOR pol IN
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, 'public', t);
        END LOOP;
    END LOOP;
END
$$;

-- -----------------------------------------------------------------
-- A. PUBLIC LOG TABLES (Insert Only for Everyone, Select only for Admin)
-- -----------------------------------------------------------------

-- traffic_logs
ALTER TABLE public.traffic_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view traffic logs" ON public.traffic_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Anyone can insert traffic logs" ON public.traffic_logs FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- bot_questions_log
ALTER TABLE public.bot_questions_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view bot logs" ON public.bot_questions_log FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Anyone can insert bot logs" ON public.bot_questions_log FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- article_satisfaction (jika ada)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'article_satisfaction') THEN
        EXECUTE 'ALTER TABLE public.article_satisfaction ENABLE ROW LEVEL SECURITY';
        EXECUTE 'CREATE POLICY "Admins can view article satisfaction" ON public.article_satisfaction FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = ''admin''))';
        EXECUTE 'CREATE POLICY "Anyone can insert article satisfaction" ON public.article_satisfaction FOR INSERT WITH CHECK (auth.role() IN (''anon'', ''authenticated''))';
    END IF;
END
$$;

-- -----------------------------------------------------------------
-- B. ORDERS TABLE (Users can insert own, Admins full access)
-- -----------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders and Admins view all" ON public.orders FOR SELECT TO authenticated 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- -----------------------------------------------------------------
-- C. ADMIN ONLY CONTENT TABLES (Public Read, Admin Write)
-- -----------------------------------------------------------------

-- products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- featured_products
ALTER TABLE public.featured_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read featured_products" ON public.featured_products FOR SELECT USING (true);
CREATE POLICY "Admins can insert featured_products" ON public.featured_products FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update featured_products" ON public.featured_products FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete featured_products" ON public.featured_products FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- hero
ALTER TABLE public.hero ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read hero" ON public.hero FOR SELECT USING (true);
CREATE POLICY "Admins can insert hero" ON public.hero FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update hero" ON public.hero FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete hero" ON public.hero FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- reasons
ALTER TABLE public.reasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reasons" ON public.reasons FOR SELECT USING (true);
CREATE POLICY "Admins can insert reasons" ON public.reasons FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update reasons" ON public.reasons FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete reasons" ON public.reasons FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert settings" ON public.settings FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update settings" ON public.settings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can delete settings" ON public.settings FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Reload schema caches
NOTIFY pgrst, 'reload schema';
