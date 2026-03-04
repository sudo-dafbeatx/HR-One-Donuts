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

  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: .3s;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    background-color: rgb(255, 65, 65);
  }

  /* plus sign */
  .sign {
    width: 100%;
    transition-duration: .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sign svg {
    width: 17px;
  }

  .sign svg path {
    fill: white;
  }
  /* text */
  .text {
    position: absolute;
    right: 0%;
    width: 0%;
    opacity: 0;
    color: white;
    font-size: 1.2em;
    font-weight: 600;
    transition-duration: .3s;
  }
  /* hover effect on button width */
  .Btn:hover {
    width: 125px;
    border-radius: 40px;
    transition-duration: .3s;
  }

  .Btn:hover .sign {
    width: 30%;
    transition-duration: .3s;
    padding-left: 20px;
  }
  /* hover effect button's text */
  .Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: .3s;
    padding-right: 10px;
  }
  /* button click effect*/
  .Btn:active {
    transform: translate(2px ,2px);
  }`;

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
            <div className="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" /></svg></div>
            <div className="text">{t('settings.logout')}</div>
          </button>
        </StyledWrapper>
      </div>
    </div>
  );
}
