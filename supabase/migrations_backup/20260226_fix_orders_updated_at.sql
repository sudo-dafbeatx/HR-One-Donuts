-- =========================================================================
-- FIX MISSING COLUMN: Add updated_at to orders
-- This migration resolves the schema cache error during order status updates
-- =========================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'orders'
          AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END
$$;

-- Reload Supabase PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
