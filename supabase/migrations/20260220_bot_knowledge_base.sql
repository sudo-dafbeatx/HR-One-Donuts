-- =====================================================
-- Bot Training Feature (Knowledge Base & Question Logs)
-- =====================================================

-- 1. Knowledge Base Table
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bot Questions Log Table
CREATE TABLE IF NOT EXISTS public.bot_questions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_answered BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_questions_log ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for knowledge_base
-- Only admins can CRUD knowledge_base
-- (Assuming public.is_admin() exists from previous migrations)
DROP POLICY IF EXISTS "Admins can CRUD knowledge_base" ON public.knowledge_base;
CREATE POLICY "Admins can CRUD knowledge_base"
    ON public.knowledge_base
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Everyone can view knowledge_base" ON public.knowledge_base;
CREATE POLICY "Everyone can view knowledge_base"
    ON public.knowledge_base
    FOR SELECT
    USING (true);

-- 5. RLS Policies for bot_questions_log
-- Public/Authenticated users can insert questions
DROP POLICY IF EXISTS "Anyone can insert to bot_questions_log" ON public.bot_questions_log;
CREATE POLICY "Anyone can insert to bot_questions_log"
    ON public.bot_questions_log
    FOR INSERT
    WITH CHECK (true);

-- Only admins can view and delete logs
DROP POLICY IF EXISTS "Admins can manage bot_questions_log" ON public.bot_questions_log;
CREATE POLICY "Admins can manage bot_questions_log"
    ON public.bot_questions_log
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Trigger for updated_at in knowledge_base
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.knowledge_base;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
