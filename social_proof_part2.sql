-- =====================================================
-- Social Proof Update 2: Stats View (FIXED)
-- =====================================================

-- 1. DROP THE EXISTING VIEW TO AVOID COLUMN CONFLICTS
DROP VIEW IF EXISTS public.product_review_stats;

-- 2. CREATE VIEW FOR REVIEW STATS
CREATE VIEW public.product_review_stats AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  COALESCE(ROUND(AVG(r.rating), 1)::float, 0) as average_rating,
  COUNT(r.id) as total_reviews,
  COALESCE(SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END), 0) as five_star_count,
  COALESCE(SUM(CASE WHEN r.rating >= 4 AND r.rating < 5 THEN 1 ELSE 0 END), 0) as four_star_count,
  COALESCE(SUM(CASE WHEN r.rating >= 3 AND r.rating < 4 THEN 1 ELSE 0 END), 0) as three_star_count,
  COALESCE(SUM(CASE WHEN r.rating >= 2 AND r.rating < 3 THEN 1 ELSE 0 END), 0) as two_star_count,
  COALESCE(SUM(CASE WHEN r.rating >= 1 AND r.rating < 2 THEN 1 ELSE 0 END), 0) as one_star_count
FROM public.products p
LEFT JOIN public.product_reviews r ON p.id = r.product_id
GROUP BY p.id, p.name;

-- 3. GRANT ACCESS TO THE VIEW
GRANT SELECT ON public.product_review_stats TO anon, authenticated;
