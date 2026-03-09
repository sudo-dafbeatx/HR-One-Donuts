-- Migration: Add delivery fields to orders
-- Description: Track how the user wants their donuts (pickup vs delivery) and how much they paid for shipping.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'delivery',
ADD COLUMN IF NOT EXISTS shipping_fee INTEGER DEFAULT 0;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
