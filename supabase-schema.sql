-- =====================================================
-- Donat Keluarga - Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. CREATE TABLES
-- =====================================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  items JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  total_items INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitors table (optional for page tracking)
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (admin users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_session ON visitors(session_id);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES
-- =====================================================

-- Products: Public can read active products
DROP POLICY IF EXISTS "Public can read products" ON products;
CREATE POLICY "Public can read products"
  ON products FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Only admins can modify products" ON products;
CREATE POLICY "Only admins can modify products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');

-- Orders: Anyone can insert with validation, admins can read all
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    items IS NOT NULL 
    AND jsonb_array_length(items) > 0
    AND total_amount > 0
    AND total_items > 0
  );

DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

-- Visitors: Anyone can insert with validation, admins can read
DROP POLICY IF EXISTS "Anyone can track visit" ON visitors;
CREATE POLICY "Anyone can track visit"
  ON visitors FOR INSERT
  WITH CHECK (
    page_path IS NOT NULL 
    AND length(page_path) > 0
  );

DROP POLICY IF EXISTS "Admins can read visitors" ON visitors;
CREATE POLICY "Admins can read visitors"
  ON visitors FOR SELECT
  USING (auth.role() = 'authenticated');

-- Profiles: Admins only
DROP POLICY IF EXISTS "Admins can view profiles" ON profiles;
CREATE POLICY "Admins can view profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- 5. CREATE VIEWS FOR ANALYTICS
-- =====================================================

-- Top products view (last 30 days)
CREATE OR REPLACE VIEW top_products 
WITH (security_invoker=true) AS
SELECT 
  p.id,
  p.name,
  p.price,
  COALESCE(SUM((item->>'quantity')::int), 0) as total_sold,
  COUNT(DISTINCT o.id) as order_count
FROM products p
LEFT JOIN orders o ON TRUE
LEFT JOIN LATERAL jsonb_array_elements(o.items) AS item ON (item->>'product_id') = p.id
WHERE o.created_at >= NOW() - INTERVAL '30 days' OR o.created_at IS NULL
GROUP BY p.id, p.name, p.price
ORDER BY total_sold DESC;

-- Daily stats view
CREATE OR REPLACE VIEW daily_stats 
WITH (security_invoker=true) AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  SUM(total_amount) as revenue,
  SUM(total_items) as items_sold
FROM orders
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 6. INSERT SAMPLE PRODUCTS
-- =====================================================

