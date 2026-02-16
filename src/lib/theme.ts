import { createServerSupabaseClient } from '@/lib/supabase/server';
import { UITheme } from '@/types/cms';
import { DEFAULT_THEME, DEFAULT_COPY } from '@/lib/theme-defaults';

// Re-export defaults for convenience
export { DEFAULT_THEME, DEFAULT_COPY };

// ==============================
// Server-side fetchers
// ==============================

export async function getTheme(): Promise<UITheme> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('ui_theme')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error || !data) return DEFAULT_THEME;
    return { ...DEFAULT_THEME, ...data };
  } catch {
    return DEFAULT_THEME;
  }
}

export async function getCopy(): Promise<Record<string, string>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('ui_copy')
      .select('key, value');
    
    if (error || !data) return DEFAULT_COPY;
    
    const copy: Record<string, string> = { ...DEFAULT_COPY };
    for (const row of data) {
      copy[row.key] = row.value;
    }
    return copy;
  } catch {
    return DEFAULT_COPY;
  }
}
