-- =====================================================
-- FLASH SALE ITEMS TABLE
-- Migration: 20260303_flash_sale_items
-- Join table: flash_sales ↔ products (product-level flash sale)
-- =====================================================

-- 1. CREATE TABLE
CREATE TABLE IF NOT EXISTS public.flash_sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flash_sale_id UUID NOT NULL REFERENCES public.flash_sales(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sale_price INTEGER NOT NULL,
  stock_limit INTEGER NOT NULL DEFAULT 10,
  sold_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(flash_sale_id, product_id)
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_fsi_flash_sale_id ON public.flash_sale_items(flash_sale_id);
CREATE INDEX IF NOT EXISTS idx_fsi_product_id ON public.flash_sale_items(product_id);

-- 3. ENABLE RLS
ALTER TABLE public.flash_sale_items ENABLE ROW LEVEL SECURITY;

-- Public can read items of active flash sales
DROP POLICY IF EXISTS "Public can read flash sale items" ON public.flash_sale_items;
CREATE POLICY "Public can read flash sale items"
  ON public.flash_sale_items FOR SELECT
  USING (true);

-- Service role can manage all (admin actions use service role client)
DROP POLICY IF EXISTS "Service role manages flash sale items" ON public.flash_sale_items;
CREATE POLICY "Service role manages flash sale items"
  ON public.flash_sale_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated admins can manage
DROP POLICY IF EXISTS "Admins can manage flash sale items" ON public.flash_sale_items;
CREATE POLICY "Admins can manage flash sale items"
  ON public.flash_sale_items FOR ALL
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

-- =====================================================
-- DONE! Run this migration in Supabase SQL Editor.
-- =====================================================
