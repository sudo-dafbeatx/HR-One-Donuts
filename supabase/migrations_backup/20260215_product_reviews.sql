-- =====================================================
-- Product Reviews System - Database Schema
-- Migration: 20260215_product_reviews
-- =====================================================

-- 1. CREATE PRODUCT REVIEWS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- One review per user per product
);

-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.product_reviews(created_at DESC);

-- 3. CREATE TRIGGER FOR AUTO-UPDATE TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_review_updated_at()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON public.product_reviews;
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_review_updated_at();

-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES
-- =====================================================

-- Public can read all reviews
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.product_reviews;
CREATE POLICY "Anyone can read reviews"
  ON public.product_reviews FOR SELECT
  USING (true);

-- Authenticated users can insert reviews with validation
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.product_reviews;
CREATE POLICY "Authenticated users can create reviews"
  ON public.product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id -- Can only create review for yourself
    AND rating >= 1 
    AND rating <= 5
  );

-- Users can update their own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON public.product_reviews;
CREATE POLICY "Users can update own reviews"
  ON public.product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND rating >= 1
    AND rating <= 5
  );

-- Users can delete their own reviews
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.product_reviews;
CREATE POLICY "Users can delete own reviews"
  ON public.product_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. CREATE VIEW FOR PRODUCT REVIEW STATISTICS
-- =====================================================

CREATE OR REPLACE VIEW public.product_review_stats
WITH (security_invoker=true) AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  COALESCE(ROUND(AVG(pr.rating)::numeric, 1), 0) as average_rating,
  COUNT(pr.id) as total_reviews,
  COUNT(CASE WHEN pr.rating = 5 THEN 1 END) as five_star_count,
  COUNT(CASE WHEN pr.rating = 4 THEN 1 END) as four_star_count,
  COUNT(CASE WHEN pr.rating = 3 THEN 1 END) as three_star_count,
  COUNT(CASE WHEN pr.rating = 2 THEN 1 END) as two_star_count,
  COUNT(CASE WHEN pr.rating = 1 THEN 1 END) as one_star_count
FROM public.products p
LEFT JOIN public.product_reviews pr ON p.id = pr.product_id
GROUP BY p.id, p.name;

-- 7. CREATE FUNCTION TO GET REVIEWS WITH USER INFO
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_product_reviews_with_user_info(
  p_product_id TEXT,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  product_id TEXT,
  user_id UUID,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  reviewer_name TEXT,
  reviewer_avatar TEXT,
  reviewer_email TEXT
)
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.product_id,
    pr.user_id,
    pr.rating,
    pr.comment,
    pr.created_at,
    pr.updated_at,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      SPLIT_PART(u.email, '@', 1)
    ) as reviewer_name,
    COALESCE(
      u.raw_user_meta_data->>'avatar_url',
      u.raw_user_meta_data->>'picture'
    ) as reviewer_avatar,
    u.email as reviewer_email
  FROM public.product_reviews pr
  JOIN auth.users u ON pr.user_id = u.id
  WHERE pr.product_id = p_product_id
  ORDER BY pr.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =====================================================
-- DONE!
-- Product reviews table created with:
-- - One review per user per product constraint
-- - Star rating validation (1-5)
-- - Auto-updated timestamps
-- - RLS policies for security
-- - Statistics view for aggregated data
-- - Function to fetch reviews with user info
-- =====================================================
