-- =====================================================
-- Add Birth Info to User Profiles
-- =====================================================

-- Add birth_place and birth_date to user_profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'birth_place') THEN
        ALTER TABLE public.user_profiles ADD COLUMN birth_place TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'birth_date') THEN
        ALTER TABLE public.user_profiles ADD COLUMN birth_date DATE;
    END IF;
END $$;
