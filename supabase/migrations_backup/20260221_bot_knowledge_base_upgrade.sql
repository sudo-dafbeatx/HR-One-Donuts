-- Migration: Add 'tags' column to knowledge_base table
-- Description: Supports keyword-based matching for Bot Dona and aligns with JSON Schema.

-- 1. Add tags column
ALTER TABLE public.knowledge_base 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Update category constraint or defaults if needed
-- (Keeping current category implementation as is, but allowing more values via schema validation)

-- 3. Add unique constraint to question to support upsert (avoiding duplicate training data)
ALTER TABLE public.knowledge_base
ADD CONSTRAINT knowledge_base_question_key UNIQUE (question);

-- 4. Comment on column
COMMENT ON COLUMN public.knowledge_base.tags IS 'Keywords for better bot matching and organization';
