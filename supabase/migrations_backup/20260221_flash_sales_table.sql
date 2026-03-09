-- =====================================================
-- FLASH SALES TABLE
-- Migration: 20260221_flash_sales_table
-- =====================================================

-- 1. CREATE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flash_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'bogo')) DEFAULT 'percentage',
  discount_value INTEGER,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flash_sales_is_active ON public.flash_sales(is_active);
CREATE INDEX IF NOT EXISTS idx_flash_sales_slug ON public.flash_sales(slug);

-- 2. ENABLE RLS
-- =====================================================
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;

-- Public can read active flash sales
DROP POLICY IF EXISTS "Public can read active flash sales" ON public.flash_sales;
CREATE POLICY "Public can read active flash sales"
  ON public.flash_sales FOR SELECT
  USING (is_active = true);

-- Admin can do everything
DROP POLICY IF EXISTS "Admins can manage flash sales" ON public.flash_sales;
CREATE POLICY "Admins can manage flash sales"
  ON public.flash_sales FOR ALL
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

-- 3. INSERT DEFAULT DATA
-- =====================================================
INSERT INTO public.flash_sales
  (slug, title, description, discount_type, discount_value)
VALUES
  ('selasa-mega-sale', 'Selasa Mega Sale', 'Diskon spesial setiap hari Selasa', 'percentage', 50),
  ('jumat-berkah', 'Jum''at Berkah', 'Promo spesial hari Jum''at — Beli 1 Gratis 1', 'bogo', 1)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- DONE! Run this migration in Supabase SQL Editor.
-- =====================================================
