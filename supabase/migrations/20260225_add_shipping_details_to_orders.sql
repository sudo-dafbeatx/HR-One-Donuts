-- Migration: Add shipping details to orders
-- Description: Track shipping address and notes for order delivery.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_notes TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
