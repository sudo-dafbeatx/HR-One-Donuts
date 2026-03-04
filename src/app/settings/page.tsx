'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { 
  UserIcon, 
  MapPinIcon, 
  BellIcon, 
  QuestionMarkCircleIcon, 
  DocumentTextIcon, 
  InformationCircleIcon, 
  TrashIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  .Btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 54px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(255, 65, 65, 0.25);
    background-color: #ff4141;
    gap: 12px;
  }

  .sign {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent; /* Ensure no accidental white background */
    border: none; /* Ensure no accidental borders */
  }

  .sign svg {
    width: 22px; /* Slightly larger for better precision and clarity */
    height: 22px;
  }

  .sign svg path {
    fill: white;
  }

  .text {
    color: white;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .Btn:hover {
    background-color: #f03232;
    box-shadow: 0 6px 20px rgba(255, 65, 65, 0.35);
  }

  .Btn:active {
    transform: scale(0.97);
  }
`;

export default function SettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "hr_profile_complete=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/');
    router.refresh();
  };

  const sections = [
    {
      title: t('settings.sections.account'),
      items: [
        { label: t('settings.items.account'), href: "/settings/account", icon: UserIcon },
        { label: t('settings.items.address'), href: "/settings/address", icon: MapPinIcon },
      ]
    },
    {
      title: t('settings.sections.settings'),
      items: [
        { label: t('settings.items.preferences'), href: "/settings/preferences", icon: BellIcon },
      ]
    },
    {
      title: t('settings.sections.help'),
      items: [
        { label: t('settings.items.help'), href: "/settings/help", icon: QuestionMarkCircleIcon },
        { label: t('settings.items.policies'), href: "/settings/policies", icon: DocumentTextIcon },
        { label: t('settings.items.info'), href: "/settings/info", icon: InformationCircleIcon },
        { label: t('settings.items.delete'), href: "/settings/delete-account", icon: TrashIcon, variant: "danger" },
      ]
    }
  ];

  return (
    <div className="py-4 space-y-6">
      {sections.map((section, sIndex) => (
        <div key={sIndex} className="space-y-2">
          <h2 className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {section.title}
          </h2>
          <div className="bg-white border-y border-slate-100 divide-y divide-slate-50">
            {section.items.map((item, iIndex) => (
              <Link 
                key={iIndex} 
                href={item.href}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${item.variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'} group-hover:scale-110 transition-transform`}>
                    <item.icon className="size-5" />
                  </div>
                  <span className={`text-sm font-medium ${item.variant === 'danger' ? 'text-red-500' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                </div>
                <ChevronRightIcon className="size-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Logout Button */}
      <div className="pt-4 pb-12 px-6">
        <StyledWrapper>
          <button className="Btn" onClick={handleLogout}>
            <div className="sign">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </div>
            <div className="text">{t('settings.logout')}</div>
          </button>
        </StyledWrapper>
      </div>
    </div>
  );
}
