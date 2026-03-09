-- 1. Add birth_date and is_verified to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. Update existing trigger to insert birth_date on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, address, role, birth_date)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address',
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    NULLIF(new.raw_user_meta_data->>'birth_date', '')::DATE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger to auto-verify profile based on completeness
CREATE OR REPLACE FUNCTION public.update_profile_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.full_name IS NOT NULL AND NEW.phone IS NOT NULL AND NEW.birth_date IS NOT NULL THEN
    NEW.is_verified = TRUE;
  ELSE
    NEW.is_verified = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_verify_profile ON public.profiles;
CREATE TRIGGER trg_auto_verify_profile
BEFORE INSERT OR UPDATE OF full_name, phone, birth_date ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_verification();

-- 4. Initial Sync for existing users who already completed their setup
UPDATE public.profiles p
SET birth_date = up.birth_date
FROM public.user_profiles up
WHERE p.id = up.id AND p.birth_date IS NULL;

UPDATE public.profiles
SET is_verified = TRUE
WHERE full_name IS NOT NULL AND phone IS NOT NULL AND birth_date IS NOT NULL;