INSERT INTO products (id, name, price, description, image, category) VALUES
  ('classic-glazed', 'Classic Glazed', 12000, 'The timeless favorite, perfectly soft dough with a signature honey glaze.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0wiT6qFEqug77pjnddnAne8HeuukD0QKQPYpLrrYzgiAD4eeHfeVUXVsLMR3gOJBaPHEFrxsTVM9RDr4yuZlcPfXBEhtQz4XJnQ8lXrLZktcqZNDkHBkokHPBU9AdFvo6wEiEH5uZpNBn0HWwHB6MKcIp796GQALpJY6KyCPvc-tsqTY6EARbg_TzgbWWAE27bhWBtiQ7m-qjMr0QEgxbr5UWuJ9PrYX5bvjRbON66lewM-WnxrmIafCvxAgJM8SF_YGxq3x4Nh5v', 'classic'),
  ('chocolate-dream', 'Chocolate Dream', 15000, 'Indulgent dark chocolate ganache topped with belgian chocolate shavings.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAvhBgVo2CSujDOE--X4SqRz1zqunePaFhkFLk0t7pwzuDsaoO7B79bl4f0UTPBwCRiR2F4_2oqLAIt5enNT-z5kcnyy5obi6-AWQxN7Mfa4_pGkbiepFH2lIgrG3WzB7uLwma0puGIhInZN2fLVUwW-uE5jPg5Dw1VzhwfrDHiZBll3EKE5QgezTvLrkxuV3Y8EbhHzsdJk3jKmlfYkjdY5Rwl9UxyI7L1MMPHjRFtAXLO4o_BjI_hXHCusMmGXoMeRzO76q8s9Up', 'chocolate'),
  ('lotus-biscoff', 'Lotus Biscoff', 18000, 'Stuffed with cookie butter cream and topped with Biscoff crumble.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXZUAv6P31flDtamJ4ew3MIa5aPHhvqQvaWEUwTw9Tk7wAeuM5YhwBxjFgzDKJNjzvAGgtauD8P5f9VgYV6WhiFnPHc2YKqEcpMD8sW1CnZoIrZd0tqvNdxSikrY4K_xxdH6C4zkTJQJXWWQVpo-ucuU0Vj8j8E151aKGUTpDR5pcuEbUrJK4i2fH8E2reQKUFAIyu3f7b_f1KZ3GYSZhJEx0Rj_5xdJ9Ft5UZyoIAuB81kljutTr1AWG0G67SkvL-rokC9aqcpoJc', 'premium'),
  ('strawberry-sparkle', 'Strawberry Sparkle', 15000, 'Fresh strawberry icing made from real berries with white chocolate drizzle.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBdCwbJGcyKGuZNyKGLdPGYTpaSx9OHDl6d1g75lU92dmMoeb7jumEvxL1iETv_SOpzhiD4c19rizmq8vxcLNSYz6BQmv0e-6A3SmS8FjIr1F0wKCsSxt5mNi1XpDmeSOty14yE8fyb8Mv4SoBo_OKYEluj2S9E4WLbBRqNOZ4mNI-dLnK8o12nFPLUXmNzP97HFzhQOWaL1wckwlu1f7uY0AoAqQXVMW3BsWl5-Ap1_8EKWMwd_ul4djXhf9iFz-mjpDQGcoIET9d', 'fruity'),
  ('pistachio-perfection', 'Pistachio Perfection', 22000, 'Creamy pistachio glaze topped with roasted Sicilian pistachios.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtbRCzvOL8Eq45HBbGI-MoJomRyA-nbSNHucyKrUzQeeZQOTqH-jITHF8goPfCJlIvbvMVDsI8aaYp5mSZfiJN9Mrr5cqD3B3zWyRZsCXhYqwBr77PQv6t9q_QvsYbYwSH-yciFAm09HaqqgtaNaWekbG0R4cDDu2y5hPiRfmt-2bZFw4DL-GjEHV2OxMDix2pBX6lwGfTr-OL2460Gq_TZ4ckhJfxznd1CqbkGROcVvcBdNnF_139dZRuWFt4PcuDw1I4KclxP9mM', 'premium'),
  ('nutella-heaven', 'Nutella Heaven', 20000, 'Exploding with Nutella filling and dusted with fine icing sugar.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTfeQXZDwNKJFjSYk21Y0SAxtcSOL04N3RzYMHqQLCdQHar3ymKcwDoE0JSSWM4RsQytuvi_6QngzEHH88M84jMHpau0IQ7KUoktoWVPhpC90rbqGyQnUjlBqW2AUn3lTgm9I4Zhb9H57ULsmjff2qZ0Y7Z9eBcTe1yVhQPJ_wcDG9MnqMQSCA6OGCYnO1H3uow-Hejjwfg-Q4NXJ1UwB-rAnusrelW3OR56FZ0Z5uFxkCOTxCb02TbDRUJQpSFneqc66KTdB_I-Hg', 'chocolate'),
  ('blueberry-blast', 'Blueberry Blast', 15000, 'Wild blueberry preserve filling with a light vanilla icing.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAPyM3b51FTofVW3UaoJbWneerHLF1HLQExAVR3Rsf5Dp_D2iaqDE8uInBj_0o1Erc4xDXUaXP81xPZFuGFkQdXnrnUNjQ3_Z5-H-DtadzbUioY6R4epRLTVMSRGgOA6zxamOc66ubqNB8vjOHfjX_eUbjyVt20AKGmhX9S57BNWc3U6OVzH22SBa3v73RqmUZ711_1cRaWiY65NwCZZ-g_IytS_0QDwz9AsssdHvgG7u3_lpzCO8rVkgpnU6hYfENhuDJXHVhBjUS', 'fruity'),
  ('cinnamon-sugar', 'Cinnamon Sugar', 12000, 'Classic ring donut tossed in a warm cinnamon and sugar mix.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9DEpFh2H-6jbYZzji5-Ug0_AGsGA1VyUoIafT-HnTCUp2DyCeyl-QlDnI5ex1TOQ9bNOsY2sc6joAO004ztwldFm5UQGal-ueK4nxxFp1K6O83JMA3nexEdK0anWAWHr2Ontvy3Q_BaDMugAWD4spstD47YVuELScxD0rEIL8QkK_gbYKw9m4zOFuDbuAi8bnOoiHcCciASREO_W-FhK79Zg__qJGShOl9m1KjPRu9GnfS5G_UCdRJWpQ_yywCyc8VHO-Arg-8ZjL', 'classic')
ON CONFLICT (id) DO NOTHING;

-- 7. CREATE TRIGGER FOR AUTO PROFILE CREATION
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- DONE! 
-- Next: Create admin user in Supabase UI or with signup
-- =====================================================
