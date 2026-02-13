import { createServerSupabaseClient } from '@/lib/supabase/server';
import HeroEditor from '@/components/admin/CMS/HeroEditor';
import ReasonsEditor from '@/components/admin/CMS/ReasonsEditor';
import EventManager from '@/components/admin/CMS/EventManager';
import { AdminCard } from '@/components/admin/CMS/Shared';

export default async function ContentPage() {
  const supabase = await createServerSupabaseClient();
  
  // Fetch hero data - using maybeSingle to avoid error if empty
  const { data: hero, error: heroError } = await supabase
    .from('hero')
    .select('*')
    .maybeSingle();

  if (heroError && heroError.code !== 'PGRST116') {
    console.error('Error fetching hero:', heroError);
  }

  // Fetch reasons
  const { data: reasons, error: reasonsError } = await supabase
    .from('reasons')
    .select('*')
    .order('order_index', { ascending: true });

  if (reasonsError) {
    console.error('Error fetching reasons:', reasonsError);
  }

  // Fetch events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (eventsError) {
    console.error('Error fetching events:', eventsError);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-heading mb-2">Manajemen Konten</h1>
        <p className="text-slate-500">Kelola hagian-hagian utama website Anda.</p>
      </div>

      <HeroEditor initialData={hero || undefined} />

      <EventManager initialEvents={events || []} />

      <ReasonsEditor initialReasons={reasons || []} />
      
      {/* Placeholder for other sections */}
      <AdminCard title="About Us & Footer">
        <p className="text-slate-500 text-sm">Fitur pengaturan footer dan tentang kami sedang dalam pengembangan.</p>
      </AdminCard>
    </div>
  );
}
