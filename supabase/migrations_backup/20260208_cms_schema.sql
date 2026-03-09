-- CMS Database Schema for HR-One Donuts

-- 1. HERO SECTION
CREATE TABLE IF NOT EXISTS public.hero (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    cta_text TEXT DEFAULT 'Order Now',
    cta_link TEXT DEFAULT '/catalog',
    image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL NOT NULL,
    description TEXT,
    image_url TEXT,
    tag TEXT, -- e.g., 'Best Seller', 'New'
    category TEXT DEFAULT 'Classic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. REASONS (Mengapa Memilih Kami)
CREATE TABLE IF NOT EXISTS public.reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT, -- Lucide or Material icon name
    order_index INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SETTINGS (Footer, SEO, Contact)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. FEATURED PRODUCTS (Top Picks)
CREATE TABLE IF NOT EXISTS public.featured_products (
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    order_index INT DEFAULT 0,
    PRIMARY KEY (product_id)
);

-- RLS POLICIES

-- Enable RLS
ALTER TABLE public.hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_products ENABLE ROW LEVEL SECURITY;

-- Public READ Access
DROP POLICY IF EXISTS "Allow public read on hero" ON public.hero;
CREATE POLICY "Allow public read on hero" ON public.hero FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on products" ON public.products;
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on reasons" ON public.reasons;
CREATE POLICY "Allow public read on reasons" ON public.reasons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on settings" ON public.settings;
CREATE POLICY "Allow public read on settings" ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on featured_products" ON public.featured_products;
CREATE POLICY "Allow public read on featured_products" ON public.featured_products FOR SELECT USING (true);

-- Admin WRITE Access (Authenticated only)
DROP POLICY IF EXISTS "Allow admin write on hero" ON public.hero;
CREATE POLICY "Allow admin write on hero" ON public.hero FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin write on products" ON public.products;
CREATE POLICY "Allow admin write on products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin write on reasons" ON public.reasons;
CREATE POLICY "Allow admin write on reasons" ON public.reasons FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin write on settings" ON public.settings;
CREATE POLICY "Allow admin write on settings" ON public.settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin write on featured_products" ON public.featured_products;
CREATE POLICY "Allow admin write on featured_products" ON public.featured_products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- INITIAL SEED DATA (Optional)
INSERT INTO public.hero (title, subtitle, description) 
VALUES ('HR-One Donuts', 'Homemade with Love', 'Nikmati kelembutan donat ragi premium kami.')
ON CONFLICT DO NOTHING;
