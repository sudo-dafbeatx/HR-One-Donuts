-- =====================================================
-- FIX REGISTRATION TRIGGERS
-- Updates the `handle_new_customer` and `handle_new_user` triggers
-- to fully extract profile data sent during registration
-- (phone, birth_date, address) and auto-complete onboarding.
-- =====================================================

-- 1. Update the handler for `user_profiles` (Customer Profile)
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS trigger AS $$
DECLARE
  extracted_phone TEXT;
  extracted_birth_date DATE;
  extracted_address TEXT;
  is_complete BOOLEAN;
BEGIN
  -- Extract raw metadata safely
  extracted_phone := NEW.raw_user_meta_data->>'phone';
  extracted_address := NEW.raw_user_meta_data->>'address';
  
  -- Handle birth_date casting safely
  BEGIN
    IF NEW.raw_user_meta_data->>'birth_date' IS NOT NULL AND NEW.raw_user_meta_data->>'birth_date' != '' THEN
      extracted_birth_date := (NEW.raw_user_meta_data->>'birth_date')::date;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    extracted_birth_date := NULL;
  END;

  -- Determine if profile meets basic completion criteria (has phone and address)
  is_complete := (extracted_phone IS NOT NULL AND extracted_address IS NOT NULL);

  -- Insert into public.user_profiles
  INSERT INTO public.user_profiles (
    id, 
    email, 
    full_name, 
    phone, 
    phone_number,
    birth_date, 
    address_detail, 
    is_profile_complete
  )
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    extracted_phone,
    extracted_phone,
    extracted_birth_date,
    extracted_address,
    is_complete
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    phone_number = EXCLUDED.phone_number,
    birth_date = EXCLUDED.birth_date,
    address_detail = EXCLUDED.address_detail,
    is_profile_complete = EXCLUDED.is_profile_complete;

  -- Automatically generate a user_addresses entry if address provided
  IF extracted_address IS NOT NULL THEN
    INSERT INTO public.user_addresses (
      user_id,
      label,
      full_name,
      phone,
      street_name,
      is_default
    ) VALUES (
      NEW.id,
      'Rumah',
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      extracted_phone,
      extracted_address,
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Update the handler for `profiles` (Legacy/Basic Admin User fallback)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    phone,
    address,
    birth_date
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    NULLIF(NEW.raw_user_meta_data->>'birth_date', '')::date
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    birth_date = EXCLUDED.birth_date;
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Fallback logic just in case cast fails
  INSERT INTO public.profiles (id, email, full_name, phone, address)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. In case they were missing, make sure there are columns in profiles for them
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Notify PostgREST cache
NOTIFY pgrst, 'reload schema';
