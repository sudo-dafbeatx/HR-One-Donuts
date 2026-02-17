import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LogoBrand from '@/components/ui/LogoBrand';
import ProfileForm from '@/components/onboarding/ProfileForm';

export default async function OnboardingProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if profile is already complete
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_profile_complete')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.is_profile_complete) {
    redirect('/');
  }

  // Fetch site settings for branding
  const { data: settings } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'site_info')
    .maybeSingle();
  
  const siteInfo = settings?.value as {
    logo_url?: string;
    store_name?: string;
    tagline?: string;
  };

  return (
    <div 
      className="min-h-screen flex flex-col py-6 md:py-12 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12"
      style={{
        backgroundColor: '#f6f7f8',
        backgroundImage: 'radial-gradient(#d1d5db 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      <main className="relative z-10 max-w-[800px] w-full mx-auto px-1 md:px-0">
        <div className="bg-white shadow-xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="px-5 pt-10 pb-6 md:px-8 md:pt-12 md:pb-10 text-center bg-gradient-to-b from-blue-50/50 to-white">
            <div className="flex items-center justify-center mb-6 md:mb-8">
              <LogoBrand 
                logoUrl={siteInfo?.logo_url || "/images/logo-hr-one.png"} 
                storeName={siteInfo?.store_name} 
                size="lg"
                priority
              />
            </div>
            <h1 className="text-xl md:text-3xl font-black text-slate-900 mb-2 md:mb-4 tracking-tight px-4">
              Lengkapi Profil Kamu 🍩
            </h1>
            <p className="text-[13px] md:text-base text-slate-500 font-medium max-w-sm mx-auto leading-relaxed px-4 md:px-0">
              Hai {user.user_metadata?.full_name || 'Teman Donat'}! Sedikit lagi selesai. Bantu kami mengenal wilayahmu agar pengiriman makin akurat.
            </p>
          </div>

          {/* Form Section */}
          <div className="px-5 md:px-12 pb-10 md:pb-12">
            <ProfileForm 
              initialData={{
                full_name: user.user_metadata?.full_name || '',
                email: user.email || ''
              }}
            />
          </div>

          {/* Footer Info */}
          <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[20px] md:text-[22px] leading-none">shield_with_heart</span>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.15em] text-center leading-relaxed">
              Data Terenkripsi & Aman di Supabase
            </p>
          </div>
        </div>

        {/* Support Link */}
        <p className="mt-10 mb-8 text-center text-slate-400 text-[13px] font-medium">
          Ada kendala? <a href="https://wa.me/6285810658117" target="_blank" rel="noopener noreferrer" className="text-primary font-extrabold hover:underline">Hubungi Admin</a>
        </p>
      </main>
    </div>
  );
}
