import { createServiceRoleClient } from '@/lib/supabase/server';
import ThemeEditor from '@/components/admin/CMS/ThemeEditor';
import UICopyEditor from '@/components/admin/CMS/UICopyEditor';
import { getTheme, getCopy } from '@/lib/theme';
import { UITheme } from '@/types/cms';

export default async function ThemePage() {
  let theme: UITheme;
  let copy: Record<string, string>;

  try {
    // Verify table exists by attempting fetch
    const supabase = createServiceRoleClient();
    const { error: themeError } = await supabase.from('ui_theme').select('id').limit(1);
    
    if (themeError) {
      return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">Theme & Teks UI</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-yellow-800">
            <h3 className="font-bold mb-2">⚠️ Tabel belum tersedia</h3>
            <p className="text-sm">Jalankan migration SQL <code className="bg-yellow-100 px-1 py-0.5 rounded">20260216_ui_theme_and_copy.sql</code> terlebih dahulu di Supabase Dashboard.</p>
          </div>
        </div>
      );
    }

    theme = await getTheme();
    copy = await getCopy();
  } catch {
    theme = (await import('@/lib/theme')).DEFAULT_THEME;
    copy = (await import('@/lib/theme')).DEFAULT_COPY;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">Theme & Teks UI</h1>
        <p className="text-slate-500">Ubah warna, font, dan semua teks UI website dari sini.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">1. Theme & Branding</h2>
        <ThemeEditor initialTheme={theme} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">2. Teks UI</h2>
        <UICopyEditor initialCopy={copy} />
      </section>
    </div>
  );
}
