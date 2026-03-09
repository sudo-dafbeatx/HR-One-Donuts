-- Ensure settings table exists
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for middleware)
DROP POLICY IF EXISTS "Public can read settings" ON public.settings;
CREATE POLICY "Public can read settings" ON public.settings
FOR SELECT USING (true);

-- Allow admin write access (service role bypasses this)
DROP POLICY IF EXISTS "Only admin can modify settings" ON public.settings;
CREATE POLICY "Only admin can modify settings" ON public.settings
FOR ALL USING (auth.role() = 'authenticated');
