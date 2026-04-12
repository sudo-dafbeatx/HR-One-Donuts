-- =====================================================
-- HR-One Donuts: Social Proof Complete Fix
-- Run this ENTIRE script in Supabase SQL Editor (one shot)
-- =====================================================

-- ===== STEP 1: ENSURE sold_count COLUMN EXISTS =====
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- ===== STEP 2: UPDATE sold_count FOR ALL PRODUCTS =====
UPDATE public.products SET sold_count = 8742 WHERE id = (SELECT id FROM public.products ORDER BY created_at ASC LIMIT 1 OFFSET 0);
UPDATE public.products SET sold_count = 11845 WHERE id = (SELECT id FROM public.products ORDER BY created_at ASC LIMIT 1 OFFSET 1);
UPDATE public.products SET sold_count = 5291 WHERE id = (SELECT id FROM public.products ORDER BY created_at ASC LIMIT 1 OFFSET 2);
UPDATE public.products SET sold_count = 9563 WHERE id = (SELECT id FROM public.products ORDER BY created_at ASC LIMIT 1 OFFSET 3);
UPDATE public.products SET sold_count = 3847 WHERE id = (SELECT id FROM public.products ORDER BY created_at ASC LIMIT 1 OFFSET 4);
UPDATE public.products SET sold_count = 12103 WHERE id = (SELECT id FROM public.products ORDER BY created_at ASC LIMIT 1 OFFSET 5);
UPDATE public.products SET sold_count = 6428 WHERE id = (SELECT id FROM public.products ORDER BY created_at ASC LIMIT 1 OFFSET 6);
UPDATE public.products SET sold_count = 4215 WHERE id = (SELECT id FROM public.products ORDER BY created_at ASC LIMIT 1 OFFSET 7);
-- Catch remaining products
UPDATE public.products SET sold_count = floor(random() * 10000 + 2500)::int WHERE sold_count = 0 OR sold_count IS NULL;

-- ===== STEP 3: ENSURE product_reviews TABLE EXISTS =====
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID,
    user_name TEXT NOT NULL DEFAULT 'Pelanggan HR-One',
    rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user_name column if table already exists but column doesn't
ALTER TABLE public.product_reviews ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT 'Pelanggan HR-One';
ALTER TABLE public.product_reviews ADD COLUMN IF NOT EXISTS verified_purchase BOOLEAN DEFAULT true;
ALTER TABLE public.product_reviews ADD COLUMN IF NOT EXISTS user_id UUID;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON public.product_reviews(created_at DESC);

-- ===== STEP 4: ENABLE RLS & POLICIES =====
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read product reviews" ON public.product_reviews;
CREATE POLICY "Public can read product reviews"
  ON public.product_reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.product_reviews;
CREATE POLICY "Authenticated users can insert reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.product_reviews;
CREATE POLICY "Users can update own reviews"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.product_reviews;
CREATE POLICY "Users can delete own reviews"
  ON public.product_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ===== STEP 5: DROP AND RECREATE product_review_stats VIEW =====
DROP VIEW IF EXISTS public.product_review_stats;

CREATE VIEW public.product_review_stats AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  COALESCE(ROUND(AVG(r.rating), 1)::float, 0) as average_rating,
  COUNT(r.id)::int as total_reviews,
  COALESCE(SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END), 0)::int as five_star_count,
  COALESCE(SUM(CASE WHEN r.rating >= 4 AND r.rating < 5 THEN 1 ELSE 0 END), 0)::int as four_star_count,
  COALESCE(SUM(CASE WHEN r.rating >= 3 AND r.rating < 4 THEN 1 ELSE 0 END), 0)::int as three_star_count,
  COALESCE(SUM(CASE WHEN r.rating >= 2 AND r.rating < 3 THEN 1 ELSE 0 END), 0)::int as two_star_count,
  COALESCE(SUM(CASE WHEN r.rating >= 1 AND r.rating < 2 THEN 1 ELSE 0 END), 0)::int as one_star_count
FROM public.products p
LEFT JOIN public.product_reviews r ON p.id = r.product_id
GROUP BY p.id, p.name;

GRANT SELECT ON public.product_review_stats TO anon, authenticated;

-- ===== STEP 6: CLEAR OLD SEED DATA (if any) =====
DELETE FROM public.product_reviews WHERE user_id IS NULL;

-- ===== STEP 7: SEED REVIEWS (dynamic, works for ANY products in the DB) =====
-- This uses a DO block with PL/pgSQL to loop through all products and generate reviews

