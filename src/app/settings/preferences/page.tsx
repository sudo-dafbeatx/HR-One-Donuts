'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  BellIcon, 
  LanguageIcon, 
  MapPinIcon, 
  PhotoIcon, 
  CameraIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function PreferencesPage() {
  const [botEnabled, setBotEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatbot_disabled') !== 'true';
    }
    return true;
  });
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notifications_disabled') !== 'true';
    }
    return true;
  });

  const [privacy, setPrivacy] = useState({
    location: true,
    photos: false,
    camera: false
  });
  const [language, setLanguage] = useState('Bahasa Indonesia');
  const [showLangPicker, setShowLangPicker] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const toggleBot = () => {
    const newState = !botEnabled;
    setBotEnabled(newState);
    localStorage.setItem('chatbot_disabled', newState ? 'false' : 'true');
    window.dispatchEvent(new Event('chatbot_preference_change'));
  };

  const languages = [
    "Bahasa Indonesia",
    "English",
    "Bahasa Jawa",
    "Bahasa Sunda",
    "Bahasa Daerah Lainnya..."
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-6 px-4 py-8 pb-32">
      {/* Bot Setting */}
      <section className="space-y-3">
        <h3 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bot & Chat</h3>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-primary/5 text-primary rounded-2xl">
               <ChatBubbleLeftRightIcon className="size-6" />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-800">Chat Bot</p>
               <p className="text-xs text-slate-500 font-medium">Bantuan otomatis kami.</p>
             </div>
           </div>
           <Toggle active={botEnabled} onToggle={toggleBot} />
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-3">
        <h3 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Komunikasi</h3>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
               <BellIcon className="size-6" />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-800">Notifikasi</p>
               <p className="text-xs text-slate-500 font-medium">Update pesanan & promo.</p>
             </div>
           </div>
           <Toggle 
             active={notifications} 
             onToggle={() => {
               const newState = !notifications;
               setNotifications(newState);
               localStorage.setItem('notifications_disabled', newState ? 'false' : 'true');
             }} 
           />
        </div>
      </section>

      {/* Privacy Permissions */}
      <section className="space-y-3">
        <h3 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Izin & Privasi</h3>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
           <PermissionItem 
             icon={MapPinIcon} 
             title="Lokasi" 
             desc="Berikan akses agar dapat menentukan lokasi alamatmu" 
             active={privacy.location}
             onToggle={() => setPrivacy({...privacy, location: !privacy.location})}
           />
           <PermissionItem 
             icon={PhotoIcon} 
             title="Album Foto" 
             desc="Berikan akses agar dapat meng-upload foto untuk feed atau penilaian" 
             active={privacy.photos}
             onToggle={() => setPrivacy({...privacy, photos: !privacy.photos})}
           />
           <PermissionItem 
             icon={CameraIcon} 
             title="Kamera" 
             desc="Berikan akses agar dapat mengambil foto" 
             active={privacy.camera}
             onToggle={() => setPrivacy({...privacy, camera: !privacy.camera})}
           />
        </div>
      </section>

      {/* Language Selection */}
      <section className="space-y-3">
        <h3 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regional</h3>
        <div 
          onClick={() => setShowLangPicker(!showLangPicker)}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
        >
           <div className="flex items-center gap-4">
             <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
               <LanguageIcon className="size-6" />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-800">Bahasa</p>
               <p className="text-xs text-slate-500 font-medium">{language}</p>
             </div>
           </div>
           <ChevronRightIcon className={`size-5 text-slate-300 transition-transform ${showLangPicker ? 'rotate-90' : 'rotate-0'}`} />
        </div>
        
        {showLangPicker && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 divide-y divide-slate-50 animate-in slide-in-from-top-2 duration-200">
             {languages.map((lang) => (
               <button 
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setShowLangPicker(false);
                }}
                className={`w-full text-left px-8 py-4 text-sm font-bold transition-colors ${language === lang ? 'text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                 {lang}
               </button>
             ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Toggle({ active, onToggle }: { active: boolean, onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${active ? 'bg-primary' : 'bg-slate-200'}`}
    >
      <div className={`size-5 bg-white rounded-full shadow-sm transition-transform absolute ${active ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function PermissionItem({ icon: Icon, title, desc, active, onToggle }: { icon: React.ElementType, title: string, desc: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="p-6 flex items-start gap-4">
       <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl">
         <Icon className="size-6" />
       </div>
       <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-slate-800 mb-0.5">{title}</p>
            <Toggle active={active} onToggle={onToggle} />
          </div>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
