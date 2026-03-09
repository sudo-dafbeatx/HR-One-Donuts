-- Migration: 20260224_fix_orders_update_policy
-- Description: Explicitly allow Admins to update order status.

-- Ensure RLS is enabled (it should be, but let's be safe)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 1. DROP old policy if exists
DROP POLICY IF EXISTS "Admins can update order status" ON public.orders;

-- 2. CREATE new policy for UPDATE
CREATE POLICY "Admins can update order status"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Double check SELECT policy (ensure it's robust)
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" 
  ON public.orders FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
