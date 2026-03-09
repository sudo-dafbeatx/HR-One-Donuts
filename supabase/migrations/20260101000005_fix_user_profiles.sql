-- =====================================================
-- FIX USER PROFILES TABLE SCHEMA
-- Adds missing columns required by the onboarding form
-- =====================================================

ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS birth_place TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Ensure RLS allows users to manage their own additional fields
-- (Policies should already cover this if "Users manage own user_profiles" is active)
