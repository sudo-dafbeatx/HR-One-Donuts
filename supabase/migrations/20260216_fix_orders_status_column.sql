-- FIX ORDERS TABLE SCHEMA INCONSISTENCY
-- Migration: 20260216_fix_orders_status_column
-- Description: Ensures 'status' column exists in 'orders' table and reloads schema cache.

-- 1. Add status column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN status TEXT DEFAULT 'pending';
        RAISE NOTICE 'Added status column to orders table.';
    ELSE
        RAISE NOTICE 'Status column already exists in orders table.';
    END IF;
END $$;

-- 2. Ensure session_id and items columns also exist (hardening)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'session_id') THEN
        ALTER TABLE public.orders ADD COLUMN session_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'items') THEN
        ALTER TABLE public.orders ADD COLUMN items JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
