-- =====================================================
-- Social Proof Update 2: Stats View
-- =====================================================

-- 1. CREATE VIEW FOR REVIEW STATS
CREATE OR REPLACE VIEW public.product_review_stats AS
SELECT 
  product_id,
  ROUND(AVG(rating), 1)::float as average_rating,
  COUNT(*) as total_reviews,
  SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star_count,
  SUM(CASE WHEN rating >= 4 AND rating < 5 THEN 1 ELSE 0 END) as four_star_count,
  SUM(CASE WHEN rating >= 3 AND rating < 4 THEN 1 ELSE 0 END) as three_star_count,
  SUM(CASE WHEN rating >= 2 AND rating < 3 THEN 1 ELSE 0 END) as two_star_count,
  SUM(CASE WHEN rating >= 1 AND rating < 2 THEN 1 ELSE 0 END) as one_star_count
FROM public.product_reviews
GROUP BY product_id;

-- 2. GRANT ACCESS TO THE VIEW
GRANT SELECT ON public.product_review_stats TO anon, authenticated;
