-- Refine Promo Events Migration
-- Aligns with specific CMS naming conventions and weekly recurring logic

-- 1. Create the new promo_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS promo_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_slug TEXT UNIQUE NOT NULL,
  event_day TEXT NOT NULL, -- TUESDAY | FRIDAY etc.
  start_time TIME DEFAULT '00:00:00',
  end_time TIME DEFAULT '23:59:59',
  is_enabled BOOLEAN DEFAULT true,
  headline TEXT NOT NULL,
  description TEXT,
  banner_image_url TEXT,
  discount_percent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE promo_events ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Public can read enabled promo events" ON promo_events;
CREATE POLICY "Public can read enabled promo events"
  ON promo_events FOR SELECT
  USING (is_enabled = true);

DROP POLICY IF EXISTS "Admins can manage promo events" ON promo_events;
CREATE POLICY "Admins can manage promo events"
  ON promo_events FOR ALL
  USING (auth.role() = 'authenticated');

-- 4. Seed with requested events
INSERT INTO promo_events (event_slug, event_day, headline, description, discount_percent)
VALUES 
  (
    'selasa_mega_sale', 
    'TUESDAY', 
    'Selasa Mega Sale', 
    'Mega Sale di hari Selasa! Diskon s.d 50% untuk semua menu.', 
    50
  ),
  (
    'jumat_berkah', 
    'FRIDAY', 
    'Jumat Berkah', 
    'Berbagi kebahagiaan di hari Jumat. Beli 1 Lusin Gratis 2 Donat!', 
    0
  )
ON CONFLICT (event_slug) DO UPDATE 
SET event_day = EXCLUDED.event_day,
    headline = EXCLUDED.headline,
    description = EXCLUDED.description,
    discount_percent = EXCLUDED.discount_percent;
