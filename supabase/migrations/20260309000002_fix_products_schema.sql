-- Fix products table schema for the new CMS
-- Rename `image` to `image_url` if it exists
DO $$ 
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='products' and column_name='image')
  THEN
      ALTER TABLE "public"."products" RENAME COLUMN "image" TO "image_url";
  END IF;
END $$;

-- Ensure `variants` JSONB column exists
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
