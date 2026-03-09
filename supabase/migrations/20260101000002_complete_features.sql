-- =====================================================
-- COMPLETE FEATURES SCHEMA
-- This migration restores all tables and logic required for the full donut shop experience.
-- =====================================================

-- 1. UTILITIES & HELPERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. PRODUCTS ENHANCEMENTS
-- =====================================================
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS package_type TEXT DEFAULT 'satuan',
  ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS promo_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS promo_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tag TEXT;

-- 3. CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin());

INSERT INTO public.categories (name) VALUES ('Donat') ON CONFLICT (name) DO NOTHING;

-- 4. PROMO EVENTS (Weekly/Seasonal)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.promo_events (
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

ALTER TABLE public.promo_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read promo events" ON public.promo_events FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins can manage promo events" ON public.promo_events FOR ALL USING (public.is_admin());

INSERT INTO public.promo_events (event_slug, event_day, headline, description, discount_percent)
VALUES 
  ('selasa_mega_sale', 'TUESDAY', 'Selasa Mega Sale', 'Mega Sale di hari Selasa! Diskon s.d 50% untuk semua menu.', 50),
  ('jumat_berkah', 'FRIDAY', 'Jumat Berkah', 'Berbagi kebahagiaan di hari Jumat. Beli 1 Lusin Gratis 2 Donat!', 0)
ON CONFLICT (event_slug) DO NOTHING;

-- 5. FLASH SALES
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

ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read flash sales" ON public.flash_sales FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage flash sales" ON public.flash_sales FOR ALL USING (public.is_admin());

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

ALTER TABLE public.flash_sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read flash sale items" ON public.flash_sale_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage flash sale items" ON public.flash_sale_items FOR ALL USING (public.is_admin());

-- 6. PRODUCT REVIEWS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own review" ON public.product_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own review" ON public.product_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW public.product_review_stats
WITH (security_invoker=true) AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  COALESCE(ROUND(AVG(pr.rating)::numeric, 1), 0) as average_rating,
  COUNT(pr.id) as total_reviews
FROM public.products p
LEFT JOIN public.product_reviews pr ON p.id = pr.product_id
GROUP BY p.id, p.name;

-- 7. CMS THEME & COPY
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ui_theme (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color varchar(9) NOT NULL DEFAULT '#1152d4',
  secondary_color varchar(9) NOT NULL DEFAULT '#3b82f6',
  background_color varchar(9) NOT NULL DEFAULT '#f6f7f8',
  text_color varchar(9) NOT NULL DEFAULT '#0f172a',
  heading_font varchar(100) NOT NULL DEFAULT 'Sora',
  body_font varchar(100) NOT NULL DEFAULT 'Public Sans',
  button_radius int NOT NULL DEFAULT 8,
  card_radius int NOT NULL DEFAULT 16,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ui_copy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(100) UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ui_theme ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_copy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read theme" ON public.ui_theme FOR SELECT USING (true);
CREATE POLICY "Public read copy" ON public.ui_copy FOR SELECT USING (true);
CREATE POLICY "Admin write theme" ON public.ui_theme FOR ALL USING (public.is_admin());
CREATE POLICY "Admin write copy" ON public.ui_copy FOR ALL USING (public.is_admin());

INSERT INTO public.ui_theme (primary_color, secondary_color, heading_font, body_font)
VALUES ('#1152d4', '#3b82f6', 'Sora', 'Public Sans')
ON CONFLICT DO NOTHING;

-- 8. ADDRESSES & SESSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  label TEXT DEFAULT 'Rumah',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  province TEXT,
  city TEXT,
  district TEXT,
  postal_code TEXT,
  street_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own address" ON public.user_addresses FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.checkout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    total_amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. KNOWLEDGE BASE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read knowledge" ON public.knowledge_base FOR SELECT USING (true);
CREATE POLICY "Admin manage knowledge" ON public.knowledge_base FOR ALL USING (public.is_admin());

-- 10. ORDERS MODIFICATION
-- =====================================================
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 11. ARTICLE SATISFACTION
-- =====================================================
CREATE TABLE IF NOT EXISTS public.article_satisfaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  article_id TEXT NOT NULL,
  is_satisfied BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.article_satisfaction ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone insert satisfaction" ON public.article_satisfaction FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read satisfaction" ON public.article_satisfaction FOR SELECT USING (public.is_admin());

-- RELOAD CACHE
NOTIFY pgrst, 'reload schema';
