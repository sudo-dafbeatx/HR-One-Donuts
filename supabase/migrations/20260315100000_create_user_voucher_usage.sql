-- Create user_voucher_usage table for tracking voucher usage per user
CREATE TABLE IF NOT EXISTS user_voucher_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
  voucher_code TEXT NOT NULL,
  discount_value INTEGER NOT NULL DEFAULT 0,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  device_id TEXT,
  ip_address TEXT,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_voucher_usage ENABLE ROW LEVEL SECURITY;

-- Users can only read their own usage history
DROP POLICY IF EXISTS "Users can read own voucher usage" ON user_voucher_usage;
CREATE POLICY "Users can read own voucher usage"
  ON user_voucher_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own usage records
DROP POLICY IF EXISTS "Users can insert own voucher usage" ON user_voucher_usage;
CREATE POLICY "Users can insert own voucher usage"
  ON user_voucher_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins get full access
DROP POLICY IF EXISTS "Admins can manage voucher usage" ON user_voucher_usage;
CREATE POLICY "Admins can manage voucher usage"
  ON user_voucher_usage FOR ALL
  USING (auth.role() = 'authenticated');
