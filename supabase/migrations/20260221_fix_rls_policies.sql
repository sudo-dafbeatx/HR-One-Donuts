-- =====================================================
-- FIX: Products & Profiles RLS policies
-- Run this in Supabase SQL Editor to fix 500 errors
-- =====================================================

-- Fix products: ensure public (anon + authenticated) can read active products
DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Fix: admin can manage all products
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- DONE! This fixes the 500 errors on products/profiles.
-- =====================================================
