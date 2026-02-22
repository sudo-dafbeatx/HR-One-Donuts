-- Migration: Settings Suite Schema
-- Description: Adds tables and fields for Account, Addresses, and Bot Preferences.

-- 1. Expand user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{"facebook": "", "instagram": "", "tiktok": ""}',
ADD COLUMN IF NOT EXISTS chatbot_disabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_location BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS privacy_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS privacy_profile BOOLEAN DEFAULT true;

-- 2. Create user_addresses table
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  label TEXT DEFAULT 'Rumah', -- 'Rumah' or 'Kantor'
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  street_name TEXT NOT NULL,
  building_name TEXT,
  house_no TEXT,
  additional_details TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_addresses
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Policies for user_addresses
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.user_addresses;
CREATE POLICY "Users can manage their own addresses"
  ON public.user_addresses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Create article_satisfaction table
CREATE TABLE IF NOT EXISTS public.article_satisfaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  article_id TEXT NOT NULL,
  is_satisfied BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for article_satisfaction
ALTER TABLE public.article_satisfaction ENABLE ROW LEVEL SECURITY;

-- Policy for article_satisfaction (Insert only for users, read for admins)
DROP POLICY IF EXISTS "Users can insert satisfaction logs" ON public.article_satisfaction;
CREATE POLICY "Users can insert satisfaction logs"
  ON public.article_satisfaction FOR INSERT
  WITH CHECK (true); -- Allow anonymous if not logged in, or tied to session

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
