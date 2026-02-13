-- Migration: Fix Products Schema
-- This migration ensures the products table matches the application's requirements.

-- 1. Ensure image_url column exists and image is renamed to image_url if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image') THEN
        ALTER TABLE products RENAME COLUMN image TO image_url;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 2. Add variants column (JSONB)
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- 3. Ensure other missing columns from recent migrations are present (double-check)
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

-- 4. Update existing null variants to empty array
UPDATE products SET variants = '[]'::jsonb WHERE variants IS NULL;
