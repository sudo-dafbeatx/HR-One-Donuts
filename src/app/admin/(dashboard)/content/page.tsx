import { createServerSupabaseClient } from '@/lib/supabase/server';
import HeroEditor from '@/components/admin/CMS/HeroEditor';
import ReasonsEditor from '@/components/admin/CMS/ReasonsEditor';
import { AdminCard } from '@/components/admin/CMS/Shared';

export default async function ContentPage() {
  const supabase = await createServerSupabaseClient();
  
  // Fetch hero data
  const { data: hero } = await supabase
    .from('hero')
    .select('*')
    .limit(1)
    .single();

  // Fetch reasons
  const { data: reasons } = await supabase
    .from('reasons')
    .select('*')
    .order('order_index', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-heading mb-2">Manajemen Konten</h1>
        <p className="text-slate-500">Kelola hagian-hagian utama website Anda.</p>
      </div>

      <HeroEditor initialData={hero || undefined} />

      <ReasonsEditor initialReasons={reasons || []} />
      
      {/* Placeholder for other sections */}
      <AdminCard title="About Us & Footer">
        <p className="text-slate-500 text-sm">Fitur pengaturan footer dan tentang kami sedang dalam pengembangan.</p>
      </AdminCard>
    </div>
  );
}
