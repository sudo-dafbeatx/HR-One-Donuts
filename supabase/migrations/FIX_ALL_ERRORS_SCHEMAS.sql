-- HR-ONE DONUTS COMPLETE MIGRATION
-- Run this in Supabase SQL Editor to fix all database-related errors

-- 1. PROFILES Table (Basic Auth Support)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify categories" ON categories;
CREATE POLICY "Only admins can modify categories" ON categories FOR ALL 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 3. PRODUCTS Table Updates
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS package_type TEXT DEFAULT 'satuan',
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS promo_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS promo_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tag TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. EVENTS Table
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

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active events" ON events;
CREATE POLICY "Public can read active events" ON events FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Only admins can modify events" ON events;
CREATE POLICY "Only admins can modify events" ON events FOR ALL 
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 5. SETTINGS Table (Fallback)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read settings" ON settings;
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);

-- 6. RPC Function for Sales Tracking
CREATE OR REPLACE FUNCTION increment_product_sold(product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET sold_count = COALESCE(sold_count, 0) + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. DEFAULT SEED DATA
INSERT INTO categories (name) VALUES ('Donat') ON CONFLICT (name) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('site_info', '{"store_name": "HR-One Donuts", "tagline": "Premium Donuts"}') ON CONFLICT (key) DO NOTHING;
