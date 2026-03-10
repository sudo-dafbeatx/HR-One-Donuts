-- Fix user_addresses table: add missing columns used by the address form
ALTER TABLE public.user_addresses
  ADD COLUMN IF NOT EXISTS building_name TEXT,
  ADD COLUMN IF NOT EXISTS house_no TEXT,
  ADD COLUMN IF NOT EXISTS additional_details TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

NOTIFY pgrst, 'reload schema';
