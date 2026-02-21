-- Fix Product Visibility bug by ensuring Public RLS Policy exists
-- and defaults are correctly set.

-- 1. Ensure is_active defaults to true
ALTER TABLE public.products
ALTER COLUMN is_active SET DEFAULT true;

-- 2. Ensure RLS is enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing potentially conflicting reader policies
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
DROP POLICY IF EXISTS "products_read_all" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;

-- 4. Create explicit policy granting public read access to active products
CREATE POLICY "Public can read active products"
ON public.products
FOR SELECT
USING (is_active = true);
