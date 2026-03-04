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
  button {
    font-size: 18px;
    color: #475569; /* slate-600 */
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    border: none;
    background: none;

    transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
    transition-duration: 400ms;
    transition-property: color;
    display: inline-flex;
    align-items: center;
  }

  button:focus,
  button:hover {
    color: #ef4444; /* red-500 for logout visibility */
  }

  button:focus:after,
  button:hover:after {
    width: 100%;
    right: 0;
    left: auto; /* Ensure left is auto to override the initial value */
  }

  button:after {
    content: "";
    pointer-events: none;
    bottom: -4px;
    right: auto; /* Start from the right */
    left: 0; /* Ensure left is auto to override the initial value */
    position: absolute;
    width: 0%;
    height: 2px;
    background-color: #ef4444; /* matching the text hover */
    transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
    transition-duration: 500ms;
    transition-property: width, right;
  }

  .svg-icon {
    width: 0.9em;
    height: 0.8em;
    margin-left: 10px;
    fill: #475569;
    transform: rotate(-45deg);
    transition: transform 0.5s ease-out, fill 0.4s;
  }

  button:hover .svg-icon {
    transform: rotate(0deg);
    fill: #ef4444;
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
      <div className="pt-4 pb-12 px-6 flex justify-center">
        <StyledWrapper>
          <button onClick={handleLogout}>
            <span>{t('settings.logout')}</span>
            <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="svg-icon">
                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
              </svg>
            </span>
          </button>
        </StyledWrapper>
      </div>
    </div>
  );
}