DO $$
DECLARE
  prod RECORD;
  review_count INT;
  i INT;
  rating_val NUMERIC(2,1);
  rand_val FLOAT;
  name_idx INT;
  comment_idx INT;
  suffix_idx INT;
  days_ago INT;
  review_date TIMESTAMPTZ;
  
  names TEXT[] := ARRAY[
    'Budi Santoso','Siti Rahayu','Ahmad Fauzi','Rina Wijaya','Dika Prasetyo',
    'Nia Pratiwi','Andi Kusuma','Dewi Sartika','Reza Pahlawan','Maya Indah',
    'Rizky Aditya','Putri Maharani','Yusuf Hidayat','Ayu Lestari','Eko Yulianto',
    'Dina Mariana','Fajar Nugroho','Siska Amelia','Hendra Gunawan','Fitri Handayani',
    'Agus Setiawan','Ratna Sari','Irfan Maulana','Wulan Septiani','Bayu Pratama',
    'Sri Wahyuni','Denny Kurniawan','Linda Permata','Arif Rahman','Mega Puspita',
    'Taufik Hidayat','Nisa Aulia','Bagus Wicaksono','Intan Maharani','Rangga Saputra',
    'Anisa Putri','Galih Permana','Citra Dewi','Wahyu Nugroho','Lestari Rahmawati',
    'Joko Susilo','Indah Permatasari','Doni Firmansyah','Eka Safitri','Teguh Wibowo',
    'Nurhasanah','Ardi Wijaya','Sari Mulyani','Bambang Supriadi','Yuni Kartika'
  ];
  
  suffixes TEXT[] := ARRAY['', ' S.', ' M.', ' W.', ' P.', ' R.', ' K.', ' H.', ' D.', ' A.'];
  
  comments TEXT[] := ARRAY[
    'Donutnya enak banget, toppingnya melimpah!',
    'Fresh banget, packaging premium dan rapi',
    'Paling suka variannya, rasanya unik',
    'Recommended banget untuk temen kantor',
    'Suka banget sama teksturnya yang empuk dan lembut',
    'Pesan untuk acara keluarga, semua pada suka!',
    'Rasanya premium, gak kalah sama brand besar',
    'Manisnya pas, gak bikin eneg. Mantap!',
    'Cepat sampai dan kondisinya masih sangat baik',
    'Varian rasanya unik-unik dan enak semua',
    'Udah repurchase berkali-kali saking enaknya',
    'Bikin nagih! Besok mau pesen lagi ah',
    'Donatnya lembut banget, meleleh di mulut',
    'Anak-anak suka banget, langsung habis',
    'Buat hadiah ulang tahun, tampilannya cantik',
    'Worth the price! Kualitasnya memang top',
    'Packagingnya bagus, cocok buat gift',
    'Rasa coklatnya rich banget, mantul!',
    'Glazingnya pas, gak terlalu manis',
    'Best donut yang pernah aku cobain!',
    'Delivery cepat, donatnya masih fresh',
    'Porsinya besar, toppingnya royal',
    'Cocok buat cemilan weekend sama keluarga',
    'Teksturnya fluffy, toppingnya crunchy. Perfect!',
    'Donut favorit keluarga sejak pertama coba',
    'Selalu konsisten rasanya, gak pernah mengecewakan',
    'Beli 1 lusin langsung habis dalam sehari',
    'Harga terjangkau untuk kualitas se-premium ini',
    'Adonannya lembut, isian creamnya melimpah',
    'Gak nyesel order, pasti repeat order lagi',
    'Pelayanan ramah, pengiriman cepat & aman',
    'Donut terenak yang pernah aku pesan online',
    'Wajib coba! Gak bakal kecewa deh',
    'Rasanya bikin happy, mood booster banget',
    'Tampilannya cantik, rasanya juga top markotop'
  ];

BEGIN
  FOR prod IN SELECT id FROM public.products WHERE is_active = true
  LOOP
    -- Random review count between 150–450
    review_count := floor(random() * 300 + 150)::int;
    
    FOR i IN 1..review_count
    LOOP
      -- Rating distribution: ~60% = 5, ~25% = 4, ~10% = 3, ~3% = 2, ~2% = 1
      rand_val := random();
      IF rand_val < 0.60 THEN
        rating_val := 5;
      ELSIF rand_val < 0.85 THEN
        rating_val := 4;
      ELSIF rand_val < 0.95 THEN
        rating_val := 3;
      ELSIF rand_val < 0.98 THEN
        rating_val := 2;
      ELSE
        rating_val := 1;
      END IF;
      
      -- Random name
      name_idx := floor(random() * array_length(names, 1) + 1)::int;
      suffix_idx := floor(random() * array_length(suffixes, 1) + 1)::int;
      comment_idx := floor(random() * array_length(comments, 1) + 1)::int;
      
      -- Random date 1–365 days ago
      days_ago := floor(random() * 365 + 1)::int;
      review_date := NOW() - (days_ago || ' days')::interval 
                     - (floor(random() * 24)::int || ' hours')::interval 
                     - (floor(random() * 60)::int || ' minutes')::interval;
      
      INSERT INTO public.product_reviews (
        product_id, user_name, rating, comment, verified_purchase, created_at, updated_at
      ) VALUES (
        prod.id,
        names[name_idx] || suffixes[suffix_idx],
        rating_val,
        comments[comment_idx],
        true,
        review_date,
        review_date
      );
    END LOOP;
    
    RAISE NOTICE 'Seeded % reviews for product %', review_count, prod.id;
  END LOOP;
END $$;

-- ===== STEP 8: VERIFY =====
SELECT 
  p.name, 
  p.sold_count,
  COUNT(r.id) as review_count, 
  ROUND(AVG(r.rating), 2) as avg_rating
FROM public.products p
LEFT JOIN public.product_reviews r ON p.id = r.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.sold_count
ORDER BY p.name;
