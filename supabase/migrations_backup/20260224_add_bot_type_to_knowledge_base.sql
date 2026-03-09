-- Migration: Add 'bot_type' column to knowledge_base table
-- Purpose: Separate Bot Dona (Product) and Bot Onat (System/Teknis) knowledge.

ALTER TABLE public.knowledge_base 
ADD COLUMN IF NOT EXISTS bot_type text NOT NULL DEFAULT 'dona' CHECK (bot_type IN ('dona', 'onat'));

-- Default all existing Q&A to 'dona' logically.

COMMENT ON COLUMN public.knowledge_base.bot_type IS 'To distinguish between Dona (product) and Onat (system) data.';
