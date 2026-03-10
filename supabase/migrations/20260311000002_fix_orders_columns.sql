-- Fix orders table: add missing delivery/shipping columns used by createOrder
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'delivery',
  ADD COLUMN IF NOT EXISTS shipping_fee INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address_notes TEXT;

-- Also fix RLS: allow authenticated users to read their own orders
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to update their own orders (for status changes via webhook)
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
