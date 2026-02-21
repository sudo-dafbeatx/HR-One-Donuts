-- =====================================================
-- FIX: Infinite Recursion in Profiles RLS
-- Migration: 20260221_fix_profiles_recursion
-- =====================================================

-- 1. Create a SECURITY DEFINER function to check if a user is an admin.
-- This bypasses RLS on the profiles table, preventing recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update Profiles Policies
-- Remove policies that cause recursion and replace them with the is_admin() function.

-- Policy for reading all profiles (admin only)
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- Policy for updating profiles (own or admin)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 3. Update Products Policies
-- Replace subqueries with is_admin() for efficiency and safety.

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can do everything with products" ON public.products;

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Update Categories Policies
DROP POLICY IF EXISTS "Only admins can modify categories" ON public.categories;
CREATE POLICY "Only admins can modify categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Update Events Policies
DROP POLICY IF EXISTS "Only admins can modify events" ON public.events;
CREATE POLICY "Only admins can modify events"
  ON public.events FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Ensure Public Read Access (Anon) still works without recursion
-- Products
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
CREATE POLICY "Public can read active products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Categories
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Settings
DROP POLICY IF EXISTS "Public can read settings" ON public.settings;
CREATE POLICY "Public can read settings"
  ON public.settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Profiles (Anon/User can read their own profile, which is already set above in point 2)
-- Note: 'USING (auth.uid() = id OR public.is_admin())' covers reading own profile + admins reading all.
