-- =====================================================
-- ADMIN FEATURE PERMISSIONS & SALES RESET RPC
-- Migration: 20260217_admin_feature_permissions
-- =====================================================

-- 1. Create Atomic Reset Sales Data Function
-- =====================================================
-- 1. Create Atomic Reset Sales Data Function
-- =====================================================
CREATE OR REPLACE FUNCTION public.reset_all_sales_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Forbidden: Hanya admin yang dapat mereset data penjualan.';
  END IF;

  -- 1. Delete all order items (to prevent foreign key constraint violations)
  DELETE FROM public.order_items;

  -- 2. Delete all orders
  DELETE FROM public.orders;

  -- 3. Reset sold count for all products
  UPDATE public.products SET sold_count = 0;

  -- 4. Delete all checkout sessions that might be pending/orphaned
  DELETE FROM public.checkout_sessions;
END;
$$;

-- 2. Ensure Admin RLS Policies for Orders Table
-- =====================================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admin can delete orders
DROP POLICY IF EXISTS "Admins can delete all orders" ON public.orders;
CREATE POLICY "Admins can delete all orders"
  ON public.orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin can update orders (e.g., status changes)
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Ensure Admin RLS Policies for Products Table
-- =====================================================

-- Verify admin can do everything with products
DROP POLICY IF EXISTS "Admins can do everything with products" ON public.products;
CREATE POLICY "Admins can do everything with products"
  ON public.products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Reload PostgREST schema cache
-- =====================================================
NOTIFY pgrst, 'reload schema';
