-- migration.sql
-- Run this in Supabase SQL Editor

-- 1. Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS package_type TEXT DEFAULT 'satuan',
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promo_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS promo_end TIMESTAMPTZ;

-- 2. Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT DEFAULT 'seasonal',
  banner_image_url TEXT,
  discount_percent INTEGER DEFAULT 0,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for events
DROP POLICY IF EXISTS "Public can read active events" ON events;
CREATE POLICY "Public can read active events"
  ON events FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Only admins can modify events" ON events;
CREATE POLICY "Only admins can modify events"
  ON events FOR ALL
  USING (auth.role() = 'authenticated' AND (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  ));

-- 5. RPC to increment sold_count
CREATE OR REPLACE FUNCTION increment_product_sold(product_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET sold_count = COALESCE(sold_count, 0) + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
