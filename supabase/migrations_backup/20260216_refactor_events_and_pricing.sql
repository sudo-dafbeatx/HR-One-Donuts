-- Migration: Refactor Events and Pricing System
-- Remove Ecer/Grosir (package_type) and simplify events

-- 0. Ensure description column exists in events
ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;

-- 1. Reset and Seed Events table
TRUNCATE TABLE events;

INSERT INTO events (title, description, event_type, discount_percent, is_active, start_at, end_at)
VALUES 
  (
    'Jum''at berkah', 
    'Berbagi kebahagiaan di hari Jum''at. Beli 1 Lusin Gratis 2 Donat!', 
    'jumat_berkah', 
    0, 
    true, 
    NOW(), 
    NOW() + INTERVAL '1 year'
  ),
  (
    'SMS (Selasa Mega Sale)', 
    'Mega Sale di hari Selasa! Diskon s.d 50% untuk semua menu.', 
    'selasa_mega_sale', 
    50, 
    true, 
    NOW(), 
    NOW() + INTERVAL '1 year'
  );

-- 2. Update existing products sale_type to match new enums
-- Set anyone not matching to 'normal'
UPDATE products 
SET sale_type = 'normal' 
WHERE sale_type NOT IN ('normal', 'jumat_berkah');

-- 3. Remove package_type column from products
-- This removes the "Ecer/Grosir" distinction as requested
ALTER TABLE products DROP COLUMN IF EXISTS package_type;
