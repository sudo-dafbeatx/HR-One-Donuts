-- =====================================================
-- NORMALIZE PHONE NUMBERS & ENFORCE UNIQUE CONSTRAINT
-- Migration: 20260221_normalize_phone_numbers
-- =====================================================

-- 1. Create a function to normalize phone numbers
CREATE OR REPLACE FUNCTION normalize_phone(p_phone TEXT) RETURNS TEXT AS $$
DECLARE
  v_cleaned TEXT;
BEGIN
  IF p_phone IS NULL OR p_phone = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remove all non-digit characters
  v_cleaned := regexp_replace(p_phone, '\D', '', 'g');
  
  -- Handle prefixes
  IF v_cleaned LIKE '08%' THEN
    v_cleaned := '628' || substr(v_cleaned, 3);
  ELSIF v_cleaned LIKE '8%' THEN
    v_cleaned := '628' || substr(v_cleaned, 2);
  END IF;
  
  RETURN v_cleaned;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Normalize existing data in `profiles` and handle duplicates
-- To safely add a UNIQUE constraint, we must ensure no duplicates exist.
-- If duplicates exist, we keep the one created most recently and suffix the others.
WITH normalized_profiles AS (
  SELECT id, normalize_phone(phone) AS norm_phone, created_at
  FROM profiles
  WHERE phone IS NOT NULL AND phone != ''
),
ranked_profiles AS (
  SELECT id, norm_phone,
         ROW_NUMBER() OVER(PARTITION BY norm_phone ORDER BY created_at DESC) as rn
  FROM normalized_profiles
  WHERE norm_phone IS NOT NULL
)
UPDATE profiles
SET phone = CASE
              WHEN r.rn = 1 THEN r.norm_phone
              ELSE r.norm_phone || '_DUP_' || substr(profiles.id::text, 1, 6)
            END
FROM ranked_profiles r
WHERE profiles.id = r.id;

-- 3. Add UNIQUE constraint to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_phone_unique'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);
  END IF;
END $$;
