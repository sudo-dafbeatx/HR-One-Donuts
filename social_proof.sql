-- =====================================================
-- Social Proof Update
-- =====================================================

-- 1. ADD sold_count TO products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- 2. CREATE product_reviews TABLE
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating DESC);

-- 4. ENABLE RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
-- Public can read all reviews
DROP POLICY IF EXISTS "Public can read product reviews" ON public.product_reviews;
CREATE POLICY "Public can read product reviews"
  ON public.product_reviews FOR SELECT
  USING (true);

-- Only admins or authenticated users can insert (for seed script, we might need admin or bypass)
-- Using authenticated role for potential real user reviews later
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.product_reviews;
CREATE POLICY "Authenticated users can insert reviews"
  ON public.product_reviews FOR INSERT
  USING (auth.role() = 'authenticated');

-- Admin can manage all reviews
DROP POLICY IF EXISTS "Admins can manage product reviews" ON public.product_reviews;
CREATE POLICY "Admins can manage product reviews"
  ON public.product_reviews FOR ALL
  USING (auth.role() = 'authenticated' AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
