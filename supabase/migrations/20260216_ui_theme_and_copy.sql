-- ================================================
-- CMS Theme & UI Copy System
-- ================================================

-- 1. ui_theme table (single-row configuration)
CREATE TABLE IF NOT EXISTS ui_theme (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color varchar(9) NOT NULL DEFAULT '#1152d4',
  secondary_color varchar(9) NOT NULL DEFAULT '#3b82f6',
  background_color varchar(9) NOT NULL DEFAULT '#f6f7f8',
  text_color varchar(9) NOT NULL DEFAULT '#0f172a',
  heading_font varchar(100) NOT NULL DEFAULT 'Sora',
  body_font varchar(100) NOT NULL DEFAULT 'Public Sans',
  button_radius int NOT NULL DEFAULT 8,
  card_radius int NOT NULL DEFAULT 8,
  updated_at timestamptz DEFAULT now()
);

-- 2. ui_copy table (key-value store for all UI text)
CREATE TABLE IF NOT EXISTS ui_copy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(100) UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- ================================================
-- RLS Policies
-- ================================================

ALTER TABLE ui_theme ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_copy ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "ui_theme_public_read" ON ui_theme FOR SELECT USING (true);
CREATE POLICY "ui_copy_public_read" ON ui_copy FOR SELECT USING (true);

-- Admin write (uses profiles.role check)
CREATE POLICY "ui_theme_admin_write" ON ui_theme
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "ui_copy_admin_write" ON ui_copy
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ================================================
-- Seed: Default Theme
-- ================================================
INSERT INTO ui_theme (primary_color, secondary_color, background_color, text_color, heading_font, body_font, button_radius, card_radius)
VALUES ('#1152d4', '#3b82f6', '#f6f7f8', '#0f172a', 'Sora', 'Public Sans', 8, 8)
ON CONFLICT DO NOTHING;

-- ================================================
-- Seed: Default UI Copy
-- ================================================
INSERT INTO ui_copy (key, value) VALUES
  -- Navigation
  ('nav_home', 'Home'),
  ('nav_menu', 'Menu'),
  ('nav_account', 'Account'),
  ('search_placeholder', 'Cari donat...'),
  
  -- Hero / Banners
  ('hero_title', 'HR-One Donuts'),
  ('hero_subtitle', 'Resep Tradisional, Rasa Internasional'),
  ('banner_1_label', 'Flash Sale'),
  ('banner_1_title', 'Diskon s.d 50%'),
  ('banner_1_subtitle', 'Jam 14:00 - 16:00'),
  ('banner_2_label', 'Jumat Berkah'),
  ('banner_2_title', 'Beli 1 Lusin'),
  ('banner_2_subtitle', 'Gratis 2 Donat'),
  ('banner_3_label', 'Takjil Series'),
  ('banner_3_title', 'Menu Buka Puasa'),
  ('banner_3_subtitle', 'Mulai Rp 10rb'),
  
  -- Product Section
  ('section_catalog', 'Pilihan Terbaik'),
  ('section_catalog_desc', 'Recommended daily delights for you'),
  ('cta_add_cart', '+ Keranjang'),
  ('cta_buy', 'Beli Sekarang'),
  ('sold_label', 'Terjual'),
  
  -- Badges
  ('badge_promo', 'PROMO'),
  ('badge_limited', 'LIMITED'),
  ('badge_bestseller', 'TERLARIS'),
  
  -- Footer
  ('footer_copyright', '© 2024 HR-One Donuts. All rights reserved.'),
  ('footer_quicklinks', 'Quick Links'),
  ('footer_support', 'Customer Support'),
  ('footer_contact', 'Contact Us'),
  
  -- Empty states
  ('empty_products', 'Belum ada produk aktif.'),
  ('empty_category', 'Tidak ada produk di kategori ini.')
ON CONFLICT (key) DO NOTHING;
