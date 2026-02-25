'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  UserCircleIcon, 
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ClockIcon,
  FingerPrintIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';

interface AuthLog {
  id: string;
  event_type: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  phone_number: string | null;
  email: string; // Assuming email is always present after initial fetch
  is_verified: boolean;
  birth_place?: string | null;
  social_links: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  } | null;
}

export default function AccountSettingsPage() {
  const { t, language } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isGoogleUser, setIsGoogleUser] = useState(false); // Added isGoogleUser state
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => { // Renamed fetchData to fetchUser
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsGoogleUser(user.app_metadata.provider === 'google'); // Set isGoogleUser

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const { data: logsData } = await supabase
        .from('auth_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      let finalLogs = logsData || [];
      if (finalLogs.length === 0 && user.last_sign_in_at) {
        finalLogs = [{
          id: 'fallback_initial_login',
          event_type: user.app_metadata?.provider === 'google' ? 'google_login' : 'login',
          ip_address: 'unknown',
          user_agent: 'Local Session',
          created_at: user.last_sign_in_at
        }];
      }

      setProfile(profileData || { email: user.email });
      setAuthLogs(finalLogs);
      setLoading(false);
    }
    fetchUser(); // Called fetchUser
  }, [supabase]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-100 px-4 sticky top-16 z-20">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
        >
          {t('settings.account.tabs.profile')}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'security' ? 'border-primary text-primary' : 'border-transparent text-slate-400'}`}
        >
          {t('settings.account.tabs.security')}
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-6 px-4">
          {/* Profile Basic */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative size-24 mb-4">
              <div className="size-full bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                <UserCircleIcon className="size-full text-slate-300" />
              </div>
              {profile?.is_verified && (
                <div className="absolute bottom-0 right-0 bg-white rounded-full border-2 border-primary">
                  <CheckBadgeIcon className="size-6 text-primary" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{profile?.full_name || t('profile.default_name')}</h3>
            <p className="text-sm text-slate-500 font-medium">@{profile?.username || 'user' + profile?.id?.slice(0,5)}</p>
          </section>

          {/* Details Section */}
          <div className="space-y-4"> {/* Added a wrapper div for the new structure */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('settings.account.basic_info.title')}</h3>
              <Link
                href="/settings/account/edit"
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
              >
                {t('settings.account.basic_info.edit_cta')}
              </Link>
            </div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 divide-y divide-slate-50">
              <EditableItem icon={UserCircleIcon} label={t('settings.account.basic_info.labels.name')} value={profile?.full_name || '-'} />
              <EditableItem icon={FingerPrintIcon} label={t('settings.account.basic_info.labels.username')} value={profile?.username || '-'} />
              <EditableItem icon={DevicePhoneMobileIcon} label={t('settings.account.basic_info.labels.phone')} value={profile?.phone_number || '-'} />
              <EditableItem icon={EnvelopeIcon} label={t('settings.account.basic_info.labels.email')} value={profile?.email || '-'} />
              {profile?.birth_place && <EditableItem icon={ClockIcon} label="Tempat Lahir" value={profile.birth_place} />}
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">{t('settings.account.social')}</p>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              <div className="px-6 py-4 grid grid-cols-2 gap-3">
                <SocialLink icon={CheckBadgeIcon} label="Facebook" href={profile?.social_links?.facebook} />
                <SocialLink icon={CheckBadgeIcon} label="Instagram" href={profile?.social_links?.instagram} />
                <SocialLink icon={CheckBadgeIcon} label="TikTok" href={profile?.social_links?.tiktok} />
              </div>
          </div>

          <div className="px-2">
            {/* Conditional rendering for password change button */}
            {!isGoogleUser && (
              <Link
                href="/auth/forgot-password"
                className="w-full flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-2xl group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <FingerPrintIcon className="size-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-slate-800">{t('settings.account.password.title')}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{t('settings.account.password.subtitle')}</span>
                  </div>
                </div>
                <ChevronRightIcon className="size-4 text-slate-300" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 px-4">
          {/* Security Features */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-500 rounded-2xl">
                <ShieldCheckIcon className="size-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Periksa Aktivitas Akun</p>
                <p className="text-xs text-slate-500 font-medium italic">Akun Anda terpantau aman.</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">{t('settings.account.security.history_title')}</p>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 divide-y divide-slate-50">
            {authLogs.length > 0 ? authLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 px-6 py-4">
                <div className="p-2 bg-slate-100 text-slate-400 rounded-xl">
                  <ClockIcon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-slate-700 truncate capitalize">{log.event_type.replace('_', ' ')}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{new Date(log.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate font-medium">IP: {log.ip_address} • {log.user_agent.split(' ')[0]}</p>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center">
                <p className="text-slate-400 text-sm italic font-medium">{t('settings.account.security.empty_history')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SocialLink({ icon: Icon, label, href }: { icon: React.ElementType, label: string, href: string | null | undefined }) {
  return (
    <a 
      href={href || '#'} 
      className={`flex items-center gap-2 p-3 rounded-2xl border transition-all ${href ? 'border-primary/10 bg-primary/5 text-primary' : 'border-slate-50 text-slate-300 grayscale opacity-50'}`}
    >
      <Icon className="size-4" />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </a>
  );
}

function EditableItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4 overflow-hidden">
        <Icon className="size-5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
        </div>
      </div>
      <div className="flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">
        <ChevronRightIcon className="size-5" />
      </div>
    </div>
  );
}
