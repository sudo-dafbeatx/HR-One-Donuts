-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  min_purchase INTEGER DEFAULT 0,
  max_discount INTEGER,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vouchers_modtime
BEFORE UPDATE ON vouchers
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Enable RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Policies for Vouchers
-- Public can read active vouchers (within date range and not exceeding limit)
DROP POLICY IF EXISTS "Public can read active vouchers" ON vouchers;
CREATE POLICY "Public can read active vouchers"
  ON vouchers FOR SELECT
  USING (
    status = true 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
    AND (usage_limit IS NULL OR used_count < usage_limit)
  );

-- Admins get full access
DROP POLICY IF EXISTS "Admins can manage vouchers" ON vouchers;
CREATE POLICY "Admins can manage vouchers"
  ON vouchers FOR ALL
  USING (auth.role() = 'authenticated');
